import { useState, useEffect } from 'react';
import { Bell, CheckCheck, BookOpen, Award, AlertCircle } from 'lucide-react';
import DashboardSidebar from '../components/DashboardSidebar';
import { Loader } from '../components/UI';
import api from '../services/api';

const iconMap = {
  enrollment: <BookOpen size={18} color="var(--primary)" />,
  certificate: <Award size={18} color="#f59e0b" />,
  default: <Bell size={18} color="var(--text-secondary)" />,
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/notifications/')
      .then(res => setNotifications(res.data.results || res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    try {
      await api.post('/notifications/mark_all_read/');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) { console.error(err); }
  };

  const markRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/`, { is_read: true });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) { console.error(err); }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) return <div style={{ display: 'flex', flex: 1 }}><DashboardSidebar /><div style={{ flex: 1 }}><Loader /></div></div>;

  return (
    <div style={{ display: 'flex', flex: 1, background: 'var(--bg-base)' }}>
      <DashboardSidebar />
      <main style={{ flex: 1, padding: '32px 40px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: 'var(--text-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
              <Bell size={26} /> Notifications
              {unreadCount > 0 && (
                <span style={{ background: '#ef4444', color: 'white', fontSize: 12, fontWeight: 700, borderRadius: 999, padding: '2px 8px' }}>
                  {unreadCount} new
                </span>
              )}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>{notifications.length} total notifications</p>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="btn-secondary" style={{ gap: 8, fontSize: 13 }}>
              <CheckCheck size={15}/> Mark all as read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <Bell size={56} color="var(--border-color)" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontWeight: 700, fontSize: 20, color: 'var(--text-primary)', marginBottom: 8 }}>You're all caught up!</h3>
            <p style={{ color: 'var(--text-secondary)' }}>No notifications at the moment.</p>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {notifications.map((n, i) => (
              <div
                key={n.id}
                onClick={() => !n.is_read && markRead(n.id)}
                style={{
                  display: 'flex', gap: 16, padding: '18px 24px',
                  borderBottom: i < notifications.length - 1 ? '1px solid var(--border-color)' : 'none',
                  background: n.is_read ? 'transparent' : 'rgba(99,102,241,0.04)',
                  cursor: n.is_read ? 'default' : 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {iconMap[n.notification_type] || iconMap.default}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: n.is_read ? 500 : 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 4 }}>
                    {n.title || n.message}
                  </p>
                  {n.title && <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{n.message}</p>}
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                    {new Date(n.created_at).toLocaleString()}
                  </p>
                </div>
                {!n.is_read && (
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', marginTop: 6, flexShrink: 0 }} />
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
