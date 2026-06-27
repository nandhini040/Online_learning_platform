from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from accounts.models import Role, Profile

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds default users (Admin, Instructor, Student) for demonstration and testing.'

    def handle(self, *args, **options):
        # 1. Ensure Roles are present
        admin_role, _ = Role.objects.get_or_create(name=Role.ADMIN)
        instructor_role, _ = Role.objects.get_or_create(name=Role.INSTRUCTOR)
        student_role, _ = Role.objects.get_or_create(name=Role.STUDENT)

        # 2. Create Admin
        admin_email = 'admin@skillsphere.com'
        if not User.objects.filter(email=admin_email).exists():
            admin_user = User.objects.create_superuser(
                email=admin_email,
                password='AdminPass123!',
                first_name='System',
                last_name='Admin'
            )
            self.stdout.write(self.style.SUCCESS(f'Admin user created successfully: {admin_email} / AdminPass123!'))
        else:
            self.stdout.write(self.style.WARNING(f'Admin user already exists: {admin_email}'))

        # 3. Create Instructor
        instructor_email = 'instructor@skillsphere.com'
        if not User.objects.filter(email=instructor_email).exists():
            instructor_user = User.objects.create_user(
                email=instructor_email,
                password='InstructorPass123!',
                first_name='Alex',
                last_name='Instructor',
                role=instructor_role,
                is_verified=True,
                is_approved=True  # Auto approve demo instructor
            )
            self.stdout.write(self.style.SUCCESS(f'Instructor user created successfully: {instructor_email} / InstructorPass123!'))
        else:
            self.stdout.write(self.style.WARNING(f'Instructor user already exists: {instructor_email}'))

        # 4. Create Student
        student_email = 'student@skillsphere.com'
        if not User.objects.filter(email=student_email).exists():
            student_user = User.objects.create_user(
                email=student_email,
                password='StudentPass123!',
                first_name='Jane',
                last_name='Student',
                role=student_role,
                is_verified=True,
                is_approved=True
            )
            self.stdout.write(self.style.SUCCESS(f'Student user created successfully: {student_email} / StudentPass123!'))
        else:
            self.stdout.write(self.style.WARNING(f'Student user already exists: {student_email}'))
