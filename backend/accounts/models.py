from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils import timezone
from datetime import timedelta

class Role(models.Model):
    ADMIN = 'ADMIN'
    INSTRUCTOR = 'INSTRUCTOR'
    STUDENT = 'STUDENT'
    
    ROLE_CHOICES = (
        (ADMIN, 'Admin'),
        (INSTRUCTOR, 'Instructor'),
        (STUDENT, 'Student'),
    )
    
    name = models.CharField(max_length=20, choices=ROLE_CHOICES, unique=True)

    def __str__(self):
        return self.get_name_display()


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        extra_fields.setdefault('is_active', True)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_verified', True)

        # Assign Admin role
        admin_role, _ = Role.objects.get_or_create(name=Role.ADMIN)
        extra_fields['role'] = admin_role

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    username = None  # Remove username field, use email instead
    email = models.EmailField(unique=True)
    role = models.ForeignKey(Role, on_delete=models.PROTECT, null=True, blank=True)
    
    is_verified = models.BooleanField(default=False)
    is_approved = models.BooleanField(default=False)
    
    # OTP Fields
    otp_code = models.CharField(max_length=6, null=True, blank=True)
    otp_expiry = models.DateTimeField(null=True, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    def generate_otp(self):
        import random
        self.otp_code = f"{random.randint(100000, 999999)}"
        self.otp_expiry = timezone.now() + timedelta(minutes=10)
        self.save()
        return self.otp_code

    def verify_otp(self, code):
        if not self.otp_code or not self.otp_expiry:
            return False
        if timezone.now() > self.otp_expiry:
            return False
        if self.otp_code == code:
            self.otp_code = None
            self.otp_expiry = None
            self.is_verified = True
            self.save()
            return True
        return False

    def __str__(self):
        return self.email


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    bio = models.TextField(blank=True, default='')
    phone = models.CharField(max_length=20, blank=True, default='')
    
    # Gamification and Streak Tracking
    learning_streak = models.IntegerField(default=0)
    last_active_date = models.DateField(null=True, blank=True)
    xp = models.IntegerField(default=0)
    level = models.IntegerField(default=1)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def add_xp(self, amount):
        self.xp += amount
        # Level up logic: Level = 1 + floor(sqrt(XP / 100)) or simple XP thresholds
        # Let's say every 500 XP is a level
        self.level = 1 + (self.xp // 500)
        self.save()

    def update_streak(self):
        today = timezone.now().date()
        if self.last_active_date == today:
            return
        elif self.last_active_date == today - timedelta(days=1):
            self.learning_streak += 1
            self.add_xp(50)  # XP reward for maintaining streak
        else:
            self.learning_streak = 1
            self.add_xp(10)  # Starting streak reward
        self.last_active_date = today
        self.save()

    def __str__(self):
        return f"Profile of {self.user.email}"
