from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import DiscussionForum, Comment
from .serializers import DiscussionForumSerializer, CommentSerializer
from courses.models import Enrollment, Course
from accounts.models import Role

class HasForumAccess(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # Admin has absolute access
        if request.user.role and request.user.role.name == Role.ADMIN:
            return True
            
        course = obj.course if isinstance(obj, DiscussionForum) else obj.forum.course
        
        # Instructor of the course has access
        if course.instructor == request.user:
            return True
            
        # Student must be enrolled
        return Enrollment.objects.filter(student=request.user, course=course).exists()


class DiscussionForumViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = DiscussionForum.objects.all()
    serializer_class = DiscussionForumSerializer
    permission_classes = [permissions.IsAuthenticated, HasForumAccess]

    # Fetch forum details directly using course ID
    @action(detail=False, methods=['get'], url_path='by-course/(?P<course_id>[^/.]+)')
    def by_course(self, request, course_id=None):
        course = get_object_or_404(Course, id=course_id)
        forum, created = DiscussionForum.objects.get_or_create(course=course)
        
        # Check permissions manually since it is a custom list-level route
        self.check_object_permissions(request, forum)
        
        serializer = self.get_serializer(forum)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated, HasForumAccess]

    def perform_create(self, serializer):
        forum_id = self.request.data.get('forum')
        forum = get_object_or_404(DiscussionForum, id=forum_id)
        
        # Check if user has permission to post to this forum
        # Self-contained check
        self.check_object_permissions(self.request, forum)
        
        # Save comment
        serializer.save(user=self.request.user, forum=forum)

    def perform_update(self, serializer):
        # Ensure only the comment owner can update
        comment = self.get_object()
        if comment.user != self.request.user and not (self.request.user.role and self.request.user.role.name == Role.ADMIN):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only edit your own comments.")
        serializer.save()

    def perform_destroy(self, instance):
        # Ensure only comment owner or course instructor/admin can delete
        if instance.user != self.request.user and instance.forum.course.instructor != self.request.user and not (self.request.user.role and self.request.user.role.name == Role.ADMIN):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You do not have permission to delete this comment.")
        instance.delete()
