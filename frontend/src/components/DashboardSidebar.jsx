import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, Users, Settings, Bell, Award,
  Heart, FileText, Video, BarChart2, CheckSquare, MessageCircle,
  UserCheck, Tag, LogOut, Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const STUDENT_LINKS = [
  { to: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/my-courses', icon: BookOpen, label: 'My Courses' },
  { to: '/wishlist', icon: Heart, label: 'Wishlist' },
  { to: '/certificates', icon: Award, label: 'Certificates' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/profile', icon: Settings, label: 'Profile' },
];

const INSTRUCTOR_LINKS = [
  { to: '/instructor/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/instructor/courses', icon: BookOpen, label: 'My Courses' },
  { to: '/instructor/analytics', icon: BarChart2, label: 'Analytics' },
  { to: '/instructor/submissions', icon: FileText, label: 'Submissions' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/profile', icon: Settings, label: 'Profile' },
];

const ADMIN_LINKS = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/approvals', icon: UserCheck, label: 'Approvals' },
  { to: '/admin/categories', icon: Tag, label: 'Categories' },
  { to: '/admin/courses', icon: BookOpen, label: 'All Courses' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
];

export default function DashboardSidebar() {
  const { user, logout, isAdmin, isInstructor } = useAuth();
  const location = useLocation();

  const links = isAdmin ? ADMIN_LINKS : isInstructor ? INSTRUCTOR_LINKS : STUDENT_LINKS;
  const roleLabel = isAdmin ? 'Admin' : isInstructor ? 'Instructor' : 'Student';
  const roleColor = isAdmin ? '#ef4444' : isInstructor ? '#f59e0b' : '#6366f1';

  return (
    <aside style={{
      width: 240,
      minHeight: '100vh',
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex', flexDirection: 'column',
      padding: '24px 12px',
      position: 'sticky', top: 64,
    }}>
      {/* User Card */}
      <div style={{
        padding: 16, borderRadius: 12, marginBottom: 24,
        background: 'var(--gradient-card)',
        border: '1px solid var(--border-color)',
        textAlign: 'center',
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: '50%', margin: '0 auto 10px',
          background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontSize: 18, fontWeight: 700,
          boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
        }}>
          {user?.first_name?.[0]}{user?.last_name?.[0]}
        </div>
        <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 4 }}>
          {user?.first_name} {user?.last_name}
        </p>
        <span style={{
          display: 'inline-block', padding: '2px 10px', borderRadius: 999,
          background: `${roleColor}20`, color: roleColor,
          fontSize: 11, fontWeight: 700,
        }}>
          {roleLabel}
        </span>
      </div>

      {/* Navigation Links */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
        {links.map((link) => {
          const active = location.pathname === link.to;
          const Icon = link.icon;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`sidebar-link${active ? ' active' : ''}`}
            >
              <Icon size={16} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <button
        onClick={logout}
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '10px 16px', borderRadius: 10, border: 'none',
          background: 'rgba(239,68,68,0.08)', cursor: 'pointer',
          color: '#ef4444', fontWeight: 600, fontSize: 14, marginTop: 12,
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
      >
        <LogOut size={16} /> Sign Out
      </button>
    </aside>
  );
}
