from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Certificate
from .serializers import CertificateSerializer
from .utils import generate_certificate_pdf
from courses.models import Course, Enrollment, Progress

class CertificateViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Certificate.objects.all()
    serializer_class = CertificateSerializer

    def get_permissions(self):
        if self.action in ['verify']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        # Students see only their own certificates
        return Certificate.objects.filter(student=self.request.user)

    # Dynamic on-demand certificate generation
    @action(detail=False, methods=['post'], url_path='generate')
    def generate(self, request):
        course_id = request.data.get('course_id')
        if not course_id:
            return Response({"error": "course_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        course = get_object_or_404(Course, id=course_id)
        student = request.user

        # 1. Verify enrollment
        enrollment = Enrollment.objects.filter(student=student, course=course).first()
        if not enrollment:
            return Response({"error": "You are not enrolled in this course."}, status=status.HTTP_403_FORBIDDEN)

        # 2. Verify course completion (all lessons completed)
        total_lessons = course.lessons.count()
        if total_lessons == 0:
            return Response({"error": "This course has no content yet, cannot generate certificate."}, status=status.HTTP_400_BAD_REQUEST)

        completed_lessons = Progress.objects.filter(enrollment=enrollment, is_completed=True).count()
        if completed_lessons < total_lessons:
            return Response({
                "error": "Course not complete.",
                "total_lessons": total_lessons,
                "completed_lessons": completed_lessons,
                "percentage": int((completed_lessons / total_lessons) * 100)
            }, status=status.HTTP_400_BAD_REQUEST)

        # Ensure enrollment is marked complete
        if not enrollment.completed:
            enrollment.completed = True
            from django.utils import timezone
            enrollment.completed_at = timezone.now()
            enrollment.save()

        # 3. Get or generate Certificate
        certificate, created = Certificate.objects.get_or_create(student=student, course=course)
        if created or not certificate.pdf_file:
            certificate = generate_certificate_pdf(certificate)

        serializer = self.get_serializer(certificate)
        return Response({
            "message": "Certificate generated successfully.",
            "certificate": serializer.data
        }, status=status.HTTP_200_OK)

    # Public Verification API
    @action(detail=True, methods=['get'], url_path='verify', permission_classes=[permissions.AllowAny])
    def verify(self, request, pk=None):
        try:
            certificate = Certificate.objects.get(id=pk)
            serializer = self.get_serializer(certificate)
            return Response({
                "valid": True,
                "certificate": serializer.data
            }, status=status.HTTP_200_OK)
        except (Certificate.DoesNotExist, ValueError):
            return Response({
                "valid": False,
                "error": "Invalid certificate ID. This certificate was not issued by SkillSphere."
            }, status=status.HTTP_404_NOT_FOUND)
