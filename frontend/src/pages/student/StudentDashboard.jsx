import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Award, Zap, TrendingUp, Star, Play, ChevronRight } from 'lucide-react';
import DashboardSidebar from '../../components/DashboardSidebar';
import { ProgressBar, Loader } from '../../components/UI';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/dashboards/student/'),
      api.get('/courses/my_courses/'),
    ]).then(([statsRes, enrRes]) => {
      setStats(statsRes.data);
      setEnrollments((enrRes.data || []).slice(0, 4));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', flex: 1 }}><DashboardSidebar /><div style={{ flex: 1 }}><Loader /></div></div>;

  const xpPct = stats ? Math.min((stats.xp / stats.next_level_xp) * 100, 100) : 0;

  return (
    <div style={{ display: 'flex', flex: 1, background: 'var(--bg-base)' }}>
      <DashboardSidebar />
      <main style={{ flex: 1, padding: '32px 40px', overflowY: 'auto' }}>
        {/* Welcome Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: 'var(--text-primary)', marginBottom: 6 }}>
            Welcome back, {user?.first_name}! 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Continue your learning journey where you left off.</p>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20, marginBottom: 32 }}>
          <StatCard icon={<BookOpen size={22}/>} color="#6366f1" label="Enrolled Courses" value={stats?.enrolled_courses_count || 0} />
          <StatCard icon={<Award size={22}/>} color="#10b981" label="Completed" value={stats?.completed_courses_count || 0} />
          <StatCard icon={<Zap size={22}/>} color="#f59e0b" label="Day Streak" value={`${stats?.learning_streak || 0} 🔥`} />
          <StatCard icon={<TrendingUp size={22}/>} color="#06b6d4" label="XP Points" value={stats?.xp || 0} />
        </div>

        {/* Level & XP Progress */}
        <div className="card" style={{ padding: 24, marginBottom: 32, background: 'var(--gradient-card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #6366f1, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: 18 }}>
                {stats?.level || 1}
              </div>
              <div>
                <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 15 }}>Level {stats?.level || 1}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>SkillSphere Learner</p>
              </div>
            </div>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              {stats?.xp} / {stats?.next_level_xp} XP
            </span>
          </div>
          <ProgressBar value={xpPct} />
        </div>

        {/* Badges */}
        {stats?.badges?.length > 0 && (
          <div className="card" style={{ padding: 24, marginBottom: 32 }}>
            <h2 style={{ fontWeight: 800, fontSize: 18, color: 'var(--text-primary)', marginBottom: 20 }}>🏆 Your Badges</h2>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {stats.badges.map(badge => (
                <div key={badge.name} style={{ padding: '12px 16px', borderRadius: 12, background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(6,182,212,0.06))', border: '1px solid rgba(99,102,241,0.2)', textAlign: 'center', minWidth: 100 }}>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>
                    {badge.name === 'Streak Starter' ? '⚡' : badge.name === 'Quiz Master' ? '✅' : badge.name === 'SkillSphere Graduate' ? '🎓' : badge.name === 'Elite Learner' ? '👑' : '🏆'}
                  </div>
                  <p style={{ fontWeight: 700, fontSize: 11, color: 'var(--primary)' }}>{badge.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Courses */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontWeight: 800, fontSize: 18, color: 'var(--text-primary)' }}>📚 Continue Learning</h2>
            <Link to="/my-courses" className="btn-ghost" style={{ fontSize: 13, gap: 4 }}>View All <ChevronRight size={14}/></Link>
          </div>
          {enrollments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>You haven't enrolled in any courses yet.</p>
              <Link to="/courses" className="btn-primary">Browse Courses</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {enrollments.map(enr => (
                <div key={enr.id} style={{ display: 'flex', gap: 16, alignItems: 'center', padding: 16, borderRadius: 12, background: 'var(--bg-elevated)' }}>
                  <div style={{ width: 56, height: 56, borderRadius: 10, background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(6,182,212,0.15))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <BookOpen size={22} color="rgba(99,102,241,0.6)" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {enr.course?.title}
                    </p>
                    <ProgressBar value={enr.progress_percentage} />
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                      {enr.completed_lessons_count}/{enr.total_lessons_count} lessons
                    </p>
                  </div>
                  <Link to={`/courses/${enr.course?.id}`} className="btn-primary" style={{ padding: '8px 14px', fontSize: 12, flexShrink: 0, gap: 5 }}>
                    <Play size={12}/> Resume
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon, color, label, value }) {
  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, color }}>
        {icon}
      </div>
      <p style={{ fontSize: 26, fontWeight: 900, color: 'var(--text-primary)' }}>{value}</p>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{label}</p>
    </div>
  );
}
