import datetime
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import Assignment, AssignmentSubmission
from .serializers import (
    AssignmentSerializer, 
    AssignmentSubmissionSerializer, 
    GradeSubmissionSerializer
)
from accounts.models import Role
from courses.models import Enrollment

class IsInstructorOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.role and request.user.role.name in [Role.INSTRUCTOR, Role.ADMIN]
        )


class AssignmentViewSet(viewsets.ModelViewSet):
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer

    def get_permissions(self):
        if self.action in ['retrieve', 'list']:
            return [permissions.IsAuthenticated()]
        return [IsInstructorOrAdmin()]

    def get_queryset(self):
        # Filter assignments by course if course_id parameter is present
        course_id = self.request.query_params.get('course_id')
        if course_id:
            return Assignment.objects.filter(lesson__course_id=course_id)
        return Assignment.objects.all()

    def perform_create(self, serializer):
        serializer.save()


class AssignmentSubmissionViewSet(viewsets.ModelViewSet):
    serializer_class = AssignmentSubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        
        # If user is instructor, show submissions for courses they instruct
        if user.role and user.role.name == Role.INSTRUCTOR:
            return AssignmentSubmission.objects.filter(assignment__lesson__course__instructor=user)
        # If user is admin, show all
        elif user.role and user.role.name == Role.ADMIN:
            return AssignmentSubmission.objects.all()
        # Student sees their own submissions
        return AssignmentSubmission.objects.filter(student=user)

    def perform_create(self, serializer):
        assignment_id = self.request.data.get('assignment')
        assignment = get_object_or_404(Assignment, id=assignment_id)
        
        # Check course enrollment
        enrolled = Enrollment.objects.filter(student=self.request.user, course=assignment.lesson.course).exists()
        if not enrolled:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You must be enrolled in the course to submit this assignment.")

        serializer.save(student=self.request.user, assignment=assignment)

    # Grading action for instructors
    @action(detail=True, methods=['post'], permission_classes=[IsInstructorOrAdmin])
    def grade(self, request, pk=None):
        submission = self.get_object()
        
        # Check if the instructor is the owner of the course
        if submission.assignment.lesson.course.instructor != request.user and not (request.user.role and request.user.role.name == Role.ADMIN):
            return Response({"error": "You do not own this course and cannot grade this submission."}, status=status.HTTP_403_FORBIDDEN)

        serializer = GradeSubmissionSerializer(submission, data=request.data)
        serializer.is_valid(raise_exception=True)
        
        submission.grade = serializer.validated_data['grade']
        submission.feedback = serializer.validated_data.get('feedback', '')
        submission.graded_at = timezone.now()
        submission.save()

        # Award student XP based on their grade
        max_pts = submission.assignment.max_points
        ratio = submission.grade / max_pts if max_pts > 0 else 0
        xp_gained = int(ratio * 50)  # Up to 50 XP based on score
        
        student_profile = submission.student.profile
        student_profile.add_xp(xp_gained + 20)  # Submission base XP + performance XP

        return Response({
            "message": "Submission graded successfully.",
            "grade": submission.grade,
            "feedback": submission.feedback,
            "student_xp_gained": xp_gained + 20
        }, status=status.HTTP_200_OK)
