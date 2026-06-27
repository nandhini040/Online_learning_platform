import { useState, useEffect } from 'react';
import { Search, User, Shield, Ban, CheckCircle } from 'lucide-react';
import DashboardSidebar from '../../components/DashboardSidebar';
import { Loader } from '../../components/UI';
import api from '../../services/api';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  useEffect(() => {
    api.get('/auth/users/')
      .then(res => setUsers(res.data.results || res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u => {
    const matchSearch = !search ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      `${u.first_name} ${u.last_name}`.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const roleColor = { ADMIN: '#6366f1', INSTRUCTOR: '#f59e0b', STUDENT: '#10b981' };

  if (loading) return <div style={{ display: 'flex', flex: 1 }}><DashboardSidebar /><div style={{ flex: 1 }}><Loader /></div></div>;

  return (
    <div style={{ display: 'flex', flex: 1, background: 'var(--bg-base)' }}>
      <DashboardSidebar />
      <main style={{ flex: 1, padding: '32px 40px', overflowY: 'auto' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: 'var(--text-primary)', marginBottom: 8 }}>
          Manage Users
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginBottom: 32 }}>
          {users.length} total users registered
        </p>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input type="text" className="input-field" style={{ paddingLeft: 42 }}
              placeholder="Search by name or email…"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['ALL', 'STUDENT', 'INSTRUCTOR', 'ADMIN'].map(r => (
              <button key={r} onClick={() => setRoleFilter(r)}
                style={{
                  padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border-color)',
                  background: roleFilter === r ? 'var(--primary)' : 'var(--bg-surface)',
                  color: roleFilter === r ? 'white' : 'var(--text-secondary)',
                  fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
                }}>
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-color)' }}>
                {['User', 'Email', 'Role', 'Joined', 'Status'].map(h => (
                  <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)', background: i % 2 === 0 ? 'transparent' : 'var(--bg-elevated)' }}>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                        {u.first_name?.[0]}{u.last_name?.[0]}
                      </div>
                      <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{u.first_name} {u.last_name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: 'var(--text-secondary)' }}>{u.email}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700, background: `${roleColor[u.role] || '#6366f1'}15`, color: roleColor[u.role] || '#6366f1' }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: 'var(--text-secondary)' }}>
                    {new Date(u.date_joined).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: u.is_active ? 'var(--success)' : 'var(--danger)' }}>
                      {u.is_active ? <CheckCircle size={13}/> : <Ban size={13}/>}
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No users found.</div>
          )}
        </div>
      </main>
    </div>
  );
}
