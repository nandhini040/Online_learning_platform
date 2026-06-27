from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Q
from .models import Category, Course, Lesson, Video, PDFNote, Enrollment, Progress, Wishlist, Review
from .serializers import (
    CategorySerializer, 
    CourseListSerializer, 
    CourseDetailSerializer, 
    LessonSerializer,
    VideoSerializer,
    PDFNoteSerializer,
    EnrollmentSerializer,
    WishlistSerializer,
    ReviewSerializer
)
from accounts.models import Role

class IsInstructorOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.role and request.user.role.name == Role.INSTRUCTOR


class IsCourseOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        # For course object itself
        if isinstance(obj, Course):
            return obj.instructor == request.user or (request.user.role and request.user.role.name == Role.ADMIN)
        # For lessons, video, pdfs
        if hasattr(obj, 'course'):
            return obj.course.instructor == request.user or (request.user.role and request.user.role.name == Role.ADMIN)
        return False


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated(), permissions.IsAdminUser()]


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'description']

    def get_serializer_class(self):
        if self.action in ['list', 'recommendations']:
            return CourseListSerializer
        return CourseDetailSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        elif self.action in ['enroll', 'my_courses']:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated(), IsInstructorOrReadOnly()]

    def get_queryset(self):
        queryset = Course.objects.all()
        
        # Public search/list should only show published courses
        if not self.request.user.is_authenticated:
            queryset = queryset.filter(is_published=True)
        elif self.request.user.role and self.request.user.role.name == Role.INSTRUCTOR:
            # Instructors see all their own courses (drafts + published) + all other published courses
            queryset = queryset.filter(Q(instructor=self.request.user) | Q(is_published=True)).distinct()
        elif self.request.user.role and self.request.user.role.name == Role.ADMIN:
            # Admins see everything
            pass
        else:
            # Students see published courses only
            queryset = queryset.filter(is_published=True)

        # Filters
        category_slug = self.request.query_params.get('category')
        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)

        level = self.request.query_params.get('level')
        if level:
            queryset = queryset.filter(level=level)

        instructor_id = self.request.query_params.get('instructor')
        if instructor_id:
            queryset = queryset.filter(instructor_id=instructor_id)

        return queryset

    def perform_create(self, serializer):
        # Prevent instructor from creating course if they aren't approved
        if not self.request.user.is_approved:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Your instructor account has not been approved by the Administrator yet.")
        serializer.save(instructor=self.request.user)

    # Custom enrollment action
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def enroll(self, request, pk=None):
        course = self.get_object()
        student = request.user

        if Enrollment.objects.filter(student=student, course=course).exists():
            return Response({"message": "You are already enrolled in this course."}, status=status.HTTP_400_BAD_REQUEST)

        # Create enrollment
        enrollment = Enrollment.objects.create(student=student, course=course)

        # Initialize progress records for all current lessons
        lessons = course.lessons.all()
        for lesson in lessons:
            Progress.objects.create(enrollment=enrollment, lesson=lesson)

        # Update learning streak & award XP for starting a course
        profile = student.profile
        profile.update_streak()
        profile.add_xp(50)  # 50 XP for course registration

        return Response({
            "message": f"Successfully enrolled in {course.title}!",
            "enrollment_id": enrollment.id
        }, status=status.HTTP_201_CREATED)

    # Fetch currently enrolled courses
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_courses(self, request):
        enrollments = Enrollment.objects.filter(student=request.user)
        serializer = EnrollmentSerializer(enrollments, many=True, context={'request': request})
        return Response(serializer.data)

    # AI Course Recommendations based on Student Profile & Enrollment History
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def recommendations(self, request):
        student = request.user
        profile = student.profile
        
        # Get categories of courses the student is already enrolled in
        enrolled_course_ids = Enrollment.objects.filter(student=student).values_list('course_id', flat=True)
        enrolled_categories = Course.objects.filter(id__in=enrolled_course_ids).values_list('category_id', flat=True)
        
        # Recommendations strategy:
        # 1. Recommend courses from the same categories they show interest in, but not yet enrolled
        rec_courses = Course.objects.filter(
            is_published=True,
            category_id__in=enrolled_categories
        ).exclude(id__in=enrolled_course_ids)
        
        # 2. If not enough recommendations, recommend popular courses matching student's gamification level
        if rec_courses.count() < 4:
            level_match = 'Beginner'
            if profile.level > 5:
                level_match = 'Advanced'
            elif profile.level > 2:
                level_match = 'Intermediate'
                
            additional = Course.objects.filter(
                is_published=True,
                level=level_match
            ).exclude(id__in=enrolled_course_ids).exclude(id__in=rec_courses.values_list('id', flat=True))
            
            rec_courses = (rec_courses | additional).distinct()
            
        # Limit to 6 recommendations
        rec_courses = rec_courses[:6]
        
        serializer = CourseListSerializer(rec_courses, many=True, context={'request': request})
        return Response(serializer.data)


