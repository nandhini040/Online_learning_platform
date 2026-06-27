import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, AlertCircle, CheckCircle, BookOpen } from 'lucide-react';
import api from '../services/api';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState('request'); // 'request' | 'reset' | 'done'
  const [form, setForm] = useState({ email: '', otp: '', new_password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRequest = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await api.post('/auth/forgot-password/', { email: form.email });
      setStep('reset');
    } catch (err) {
      setError(err.response?.data?.email?.[0] || 'Request failed.');
    } finally { setLoading(false); }
  };

  const handleReset = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await api.post('/auth/reset-password/', form);
      setStep('done');
    } catch (err) {
      setError(err.response?.data?.error || 'Reset failed. Check your OTP.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div className="card" style={{ padding: 40 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              {step === 'done' ? <CheckCircle size={24} color="var(--success)" /> : <Mail size={24} color="var(--primary)" />}
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, color: 'var(--text-primary)', marginBottom: 8 }}>
              {step === 'done' ? 'Password Reset!' : 'Forgot Password?'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              {step === 'request' && "No worries — we'll send an OTP to your email."}
              {step === 'reset' && 'Enter the OTP from the Django terminal and your new password.'}
              {step === 'done' && 'Your password has been reset. You can now sign in.'}
            </p>
          </div>

          {error && (
            <div style={{ padding: '12px 16px', borderRadius: 10, marginBottom: 16, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', gap: 8, color: '#ef4444', fontSize: 13 }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {step === 'request' && (
            <form onSubmit={handleRequest} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <input type="email" required className="input-field" placeholder="Enter your email address"
                value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
              <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', padding: '13px' }}>
                {loading ? 'Sending…' : 'Send OTP'}
              </button>
            </form>
          )}

          {step === 'reset' && (
            <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <input type="text" required maxLength={6} className="input-field"
                style={{ fontSize: 22, textAlign: 'center', letterSpacing: 10, fontWeight: 700 }}
                placeholder="000000" value={form.otp}
                onChange={e => setForm(p => ({ ...p, otp: e.target.value.replace(/\D/g, '') }))} />
              <input type="password" required className="input-field" placeholder="New password"
                value={form.new_password} onChange={e => setForm(p => ({ ...p, new_password: e.target.value }))} />
              <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', padding: '13px' }}>
                {loading ? 'Resetting…' : 'Reset Password'}
              </button>
            </form>
          )}

          {step === 'done' && (
            <Link to="/login" className="btn-primary" style={{ display: 'block', textAlign: 'center', padding: '13px' }}>
              Back to Sign In
            </Link>
          )}

          {step !== 'done' && (
            <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
              Remember it? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
