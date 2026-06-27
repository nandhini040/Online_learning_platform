import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, BookOpen, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role === 'ADMIN') navigate('/admin/dashboard');
      else if (user.role === 'INSTRUCTOR') navigate('/instructor/dashboard');
      else navigate('/student/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Demo credentials
  const demoAccounts = [
    { label: 'Admin', email: 'admin@skillsphere.com', password: 'AdminPass123!' },
    { label: 'Instructor', email: 'instructor@skillsphere.com', password: 'InstructorPass123!' },
    { label: 'Student', email: 'student@skillsphere.com', password: 'StudentPass123!' },
  ];

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: 'var(--bg-base)',
    }}>
      {/* Left Panel - Decorative */}
      <div style={{
        flex: 1, display: 'none',
        background: 'var(--gradient-dark)',
        position: 'relative', overflow: 'hidden',
      }} className="md:flex flex-col items-center justify-center p-12">
        {/* Animated blobs */}
        <div style={{
          position: 'absolute', width: 400, height: 400, borderRadius: '50%',
          background: 'rgba(99,102,241,0.2)', filter: 'blur(80px)',
          top: -100, left: -100,
        }} />
        <div style={{
          position: 'absolute', width: 300, height: 300, borderRadius: '50%',
          background: 'rgba(6,182,212,0.2)', filter: 'blur(80px)',
          bottom: -50, right: -50,
        }} />

        <div style={{ position: 'relative', textAlign: 'center', color: 'white' }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20, margin: '0 auto 24px',
            background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(99,102,241,0.5)',
          }} className="animate-float">
            <BookOpen size={36} color="white" />
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: 16 }}>
            Welcome back to<br />SkillSphere
          </h1>
          <p style={{ opacity: 0.7, fontSize: 16, maxWidth: 320, lineHeight: 1.7 }}>
            Continue your learning journey. Thousands of courses are waiting for you.
          </p>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 32, marginTop: 48, justifyContent: 'center' }}>
            {[['10K+', 'Students'], ['500+', 'Courses'], ['200+', 'Instructors']].map(([n, l]) => (
              <div key={l}>
                <p style={{ fontSize: 28, fontWeight: 800 }}>{n}</p>
                <p style={{ fontSize: 13, opacity: 0.6 }}>{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div style={{
        width: '100%', maxWidth: 480,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 40,
        background: 'var(--bg-surface)',
      }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <BookOpen size={18} color="white" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20,
              background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>SkillSphere</span>
          </div>

          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: 'var(--text-primary)', marginBottom: 8 }}>
            Sign in
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 28 }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
              Create one free
            </Link>
          </p>

          {/* Demo Credentials */}
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>DEMO ACCOUNTS:</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {demoAccounts.map(acc => (
                <button key={acc.label} onClick={() => setForm({ email: acc.email, password: acc.password })}
                  style={{
                    padding: '4px 12px', borderRadius: 8, border: '1px solid var(--border-color)',
                    background: 'var(--bg-elevated)', cursor: 'pointer',
                    fontSize: 12, fontWeight: 600, color: 'var(--primary)',
                  }}>
                  {acc.label}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              padding: '12px 16px', borderRadius: 10, marginBottom: 20,
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
              display: 'flex', alignItems: 'center', gap: 8, color: '#ef4444', fontSize: 13,
            }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                Email address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="email" required
                  className="input-field"
                  style={{ paddingLeft: 42 }}
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Password</label>
                <Link to="/forgot-password" style={{ fontSize: 12, color: 'var(--primary)', textDecoration: 'none' }}>
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type={showPwd ? 'text' : 'password'} required
                  className="input-field"
                  style={{ paddingLeft: 42, paddingRight: 42 }}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                />
                <button type="button" onClick={() => setShowPwd(p => !p)} style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                }}>
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', padding: '13px', fontSize: 15, marginTop: 8 }}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
