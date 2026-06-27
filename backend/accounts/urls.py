from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView,
    VerifyOTPView,
    ResendOTPView,
    CustomTokenObtainPairView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
    ProfileView,
    AdminDashboardView,
    InstructorDashboardView,
    StudentDashboardView
)

urlpatterns = [
    # Auth endpoints
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('auth/resend-otp/', ResendOTPView.as_view(), name='resend-otp'),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/forgot-password/', PasswordResetRequestView.as_view(), name='forgot-password'),
    path('auth/reset-password/', PasswordResetConfirmView.as_view(), name='reset-password'),
    
    # Profile endpoint
    path('profile/', ProfileView.as_view(), name='profile'),
    
    # Dashboards
    path('dashboards/admin/', AdminDashboardView.as_view(), name='dashboard-admin'),
    path('dashboards/instructor/', InstructorDashboardView.as_view(), name='dashboard-instructor'),
    path('dashboards/student/', StudentDashboardView.as_view(), name='dashboard-student'),
]
