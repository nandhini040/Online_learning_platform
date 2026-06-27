from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryViewSet, 
    CourseViewSet, 
    LessonViewSet, 
    VideoUploadView, 
    PDFNoteUploadView, 
    WishlistViewSet, 
    ReviewViewSet
)

router = DefaultRouter()
router.register('categories', CategoryViewSet, basename='category')
router.register('courses', CourseViewSet, basename='course')
router.register('lessons', LessonViewSet, basename='lesson')
router.register('wishlist', WishlistViewSet, basename='wishlist')
router.register('reviews', ReviewViewSet, basename='review')

urlpatterns = [
    path('', include(router.urls)),
    path('video-upload/', VideoUploadView.as_view(), name='video-upload'),
    path('pdf-upload/', PDFNoteUploadView.as_view(), name='pdf-upload'),
]