class LessonViewSet(viewsets.ModelViewSet):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer

    def get_permissions(self):
        return [permissions.IsAuthenticated(), IsCourseOwner()]

    def get_queryset(self):
        # Filter lessons by course if course_id parameter is present
        course_id = self.request.query_params.get('course_id')
        if course_id:
            return Lesson.objects.filter(course_id=course_id)
        return Lesson.objects.all()

    def perform_create(self, serializer):
        course_id = self.request.data.get('course_id')
        course = get_object_or_404(Course, id=course_id)
        if course.instructor != self.request.user and not (self.request.user.role and self.request.user.role.name == Role.ADMIN):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You do not own this course.")
        serializer.save(course=course)

    # Complete a lesson action
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def complete(self, request, pk=None):
        lesson = self.get_object()
        student = request.user

        # Ensure enrolled
        enrollment = Enrollment.objects.filter(student=student, course=lesson.course).first()
        if not enrollment:
            return Response({"error": "You are not enrolled in this course."}, status=status.HTTP_403_FORBIDDEN)

        # Update progress
        progress, created = Progress.objects.get_or_create(enrollment=enrollment, lesson=lesson)
        if not progress.is_completed:
            progress.is_completed = True
            progress.completed_at = timezone.now()
            progress.save()

            # Award XP to student
            profile = student.profile
            profile.update_streak()
            profile.add_xp(20)  # 20 XP for lesson completion

            # Check if all lessons are completed
            total_lessons = lesson.course.lessons.count()
            completed_lessons = Progress.objects.filter(enrollment=enrollment, is_completed=True).count()

            if total_lessons > 0 and completed_lessons == total_lessons:
                enrollment.completed = True
                enrollment.completed_at = timezone.now()
                enrollment.save()
                profile.add_xp(100) # Bonus 100 XP for course completion
                return Response({
                    "message": "Lesson marked complete. Congratulations! You have completed the entire course!",
                    "course_completed": True
                }, status=status.HTTP_200_OK)

            return Response({
                "message": "Lesson marked complete.",
                "course_completed": False
            }, status=status.HTTP_200_OK)

        return Response({"message": "Lesson already marked complete."}, status=status.HTTP_200_OK)


class VideoUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        lesson_id = request.data.get('lesson_id')
        lesson = get_object_or_404(Lesson, id=lesson_id)
        
        # Check course ownership
        if lesson.course.instructor != request.user and not (request.user.role and request.user.role.name == Role.ADMIN):
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

        video, created = Video.objects.get_or_create(lesson=lesson)
        serializer = VideoSerializer(video, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)


class PDFNoteUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        lesson_id = request.data.get('lesson_id')
        lesson = get_object_or_404(Lesson, id=lesson_id)
        
        # Check course ownership
        if lesson.course.instructor != request.user and not (request.user.role and request.user.role.name == Role.ADMIN):
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

        serializer = PDFNoteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(lesson=lesson)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class WishlistViewSet(viewsets.ModelViewSet):
    serializer_class = WishlistSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user)


class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    queryset = Review.objects.all()

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        course_id = self.request.data.get('course_id')
        course = get_object_or_404(Course, id=course_id)
        
        # Enforce enrollment before leaving a review
        if not Enrollment.objects.filter(student=self.request.user, course=course).exists():
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only review courses you are enrolled in.")
            
        serializer.save(student=self.request.user, course=course)
