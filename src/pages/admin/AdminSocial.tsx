import { useState, useEffect, useCallback } from 'react';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { adminFetch, adminInsert, adminUpdate, adminDelete } from '../../utils/adminApi';
import { supabase } from '../../utils/supabase';
import { showToast } from '../../components/ui/Toast';
import type { InstagramPost } from '../../types/database';

// Seed posts fallback (no DB table yet)
const SEED_POSTS: InstagramPost[] = [
  { id: '1', url: 'https://www.instagram.com/p/DWEnZb4jn5w/', type: 'post', is_visible: true, sort_order: 0, created_at: '' },
  { id: '2', url: 'https://www.instagram.com/p/DPo41_dDkWh/', type: 'reel', is_visible: true, sort_order: 1, created_at: '' },
  { id: '3', url: 'https://www.instagram.com/p/DGmNg0PPvCM/', type: 'post', is_visible: true, sort_order: 2, created_at: '' },
];

export function AdminSocial() {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<InstagramPost> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    const data = await adminFetch<InstagramPost>('instagram_posts', { orderBy: 'sort_order' });
    setPosts(data.length > 0 ? data : [...SEED_POSTS]);
    setLoading(false);
  }, []);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  function openNew() {
    setEditing({ url: '', type: 'post', is_visible: true, sort_order: posts.length });
    setIsNew(true);
  }

  function openEdit(post: InstagramPost) {
    setEditing({ ...post });
    setIsNew(false);
  }

  async function handleSave() {
    if (!editing || !editing.url?.trim()) return;
    setSaving(true);

    if (supabase) {
      if (isNew) {
        const { error } = await adminInsert<InstagramPost>('instagram_posts', editing);
        if (error) { showToast('Error al guardar: ' + error, 'error'); } else { await loadPosts(); showToast('Post agregado', 'success'); }
      } else {
        const { id, created_at, ...rest } = editing as any;
        const { error } = await adminUpdate<InstagramPost>('instagram_posts', editing.id!, rest);
        if (error) { showToast('Error al guardar: ' + error, 'error'); } else { await loadPosts(); showToast('Post actualizado', 'success'); }
      }
    } else {
      // Local fallback
      if (isNew) {
        const newPost = { ...editing, id: String(Date.now()), created_at: new Date().toISOString() } as InstagramPost;
        setPosts(prev => [...prev, newPost]);
        showToast('Post agregado', 'success');
      } else {
        setPosts(prev => prev.map(p => p.id === editing.id ? { ...p, ...editing } as InstagramPost : p));
        showToast('Post actualizado', 'success');
      }
    }

    setSaving(false);
    setEditing(null);
  }

  async function handleDelete(id: string) {
    if (supabase) {
      const { ok, error } = await adminDelete('instagram_posts', id);
      if (error) { showToast('Error al eliminar: ' + error, 'error'); }
      if (ok) { await loadPosts(); showToast('Post eliminado', 'success'); }
    } else {
      setPosts(prev => prev.filter(p => p.id !== id));
      showToast('Post eliminado', 'success');
    }
  }

  // Reorder helpers
  async function moveUp(i: number) {
    if (i === 0) return;
    const next = [...posts];
    [next[i - 1], next[i]] = [next[i], next[i - 1]];
    // Update sort_order values
    const updated = next.map((p, idx) => ({ ...p, sort_order: idx }));
    setPosts(updated);

    if (supabase) {
      // Update both swapped items (ignore individual errors for reordering)
      await Promise.all([
        adminUpdate('instagram_posts', updated[i].id, { sort_order: i }),
        adminUpdate('instagram_posts', updated[i - 1].id, { sort_order: i - 1 }),
      ]);
    }
  }

  async function moveDown(i: number) {
    if (i >= posts.length - 1) return;
    const next = [...posts];
    [next[i], next[i + 1]] = [next[i + 1], next[i]];
    const updated = next.map((p, idx) => ({ ...p, sort_order: idx }));
    setPosts(updated);

    if (supabase) {
      await Promise.all([
        adminUpdate('instagram_posts', updated[i].id, { sort_order: i }),
        adminUpdate('instagram_posts', updated[i + 1].id, { sort_order: i + 1 }),
      ]);
    }
  }

  // Toggle visibility
  async function toggleVisible(post: InstagramPost) {
    const newVal = !post.is_visible;
    if (supabase) {
      const { error } = await adminUpdate('instagram_posts', post.id, { is_visible: newVal });
      if (error) { showToast('Error: ' + error, 'error'); } else { showToast(newVal ? 'Post visible' : 'Post oculto', 'info'); }
      await loadPosts();
    } else {
      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, is_visible: newVal } : p));
      showToast(newVal ? 'Post visible' : 'Post oculto', 'info');
    }
  }

  if (loading) {
    return <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>Cargando posts...</div>;
  }

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 400, color: 'var(--text)' }}>Redes Sociales</h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
            Administra los posts de Instagram que se muestran en la pagina principal. Se recomiendan 6 posts (2 filas de 3).
          </p>
        </div>
        <button onClick={openNew} style={{
          background: 'var(--hot)', color: '#fff',
          border: 'none', borderRadius: 'var(--r-pill)',
          padding: '10px 22px', fontSize: 14, fontWeight: 600,
          fontFamily: 'var(--font-body)', cursor: 'pointer',
        }}>
          + Anadir Post
        </button>
      </div>

      {/* Posts list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {posts.map((post, i) => (
          <div key={post.id} style={{
            display: 'flex', alignItems: 'center', gap: 16,
            background: 'var(--white)', border: '1px solid var(--border)',
            borderRadius: 'var(--r-md)', padding: '16px 20px',
            opacity: post.is_visible ? 1 : 0.5,
          }}>
            {/* Order controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
              <button onClick={() => moveUp(i)} style={{
                background: 'none', border: '1px solid var(--border2)',
                borderRadius: 4, width: 24, height: 24, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-muted)', fontSize: 12,
              }}>^</button>
              <button onClick={() => moveDown(i)} style={{
                background: 'none', border: '1px solid var(--border2)',
                borderRadius: 4, width: 24, height: 24, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-muted)', fontSize: 12,
              }}>v</button>
            </div>

            {/* Position badge */}
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', flexShrink: 0,
            }}>
              {i + 1}
            </div>

            {/* Post info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{
                  padding: '2px 8px', borderRadius: 'var(--r-pill)',
                  fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                  background: post.type === 'reel' ? 'rgba(235,25,130,0.1)' : 'var(--cream)',
                  color: post.type === 'reel' ? 'var(--hot)' : 'var(--text-muted)',
                }}>
                  {post.type}
                </span>
                <button
                  onClick={() => toggleVisible(post)}
                  style={{
                    padding: '2px 8px', borderRadius: 'var(--r-pill)',
                    border: 'none', fontSize: 10, fontWeight: 700, cursor: 'pointer',
                    background: post.is_visible ? 'rgba(37,211,102,0.1)' : 'rgba(0,0,0,0.05)',
                    color: post.is_visible ? '#25D366' : 'var(--text-muted)',
                  }}
                >
                  {post.is_visible ? 'Visible' : 'Oculto'}
                </button>
              </div>
              <p style={{
                fontSize: 13, color: 'var(--text-soft)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                fontFamily: 'monospace',
              }}>
                {post.url}
              </p>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <button onClick={() => openEdit(post)} style={{
                padding: '5px 12px', borderRadius: 'var(--r-sm)',
                border: '1px solid var(--border2)', background: 'none',
                fontSize: 12, fontWeight: 600, color: 'var(--text-soft)',
                cursor: 'pointer', fontFamily: 'var(--font-body)',
              }}>
                Editar
              </button>
              <button onClick={() => handleDelete(post.id)} style={{
                padding: '5px 12px', borderRadius: 'var(--r-sm)',
                border: '1px solid rgba(239,68,68,0.3)', background: 'none',
                fontSize: 12, fontWeight: 600, color: '#ef4444',
                cursor: 'pointer', fontFamily: 'var(--font-body)',
              }}>
                x
              </button>
            </div>
          </div>
        ))}

        {posts.length === 0 && (
          <div style={{
            background: 'var(--white)', border: '1px solid var(--border)',
            borderRadius: 'var(--r-md)', padding: '60px 24px', textAlign: 'center',
          }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>No hay posts agregados aun</p>
          </div>
        )}
      </div>

      {/* Edit/Create Modal */}
      <Modal open={!!editing} onClose={() => setEditing(null)} maxWidth={460}>
        {editing && (
          <div style={{ padding: '28px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 400, marginBottom: 24 }}>
              {isNew ? 'Anadir Post' : 'Editar Post'}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
                  URL de Instagram
                </label>
                <input
                  type="url" value={editing.url || ''}
                  onChange={e => setEditing({ ...editing, url: e.target.value })}
                  placeholder="https://www.instagram.com/p/..."
                  style={{
                    width: '100%', padding: '12px 14px',
                    border: '1.5px solid var(--border2)', borderRadius: 'var(--r-sm)',
                    fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--text)', outline: 'none',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Tipo
                </label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {(['post', 'reel'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => setEditing({ ...editing, type })}
                      style={{
                        flex: 1, padding: '10px',
                        borderRadius: 'var(--r-sm)',
                        border: editing.type === type ? '2px solid var(--hot)' : '1.5px solid var(--border2)',
                        background: editing.type === type ? 'rgba(235,25,130,0.06)' : 'none',
                        color: editing.type === type ? 'var(--hot)' : 'var(--text-soft)',
                        fontSize: 14, fontWeight: 600,
                        cursor: 'pointer', fontFamily: 'var(--font-body)',
                        textTransform: 'capitalize',
                      }}
                    >
                      {type === 'reel' ? 'Reel' : 'Post'}
                    </button>
                  ))}
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14, color: 'var(--text-soft)' }}>
                <input
                  type="checkbox"
                  checked={editing.is_visible ?? true}
                  onChange={e => setEditing({ ...editing, is_visible: e.target.checked })}
                  style={{ accentColor: 'var(--hot)', width: 16, height: 16 }}
                />
                Visible en la pagina principal
              </label>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <Button onClick={handleSave} disabled={saving} fullWidth>
                  {saving ? 'Guardando...' : isNew ? 'Anadir' : 'Guardar'}
                </Button>
                <Button onClick={() => setEditing(null)} variant="outline" fullWidth>
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
