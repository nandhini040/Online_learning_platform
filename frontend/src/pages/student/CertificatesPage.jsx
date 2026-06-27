import { useState, useEffect } from 'react';
import { Award, Download, ExternalLink, CheckCircle } from 'lucide-react';
import DashboardSidebar from '../../components/DashboardSidebar';
import { Loader } from '../../components/UI';
import api from '../../services/api';

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/certificates/')
      .then(res => setCertificates(res.data.results || res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', flex: 1 }}><DashboardSidebar /><div style={{ flex: 1 }}><Loader /></div></div>;

  return (
    <div style={{ display: 'flex', flex: 1, background: 'var(--bg-base)' }}>
      <DashboardSidebar />
      <main style={{ flex: 1, padding: '32px 40px', overflowY: 'auto' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: 'var(--text-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
            <Award size={28} color="var(--primary)" /> My Certificates
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>{certificates.length} certificates earned</p>
        </div>

        {certificates.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <Award size={56} color="var(--border-color)" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontWeight: 700, fontSize: 20, color: 'var(--text-primary)', marginBottom: 8 }}>No certificates yet</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Complete a course to earn your first certificate!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 24 }}>
            {certificates.map(cert => (
              <div key={cert.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {/* Certificate visual */}
                <div style={{
                  padding: 32, textAlign: 'center',
                  background: 'linear-gradient(135deg, #1e1b4b 0%, #0c1a2e 100%)',
                  position: 'relative', overflow: 'hidden'
                }}>
                  <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', border: '1px solid rgba(99,102,241,0.2)', top: -60, right: -60 }} />
                  <div style={{ position: 'absolute', width: 150, height: 150, borderRadius: '50%', border: '1px solid rgba(6,182,212,0.2)', bottom: -40, left: -40 }} />
                  <Award size={48} color="#f59e0b" style={{ margin: '0 auto 12px' }} />
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>Certificate of Completion</p>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: 'white', lineHeight: 1.3, marginBottom: 8 }}>
                    {cert.course?.title || cert.course_title}
                  </h3>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
                    Issued {new Date(cert.issued_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>

                {/* Actions */}
                <div style={{ padding: 20, display: 'flex', gap: 10 }}>
                  <a href={cert.certificate_file} target="_blank" rel="noreferrer"
                    className="btn-primary" style={{ flex: 1, justifyContent: 'center', gap: 8, fontSize: 13, padding: '9px 12px' }}>
                    <Download size={14}/> Download PDF
                  </a>
                  <a href={`/certificates/verify/${cert.verification_code}/`} target="_blank" rel="noreferrer"
                    className="btn-secondary" style={{ flex: 1, justifyContent: 'center', gap: 8, fontSize: 13, padding: '9px 12px' }}>
                    <ExternalLink size={14}/> Verify
                  </a>
                </div>

                {/* Verification Code */}
                <div style={{ padding: '12px 20px', background: 'var(--bg-elevated)', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle size={13} color="var(--success)" />
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                    ID: {cert.verification_code}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
