import { Link } from 'react-router-dom';
import { Users, Clock, BookOpen, Heart } from 'lucide-react';
import { StarRating } from './UI';

export default function CourseCard({ course, showWishlist = false, onWishlist }) {
  if (!course) return null;
  const levelColor = { Beginner: 'badge-success', Intermediate: 'badge-warning', Advanced: 'badge-danger' };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
      {/* Thumbnail */}
      <Link to={`/courses/${course.id}`} style={{ textDecoration: 'none', display: 'block', position: 'relative' }}>
        <div style={{
          height: 180, overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(6,182,212,0.15))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {course.thumbnail ? (
            <img src={course.thumbnail} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <BookOpen size={48} color="rgba(99,102,241,0.4)" />
          )}
        </div>

        {/* Level badge on thumbnail */}
        <span className={`badge ${levelColor[course.level] || 'badge-primary'}`} style={{
          position: 'absolute', top: 10, left: 10,
        }}>
          {course.level}
        </span>

        {/* Price tag */}
        <span style={{
          position: 'absolute', top: 10, right: showWishlist ? 44 : 10,
          background: course.price == 0 ? 'var(--success)' : 'var(--primary)',
          color: 'white', padding: '3px 10px', borderRadius: 999,
          fontSize: 12, fontWeight: 700,
        }}>
          {course.price == 0 ? 'FREE' : `$${course.price}`}
        </span>
      </Link>

      {/* Wishlist button */}
      {showWishlist && (
        <button
          onClick={(e) => { e.preventDefault(); onWishlist && onWishlist(course.id); }}
          style={{
            position: 'absolute', top: 10, right: 10,
            width: 32, height: 32, borderRadius: '50%',
            background: 'rgba(255,255,255,0.9)',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(4px)',
          }}
        >
          <Heart size={15} color="#ef4444" />
        </button>
      )}

      {/* Content */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        <Link to={`/courses/${course.id}`} style={{ textDecoration: 'none' }}>
          <h3 style={{
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15,
            color: 'var(--text-primary)', lineHeight: 1.4,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {course.title}
          </h3>
        </Link>

        <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {course.description}
        </p>

        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          by <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{course.instructor_name}</span>
        </p>

        {/* Rating */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <StarRating rating={course.average_rating} size={12} />
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)' }}>{course.average_rating || '0.0'}</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>({course.enrollment_count || 0})</span>
        </div>

        {/* Footer meta */}
        <div style={{ marginTop: 'auto', paddingTop: 8, borderTop: '1px solid var(--border-color)',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)' }}>
            <Users size={11} /> {course.enrollment_count || 0} students
          </span>
          <span className={`badge ${levelColor[course.level] || 'badge-primary'}`} style={{ fontSize: 10 }}>
            {course.category_name}
          </span>
        </div>
      </div>
    </div>
  );
}
