from django.db import migrations

def create_roles(apps, schema_editor):
    Role = apps.get_model('accounts', 'Role')
    Role.objects.get_or_create(name='ADMIN')
    Role.objects.get_or_create(name='INSTRUCTOR')
    Role.objects.get_or_create(name='STUDENT')

def delete_roles(apps, schema_editor):
    Role = apps.get_model('accounts', 'Role')
    Role.objects.filter(name__in=['ADMIN', 'INSTRUCTOR', 'STUDENT']).delete()

class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_roles, reverse_code=delete_roles),
    ]
