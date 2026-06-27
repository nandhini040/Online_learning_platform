import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, BookOpen, X, ShoppingCart } from 'lucide-react';
import DashboardSidebar from '../../components/DashboardSidebar';
import { StarRating, Loader } from '../../components/UI';
import api from '../../services/api';

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = () => {
    api.get('/wishlist/')
      .then(res => setWishlist(res.data.results || res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchWishlist(); }, []);

  const removeFromWishlist = async (id) => {
    try {
      await api.delete(`/wishlist/${id}/`);
      setWishlist(prev => prev.filter(item => item.id !== id));
    } catch (err) { console.error(err); }
  };

  if (loading) return <div style={{ display: 'flex', flex: 1 }}><DashboardSidebar /><div style={{ flex: 1 }}><Loader /></div></div>;

  return (
    <div style={{ display: 'flex', flex: 1, background: 'var(--bg-base)' }}>
      <DashboardSidebar />
      <main style={{ flex: 1, padding: '32px 40px', overflowY: 'auto' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: 'var(--text-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
            <Heart size={28} color="#ef4444" fill="#ef4444" /> My Wishlist
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>{wishlist.length} saved courses</p>
        </div>

        {wishlist.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <Heart size={56} color="var(--border-color)" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontWeight: 700, fontSize: 20, color: 'var(--text-primary)', marginBottom: 8 }}>Your wishlist is empty</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Save courses you want to take later.</p>
            <Link to="/courses" className="btn-primary">Browse Courses</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
            {wishlist.map(item => {
              const course = item.course;
              return (
                <div key={item.id} className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    style={{ position: 'absolute', top: 10, right: 10, zIndex: 2, width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                    <X size={14} color="#ef4444" />
                  </button>

                  {/* Thumbnail */}
                  <div style={{ height: 160, background: 'var(--gradient-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {course?.thumbnail ? <img src={course.thumbnail} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <BookOpen size={36} color="rgba(99,102,241,0.4)" />}
                  </div>

                  <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <h3 style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {course?.title}
                    </h3>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>by {course?.instructor_name}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <StarRating rating={course?.average_rating} size={13} />
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>({course?.enrollment_count || 0})</span>
                    </div>
                    <div style={{ marginTop: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, fontSize: 20, color: 'var(--primary)' }}>
                        {course?.price == 0 ? 'FREE' : `$${course?.price}`}
                      </span>
                      <Link to={`/courses/${course?.id}`} className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '9px 12px', fontSize: 13, gap: 6 }}>
                        <ShoppingCart size={14}/> Enroll Now
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
