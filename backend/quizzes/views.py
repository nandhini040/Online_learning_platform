from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Quiz, Question, Answer, QuizResult
from .serializers import (
    QuizStudentSerializer, 
    QuizAdminSerializer, 
    QuizResultSerializer,
    QuestionAdminSerializer
)
from accounts.models import Role
from courses.models import Enrollment

class IsInstructorOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.role and request.user.role.name in [Role.INSTRUCTOR, Role.ADMIN]
        )


class QuizViewSet(viewsets.ModelViewSet):
    queryset = Quiz.objects.all()

    def get_serializer_class(self):
        if self.request.user.is_authenticated and self.request.user.role and self.request.user.role.name in [Role.INSTRUCTOR, Role.ADMIN]:
            return QuizAdminSerializer
        return QuizStudentSerializer

    def get_permissions(self):
        if self.action in ['retrieve', 'list', 'submit', 'results']:
            return [permissions.IsAuthenticated()]
        return [IsInstructorOrAdmin()]

    def perform_create(self, serializer):
        # Instructors can create quizzes for their lessons
        serializer.save()

    # Custom quiz auto-evaluation submission action
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def submit(self, request, pk=None):
        quiz = self.get_object()
        student = request.user
        
        # Verify enrollment in the course
        enrolled = Enrollment.objects.filter(student=student, course=quiz.lesson.course).exists()
        if not enrolled:
            return Response({"error": "You must be enrolled in the course to submit this quiz."}, status=status.HTTP_403_FORBIDDEN)

        # Submitted format: {"answers": [{"question_id": 1, "selected_answer_id": 10}, ...]}
        submitted_answers = request.data.get('answers', [])
        if not submitted_answers:
            return Response({"error": "No answers provided."}, status=status.HTTP_400_BAD_REQUEST)

        questions = quiz.questions.all()
        total_questions = questions.count()
        if total_questions == 0:
            return Response({"error": "This quiz has no questions."}, status=status.HTTP_400_BAD_REQUEST)

        correct_count = 0
        total_points = 0
        points_scored = 0

        # Mapping submitted answers
        selections = {item.get('question_id'): item.get('selected_answer_id') for item in submitted_answers}

        for q in questions:
            total_points += q.points
            selected_ans_id = selections.get(q.id)
            if selected_ans_id:
                # Retrieve the answer option from DB to verify if it is correct
                db_ans = Answer.objects.filter(id=selected_ans_id, question=q).first()
                if db_ans and db_ans.is_correct:
                    correct_count += 1
                    points_scored += q.points

        # Calculate score percentage
        score_pct = (points_scored / total_points) * 100 if total_points > 0 else 0
        passed = score_pct >= quiz.passing_score

        # Save result
        result = QuizResult.objects.create(
            student=student,
            quiz=quiz,
            score=round(score_pct, 2),
            passed=passed
        )

        # Award XP on passing
        if passed:
            profile = student.profile
            profile.update_streak()
            profile.add_xp(30 + int(points_scored // 2))  # XP based on points scored

        return Response({
            "message": "Quiz evaluated successfully.",
            "quiz_result_id": result.id,
            "correct_answers": correct_count,
            "total_questions": total_questions,
            "score_percentage": round(score_pct, 2),
            "passed": passed,
            "passing_score": quiz.passing_score
        }, status=status.HTTP_200_OK)

    # Fetch quiz results for currently logged in student
    @action(detail=False, methods=['get'], url_path='my-results', permission_classes=[permissions.IsAuthenticated])
    def results(self, request):
        results = QuizResult.objects.filter(student=request.user)
        serializer = QuizResultSerializer(results, many=True)
        return Response(serializer.data)
