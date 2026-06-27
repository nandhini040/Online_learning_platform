import { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1000);
  };

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh', padding: '80px 24px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(32px, 5vw, 48px)', marginBottom: 16 }}>
            Get in Touch
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 18, maxWidth: 600, margin: '0 auto' }}>
            Have questions about our platform? We're here to help you on your learning journey.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 40, alignItems: 'start' }} className="md:grid-cols-1">
          
          {/* Contact Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <div className="card" style={{ padding: 32 }}>
              <h3 style={{ fontWeight: 800, fontSize: 20, marginBottom: 24 }}>Contact Information</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(99,102,241,0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Mail size={24} />
                  </div>
                  <div>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Email Us</p>
                    <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>support@skillsphere.com</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(16,185,129,0.1)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Phone size={24} />
                  </div>
                  <div>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Call Us</p>
                    <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>+1 (555) 123-4567</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(245,158,11,0.1)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MapPin size={24} />
                  </div>
                  <div>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Visit Us</p>
                    <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>123 Learning Way, SF, CA</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="card" style={{ padding: 40 }}>
            {success ? (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--success)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                  <Send size={32} />
                </div>
                <h3 style={{ fontWeight: 800, fontSize: 24, marginBottom: 12 }}>Message Sent!</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Thank you for reaching out. Our support team will get back to you shortly.</p>
                <button onClick={() => setSuccess(false)} className="btn-secondary" style={{ marginTop: 24 }}>Send Another Message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>First Name</label>
                    <input type="text" className="input-field" required placeholder="John" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Last Name</label>
                    <input type="text" className="input-field" required placeholder="Doe" />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Email Address</label>
                  <input type="email" className="input-field" required placeholder="john@example.com" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Message</label>
                  <textarea className="input-field" required placeholder="How can we help you?" style={{ minHeight: 120, resize: 'vertical' }}></textarea>
                </div>
                <button type="submit" className="btn-primary" disabled={loading} style={{ padding: 14 }}>
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
