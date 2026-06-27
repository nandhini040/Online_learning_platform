import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Eye, ChevronRight, BookOpen, Star, Users } from 'lucide-react';
import DashboardSidebar from '../../components/DashboardSidebar';
import { Loader } from '../../components/UI';
import api from '../../services/api';

export default function InstructorCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/courses/my_taught_courses/')
      .then(res => setCourses(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', flex: 1 }}><DashboardSidebar /><div style={{ flex: 1 }}><Loader /></div></div>;

  return (
    <div style={{ display: 'flex', flex: 1, background: 'var(--bg-base)' }}>
      <DashboardSidebar />
      <main style={{ flex: 1, padding: '32px 40px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
           <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: 'var(--text-primary)', marginBottom: 6 }}>
                My Courses
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Manage your courses, lessons, and content.</p>
           </div>
           <Link to="/instructor/courses/new" className="btn-primary" style={{ gap: 8 }}>
             <Plus size={16}/> Create New Course
           </Link>
        </div>

        {courses.length === 0 ? (
           <div style={{ textAlign: 'center', padding: 80 }}>
              <BookOpen size={48} color="var(--border-color)" style={{ marginBottom: 16 }} />
              <h3 style={{ fontWeight: 700, fontSize: 20, color: 'var(--text-primary)', marginBottom: 8 }}>No courses yet</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Share your knowledge and start teaching today.</p>
              <Link to="/instructor/courses/new" className="btn-primary">Create Your First Course</Link>
           </div>
        ) : (
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
              {courses.map(course => (
                 <div key={course.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ height: 160, borderRadius: '16px 16px 0 0', background: 'var(--gradient-card)', overflow: 'hidden' }}>
                       {course.thumbnail ? <img src={course.thumbnail} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}><BookOpen size={40} color="rgba(99,102,241,0.4)" /></div>}
                    </div>
                    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', flex: 1 }}>
                       <h3 style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', marginBottom: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{course.title}</h3>
                       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                          <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}><Users size={12}/> {course.enrollment_count} Students</span>
                          <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}><Star size={12} color="#f59e0b"/> {course.average_rating}</span>
                       </div>
                       <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                          <Link to={`/instructor/courses/${course.id}/edit`} className="btn-secondary" style={{ flex: 1, padding: 8, gap: 6, fontSize: 13 }}>
                             <Edit2 size={14}/> Edit
                          </Link>
                          <Link to={`/courses/${course.id}`} className="btn-secondary" style={{ flex: 1, padding: 8, gap: 6, fontSize: 13 }}>
                             <Eye size={14}/> View
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
