import { useState, useEffect } from 'react';
import { User, Mail, Link as LinkIcon, Edit2, AlertCircle } from 'lucide-react';
import DashboardSidebar from '../components/DashboardSidebar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    api.get('/auth/profile/')
      .then(res => {
        setProfile(res.data);
        setFormData({
           bio: res.data.bio || '',
           social_links: res.data.social_links || '',
           avatar: res.data.avatar || ''
        });
      })
      .catch(err => console.error(err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await api.patch('/auth/profile/', formData);
      setProfile(res.data);
      // If we also allowed updating first_name/last_name here, we'd call updateUser()
      setSuccess('Profile updated successfully!');
      setEditing(false);
    } catch (err) {
      setError('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flex: 1, background: 'var(--bg-base)' }}>
      <DashboardSidebar />
      <main style={{ flex: 1, padding: '32px 40px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
           <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: 'var(--text-primary)', marginBottom: 6 }}>
                My Profile
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Manage your personal information and settings.</p>
           </div>
           {!editing && (
              <button onClick={() => setEditing(true)} className="btn-secondary" style={{ gap: 8 }}>
                <Edit2 size={16}/> Edit Profile
              </button>
           )}
        </div>

        {error && (
          <div style={{ padding: '12px 16px', borderRadius: 10, marginBottom: 24, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', gap: 8, color: '#ef4444', fontSize: 14 }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}
        {success && (
          <div style={{ padding: '12px 16px', borderRadius: 10, marginBottom: 24, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: 'var(--success)', fontSize: 14 }}>
            {success}
          </div>
        )}

        <div className="card" style={{ padding: 32, maxWidth: 800 }}>
          {/* Avatar Section */}
          <div style={{ display: 'flex', gap: 24, alignItems: 'center', marginBottom: 32 }}>
            <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 36, fontWeight: 800, overflow: 'hidden' }}>
              {profile?.avatar ? <img src={profile.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (user?.first_name?.[0] || 'U')}
            </div>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>{user?.first_name} {user?.last_name}</h2>
              <span className="badge badge-primary" style={{ marginTop: 6, display: 'inline-flex' }}>{user?.role}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div>
                   <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>Email</label>
                   <div style={{ position: 'relative' }}>
                      <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input type="email" className="input-field" style={{ paddingLeft: 42, opacity: 0.7 }} value={user?.email || ''} disabled />
                   </div>
                </div>
                <div>
                   <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>Role</label>
                   <div style={{ position: 'relative' }}>
                      <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input type="text" className="input-field" style={{ paddingLeft: 42, opacity: 0.7 }} value={user?.role || ''} disabled />
                   </div>
                </div>
             </div>

             <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>Bio</label>
                <textarea 
                  className="input-field" 
                  style={{ minHeight: 120, resize: 'vertical' }}
                  placeholder="Tell us a bit about yourself..."
                  value={editing ? formData.bio : (profile?.bio || 'No bio provided.')}
                  onChange={e => setFormData(p => ({ ...p, bio: e.target.value }))}
                  disabled={!editing}
                />
             </div>

             <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>Social Links (LinkedIn, GitHub, etc)</label>
                <div style={{ position: 'relative' }}>
                   <LinkIcon size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                   <input 
                     type="text" className="input-field" style={{ paddingLeft: 42 }}
                     placeholder="https://linkedin.com/in/..."
                     value={editing ? formData.social_links : (profile?.social_links || 'No links provided.')}
                     onChange={e => setFormData(p => ({ ...p, social_links: e.target.value }))}
                     disabled={!editing}
                   />
                </div>
             </div>

             {editing && (
               <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                 <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '12px 24px' }}>
                   {loading ? 'Saving...' : 'Save Changes'}
                 </button>
                 <button type="button" className="btn-ghost" onClick={() => setEditing(false)}>
                   Cancel
                 </button>
               </div>
             )}
          </form>
        </div>
      </main>
    </div>
  );
}
