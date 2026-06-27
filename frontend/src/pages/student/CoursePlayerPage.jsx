import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Play, FileText, CheckCircle, ChevronLeft, ChevronRight, Menu, X, Award } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Loader, ProgressBar } from '../../components/UI';

export default function CoursePlayerPage() {
  const { id } = useParams(); // lesson_id
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    // Fetch course details by fetching enrollment details for this lesson's course
    // But we only have lesson ID. So first fetch lesson, then fetch course.
    const fetchContent = async () => {
      try {
        const lessonRes = await api.get(`/courses/lessons/${id}/`);
        setCurrentLesson(lessonRes.data);
        const courseId = lessonRes.data.course;
        const courseRes = await api.get(`/courses/${courseId}/`);
        setCourse(courseRes.data);
      } catch (err) {
        console.error(err);
        navigate('/my-courses');
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [id, navigate]);

  const markCompleted = async () => {
    setMarking(true);
    try {
      await api.post(`/courses/lessons/${id}/mark_completed/`);
      setCurrentLesson(p => ({ ...p, is_completed: true }));
      // Also update the course state lesson list
      setCourse(p => {
        const updated = { ...p };
        updated.lessons = updated.lessons.map(l => l.id === currentLesson.id ? { ...l, is_completed: true } : l);
        return updated;
      });
    } catch (err) {
      console.error(err);
    } finally {
      setMarking(false);
    }
  };

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}><Loader /></div>;

  const currentIdx = course?.lessons?.findIndex(l => l.id === currentLesson?.id) || 0;
  const prevLesson = currentIdx > 0 ? course.lessons[currentIdx - 1] : null;
  const nextLesson = currentIdx < (course?.lessons?.length || 0) - 1 ? course.lessons[currentIdx + 1] : null;

  const completedCount = course?.lessons?.filter(l => l.is_completed).length || 0;
  const totalCount = course?.lessons?.length || 0;
  const progressPct = totalCount === 0 ? 0 : (completedCount / totalCount) * 100;

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-base)', overflow: 'hidden' }}>
      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? 320 : 0, transition: 'width 0.3s ease',
        background: 'var(--bg-surface)', borderRight: '1px solid var(--border-color)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0
      }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Link to="/my-courses" style={{ color: 'var(--text-secondary)', fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
            <ChevronLeft size={14}/> Back to Dashboard
          </Link>
          <h2 style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-primary)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {course?.title}
          </h2>
          <ProgressBar value={progressPct} label={`${Math.round(progressPct)}% Complete`} />
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {course?.lessons?.map((l, idx) => {
            const isActive = l.id === currentLesson?.id;
            return (
              <Link key={l.id} to={`/lessons/${l.id}/watch`} style={{
                display: 'flex', padding: '16px 20px', gap: 12, borderBottom: '1px solid var(--border-color)',
                textDecoration: 'none', background: isActive ? 'rgba(99,102,241,0.08)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
              }}>
                <div style={{ marginTop: 2 }}>
                  {l.is_completed ? <CheckCircle size={16} color="var(--success)"/> : <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid var(--border-color)' }}/>}
                </div>
                <div>
                  <p style={{ fontWeight: isActive ? 700 : 500, fontSize: 14, color: isActive ? 'var(--primary)' : 'var(--text-primary)', marginBottom: 4 }}>
                    {idx + 1}. {l.title}
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {l.video ? 'Video' : 'Reading'}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        {/* Topbar */}
        <div style={{ height: 64, background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', padding: '0 24px', justifyContent: 'space-between' }}>
          <button onClick={() => setSidebarOpen(p => !p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Menu size={20}/> {sidebarOpen ? 'Hide Course Menu' : 'Show Course Menu'}
          </button>
          {progressPct === 100 && (
             <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--success)', fontWeight: 600, fontSize: 14 }}>
               <Award size={18}/> Course Completed!
             </div>
          )}
        </div>

        {/* Video / Content Area */}
        <div style={{ padding: '32px', maxWidth: 1000, margin: '0 auto', width: '100%' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, color: 'var(--text-primary)', marginBottom: 24 }}>
             {currentIdx + 1}. {currentLesson?.title}
          </h1>

          {currentLesson?.video ? (
            <div style={{ background: 'black', width: '100%', aspectRatio: '16/9', borderRadius: 12, overflow: 'hidden', marginBottom: 32, boxShadow: 'var(--shadow-md)' }}>
              <video src={currentLesson.video} controls style={{ width: '100%', height: '100%' }} />
            </div>
          ) : (
            <div style={{ background: 'var(--bg-elevated)', width: '100%', aspectRatio: '16/9', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32, border: '1px solid var(--border-color)' }}>
               <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  <FileText size={48} style={{ margin: '0 auto 16px' }}/>
                  <p>Text / Reading Lesson</p>
               </div>
            </div>
          )}

          {/* Description & Resources */}
          <div className="card" style={{ padding: 24, marginBottom: 32 }}>
             <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 12 }}>Overview</h3>
             <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 15, marginBottom: 24 }}>
                {currentLesson?.description}
             </p>

             {currentLesson?.pdf_notes?.length > 0 && (
                <div>
                   <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 12 }}>Resources</h3>
                   <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      {currentLesson.pdf_notes.map(pdf => (
                         <a key={pdf.id} href={pdf.pdf_file} target="_blank" rel="noreferrer" style={{
                            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px',
                            background: 'rgba(99,102,241,0.1)', color: 'var(--primary)',
                            borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: 13
                         }}>
                            <FileText size={16}/> {pdf.title}
                         </a>
                      ))}
                   </div>
                </div>
             )}
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 24, borderTop: '1px solid var(--border-color)' }}>
             {prevLesson ? (
                <Link to={`/lessons/${prevLesson.id}/watch`} className="btn-secondary" style={{ gap: 8 }}>
                   <ChevronLeft size={16}/> Previous
                </Link>
             ) : <div/>}

             <div style={{ display: 'flex', gap: 12 }}>
                {!currentLesson?.is_completed && (
                   <button onClick={markCompleted} className="btn-secondary" disabled={marking} style={{ gap: 8, color: 'var(--success)', borderColor: 'var(--success)' }}>
                      <CheckCircle size={16}/> Mark as Complete
                   </button>
                )}
                {nextLesson && (
                   <Link to={`/lessons/${nextLesson.id}/watch`} className="btn-primary" style={{ gap: 8 }}>
                      Next <ChevronRight size={16}/>
                   </Link>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
