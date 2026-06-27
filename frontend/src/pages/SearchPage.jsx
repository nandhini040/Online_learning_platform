import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';
import CourseCard from '../components/CourseCard';
import { SkeletonCard } from '../components/UI';
import api from '../services/api';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setLoading(true);
      api.get(`/courses/?search=${encodeURIComponent(q)}`)
        .then(res => setResults(res.data.results || res.data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh', padding: '40px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 32, marginBottom: 16 }}>
            Search Results
          </h1>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 0, maxWidth: 600, margin: '0 auto', background: 'var(--bg-surface)', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 16px' }}>
              <Search size={18} color="var(--text-muted)" style={{ marginRight: 12 }} />
              <input 
                type="text" 
                placeholder="Search courses, instructors..." 
                value={query} 
                onChange={e => setQuery(e.target.value)}
                style={{ border: 'none', outline: 'none', width: '100%', fontSize: 16, background: 'transparent', color: 'var(--text-primary)' }}
              />
            </div>
            <button type="submit" className="btn-primary" style={{ borderRadius: 0, padding: '12px 24px' }}>
              Search
            </button>
          </form>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : searchParams.get('q') ? (
          <div>
             <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 15 }}>
               Found <strong>{results.length}</strong> results for "{searchParams.get('q')}"
             </p>
             {results.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
                  {results.map(course => <CourseCard key={course.id} course={course} showWishlist />)}
                </div>
             ) : (
                <div style={{ textAlign: 'center', padding: 80 }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                  <h3 style={{ fontWeight: 700, fontSize: 20, color: 'var(--text-primary)', marginBottom: 8 }}>No matches found</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>Try adjusting your keywords.</p>
                </div>
             )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>
            Enter a search term to find courses.
          </div>
        )}
      </div>
    </div>
  );
}
