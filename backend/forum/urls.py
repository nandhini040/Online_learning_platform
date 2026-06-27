from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DiscussionForumViewSet, CommentViewSet

router = DefaultRouter()
router.register('forums', DiscussionForumViewSet, basename='forum')
router.register('comments', CommentViewSet, basename='comment')

urlpatterns = [
    path('', include(router.urls)),
]
