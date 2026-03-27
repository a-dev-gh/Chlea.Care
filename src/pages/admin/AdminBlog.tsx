import { useState } from 'react';
import { SEED_BLOG_POSTS, BLOG_CATEGORIES, BlogPost } from '../../data/seedBlog';
import { Button } from '../../components/ui/Button';

export function AdminBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([...SEED_BLOG_POSTS]);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [saved, setSaved] = useState(false);

  function createNew() {
    const newPost: BlogPost = {
      id: String(Date.now()),
      title: '',
      slug: '',
      excerpt: '',
      body: '',
      image_url: '',
      category: BLOG_CATEGORIES[0],
      published_at: new Date().toISOString().split('T')[0],
      is_visible: false,
    };
    setEditing(newPost);
  }

  function generateSlug(title: string) {
    return title
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 60);
  }

  function handleSave() {
    if (!editing) return;
    const updated = editing;
    if (!updated.slug) updated.slug = generateSlug(updated.title);

    setPosts(prev => {
      const exists = prev.find(p => p.id === updated.id);
      if (exists) return prev.map(p => p.id === updated.id ? updated : p);
      return [...prev, updated];
    });
    setEditing(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function toggleVisibility(id: string) {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, is_visible: !p.is_visible } : p));
  }

  function deletePost(id: string) {
    setPosts(prev => prev.filter(p => p.id !== id));
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    border: '1.5px solid var(--border2)', borderRadius: 'var(--r-sm)',
    fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--text)',
    outline: 'none', background: 'var(--white)',
  };

  return (
    <div style={{ padding: 32, maxWidth: 900 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 400, color: 'var(--text)', marginBottom: 4 }}>
            Blog
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{posts.length} posts</p>
        </div>
        <Button onClick={createNew}>+ Nuevo Post</Button>
      </div>

      {/* Edit form */}
      {editing && (
        <div style={{
          background: 'var(--white)', borderRadius: 'var(--r-md)',
          border: '1.5px solid var(--border)',
          padding: 28, marginBottom: 28,
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: 'var(--text)' }}>
            {posts.find(p => p.id === editing.id) ? 'Editar Post' : 'Nuevo Post'}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>
                Título
              </label>
              <input
                value={editing.title}
                onChange={e => setEditing({ ...editing, title: e.target.value, slug: generateSlug(e.target.value) })}
                placeholder="Título del post"
                style={inputStyle}
              />
            </div>

            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>
                  Categoría
                </label>
                <select
                  value={editing.category}
                  onChange={e => setEditing({ ...editing, category: e.target.value })}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  {BLOG_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>
                  Fecha
                </label>
                <input
                  type="date"
                  value={editing.published_at}
                  onChange={e => setEditing({ ...editing, published_at: e.target.value })}
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>
                URL de imagen (opcional)
              </label>
              <input
                value={editing.image_url}
                onChange={e => setEditing({ ...editing, image_url: e.target.value })}
                placeholder="https://..."
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>
                Extracto (resumen corto)
              </label>
              <textarea
                value={editing.excerpt}
                onChange={e => setEditing({ ...editing, excerpt: e.target.value })}
                rows={2}
                placeholder="Un resumen breve que aparece en la tarjeta..."
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>
                Contenido completo
              </label>
              <textarea
                value={editing.body}
                onChange={e => setEditing({ ...editing, body: e.target.value })}
                rows={12}
                placeholder="Escribe el contenido del post... Usa **texto** para negrita."
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                <input
                  type="checkbox"
                  checked={editing.is_visible}
                  onChange={e => setEditing({ ...editing, is_visible: e.target.checked })}
                  style={{ accentColor: 'var(--hot)', width: 16, height: 16 }}
                />
                Publicado (visible en el blog)
              </label>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <Button onClick={handleSave}>Guardar</Button>
              <button
                onClick={() => setEditing(null)}
                style={{
                  padding: '10px 20px', borderRadius: 'var(--r-sm)',
                  border: '1.5px solid var(--border2)', background: 'var(--white)',
                  color: 'var(--text-soft)', fontSize: 14, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'var(--font-body)',
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {saved && <p style={{ fontSize: 14, color: '#25D366', fontWeight: 600, marginBottom: 16 }}>✓ Post guardado</p>}

      {/* Posts table */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {posts.map(post => (
          <div key={post.id} style={{
            display: 'flex', alignItems: 'center', gap: 16,
            padding: '14px 20px',
            background: 'var(--white)',
            borderRadius: 'var(--r-sm)',
            border: '1px solid var(--border)',
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>
                {post.title || '(Sin título)'}
              </p>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{
                  padding: '1px 8px', borderRadius: 'var(--r-pill)',
                  background: 'rgba(235,25,130,0.06)', color: 'var(--hot)',
                  fontSize: 11, fontWeight: 600,
                }}>
                  {post.category}
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{post.published_at}</span>
              </div>
            </div>

            <button
              onClick={() => toggleVisibility(post.id)}
              style={{
                padding: '5px 12px', borderRadius: 'var(--r-pill)',
                border: 'none', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                background: post.is_visible ? 'rgba(37,211,102,0.1)' : 'rgba(0,0,0,0.05)',
                color: post.is_visible ? '#25D366' : 'var(--text-muted)',
              }}
            >
              {post.is_visible ? 'Visible' : 'Borrador'}
            </button>

            <button onClick={() => setEditing({ ...post })} style={{
              background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-soft)', padding: 4,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>

            <button onClick={() => deletePost(post.id)} style={{
              background: 'none', border: 'none', cursor: 'pointer', color: '#e74c3c', padding: 4,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
