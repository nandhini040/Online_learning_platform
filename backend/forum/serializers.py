from rest_framework import serializers
from .models import DiscussionForum, Comment

class CommentSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    user_avatar = serializers.SerializerMethodField()
    replies = serializers.SerializerMethodField()  # Recursive serialization for nested comment threads

    class Meta:
        model = Comment
        fields = ('id', 'forum', 'user', 'user_name', 'user_avatar', 'text', 'parent', 'replies', 'created_at')
        read_only_fields = ('user', 'created_at')

    def get_user_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"

    def get_user_avatar(self, obj):
        if hasattr(obj.user, 'profile') and obj.user.profile.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.user.profile.avatar.url)
            return obj.user.profile.avatar.url
        return None

    def get_replies(self, obj):
        # Standard recursive relation serialization
        if obj.replies.exists():
            return CommentSerializer(obj.replies.all(), many=True, context=self.context).data
        return []


class DiscussionForumSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True)
    comments = serializers.SerializerMethodField()

    class Meta:
        model = DiscussionForum
        fields = ('id', 'course', 'course_title', 'comments', 'created_at')

    def get_comments(self, obj):
        # Only return top-level comments (replies are nested inside top-level comments)
        root_comments = obj.comments.filter(parent__isnull=True)
        return CommentSerializer(root_comments, many=True, context=self.context).data
