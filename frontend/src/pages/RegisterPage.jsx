import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, BookOpen, AlertCircle, CheckCircle, GraduationCap } from 'lucide-react';
import api from '../services/api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState('register'); // 'register' | 'verify'
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: '', role_name: 'STUDENT' });
  const [otp, setOtp] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await api.post('/auth/register/', form);
      setStep('verify');
      setSuccess(`Account created! Check your email (or the Django server terminal) for the OTP code.`);
    } catch (err) {
      const data = err.response?.data;
      setError(Object.values(data || {}).flat()[0] || 'Registration failed.');
    } finally { setLoading(false); }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await api.post('/auth/verify-otp/', { email: form.email, otp });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid or expired OTP.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-base)' }}>
      {/* Left decorative panel */}
      <div style={{
        flex: 1, display: 'none',
        background: 'var(--gradient-dark)', position: 'relative', overflow: 'hidden',
      }} className="lg:flex flex-col items-center justify-center p-12">
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'rgba(99,102,241,0.2)', filter: 'blur(80px)', top: -100, right: -100 }} />
        <div style={{ position: 'relative', textAlign: 'center', color: 'white' }}>
          <h1 style={{ fontSize: 36, fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: 16 }}>
            Start Your Learning<br />Journey Today
          </h1>
          <p style={{ opacity: 0.7, fontSize: 16, maxWidth: 320, lineHeight: 1.7, margin: '0 auto 40px' }}>
            Join thousands of learners who are mastering new skills every day.
          </p>
          {[
            { icon: '🎓', title: 'Expert Instructors', desc: 'Learn from industry professionals' },
            { icon: '📜', title: 'Verified Certificates', desc: 'Get recognized for your skills' },
            { icon: '🏆', title: 'Gamified Learning', desc: 'Earn XP, badges and climb leaderboards' },
          ].map(f => (
            <div key={f.title} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, textAlign: 'left' }}>
              <span style={{ fontSize: 28 }}>{f.icon}</span>
              <div>
                <p style={{ fontWeight: 700, fontSize: 15 }}>{f.title}</p>
                <p style={{ opacity: 0.6, fontSize: 13 }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div style={{ width: '100%', maxWidth: 500, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, background: 'var(--bg-surface)' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={18} color="white" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, background: 'linear-gradient(135deg, #6366f1, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SkillSphere</span>
          </div>

          {step === 'register' ? (
            <>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, color: 'var(--text-primary)', marginBottom: 6 }}>Create an account</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 28 }}>
                Already have an account?{' '}
                <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
              </p>

              {error && <ErrorAlert msg={error} />}

              {/* Role Selection */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                {[{ val: 'STUDENT', icon: '🎓', label: 'Student', desc: 'I want to learn' }, { val: 'INSTRUCTOR', icon: '👨‍🏫', label: 'Instructor', desc: 'I want to teach' }].map(r => (
                  <button key={r.val} type="button" onClick={() => setForm(p => ({ ...p, role_name: r.val }))}
                    style={{
                      padding: 14, borderRadius: 12, border: `2px solid ${form.role_name === r.val ? 'var(--primary)' : 'var(--border-color)'}`,
                      background: form.role_name === r.val ? 'rgba(99,102,241,0.08)' : 'var(--bg-elevated)',
                      cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                    }}>
                    <div style={{ fontSize: 24, marginBottom: 4 }}>{r.icon}</div>
                    <p style={{ fontWeight: 700, fontSize: 13, color: form.role_name === r.val ? 'var(--primary)' : 'var(--text-primary)' }}>{r.label}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.desc}</p>
                  </button>
                ))}
              </div>

              <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <InputField icon={<User size={15}/>} placeholder="First name" value={form.first_name} onChange={v => setForm(p => ({ ...p, first_name: v }))} required />
                  <InputField icon={<User size={15}/>} placeholder="Last name" value={form.last_name} onChange={v => setForm(p => ({ ...p, last_name: v }))} required />
                </div>
                <InputField icon={<Mail size={15}/>} type="email" placeholder="Email address" value={form.email} onChange={v => setForm(p => ({ ...p, email: v }))} required />
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input type={showPwd ? 'text' : 'password'} required placeholder="Password (min 8 chars)"
                    className="input-field" style={{ paddingLeft: 42, paddingRight: 42 }}
                    value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
                  <button type="button" onClick={() => setShowPwd(p => !p)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    {showPwd ? <EyeOff size={15}/> : <Eye size={15}/>}
                  </button>
                </div>
                <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', padding: '13px', marginTop: 8 }}>
                  {loading ? 'Creating account…' : 'Create Account'}
                </button>
              </form>
            </>
          ) : (
            <>
              <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Mail size={28} color="var(--primary)" />
                </div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, color: 'var(--text-primary)', marginBottom: 8 }}>Verify Your Email</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>
                  {success}
                </p>
              </div>

              {error && <ErrorAlert msg={error} />}

              <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>Enter 6-digit OTP</label>
                  <input type="text" required maxLength={6} className="input-field"
                    style={{ fontSize: 24, textAlign: 'center', letterSpacing: 12, fontWeight: 700 }}
                    placeholder="000000"
                    value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} />
                </div>
                <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', padding: '13px' }}>
                  {loading ? 'Verifying…' : 'Verify Account'}
                </button>
                <button type="button" onClick={async () => {
                  await api.post('/auth/resend-otp/', { email: form.email });
                  setSuccess('New OTP sent! Check Django terminal.');
                }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontSize: 13, fontWeight: 600 }}>
                  Resend OTP
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function InputField({ icon, ...props }) {
  const { onChange, value, ...rest } = props;
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>{icon}</div>
      <input {...rest} className="input-field" style={{ paddingLeft: 42 }} value={value} onChange={e => onChange(e.target.value)} />
    </div>
  );
}

function ErrorAlert({ msg }) {
  return (
    <div style={{ padding: '12px 16px', borderRadius: 10, marginBottom: 16, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', gap: 8, color: '#ef4444', fontSize: 13 }}>
      <AlertCircle size={16} /> {msg}
    </div>
  );
}
