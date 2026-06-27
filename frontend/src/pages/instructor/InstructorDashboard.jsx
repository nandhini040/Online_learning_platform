import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, Star, TrendingUp, Plus, DollarSign, ChevronRight } from 'lucide-react';
import DashboardSidebar from '../../components/DashboardSidebar';
import { Loader } from '../../components/UI';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function InstructorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/dashboards/instructor/'),
      api.get('/courses/my_taught_courses/'),
    ]).then(([statsRes, coursesRes]) => {
      setStats(statsRes.data);
      setCourses((coursesRes.data || []).slice(0, 4));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', flex: 1 }}><DashboardSidebar /><div style={{ flex: 1 }}><Loader /></div></div>;

  return (
    <div style={{ display: 'flex', flex: 1, background: 'var(--bg-base)' }}>
      <DashboardSidebar />
      <main style={{ flex: 1, padding: '32px 40px', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: 'var(--text-primary)', marginBottom: 6 }}>
              Instructor Dashboard
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Welcome back, {user?.first_name}! Here's your teaching summary.</p>
          </div>
          <Link to="/instructor/courses/new" className="btn-primary" style={{ gap: 8 }}>
            <Plus size={16}/> Create Course
          </Link>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 32 }}>
          <StatCard icon={<BookOpen size={24}/>} color="#6366f1" label="Total Courses" value={stats?.total_courses || 0} />
          <StatCard icon={<Users size={24}/>} color="#10b981" label="Total Students" value={stats?.total_students || 0} />
          <StatCard icon={<Star size={24}/>} color="#f59e0b" label="Avg Rating" value={stats?.average_rating || '0.0'} />
          <StatCard icon={<DollarSign size={24}/>} color="#06b6d4" label="Total Revenue" value={`$${stats?.total_revenue || 0}`} />
        </div>

        {/* Recent Courses */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontWeight: 800, fontSize: 18, color: 'var(--text-primary)' }}>📚 Your Recent Courses</h2>
            <Link to="/instructor/courses" className="btn-ghost" style={{ fontSize: 13, gap: 4 }}>View All <ChevronRight size={14}/></Link>
          </div>
          
          {courses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>You haven't created any courses yet.</p>
              <Link to="/instructor/courses/new" className="btn-primary">Create Your First Course</Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              {courses.map(course => (
                <div key={course.id} style={{ padding: 16, borderRadius: 12, border: '1px solid var(--border-color)', background: 'var(--bg-elevated)', display: 'flex', flexDirection: 'column' }}>
                   <div style={{ height: 140, borderRadius: 8, background: 'var(--gradient-card)', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {course.thumbnail ? <img src={course.thumbnail} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <BookOpen size={32} color="rgba(99,102,241,0.4)" />}
                   </div>
                   <h3 style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', marginBottom: 8, flex: 1 }}>{course.title}</h3>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}><Users size={12}/> {course.enrollment_count || 0}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}><Star size={12} color="#f59e0b"/> {course.average_rating || '0.0'}</span>
                   </div>
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
          {icon}
        </div>
        <div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>{label}</p>
          <p style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</p>
        </div>
      </div>
    </div>
  );
}
