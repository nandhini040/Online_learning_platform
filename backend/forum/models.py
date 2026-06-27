from django.db import models
from django.conf import settings
from courses.models import Course

class DiscussionForum(models.Model):
    course = models.OneToOneField(Course, on_delete=models.CASCADE, related_name='forum')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Forum for: {self.course.title}"


class Comment(models.Model):
    forum = models.ForeignKey(DiscussionForum, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    text = models.TextField()
    parent = models.ForeignKey(
        'self', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='replies'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Comment by {self.user.email} on {self.forum.course.title}"
