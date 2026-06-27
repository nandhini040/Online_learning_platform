from django.db import models
from django.conf import settings
from courses.models import Lesson

class Quiz(models.Model):
    lesson = models.OneToOneField(Lesson, on_delete=models.CASCADE, related_name='quiz')
    title = models.CharField(max_length=200)
    passing_score = models.PositiveIntegerField(default=60, help_text="Passing score percentage (e.g. 60 for 60%)")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Quizzes"

    def __str__(self):
        return f"Quiz: {self.title} for {self.lesson.title}"


class Question(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    text = models.TextField()
    points = models.PositiveIntegerField(default=10)

    def __str__(self):
        return f"Q: {self.text[:50]} (Quiz: {self.quiz.title})"


class Answer(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='answers')
    text = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return f"Answer Option: {self.text} (Correct: {self.is_correct})"


class QuizResult(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='results')
    score = models.FloatField(help_text="Score percentage achieved")
    passed = models.BooleanField(default=False)
    attempted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.email} - {self.quiz.title} - Score: {self.score}% (Passed: {self.passed})"
