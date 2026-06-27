import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';
import DashboardSidebar from '../../components/DashboardSidebar';
import { Loader } from '../../components/UI';
import api from '../../services/api';

export default function CourseFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', price: '0', level: 'Beginner', category: '' });
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Load categories first
    api.get('/categories/')
      .then(res => {
        const cats = res.data.results || res.data;
        setCategories(cats);
        if (!isEditing && cats.length > 0) setForm(p => ({ ...p, category: cats[0].id }));
      })
      .catch(err => console.error(err));

    if (isEditing) {
      api.get(`/courses/${id}/`)
        .then(res => {
          setForm({
            title: res.data.title,
            description: res.data.description,
            price: res.data.price,
            level: res.data.level,
            category: res.data.category?.id || '',
          });
          if (res.data.thumbnail) setThumbnailPreview(res.data.thumbnail);
        })
        .catch(err => {
          console.error(err);
          navigate('/instructor/courses');
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEditing, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError(''); setSuccess('');
    
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('description', form.description);
    formData.append('price', form.price);
    formData.append('level', form.level);
    formData.append('category', form.category);
    if (thumbnail) formData.append('thumbnail', thumbnail);

    try {
      if (isEditing) {
        await api.patch(`/courses/${id}/`, formData, { headers: { 'Content-Type': 'multipart/form-data' }});
        setSuccess('Course updated successfully!');
      } else {
        const res = await api.post('/courses/', formData, { headers: { 'Content-Type': 'multipart/form-data' }});
        navigate(`/instructor/courses/${res.data.id}/edit`);
      }
    } catch (err) {
      setError('Failed to save course. Please check all fields.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  if (loading) return <div style={{ display: 'flex', flex: 1 }}><DashboardSidebar /><div style={{ flex: 1 }}><Loader /></div></div>;

  return (
    <div style={{ display: 'flex', flex: 1, background: 'var(--bg-base)' }}>
      <DashboardSidebar />
      <main style={{ flex: 1, padding: '32px 40px', overflowY: 'auto' }}>
        <div style={{ marginBottom: 32 }}>
           <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: 'var(--text-primary)', marginBottom: 6 }}>
             {isEditing ? 'Edit Course' : 'Create New Course'}
           </h1>
           <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Fill in the details to publish your course.</p>
        </div>

        {error && <div style={{ padding: '12px 16px', borderRadius: 10, marginBottom: 24, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', gap: 8, color: '#ef4444', fontSize: 14 }}><AlertCircle size={16} /> {error}</div>}
        {success && <div style={{ padding: '12px 16px', borderRadius: 10, marginBottom: 24, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: 'var(--success)', fontSize: 14 }}><CheckCircle size={16} /> {success}</div>}

        <div className="card" style={{ padding: 32, maxWidth: 800 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>Course Title</label>
              <input type="text" required className="input-field" placeholder="e.g. Advanced React Patterns"
                value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>Description</label>
              <textarea required className="input-field" placeholder="What will students learn?" style={{ minHeight: 120, resize: 'vertical' }}
                value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>Price ($)</label>
                <input type="number" step="0.01" min="0" required className="input-field"
                  value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>Level</label>
                <select className="input-field" value={form.level} onChange={e => setForm(p => ({ ...p, level: e.target.value }))}>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>Category</label>
                <select className="input-field" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>Course Thumbnail</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                <div style={{ width: 160, height: 90, borderRadius: 8, background: 'var(--bg-elevated)', border: '1px dashed var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {thumbnailPreview ? <img src={thumbnailPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ImageIcon size={24} color="var(--text-muted)" />}
                </div>
                <input type="file" accept="image/*" onChange={handleImageChange} style={{ fontSize: 14 }} />
              </div>
            </div>

            <div style={{ paddingTop: 24, borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button type="button" onClick={() => navigate('/instructor/courses')} className="btn-ghost">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary" style={{ padding: '10px 24px', gap: 8 }}>
                <Save size={16}/> {saving ? 'Saving...' : 'Save Course'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
