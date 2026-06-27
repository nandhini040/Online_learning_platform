from rest_framework import serializers
from .models import Certificate
from courses.serializers import CourseListSerializer
from accounts.serializers import UserSerializer

class CertificateSerializer(serializers.ModelSerializer):
    student = UserSerializer(read_only=True)
    course = CourseListSerializer(read_only=True)
    pdf_url = serializers.SerializerMethodField()
    qr_code_url = serializers.SerializerMethodField()

    class Meta:
        model = Certificate
        fields = ('id', 'student', 'course', 'issued_at', 'pdf_url', 'qr_code_url')

    def get_pdf_url(self, obj):
        if obj.pdf_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.pdf_file.url)
            return obj.pdf_file.url
        return None

    def get_qr_code_url(self, obj):
        if obj.qr_code_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.qr_code_file.url)
            return obj.qr_code_file.url
        return None
