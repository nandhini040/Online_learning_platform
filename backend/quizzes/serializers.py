from rest_framework import serializers
from .models import Quiz, Question, Answer, QuizResult

class AnswerStudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ('id', 'text')


class AnswerAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ('id', 'text', 'is_correct')


class QuestionStudentSerializer(serializers.ModelSerializer):
    answers = AnswerStudentSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ('id', 'text', 'points', 'answers')


class QuestionAdminSerializer(serializers.ModelSerializer):
    answers = AnswerAdminSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ('id', 'text', 'points', 'answers')


class QuizStudentSerializer(serializers.ModelSerializer):
    questions = QuestionStudentSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = ('id', 'title', 'passing_score', 'questions')


class QuizAdminSerializer(serializers.ModelSerializer):
    questions = QuestionAdminSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = ('id', 'title', 'passing_score', 'questions')


class QuizResultSerializer(serializers.ModelSerializer):
    quiz_title = serializers.CharField(source='quiz.title', read_only=True)
    student_email = serializers.CharField(source='student.email', read_only=True)

    class Meta:
        model = QuizResult
        fields = ('id', 'quiz', 'quiz_title', 'student_email', 'score', 'passed', 'attempted_at')
        read_only_fields = ('student', 'score', 'passed', 'attempted_at')
