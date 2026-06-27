import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import CourseCard from '../components/CourseCard';
import { SkeletonCard } from '../components/UI';
import api from '../services/api';

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

export default function CoursesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    level: searchParams.get('level') || '',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    api.get('/categories/').then(r => setCategories(r.data.results || r.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (filters.category) params.set('category', filters.category);
    if (filters.level) params.set('level', filters.level);

    api.get(`/courses/?${params}`)
      .then(r => setCourses(r.data.results || r.data))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, [search, filters]);

  const setFilter = (key, val) => setFilters(p => ({ ...p, [key]: p[key] === val ? '' : val }));

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 32, color: 'var(--text-primary)', marginBottom: 8 }}>
          Browse All Courses
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>
          {loading ? 'Loading…' : `${courses.length} courses available`}
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 32, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 280, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text" className="input-field" style={{ paddingLeft: 42 }}
            placeholder="Search courses, topics, instructors…"
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button onClick={() => setShowFilters(p => !p)} className="btn-secondary" style={{ gap: 8 }}>
          <SlidersHorizontal size={16} /> Filters
          {(filters.category || filters.level) && <span className="badge badge-primary" style={{ fontSize: 10, padding: '1px 6px' }}>•</span>}
        </button>
      </div>

      <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start' }}>
        {/* Filter Sidebar */}
        {showFilters && (
          <div className="card" style={{ padding: 24, minWidth: 220, position: 'sticky', top: 80 }}>
            <h3 style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', marginBottom: 20 }}>
              Filters
            </h3>

            {/* Category Filter */}
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>Category</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {categories.map(cat => (
                  <button key={cat.id} onClick={() => setFilter('category', cat.slug)}
                    style={{
                      textAlign: 'left', padding: '7px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                      background: filters.category === cat.slug ? 'rgba(99,102,241,0.12)' : 'transparent',
                      color: filters.category === cat.slug ? 'var(--primary)' : 'var(--text-secondary)',
                      fontWeight: filters.category === cat.slug ? 600 : 400, fontSize: 13,
                      transition: 'all 0.15s',
                    }}>
                    {cat.name}
                    <span style={{ float: 'right', fontSize: 11, color: 'var(--text-muted)' }}>{cat.course_count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Level Filter */}
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>Level</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {LEVELS.map(lvl => (
                  <button key={lvl} onClick={() => setFilter('level', lvl)}
                    style={{
                      textAlign: 'left', padding: '7px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                      background: filters.level === lvl ? 'rgba(99,102,241,0.12)' : 'transparent',
                      color: filters.level === lvl ? 'var(--primary)' : 'var(--text-secondary)',
                      fontWeight: filters.level === lvl ? 600 : 400, fontSize: 13, transition: 'all 0.15s',
                    }}>
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            {(filters.category || filters.level) && (
              <button onClick={() => setFilters({ category: '', level: '' })}
                style={{ marginTop: 20, width: '100%', padding: '8px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'transparent', cursor: 'pointer', fontSize: 13, color: '#ef4444', fontWeight: 600 }}>
                Clear All Filters
              </button>
            )}
          </div>
        )}

        {/* Course Grid */}
        <div style={{ flex: 1 }}>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
              {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : courses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 80 }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>🔍</div>
              <h3 style={{ fontWeight: 700, fontSize: 20, color: 'var(--text-primary)', marginBottom: 8 }}>No courses found</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
              {courses.map(c => <CourseCard key={c.id} course={c} showWishlist />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
