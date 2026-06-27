from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db.models import Avg
from .models import Category, Course, Lesson, Video, PDFNote, Enrollment, Progress, Wishlist, Review
from accounts.serializers import UserSerializer

User = get_user_model()

class CategorySerializer(serializers.ModelSerializer):
    course_count = serializers.IntegerField(source='courses.count', read_only=True)

    class Meta:
        model = Category
        fields = ('id', 'name', 'slug', 'description', 'icon_name', 'course_count')


class VideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Video
        fields = ('id', 'video_file', 'video_url', 'duration')


class PDFNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = PDFNote
        fields = ('id', 'title', 'pdf_file')


class LessonSerializer(serializers.ModelSerializer):
    video = VideoSerializer(read_only=True)
    pdf_notes = PDFNoteSerializer(many=True, read_only=True)
    is_completed = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = ('id', 'title', 'description', 'order', 'video', 'pdf_notes', 'is_completed')

    def get_is_completed(self, obj):
        # Determine if the current user has completed this lesson
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            # Check if there is an enrollment for this course
            enrollment = Enrollment.objects.filter(student=request.user, course=obj.course).first()
            if enrollment:
                progress = Progress.objects.filter(enrollment=enrollment, lesson=obj).first()
                return progress.is_completed if progress else False
        return False


class ReviewSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_avatar = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ('id', 'student', 'student_name', 'student_avatar', 'rating', 'comment', 'created_at')
        read_only_fields = ('student', 'created_at')

    def get_student_name(self, obj):
        return f"{obj.student.first_name} {obj.student.last_name}"

    def get_student_avatar(self, obj):
        if hasattr(obj.student, 'profile') and obj.student.profile.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.student.profile.avatar.url)
            return obj.student.profile.avatar.url
        return None

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value


class CourseListSerializer(serializers.ModelSerializer):
    instructor_name = serializers.SerializerMethodField()
    category_name = serializers.CharField(source='category.name', read_only=True)
    average_rating = serializers.SerializerMethodField()
    enrollment_count = serializers.IntegerField(source='enrollments.count', read_only=True)

    class Meta:
        model = Course
        fields = (
            'id', 'title', 'slug', 'description', 'thumbnail', 'price', 
            'level', 'instructor_name', 'category_name', 'average_rating', 
            'enrollment_count', 'is_published', 'created_at'
        )

    def get_instructor_name(self, obj):
        return f"{obj.instructor.first_name} {obj.instructor.last_name}"

    def get_average_rating(self, obj):
        avg = obj.reviews.aggregate(Avg('rating'))['rating__avg']
        return round(avg, 1) if avg else 0.0


class CourseDetailSerializer(serializers.ModelSerializer):
    instructor = UserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    lessons = LessonSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    average_rating = serializers.SerializerMethodField()
    is_enrolled = serializers.SerializerMethodField()
    is_wishlisted = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = (
            'id', 'title', 'slug', 'description', 'thumbnail', 'price', 
            'level', 'is_published', 'instructor', 'category', 'lessons', 
            'reviews', 'average_rating', 'is_enrolled', 'is_wishlisted', 
            'created_at', 'updated_at'
        )

    def get_average_rating(self, obj):
        avg = obj.reviews.aggregate(Avg('rating'))['rating__avg']
        return round(avg, 1) if avg else 0.0

    def get_is_enrolled(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Enrollment.objects.filter(student=request.user, course=obj).exists()
        return False

    def get_is_wishlisted(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Wishlist.objects.filter(user=request.user, course=obj).exists()
        return False


class ProgressSerializer(serializers.ModelSerializer):
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)

    class Meta:
        model = Progress
        fields = ('id', 'lesson', 'lesson_title', 'is_completed', 'completed_at')


class EnrollmentSerializer(serializers.ModelSerializer):
    course = CourseListSerializer(read_only=True)
    progress_percentage = serializers.SerializerMethodField()
    completed_lessons_count = serializers.SerializerMethodField()
    total_lessons_count = serializers.SerializerMethodField()

    class Meta:
        model = Enrollment
        fields = (
            'id', 'course', 'enrolled_at', 'completed', 'completed_at', 
            'progress_percentage', 'completed_lessons_count', 'total_lessons_count'
        )

    def get_total_lessons_count(self, obj):
        return obj.course.lessons.count()

    def get_completed_lessons_count(self, obj):
        return Progress.objects.filter(enrollment=obj, is_completed=True).count()

    def get_progress_percentage(self, obj):
        total = self.get_total_lessons_count(obj)
        if total == 0:
            return 0
        completed = self.get_completed_lessons_count(obj)
        return int((completed / total) * 100)


class WishlistSerializer(serializers.ModelSerializer):
    course = CourseListSerializer(read_only=True)
    course_id = serializers.PrimaryKeyRelatedField(
        queryset=Course.objects.filter(is_published=True), 
        source='course', 
        write_only=True
    )

    class Meta:
        model = Wishlist
        fields = ('id', 'course', 'course_id', 'created_at')

    def create(self, validated_data):
        user = self.context['request'].user
        course = validated_data['course']
        wishlist_item, created = Wishlist.objects.get_or_create(user=user, course=course)
        return wishlist_item
