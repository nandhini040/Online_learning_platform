import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, BookOpen, UserCheck, DollarSign, Activity, AlertTriangle } from 'lucide-react';
import DashboardSidebar from '../../components/DashboardSidebar';
import { Loader } from '../../components/UI';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboards/admin/')
      .then(res => setStats(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', flex: 1 }}><DashboardSidebar /><div style={{ flex: 1 }}><Loader /></div></div>;

  return (
    <div style={{ display: 'flex', flex: 1, background: 'var(--bg-base)' }}>
      <DashboardSidebar />
      <main style={{ flex: 1, padding: '32px 40px', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: 'var(--text-primary)', marginBottom: 6 }}>
            Admin Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>System overview and key metrics.</p>
        </div>

        {/* Quick Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24, marginBottom: 32 }}>
          <StatCard icon={<Users size={24}/>} color="#6366f1" label="Total Users" value={stats?.total_users || 0} />
          <StatCard icon={<BookOpen size={24}/>} color="#10b981" label="Total Courses" value={stats?.total_courses || 0} />
          <StatCard icon={<UserCheck size={24}/>} color="#f59e0b" label="Pending Instructors" value={stats?.pending_instructors || 0} alert={stats?.pending_instructors > 0} />
          <StatCard icon={<DollarSign size={24}/>} color="#06b6d4" label="Total Revenue" value={`$${stats?.total_revenue || 0}`} />
        </div>

        {/* Pending Instructors Alert */}
        {stats?.pending_instructors > 0 && (
          <div className="card" style={{ padding: 24, marginBottom: 32, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
               <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(245,158,11,0.2)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertTriangle size={24}/>
               </div>
               <div style={{ flex: 1 }}>
                  <h3 style={{ fontWeight: 700, fontSize: 16, color: '#b45309', marginBottom: 4 }}>Action Required</h3>
                  <p style={{ fontSize: 14, color: '#92400e' }}>There are {stats.pending_instructors} instructor applications waiting for your approval.</p>
               </div>
               <Link to="/admin/approvals" className="btn-primary" style={{ background: '#f59e0b', boxShadow: 'none' }}>Review Applications</Link>
            </div>
          </div>
        )}

        {/* System Activity */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
             <Activity size={20} color="var(--primary)" />
             <h2 style={{ fontWeight: 800, fontSize: 18, color: 'var(--text-primary)' }}>System Status</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: 16, background: 'var(--bg-elevated)', borderRadius: 12 }}>
               <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Database Connection</span>
               <span style={{ color: 'var(--success)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)' }} /> Healthy
               </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: 16, background: 'var(--bg-elevated)', borderRadius: 12 }}>
               <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>WebSocket / Channels</span>
               <span style={{ color: 'var(--success)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)' }} /> Connected
               </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon, color, label, value, alert }) {
  return (
    <div className="card" style={{ padding: 24, position: 'relative' }}>
      {alert && <div style={{ position: 'absolute', top: 16, right: 16, width: 10, height: 10, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 10px rgba(239,68,68,0.6)' }} className="animate-pulse" />}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
          {icon}
        </div>
        <div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4, fontWeight: 600 }}>{label}</p>
          <p style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</p>
        </div>
      </div>
    </div>
  );
}
