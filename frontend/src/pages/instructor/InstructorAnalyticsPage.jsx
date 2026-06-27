import { useState, useEffect } from 'react';
import { BarChart2, Users, Star, TrendingUp, DollarSign } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import DashboardSidebar from '../../components/DashboardSidebar';
import { Loader } from '../../components/UI';
import api from '../../services/api';

export default function InstructorAnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboards/instructor/analytics/')
      .then(res => setStats(res.data))
      .catch(err => {
        console.error(err);
        // Fallback demo data
        setStats({
          total_students: 0,
          total_revenue: 0,
          average_rating: 0,
          monthly_enrollments: [],
          course_ratings: [],
        });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', flex: 1 }}><DashboardSidebar /><div style={{ flex: 1 }}><Loader /></div></div>;

  // Demo data if API returns empty
  const enrollmentData = stats?.monthly_enrollments?.length > 0
    ? stats.monthly_enrollments
    : [
        { month: 'Jan', enrollments: 4 }, { month: 'Feb', enrollments: 9 },
        { month: 'Mar', enrollments: 6 }, { month: 'Apr', enrollments: 15 },
        { month: 'May', enrollments: 11 }, { month: 'Jun', enrollments: 20 },
      ];

  const ratingData = stats?.course_ratings?.length > 0
    ? stats.course_ratings
    : [];

  return (
    <div style={{ display: 'flex', flex: 1, background: 'var(--bg-base)' }}>
      <DashboardSidebar />
      <main style={{ flex: 1, padding: '32px 40px', overflowY: 'auto' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: 'var(--text-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
            <BarChart2 size={28} color="var(--primary)" /> Analytics
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Track your course performance and revenue.</p>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 32 }}>
          {[
            { icon: <Users size={22}/>, color: '#6366f1', label: 'Total Students', value: stats?.total_students || 0 },
            { icon: <DollarSign size={22}/>, color: '#10b981', label: 'Revenue', value: `$${stats?.total_revenue || 0}` },
            { icon: <Star size={22}/>, color: '#f59e0b', label: 'Avg Rating', value: stats?.average_rating || '0.0' },
            { icon: <TrendingUp size={22}/>, color: '#06b6d4', label: 'This Month', value: enrollmentData[enrollmentData.length - 1]?.enrollments || 0 },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding: 20 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `${s.color}15`, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                {s.icon}
              </div>
              <p style={{ fontSize: 26, fontWeight: 900, color: 'var(--text-primary)' }}>{s.value}</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Enrollment Chart */}
        <div className="card" style={{ padding: 24, marginBottom: 24 }}>
          <h2 style={{ fontWeight: 800, fontSize: 18, color: 'var(--text-primary)', marginBottom: 24 }}>
            Monthly Enrollments
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={enrollmentData}>
              <defs>
                <linearGradient id="enrollGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 8 }} />
              <Area type="monotone" dataKey="enrollments" stroke="#6366f1" strokeWidth={2.5} fill="url(#enrollGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Ratings Chart */}
        {ratingData.length > 0 && (
          <div className="card" style={{ padding: 24 }}>
            <h2 style={{ fontWeight: 800, fontSize: 18, color: 'var(--text-primary)', marginBottom: 24 }}>
              Course Ratings
            </h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={ratingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="title" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 5]} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 8 }} />
                <Bar dataKey="rating" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </main>
    </div>
  );
}
