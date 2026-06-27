import logging
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import Role, Profile

User = get_user_model()
logger = logging.getLogger(__name__)

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ('id', 'name')


class ProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name')
    last_name = serializers.CharField(source='user.last_name')
    role = serializers.CharField(source='user.role.name', read_only=True)
    is_verified = serializers.BooleanField(source='user.is_verified', read_only=True)
    is_approved = serializers.BooleanField(source='user.is_approved', read_only=True)

    class Meta:
        model = Profile
        fields = (
            'id', 'email', 'first_name', 'last_name', 'role', 'is_verified', 'is_approved',
            'avatar', 'bio', 'phone', 'learning_streak', 'xp', 'level', 'created_at'
        )
        read_only_fields = ('learning_streak', 'xp', 'level', 'created_at')

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        user = instance.user
        
        # Update User fields if provided
        if 'first_name' in user_data:
            user.first_name = user_data['first_name']
        if 'last_name' in user_data:
            user.last_name = user_data['last_name']
        user.save()

        # Update Profile fields
        instance.avatar = validated_data.get('avatar', instance.avatar)
        instance.bio = validated_data.get('bio', instance.bio)
        instance.phone = validated_data.get('phone', instance.phone)
        instance.save()
        return instance


class UserSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source='role.name', read_only=True)
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'role', 'is_verified', 'is_approved', 'profile')
        read_only_fields = ('is_verified', 'is_approved')


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    role_name = serializers.ChoiceField(choices=[Role.STUDENT, Role.INSTRUCTOR], write_only=True, required=True)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)

    class Meta:
        model = User
        fields = ('email', 'password', 'first_name', 'last_name', 'role_name')

    def create(self, validated_data):
        role_name = validated_data.pop('role_name')
        password = validated_data.pop('password')
        
        role_obj, _ = Role.objects.get_or_create(name=role_name)
        
        # Student auto-approved, instructor needs admin approval
        is_approved = True if role_name == Role.STUDENT else False

        user = User.objects.create_user(
            email=validated_data['email'],
            password=password,
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            role=role_obj,
            is_approved=is_approved,
            is_active=True
        )
        
        # Generate OTP verification code
        otp = user.generate_otp()
        
        # Simulating email dispatch - print clearly to console for local testing
        print("\n" + "="*50)
        print(f"MOCK EMAIL: Welcome {user.first_name}!")
        print(f"Verification OTP: {otp}")
        print("="*50 + "\n")
        
        return user


class OTPVerifySerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    otp = serializers.CharField(max_length=6, required=True)


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)

    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("User with this email does not exist.")
        return value


class PasswordResetConfirmSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    otp = serializers.CharField(max_length=6, required=True)
    new_password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
