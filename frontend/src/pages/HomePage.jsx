import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, Star, Users, BookOpen, Award, Zap, Play, ChevronRight, Globe, Shield, TrendingUp } from 'lucide-react';
import CourseCard from '../components/CourseCard';
import { SkeletonCard } from '../components/UI';
import api from '../services/api';

export default function HomePage() {
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, catRes] = await Promise.all([
          api.get('/courses/?page_size=6'),
          api.get('/categories/'),
        ]);
        setFeaturedCourses(coursesRes.data.results || coursesRes.data);
        setCategories((catRes.data.results || catRes.data).slice(0, 8));
      } catch (e) {
        console.error(e);
      } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const CATEGORY_ICONS = { 'Web Development': '💻', 'Data Science': '📊', 'Design': '🎨', 'Mobile': '📱', 'AI & ML': '🤖', 'Business': '💼', 'Marketing': '📣', 'Photography': '📷' };

  return (
    <div>
      {/* ─── Hero Section ─────────────────────────── */}
      <section style={{
        background: 'var(--gradient-dark)',
        position: 'relative', overflow: 'hidden',
        padding: '100px 24px',
      }}>
        {/* Animated background blobs */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'rgba(99,102,241,0.15)', filter: 'blur(120px)', top: -200, left: -100 }} />
          <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'rgba(6,182,212,0.15)', filter: 'blur(100px)', bottom: -100, right: -100 }} />
        </div>

        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <div className="badge badge-primary animate-fade-in" style={{ marginBottom: 20, display: 'inline-flex', background: 'rgba(99,102,241,0.2)', color: 'var(--primary-light)', border: '1px solid rgba(99,102,241,0.3)' }}>
            <Zap size={12} /> The #1 Online Learning Platform
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 900,
            fontSize: 'clamp(36px, 6vw, 72px)',
            color: 'white', lineHeight: 1.15,
            marginBottom: 24,
          }} className="animate-fade-in">
            Master New Skills,{' '}
            <span style={{
              background: 'linear-gradient(135deg, #a5b4fc, #67e8f9)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Advance Your Career
            </span>
          </h1>

          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 18, lineHeight: 1.7, maxWidth: 600, margin: '0 auto 40px' }} className="animate-fade-in">
            Learn from world-class instructors, earn verified certificates, and join a community of 10,000+ learners achieving their goals.
          </p>

          {/* Search Bar */}
          <div style={{
            display: 'flex', gap: 0, maxWidth: 560, margin: '0 auto 48px',
            background: 'rgba(255,255,255,0.95)', borderRadius: 16,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            overflow: 'hidden',
          }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 20px' }}>
              <Search size={18} color="#94a3b8" style={{ marginRight: 10, flexShrink: 0 }} />
              <input
                type="text"
                placeholder="What do you want to learn today?"
                style={{ border: 'none', outline: 'none', width: '100%', fontSize: 15, background: 'transparent', color: '#0f172a' }}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (window.location.href = `/search?q=${searchQuery}`)}
              />
            </div>
            <Link to={`/search?q=${searchQuery}`} className="btn-primary" style={{ borderRadius: 0, padding: '16px 28px', boxShadow: 'none', fontSize: 15 }}>
              Search <ArrowRight size={16} />
            </Link>
          </div>

          {/* Quick Stats */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 48, flexWrap: 'wrap' }}>
            {[
              { icon: <BookOpen size={18}/>, n: '500+', l: 'Courses' },
              { icon: <Users size={18}/>, n: '10K+', l: 'Students' },
              { icon: <Star size={18}/>, n: '4.8/5', l: 'Average Rating' },
              { icon: <Award size={18}/>, n: '200+', l: 'Instructors' },
            ].map(s => (
              <div key={s.l} style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,0.8)' }}>
                <span style={{ color: 'var(--primary-light)' }}>{s.icon}</span>
                <div>
                  <span style={{ fontWeight: 800, fontSize: 20, color: 'white' }}>{s.n}</span>
                  <span style={{ fontSize: 13, marginLeft: 6, opacity: 0.7 }}>{s.l}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Categories Section ────────────────────── */}
      <section style={{ padding: '72px 24px', background: 'var(--bg-base)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <SectionHeader
            badge="Explore"
            title="Browse Top Categories"
            subtitle="Find the perfect course from hundreds of expert-curated categories"
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 16 }}>
            {categories.length > 0 ? categories.map(cat => (
              <Link key={cat.id} to={`/courses?category=${cat.slug}`} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ padding: 20, textAlign: 'center', cursor: 'pointer' }}>
                  <div style={{ fontSize: 32, marginBottom: 10 }}>
                    {CATEGORY_ICONS[cat.name] || '📚'}
                  </div>
                  <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', marginBottom: 2 }}>{cat.name}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{cat.course_count} courses</p>
                </div>
              </Link>
            )) : Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 110, borderRadius: 16 }} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured Courses Section ──────────────── */}
      <section style={{ padding: '72px 24px', background: 'var(--bg-elevated)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
            <SectionHeader
              badge="Popular"
              title="Featured Courses"
              subtitle="Handpicked courses to get you started on your journey"
              noMargin
            />
            <Link to="/courses" className="btn-secondary" style={{ gap: 6 }}>
              View All <ChevronRight size={15} />
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
            {loading ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />) :
              featuredCourses.map(c => <CourseCard key={c.id} course={c} showWishlist />)}
          </div>
        </div>
      </section>

      {/* ─── Why SkillSphere Section ───────────────── */}
      <section style={{ padding: '72px 24px', background: 'var(--bg-base)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <SectionHeader
            badge="Why us"
            title="Why Choose SkillSphere?"
            subtitle="We offer a learning experience that sets you apart"
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24 }}>
            {[
              { icon: <Shield size={28}/>, color: '#6366f1', title: 'Verified Certificates', desc: 'Our QR-verified certificates are trusted by top employers worldwide.' },
              { icon: <TrendingUp size={28}/>, color: '#06b6d4', title: 'Gamified Learning', desc: 'Earn XP, unlock badges, maintain streaks and climb leaderboards.' },
              { icon: <Globe size={28}/>, color: '#10b981', title: 'Learn Anytime', desc: 'Stream videos and download PDFs for offline learning at your pace.' },
              { icon: <Users size={28}/>, color: '#f59e0b', title: 'Expert Instructors', desc: 'Real industry professionals teach real-world skills with mentoring.' },
            ].map(f => (
              <div key={f.title} className="card" style={{ padding: 28 }}>
                <div style={{ width: 56, height: 56, borderRadius: 14, background: `${f.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, color: f.color }}>
                  {f.icon}
                </div>
                <h3 style={{ fontWeight: 700, fontSize: 17, color: 'var(--text-primary)', marginBottom: 10 }}>{f.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ───────────────────────────── */}
      <section style={{ padding: '72px 24px', background: 'var(--gradient-dark)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'rgba(99,102,241,0.2)', filter: 'blur(100px)', top: -200, right: -100 }} />
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(28px, 4vw, 48px)', color: 'white', marginBottom: 16 }}>
            Ready to Transform Your Future?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 17, marginBottom: 36, lineHeight: 1.7 }}>
            Join thousands of successful learners. Start for free today.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn-primary" style={{ fontSize: 16, padding: '14px 32px' }}>
              Start Learning Free <ArrowRight size={18} />
            </Link>
            <Link to="/courses" className="btn-secondary" style={{ fontSize: 16, padding: '14px 32px', color: 'white', borderColor: 'rgba(255,255,255,0.4)' }}>
              Browse Courses
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHeader({ badge, title, subtitle, noMargin }) {
  return (
    <div style={{ marginBottom: noMargin ? 0 : 40 }}>
      <span className="badge badge-primary" style={{ marginBottom: 12, display: 'inline-flex' }}>{badge}</span>
      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(24px, 3vw, 36px)', color: 'var(--text-primary)', marginBottom: 10 }}>{title}</h2>
      {subtitle && <p style={{ color: 'var(--text-secondary)', fontSize: 16, maxWidth: 500 }}>{subtitle}</p>}
    </div>
  );
}
