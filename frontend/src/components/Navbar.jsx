import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  BookOpen, Sun, Moon, Bell, User, LogOut, ChevronDown,
  Menu, X, Search, Award, Settings
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { user, logout, isAdmin, isInstructor } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile on route change
  useEffect(() => setMobileOpen(false), [location]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (isAdmin) return '/admin/dashboard';
    if (isInstructor) return '/instructor/dashboard';
    return '/student/dashboard';
  };

  return (
    <nav
      style={{
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-color)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: 'var(--shadow-sm)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
            }}>
              <BookOpen size={20} color="white" />
            </div>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: 22,
              background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              SkillSphere
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="hidden md:flex">
            <NavLink to="/courses">Browse Courses</NavLink>
            <NavLink to="/categories">Categories</NavLink>
            <NavLink to="/about">About</NavLink>
          </div>

          {/* Right Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Search */}
            <Link to="/search" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 36, height: 36, borderRadius: 8,
              background: 'var(--bg-elevated)',
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              transition: 'all 0.2s',
            }}>
              <Search size={16} />
            </Link>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              style={{
                width: 36, height: 36, borderRadius: 8,
                background: 'var(--bg-elevated)',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-secondary)',
                transition: 'all 0.2s',
              }}
              title="Toggle dark mode"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {user ? (
              <>
                {/* Notifications */}
                <Link to="/notifications" style={{
                  position: 'relative', width: 36, height: 36, borderRadius: 8,
                  background: 'var(--bg-elevated)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-secondary)', textDecoration: 'none',
                }}>
                  <Bell size={16} />
                  <span style={{
                    position: 'absolute', top: 4, right: 4,
                    width: 8, height: 8, borderRadius: '50%',
                    background: '#ef4444',
                    border: '2px solid var(--bg-surface)',
                  }} />
                </Link>

                {/* User Dropdown */}
                <div ref={dropdownRef} style={{ position: 'relative' }}>
                  <button
                    onClick={() => setDropdownOpen(p => !p)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '6px 12px', borderRadius: 10,
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-color)',
                      cursor: 'pointer', color: 'var(--text-primary)',
                    }}
                  >
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontSize: 12, fontWeight: 700,
                    }}>
                      {user.first_name?.[0]}{user.last_name?.[0]}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.first_name}
                    </span>
                    <ChevronDown size={14} style={{ color: 'var(--text-muted)', transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                  </button>

                  {dropdownOpen && (
                    <div style={{
                      position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                      width: 200, background: 'var(--bg-surface)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 12, boxShadow: 'var(--shadow-lg)',
                      padding: 8, zIndex: 100, animation: 'fadeIn 0.15s ease',
                    }}>
                      <DropdownItem icon={<User size={14}/>} to="/profile" label="Profile" />
                      <DropdownItem icon={<Award size={14}/>} to={getDashboardLink()} label="Dashboard" />
                      <DropdownItem icon={<BookOpen size={14}/>} to="/my-courses" label="My Courses" />
                      <DropdownItem icon={<Settings size={14}/>} to="/settings" label="Settings" />
                      <div style={{ height: 1, background: 'var(--border-color)', margin: '4px 0' }} />
                      <button
                        onClick={handleLogout}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                          padding: '8px 12px', borderRadius: 8, border: 'none',
                          background: 'transparent', cursor: 'pointer',
                          color: '#ef4444', fontSize: 13, fontWeight: 500, textAlign: 'left',
                        }}
                      >
                        <LogOut size={14}/> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <Link to="/login" className="btn-ghost" style={{ fontSize: 13 }}>Sign In</Link>
                <Link to="/register" className="btn-primary" style={{ fontSize: 13, padding: '8px 18px' }}>Get Started</Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(p => !p)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 36, height: 36, borderRadius: 8,
                background: 'var(--bg-elevated)', border: 'none',
                cursor: 'pointer', color: 'var(--text-secondary)',
              }}
              className="md:hidden"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div style={{
            borderTop: '1px solid var(--border-color)',
            padding: '12px 0',
            display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            <MobileLink to="/courses">Browse Courses</MobileLink>
            <MobileLink to="/categories">Categories</MobileLink>
            <MobileLink to="/about">About</MobileLink>
            {user && <MobileLink to={getDashboardLink()}>Dashboard</MobileLink>}
          </div>
        )}
      </div>
    </nav>
  );
}

function NavLink({ to, children }) {
  const location = useLocation();
  const active = location.pathname.startsWith(to);
  return (
    <Link to={to} style={{
      padding: '6px 14px', borderRadius: 8,
      color: active ? 'var(--primary)' : 'var(--text-secondary)',
      background: active ? 'rgba(99,102,241,0.1)' : 'transparent',
      fontWeight: active ? 600 : 500, fontSize: 14,
      textDecoration: 'none', transition: 'all 0.2s',
    }}>
      {children}
    </Link>
  );
}

function MobileLink({ to, children }) {
  return (
    <Link to={to} style={{
      padding: '10px 12px', borderRadius: 8,
      color: 'var(--text-secondary)', fontWeight: 500, fontSize: 14,
      textDecoration: 'none', display: 'block',
    }}>
      {children}
    </Link>
  );
}

function DropdownItem({ icon, to, label }) {
  return (
    <Link to={to} style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '8px 12px', borderRadius: 8,
      color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500,
      textDecoration: 'none', transition: 'all 0.15s',
    }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
    >
      {icon} {label}
    </Link>
  );
}
