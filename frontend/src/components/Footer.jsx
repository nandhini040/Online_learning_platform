import { Link } from 'react-router-dom';
import { BookOpen, Mail } from 'lucide-react';

function Github({ size = 24, ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function Twitter({ size = 24, ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  );
}

function Linkedin({ size = 24, ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}


export default function Footer() {
  return (
    <footer style={{
      background: 'var(--bg-surface)',
      borderTop: '1px solid var(--border-color)',
      marginTop: 'auto',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 24px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40, marginBottom: 48 }}>

          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <BookOpen size={18} color="white" />
              </div>
              <span style={{
                fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20,
                background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>SkillSphere</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7, maxWidth: 220 }}>
              Empowering learners worldwide with quality education and industry-ready skills.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              {[Github, Twitter, Linkedin, Mail].map((Icon, i) => (
                <a key={i} href="#" style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: 'var(--bg-elevated)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-secondary)', textDecoration: 'none',
                  transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = 'white'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <FooterSection title="Platform" links={[
            { label: 'Browse Courses', to: '/courses' },
            { label: 'Categories', to: '/categories' },
            { label: 'Become Instructor', to: '/register' },
            { label: 'Pricing', to: '/courses' },
          ]} />
          <FooterSection title="Company" links={[
            { label: 'About Us', to: '/about' },
            { label: 'Contact', to: '/contact' },
            { label: 'Blog', to: '/' },
            { label: 'Careers', to: '/' },
          ]} />
          <FooterSection title="Support" links={[
            { label: 'Help Center', to: '/' },
            { label: 'Privacy Policy', to: '/' },
            { label: 'Terms of Service', to: '/' },
            { label: 'Cookie Settings', to: '/' },
          ]} />
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid var(--border-color)',
          paddingTop: 24,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 12,
        }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            © {new Date().getFullYear()} SkillSphere. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: 4 }}>
            <span className="badge badge-primary" style={{ fontSize: 11 }}>v1.0</span>
            <span className="badge badge-success" style={{ fontSize: 11 }}>Production Ready</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterSection({ title, links }) {
  return (
    <div>
      <h4 style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 16, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
        {title}
      </h4>
      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {links.map((l) => (
          <li key={l.label}>
            <Link to={l.to} style={{
              color: 'var(--text-secondary)', fontSize: 14, textDecoration: 'none',
              transition: 'color 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
