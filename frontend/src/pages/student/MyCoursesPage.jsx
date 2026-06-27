import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, BookOpen, Clock, Award } from 'lucide-react';
import DashboardSidebar from '../../components/DashboardSidebar';
import { ProgressBar, Loader } from '../../components/UI';
import api from '../../services/api';

export default function MyCoursesPage() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | in_progress | completed

  useEffect(() => {
    api.get('/courses/my_courses/')
      .then(res => setEnrollments(res.data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', flex: 1 }}><DashboardSidebar /><div style={{ flex: 1 }}><Loader /></div></div>;

  const filteredEnrollments = enrollments.filter(enr => {
    if (filter === 'completed') return enr.progress_percentage === 100;
    if (filter === 'in_progress') return enr.progress_percentage < 100;
    return true;
  });

  return (
    <div style={{ display: 'flex', flex: 1, background: 'var(--bg-base)' }}>
      <DashboardSidebar />
      <main style={{ flex: 1, padding: '32px 40px', overflowY: 'auto' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: 'var(--text-primary)', marginBottom: 24 }}>
          My Courses
        </h1>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 32, borderBottom: '1px solid var(--border-color)' }}>
          {[
            { id: 'all', label: 'All Courses' },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'completed', label: 'Completed' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              style={{
                padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer',
                fontWeight: filter === f.id ? 600 : 500,
                color: filter === f.id ? 'var(--primary)' : 'var(--text-secondary)',
                borderBottom: `2px solid ${filter === f.id ? 'var(--primary)' : 'transparent'}`,
                marginBottom: -1, transition: 'all 0.2s',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* List */}
        {filteredEnrollments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <BookOpen size={48} color="var(--border-color)" style={{ marginBottom: 16 }} />
            <h3 style={{ fontWeight: 700, fontSize: 20, color: 'var(--text-primary)', marginBottom: 8 }}>No courses found</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>You don't have any courses in this category.</p>
            <Link to="/courses" className="btn-primary">Browse Courses</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
            {filteredEnrollments.map(enr => (
              <div key={enr.id} className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ height: 160, background: 'var(--gradient-card)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {enr.course?.thumbnail ? (
                     <img src={enr.course.thumbnail} alt={enr.course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                     <BookOpen size={40} color="rgba(99,102,241,0.4)" />
                  )}
                </div>
                <div style={{ padding: 20, display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h3 style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', marginBottom: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {enr.course?.title}
                  </h3>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>by {enr.course?.instructor_name}</p>
                  
                  <div style={{ marginTop: 'auto' }}>
                    <ProgressBar value={enr.progress_percentage} label={`${enr.completed_lessons_count}/${enr.total_lessons_count} Lessons`} />
                    <Link to={`/courses/${enr.course?.id}`} className="btn-primary" style={{ width: '100%', marginTop: 20, padding: 12, justifyContent: 'center' }}>
                       {enr.progress_percentage === 100 ? <Award size={16}/> : <Play size={16}/>}
                       {enr.progress_percentage === 100 ? 'View Certificate' : 'Resume Course'}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
