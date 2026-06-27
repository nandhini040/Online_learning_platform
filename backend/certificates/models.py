import uuid
from django.db import models
from django.conf import settings
from courses.models import Course

class Certificate(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='certificates'
    )
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    issued_at = models.DateTimeField(auto_now_add=True)
    pdf_file = models.FileField(upload_to='certificates/', null=True, blank=True)
    qr_code_file = models.ImageField(upload_to='certificates/qrcodes/', null=True, blank=True)

    class Meta:
        unique_together = ('student', 'course')

    def __str__(self):
        return f"Certificate for {self.student.email} - {self.course.title}"
