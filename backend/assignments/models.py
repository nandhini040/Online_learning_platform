from django.db import models
from django.conf import settings
from courses.models import Lesson

class Assignment(models.Model):
    lesson = models.OneToOneField(Lesson, on_delete=models.CASCADE, related_name='assignment')
    title = models.CharField(max_length=200)
    description = models.TextField()
    file_attachment = models.FileField(upload_to='assignments/instructions/', null=True, blank=True)
    max_points = models.PositiveIntegerField(default=100)
    due_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Assignment: {self.title} for {self.lesson.title}"


class AssignmentSubmission(models.Model):
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='assignment_submissions'
    )
    submission_file = models.FileField(upload_to='assignments/submissions/')
    submitted_text = models.TextField(blank=True, default='')
    submitted_at = models.DateTimeField(auto_now_add=True)
    
    # Grading details (updated by instructors)
    grade = models.FloatField(null=True, blank=True)
    feedback = models.TextField(blank=True, default='')
    graded_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('assignment', 'student')

    def __str__(self):
        return f"{self.student.email} submission for {self.assignment.title} (Graded: {self.grade is not None})"
