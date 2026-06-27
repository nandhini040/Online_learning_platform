from django.db.models.signals import post_save
from django.dispatch import receiver
from courses.models import Course
from .models import DiscussionForum

@receiver(post_save, sender=Course)
def create_course_forum(sender, instance, created, **kwargs):
    if created:
        DiscussionForum.objects.get_or_create(course=instance)
