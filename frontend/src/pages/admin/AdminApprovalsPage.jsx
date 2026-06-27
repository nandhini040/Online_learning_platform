import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, User, Mail } from 'lucide-react';
import DashboardSidebar from '../../components/DashboardSidebar';
import { Loader } from '../../components/UI';
import api from '../../services/api';

export default function AdminApprovalsPage() {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchPending = () => {
    api.get('/auth/users/?role=INSTRUCTOR&is_approved=false')
      .then(res => setInstructors(res.data.results || res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPending(); }, []);

  const handleAction = async (userId, action) => {
    setActionLoading(userId);
    try {
      await api.post(`/auth/users/${userId}/${action}_instructor/`);
      setInstructors(prev => prev.filter(u => u.id !== userId));
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div style={{ display: 'flex', flex: 1 }}><DashboardSidebar /><div style={{ flex: 1 }}><Loader /></div></div>;

  return (
    <div style={{ display: 'flex', flex: 1, background: 'var(--bg-base)' }}>
      <DashboardSidebar />
      <main style={{ flex: 1, padding: '32px 40px', overflowY: 'auto' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: 'var(--text-primary)', marginBottom: 8 }}>
            Instructor Approvals
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
            Review and approve instructor applications.
          </p>
        </div>

        {instructors.length === 0 ? (
          <div className="card" style={{ padding: 60, textAlign: 'center' }}>
            <CheckCircle size={48} color="var(--success)" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontWeight: 700, fontSize: 20, color: 'var(--text-primary)', marginBottom: 8 }}>All caught up!</h3>
            <p style={{ color: 'var(--text-secondary)' }}>No pending instructor applications at this time.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {instructors.map(u => (
              <div key={u.id} className="card" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
                {/* Avatar */}
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 18, fontWeight: 700, flexShrink: 0 }}>
                  {u.first_name?.[0]}{u.last_name?.[0]}
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <h3 style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>{u.first_name} {u.last_name}</h3>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#f59e0b', fontWeight: 600, background: 'rgba(245,158,11,0.1)', padding: '2px 8px', borderRadius: 999 }}>
                      <Clock size={10}/> Pending Review
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 16, color: 'var(--text-secondary)', fontSize: 13 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Mail size={12}/> {u.email}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><User size={12}/> Applied {new Date(u.date_joined).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={() => handleAction(u.id, 'approve')}
                    disabled={actionLoading === u.id}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px', borderRadius: 9, border: 'none', background: 'var(--success)', color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer', opacity: actionLoading === u.id ? 0.6 : 1, transition: 'all 0.2s' }}>
                    <CheckCircle size={15}/> Approve
                  </button>
                  <button
                    onClick={() => handleAction(u.id, 'reject')}
                    disabled={actionLoading === u.id}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px', borderRadius: 9, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#ef4444', fontWeight: 700, fontSize: 13, cursor: 'pointer', opacity: actionLoading === u.id ? 0.6 : 1, transition: 'all 0.2s' }}>
                    <XCircle size={15}/> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
