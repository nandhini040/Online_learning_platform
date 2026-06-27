// src/components/Loader.jsx
export function Loader({ size = 40 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      <div style={{
        width: size, height: size,
        border: `3px solid var(--border-color)`,
        borderTopColor: 'var(--primary)',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// src/components/StarRating.jsx
export function StarRating({ rating = 0, max = 5, size = 14 }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {Array.from({ length: max }).map((_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i < Math.round(rating) ? '#f59e0b' : 'var(--border-color)'}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

// src/components/ProgressBar.jsx
export function ProgressBar({ value = 0, label }) {
  return (
    <div>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)' }}>{value}%</span>
        </div>
      )}
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
    </div>
  );
}

// src/components/SkeletonCard.jsx
export function SkeletonCard() {
  return (
    <div className="card" style={{ padding: 16, overflow: 'hidden' }}>
      <div className="skeleton" style={{ height: 180, borderRadius: 10, marginBottom: 16 }} />
      <div className="skeleton" style={{ height: 16, borderRadius: 4, marginBottom: 8, width: '80%' }} />
      <div className="skeleton" style={{ height: 12, borderRadius: 4, marginBottom: 12, width: '60%' }} />
      <div style={{ display: 'flex', gap: 8 }}>
        <div className="skeleton" style={{ height: 20, borderRadius: 999, width: 60 }} />
        <div className="skeleton" style={{ height: 20, borderRadius: 999, width: 80 }} />
      </div>
    </div>
  );
}
