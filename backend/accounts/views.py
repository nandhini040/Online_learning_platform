from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from .models import Profile
from .serializers import (
    RegisterSerializer,
    OTPVerifySerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    ProfileSerializer,
    UserSerializer
)

User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        # Add user detail payload for convenient frontend state load
        user_serializer = UserSerializer(self.user)
        data['user'] = user_serializer.data
        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({
            "message": "User registered successfully. Please verify your account using the OTP sent to your email.",
            "user": UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)


class VerifyOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = OTPVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        otp = serializer.validated_data['otp']

        try:
            user = User.objects.get(email=email)
            if user.verify_otp(otp):
                return Response({"message": "Account verified successfully."}, status=status.HTTP_200_OK)
            return Response({"error": "Invalid or expired OTP."}, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({"error": "User with this email does not exist."}, status=status.HTTP_404_NOT_FOUND)


class ResendOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({"error": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
            otp = user.generate_otp()
            # Print mock verification email to terminal
            print("\n" + "="*50)
            print(f"MOCK EMAIL: Resending Verification to {user.first_name}!")
            print(f"New OTP Code: {otp}")
            print("="*50 + "\n")
            return Response({"message": "A new OTP code has been sent to your email."}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "User with this email does not exist."}, status=status.HTTP_404_NOT_FOUND)


class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        
        user = User.objects.get(email=email)
        otp = user.generate_otp()
        
        # Print mock reset email to terminal
        print("\n" + "="*50)
        print(f"MOCK EMAIL: Password Reset Request for {user.first_name}!")
        print(f"Reset OTP Code: {otp}")
        print("="*50 + "\n")
        
        return Response({"message": "Password reset OTP has been sent to your email."}, status=status.HTTP_200_OK)


class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        otp = serializer.validated_data['otp']
        new_password = serializer.validated_data['new_password']

        try:
            user = User.objects.get(email=email)
            if user.verify_otp(otp):
                user.set_password(new_password)
                user.save()
                return Response({"message": "Password has been reset successfully."}, status=status.HTTP_200_OK)
            return Response({"error": "Invalid or expired OTP."}, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({"error": "User with this email does not exist."}, status=status.HTTP_404_NOT_FOUND)


class ProfileView(generics.RetrieveUpdateAPIView):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        # Always return the profile of the currently logged in user
        return self.request.user.profile


class AdminDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    def get(self, request):
        from courses.models import Course, Enrollment
        from accounts.models import Role
        
        student_role = Role.objects.filter(name=Role.STUDENT).first()
        instructor_role = Role.objects.filter(name=Role.INSTRUCTOR).first()
        
        students_count = User.objects.filter(role=student_role).count()
        instructors_count = User.objects.filter(role=instructor_role).count()
        
        # Instructor approval queue
        pending_instructors = User.objects.filter(role=instructor_role, is_approved=False)
        pending_serializer = UserSerializer(pending_instructors, many=True)
        
        return Response({
            "total_students": students_count,
            "total_instructors": instructors_count,
            "pending_approvals_count": pending_instructors.count(),
            "pending_instructors": pending_serializer.data,
            "total_courses": Course.objects.count(),
            "total_enrollments": Enrollment.objects.count(),
        }, status=status.HTTP_200_OK)

    # Endpoint to approve an instructor
    def post(self, request):
        instructor_id = request.data.get('user_id')
        if not instructor_id:
            return Response({"error": "user_id is required."}, status=status.HTTP_400_BAD_REQUEST)
            
        user = get_object_or_404(User, id=instructor_id)
        if user.role and user.role.name == Role.INSTRUCTOR:
            user.is_approved = True
            user.save()
            
            # Send notification
            from notifications.models import Notification
            Notification.objects.create(
                recipient=user,
                title="Account Approved",
                message="Congratulations! Your instructor registration has been approved. You can now build and publish courses."
            )
            return Response({"message": f"Instructor {user.email} approved successfully."}, status=status.HTTP_200_OK)
        return Response({"error": "User is not an instructor."}, status=status.HTTP_400_BAD_REQUEST)


class InstructorDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from courses.models import Course, Enrollment
        from assignments.models import AssignmentSubmission
        
        # Enforce role
        if not (request.user.role and request.user.role.name in [Role.INSTRUCTOR, Role.ADMIN]):
            return Response({"error": "Only instructors can access this dashboard."}, status=status.HTTP_403_FORBIDDEN)
            
        my_courses = Course.objects.filter(instructor=request.user)
        my_course_ids = my_courses.values_list('id', flat=True)
        
        enrollments = Enrollment.objects.filter(course_id__in=my_course_ids)
        total_students = enrollments.values('student').distinct().count()
        
        # Earnings calculation (simulated revenue: sum of course price for each enrollment)
        total_revenue = sum(e.course.price for e in enrollments)
        
        # Fetch ungraded assignments queue
        pending_assignments = AssignmentSubmission.objects.filter(
            assignment__lesson__course__instructor=request.user,
            grade__isnull=True
        )
        submissions_serializer = AssignmentSubmissionSerializer(pending_assignments, many=True, context={'request': request})
        
        courses_data = []
        for c in my_courses:
            course_enroll_count = Enrollment.objects.filter(course=c).count()
            course_completion_count = Enrollment.objects.filter(course=c, completed=True).count()
            courses_data.append({
                "id": c.id,
                "title": c.title,
                "price": c.price,
                "is_published": c.is_published,
                "enrollments": course_enroll_count,
                "completions": course_completion_count
            })
            
        return Response({
            "total_courses": my_courses.count(),
            "total_students": total_students,
            "total_earnings": total_revenue,
            "courses": courses_data,
            "pending_grading": submissions_serializer.data
        }, status=status.HTTP_200_OK)


class StudentDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from courses.models import Enrollment
        from quizzes.models import QuizResult
        
        student = request.user
        profile = student.profile
        
        # Recalculate streak to be accurate
        profile.update_streak()
        
        enrollments = Enrollment.objects.filter(student=student)
        enrolled_count = enrollments.count()
        completed_count = enrollments.filter(completed=True).count()
        
        # Calculate dynamic badges
        badges = []
        if profile.learning_streak >= 1:
            badges.append({
                "name": "Streak Starter",
                "icon": "Zap",
                "description": "Logged in and studied for 1 day or more."
            })
        if profile.learning_streak >= 7:
            badges.append({
                "name": "Super Studious",
                "icon": "Award",
                "description": "Maintained a learning streak of 7+ days!"
            })
        if QuizResult.objects.filter(student=student, passed=True).exists():
            badges.append({
                "name": "Quiz Master",
                "icon": "CheckSquare",
                "description": "Passed at least one knowledge check quiz."
            })
        if completed_count >= 1:
            badges.append({
                "name": "SkillSphere Graduate",
                "icon": "GraduationCap",
                "description": "Graduated and completed at least one full course."
            })
        if profile.level >= 5:
            badges.append({
                "name": "Elite Learner",
                "icon": "Crown",
                "description": "Achieved level 5 on the SkillSphere leaderboard!"
            })
            
        return Response({
            "enrolled_courses_count": enrolled_count,
            "completed_courses_count": completed_count,
            "learning_streak": profile.learning_streak,
            "xp": profile.xp,
            "level": profile.level,
            "next_level_xp": profile.level * 500,  # 500 XP per level
            "badges": badges
        }, status=status.HTTP_200_OK)
