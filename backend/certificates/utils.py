import os
import qrcode
from io import BytesIO
from django.core.files.base import ContentFile
from django.utils import timezone
from reportlab.lib.pagesizes import letter, landscape
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from .models import Certificate

def generate_certificate_pdf(certificate):
    student = certificate.student
    course = certificate.course
    cert_id = str(certificate.id)

    # 1. Generate QR Code
    # In a real environment, this would point to the deployed frontend url
    verification_url = f"http://localhost:5173/verify-certificate/{cert_id}"
    
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=1,
    )
    qr.add_data(verification_url)
    qr.make(fit=True)
    
    qr_img = qr.make_image(fill_color="#1e293b", back_color="white")
    qr_buffer = BytesIO()
    qr_img.save(qr_buffer, format='PNG')
    qr_buffer.seek(0)
    
    # Save QR code file
    certificate.qr_code_file.save(f"qr_{cert_id}.png", ContentFile(qr_buffer.read()), save=False)

    # 2. Generate PDF using ReportLab
    pdf_buffer = BytesIO()
    
    # Page size: Landscape Letter (792 x 612 points)
    width, height = landscape(letter)
    p = canvas.Canvas(pdf_buffer, pagesize=landscape(letter))
    
    # Outer Border (Navy)
    p.setStrokeColor(colors.HexColor("#1e3a8a"))  # Deep Navy Blue
    p.setLineWidth(10)
    p.rect(15, 15, width - 30, height - 30)
    
    # Inner Border (Gold/Bronze accent)
    p.setStrokeColor(colors.HexColor("#d97706"))  # Warm Amber
    p.setLineWidth(2)
    p.rect(25, 25, width - 50, height - 50)
    
    # Background subtle details - corner triangles
    # Top-Left Accent
    p.setFillColor(colors.HexColor("#1e3a8a"))
    path = p.beginPath()
    path.moveTo(25, height - 25)
    path.lineTo(100, height - 25)
    path.lineTo(25, height - 100)
    path.close()
    p.drawPath(path, fill=1, stroke=0)
    
    # Top-Right Accent
    path = p.beginPath()
    path.moveTo(width - 25, height - 25)
    path.lineTo(width - 100, height - 25)
    path.lineTo(width - 25, height - 100)
    path.close()
    p.drawPath(path, fill=1, stroke=0)
    
    # Certificate Header
    p.setFillColor(colors.HexColor("#1e293b"))  # Slate 800
    p.setFont("Helvetica-Bold", 36)
    p.drawCentredString(width / 2.0, 480, "SKILLSPHERE ACADEMY")
    
    p.setFont("Helvetica", 18)
    p.setFillColor(colors.HexColor("#475569"))  # Slate 600
    p.drawCentredString(width / 2.0, 440, "Empowering Learners Worldwide")
    
    # Gold divider line
    p.setStrokeColor(colors.HexColor("#d97706"))
    p.setLineWidth(3)
    p.line(width / 4.0, 415, width * 3 / 4.0, 415)
    
    p.setFont("Helvetica-Oblique", 22)
    p.setFillColor(colors.HexColor("#1e293b"))
    p.drawCentredString(width / 2.0, 360, "Certificate of Completion")
    
    p.setFont("Helvetica", 14)
    p.setFillColor(colors.HexColor("#64748b"))
    p.drawCentredString(width / 2.0, 320, "This is proudly presented to")
    
    # Student Name
    p.setFont("Helvetica-Bold", 32)
    p.setFillColor(colors.HexColor("#1e3a8a"))
    student_name = f"{student.first_name} {student.last_name}"
    p.drawCentredString(width / 2.0, 270, student_name.upper())
    
    # Divider for name
    p.setStrokeColor(colors.HexColor("#cbd5e1"))
    p.setLineWidth(1)
    p.line(width / 4.0, 255, width * 3 / 4.0, 255)
    
    p.setFont("Helvetica", 14)
    p.setFillColor(colors.HexColor("#64748b"))
    p.drawCentredString(width / 2.0, 225, "for successfully completing the course requirements for")
    
    # Course Title
    p.setFont("Helvetica-Bold", 24)
    p.setFillColor(colors.HexColor("#1e293b"))
    p.drawCentredString(width / 2.0, 180, f'"{course.title}"')
    
    # Instructor Signature Line
    p.setFont("Helvetica", 12)
    p.setFillColor(colors.HexColor("#475569"))
    p.drawString(100, 100, "_________________________")
    p.drawString(100, 80, "Authorized Instructor Signature")
    # Mock visual signature
    p.setFont("Times-BoldItalic", 20)
    p.setFillColor(colors.HexColor("#1e3a8a"))
    instructor_name = f"{course.instructor.first_name} {course.instructor.last_name}"
    p.drawString(110, 105, instructor_name)
    
    # Date line
    p.setFont("Helvetica", 12)
    p.setFillColor(colors.HexColor("#475569"))
    p.drawString(400, 100, "_________________________")
    date_str = timezone.now().strftime("%B %d, %Y")
    p.drawString(400, 80, f"Date Issued: {date_str}")
    p.drawString(400, 105, date_str)
    
    # Draw QR code in the corner
    # QR placement: Bottom Right
    qr_buffer.seek(0)
    # Write temporary file to pass to reportlab
    temp_qr_path = f"temp_qr_{cert_id}.png"
    with open(temp_qr_path, "wb") as f:
        f.write(qr_buffer.read())
        
    p.drawImage(temp_qr_path, width - 180, 60, width=100, height=100)
    os.remove(temp_qr_path)  # Cleanup temp file
    
    p.setFont("Helvetica", 8)
    p.setFillColor(colors.HexColor("#94a3b8"))
    p.drawString(width - 180, 50, f"Verify: {cert_id}")
    
    p.showPage()
    p.save()
    
    pdf_buffer.seek(0)
    certificate.pdf_file.save(f"cert_{cert_id}.pdf", ContentFile(pdf_buffer.read()), save=False)
    certificate.save()
    
    return certificate
