from rest_framework import serializers
from .models import Assignment, AssignmentSubmission

class AssignmentSerializer(serializers.ModelSerializer):
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)
    course_id = serializers.IntegerField(source='lesson.course.id', read_only=True)

    class Meta:
        model = Assignment
        fields = ('id', 'lesson', 'lesson_title', 'course_id', 'title', 'description', 'file_attachment', 'max_points', 'due_date', 'created_at')


class AssignmentSubmissionSerializer(serializers.ModelSerializer):
    student_email = serializers.CharField(source='student.email', read_only=True)
    student_name = serializers.SerializerMethodField()
    assignment_title = serializers.CharField(source='assignment.title', read_only=True)

    class Meta:
        model = AssignmentSubmission
        fields = (
            'id', 'assignment', 'assignment_title', 'student', 'student_email', 'student_name',
            'submission_file', 'submitted_text', 'submitted_at', 'grade', 'feedback', 'graded_at'
        )
        read_only_fields = ('student', 'grade', 'feedback', 'graded_at')

    def get_student_name(self, obj):
        return f"{obj.student.first_name} {obj.student.last_name}"


class GradeSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssignmentSubmission
        fields = ('grade', 'feedback')
        extra_kwargs = {
            'grade': {'required': True},
            'feedback': {'required': False, 'allow_blank': True}
        }

    def validate_grade(self, value):
        assignment = self.instance.assignment
        if value < 0 or value > assignment.max_points:
            raise serializers.ValidationError(f"Grade must be between 0 and {assignment.max_points} points.")
        return value
