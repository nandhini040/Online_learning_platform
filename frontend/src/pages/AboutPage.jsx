import { Users, Target, Shield, BookOpen } from 'lucide-react';

export default function AboutPage() {
  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
      {/* Hero Section */}
      <section style={{ background: 'var(--gradient-dark)', padding: '100px 24px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(36px, 5vw, 56px)', color: 'white', marginBottom: 24 }}>
          About SkillSphere
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 18, maxWidth: 600, margin: '0 auto', lineHeight: 1.7 }}>
          We are on a mission to democratize education and empower individuals worldwide through accessible, high-quality learning.
        </p>
      </section>

      {/* Mission & Vision */}
      <section style={{ padding: '80px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 40 }}>
          <div className="card" style={{ padding: 40 }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(99,102,241,0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
              <Target size={32} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, marginBottom: 16 }}>Our Mission</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 16 }}>
              To provide affordable, industry-relevant education that bridges the gap between traditional schooling and real-world professional requirements.
            </p>
          </div>
          
          <div className="card" style={{ padding: 40 }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(16,185,129,0.1)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
              <BookOpen size={32} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, marginBottom: 16 }}>Our Vision</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 16 }}>
              A world where anyone, anywhere has the opportunity to transform their life through learning and meaningful skill development.
            </p>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section style={{ padding: '80px 24px', background: 'var(--bg-surface)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 32, textAlign: 'center', marginBottom: 60 }}>
            Our Core Values
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 32 }}>
            {[
              { icon: <Users size={24}/>, title: 'Community First', text: 'We foster a collaborative environment where learners and instructors thrive together.' },
              { icon: <Shield size={24}/>, title: 'Trust & Quality', text: 'We maintain rigorous standards for course content and verified certifications.' },
              { icon: <BookOpen size={24}/>, title: 'Lifelong Learning', text: 'We believe education is a continuous journey that never truly ends.' }
            ].map(v => (
              <div key={v.title} style={{ textAlign: 'center' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}>
                  {v.icon}
                </div>
                <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 12 }}>{v.title}</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
