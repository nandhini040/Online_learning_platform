import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star, Users, BookOpen, Award, Clock, Check, Lock, Play,
  FileText, Heart, Share2, Globe, ChevronDown, ChevronUp, AlertCircle
} from 'lucide-react';
import { StarRating, ProgressBar, Loader } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function CourseDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [expandedLesson, setExpandedLesson] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/courses/${id}/`)
      .then(r => setCourse(r.data))
      .catch(() => navigate('/courses'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleEnroll = async () => {
    if (!user) { navigate('/login'); return; }
    setEnrolling(true); setError('');
    try {
      await api.post(`/courses/${id}/enroll/`);
      setMessage('🎉 Successfully enrolled! Redirecting to your course...');
      setTimeout(() => navigate('/my-courses'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Enrollment failed.');
    } finally { setEnrolling(false); }
  };

  const handleWishlist = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      await api.post('/wishlist/', { course_id: id });
      setMessage('Added to wishlist!');
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not update wishlist.');
    }
  };

  if (loading) return <Loader />;
  if (!course) return null;

  const totalLessons = course.lessons?.length || 0;

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
      {/* ─── Hero Header ─────────────────────────── */}
      <div style={{ background: 'var(--gradient-dark)', padding: '48px 24px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', gap: 40, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 300 }}>
            {/* Breadcrumb */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16, fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
              <Link to="/courses" style={{ color: 'inherit', textDecoration: 'none' }}>Courses</Link>
              <span>/</span>
              <span style={{ color: 'var(--primary-light)' }}>{course.category?.name}</span>
            </div>

            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(24px, 3vw, 38px)', color: 'white', marginBottom: 16, lineHeight: 1.25 }}>
              {course.title}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 16, lineHeight: 1.6, marginBottom: 24, maxWidth: 600 }}>
              {course.description}
            </p>

            {/* Meta */}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
                <StarRating rating={course.average_rating} size={14} />
                <span style={{ fontWeight: 700, color: '#fbbf24' }}>{course.average_rating}</span>
                <span style={{ opacity: 0.6 }}>({course.reviews?.length || 0} reviews)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
                <Users size={14}/> {course.enrollment_count} students enrolled
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
                <BookOpen size={14}/> {totalLessons} lessons
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 14 }}>
                {course.instructor?.first_name?.[0]}{course.instructor?.last_name?.[0]}
              </div>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>Created by</p>
                <p style={{ color: 'white', fontWeight: 600, fontSize: 14 }}>{course.instructor?.first_name} {course.instructor?.last_name}</p>
              </div>
              <span className={`badge ${course.level === 'Beginner' ? 'badge-success' : course.level === 'Advanced' ? 'badge-danger' : 'badge-warning'}`} style={{ marginLeft: 'auto' }}>
                {course.level}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Main Content ─────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px', display: 'grid', gridTemplateColumns: '1fr 340px', gap: 40, alignItems: 'flex-start' }}>

        {/* Left: Course content */}
        <div>
          {/* Alerts */}
          {message && (
            <div style={{ padding: '14px 18px', borderRadius: 12, marginBottom: 24, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: 'var(--success)', fontSize: 14 }}>
              {message}
            </div>
          )}
          {error && (
            <div style={{ padding: '14px 18px', borderRadius: 12, marginBottom: 24, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: 14, display: 'flex', gap: 8, alignItems: 'center' }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {/* Lessons Accordion */}
          <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 32 }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)' }}>
              <h2 style={{ fontWeight: 800, fontSize: 20, color: 'var(--text-primary)' }}>Course Content</h2>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{totalLessons} lessons</p>
            </div>
            {course.lessons?.map((lesson, idx) => (
              <div key={lesson.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <button
                  onClick={() => setExpandedLesson(expandedLesson === lesson.id ? null : lesson.id)}
                  style={{
                    width: '100%', padding: '16px 24px', background: 'transparent', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left',
                  }}
                >
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: lesson.is_completed ? 'var(--success)' : 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {lesson.is_completed ? <Check size={14} color="white" /> : <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700 }}>{idx + 1}</span>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{lesson.title}</p>
                    <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                      {lesson.video && <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}><Play size={10}/>Video</span>}
                      {lesson.pdf_notes?.length > 0 && <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}><FileText size={10}/>{lesson.pdf_notes.length} PDF(s)</span>}
                    </div>
                  </div>
                  {course.is_enrolled ? (expandedLesson === lesson.id ? <ChevronUp size={16} color="var(--text-muted)"/> : <ChevronDown size={16} color="var(--text-muted)"/>) : <Lock size={14} color="var(--text-muted)"/>}
                </button>
                {expandedLesson === lesson.id && course.is_enrolled && (
                  <div style={{ padding: '0 24px 16px 64px', animation: 'fadeIn 0.2s ease' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6, marginBottom: 12 }}>{lesson.description}</p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {lesson.video && (
                        <Link to={`/lessons/${lesson.id}/watch`} className="btn-primary" style={{ fontSize: 12, padding: '7px 14px', gap: 6 }}>
                          <Play size={12}/> Watch Video
                        </Link>
                      )}
                      {lesson.pdf_notes?.map(pdf => (
                        <a key={pdf.id} href={pdf.pdf_file} target="_blank" rel="noreferrer" className="btn-secondary" style={{ fontSize: 12, padding: '7px 14px', gap: 6 }}>
                          <FileText size={12}/> {pdf.title}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Reviews Section */}
          <div className="card" style={{ padding: 24 }}>
            <h2 style={{ fontWeight: 800, fontSize: 20, color: 'var(--text-primary)', marginBottom: 24 }}>
              Student Reviews ({course.reviews?.length || 0})
            </h2>
            <div style={{ display: 'flex', gap: 32, alignItems: 'center', padding: '20px 0', borderBottom: '1px solid var(--border-color)', marginBottom: 24 }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 52, fontWeight: 900, color: '#f59e0b', lineHeight: 1 }}>{course.average_rating}</p>
                <StarRating rating={course.average_rating} size={18} />
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Course Rating</p>
              </div>
              <div style={{ flex: 1 }}>
                {[5,4,3,2,1].map(n => {
                  const count = course.reviews?.filter(r => Math.round(r.rating) === n).length || 0;
                  const pct = course.reviews?.length ? (count/course.reviews.length)*100 : 0;
                  return (
                    <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', width: 8 }}>{n}</span>
                      <Star size={12} color="#f59e0b" fill="#f59e0b"/>
                      <div style={{ flex: 1 }}>
                        <ProgressBar value={pct} />
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', width: 28, textAlign: 'right' }}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {course.reviews?.map(rev => (
                <div key={rev.id} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: 20 }}>
                  <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                      {rev.student_name?.[0]}
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{rev.student_name}</p>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 2 }}>
                        <StarRating rating={rev.rating} size={12} />
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(rev.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>{rev.comment}</p>
                </div>
              ))}
              {!course.reviews?.length && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>No reviews yet. Be the first!</p>}
            </div>
          </div>
        </div>

        {/* Right: Sticky Enrollment Card */}
        <div style={{ position: 'sticky', top: 80 }}>
          <div className="card" style={{ overflow: 'hidden' }}>
            {/* Thumbnail */}
            <div style={{ height: 200, background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(6,182,212,0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              {course.thumbnail ? (
                <img src={course.thumbnail} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <BookOpen size={56} color="rgba(99,102,241,0.4)" />
              )}
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                  <Play size={24} color="white" />
                </div>
              </div>
            </div>

            <div style={{ padding: 24 }}>
              <p style={{ fontSize: 32, fontWeight: 900, color: 'var(--text-primary)', marginBottom: 4 }}>
                {course.price == 0 ? 'FREE' : `$${course.price}`}
              </p>

              {course.is_enrolled ? (
                <div>
                  <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 10, padding: 12, display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12, color: 'var(--success)', fontSize: 14, fontWeight: 600 }}>
                    <Check size={16}/> Already Enrolled
                  </div>
                  <Link to="/my-courses" className="btn-primary" style={{ display: 'block', textAlign: 'center', width: '100%', padding: '13px', marginBottom: 12 }}>
                    Continue Learning
                  </Link>
                </div>
              ) : (
                <button onClick={handleEnroll} className="btn-primary" disabled={enrolling} style={{ width: '100%', padding: '14px', fontSize: 16, marginBottom: 12 }}>
                  {enrolling ? 'Enrolling…' : course.price == 0 ? 'Enroll For Free' : 'Enroll Now'}
                </button>
              )}

              <button onClick={handleWishlist} className="btn-secondary" style={{ width: '100%', padding: '11px', marginBottom: 20, gap: 8 }}>
                <Heart size={15}/> {course.is_wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
              </button>

              {/* Course includes */}
              <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', marginBottom: 12 }}>This course includes:</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  [<BookOpen size={14}/>, `${totalLessons} structured lessons`],
                  [<Play size={14}/>, 'HD video streaming'],
                  [<FileText size={14}/>, 'Downloadable PDF notes'],
                  [<Award size={14}/>, 'Certificate on completion'],
                  [<Globe size={14}/>, 'Full lifetime access'],
                ].map(([icon, label]) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
                    <span style={{ color: 'var(--primary)' }}>{icon}</span> {label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
