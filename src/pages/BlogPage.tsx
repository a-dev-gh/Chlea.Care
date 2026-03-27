import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SEED_BLOG_POSTS, BLOG_CATEGORIES } from '../data/seedBlog';

export function BlogPage() {
  const [activeCategory, setActiveCategory] = useState('');
  const posts = SEED_BLOG_POSTS
    .filter(p => p.is_visible)
    .filter(p => !activeCategory || p.category === activeCategory)
    .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '48px 24px 80px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <p className="section-label" style={{ marginBottom: 8 }}>Tips & Beauty Talk</p>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2rem, 5vw, 3.2rem)',
          fontWeight: 300, fontStyle: 'italic',
          color: 'var(--text)',
          marginBottom: 14,
        }}>
          Blog de Chlea Care
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-muted)', maxWidth: 500, margin: '0 auto' }}>
          Consejos, reseñas y rutinas directamente de Denisee para que saques el máximo provecho de tus productos.
        </p>
      </div>

      {/* Category filter pills */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 40, flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveCategory('')}
          style={{
            padding: '8px 20px',
            borderRadius: 'var(--r-pill)',
            border: !activeCategory ? '2px solid var(--hot)' : '1.5px solid var(--border2)',
            background: !activeCategory ? 'rgba(235,25,130,0.06)' : 'var(--white)',
            color: !activeCategory ? 'var(--hot)' : 'var(--text-soft)',
            fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)',
            cursor: 'pointer', transition: 'all 0.15s',
          }}
        >
          Todos
        </button>
        {BLOG_CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '8px 20px',
              borderRadius: 'var(--r-pill)',
              border: activeCategory === cat ? '2px solid var(--hot)' : '1.5px solid var(--border2)',
              background: activeCategory === cat ? 'rgba(235,25,130,0.06)' : 'var(--white)',
              color: activeCategory === cat ? 'var(--hot)' : 'var(--text-soft)',
              fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Blog grid */}
      {posts.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 28,
        }}>
          {posts.map(post => (
            <Link
              key={post.id}
              to={`/blog/${post.slug}`}
              style={{
                textDecoration: 'none',
                borderRadius: 'var(--r-md)',
                overflow: 'hidden',
                background: 'var(--white)',
                border: '1px solid var(--border)',
                transition: 'all 0.28s ease',
                display: 'flex', flexDirection: 'column',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-6px)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 32px rgba(235,25,130,0.1)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              }}
            >
              {/* Image placeholder */}
              <div style={{
                height: 200,
                background: post.image_url
                  ? `url(${post.image_url}) center/cover`
                  : 'linear-gradient(135deg, #fff0f5 0%, #ffd6e7 50%, #ffeaf3 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {!post.image_url && (
                  <span style={{ fontSize: 48, opacity: 0.4 }}>✍️</span>
                )}
              </div>

              {/* Content */}
              <div style={{ padding: '20px 24px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Category badge + date */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <span style={{
                    padding: '3px 10px',
                    borderRadius: 'var(--r-pill)',
                    background: 'rgba(235,25,130,0.08)',
                    color: 'var(--hot)',
                    fontSize: 11, fontWeight: 700,
                    letterSpacing: 0.5,
                  }}>
                    {post.category}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {new Date(post.published_at).toLocaleDateString('es-DO', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>

                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 20, fontWeight: 600,
                  color: 'var(--text)',
                  lineHeight: 1.3,
                  marginBottom: 10,
                }}>
                  {post.title}
                </h3>

                <p style={{
                  fontSize: 14, color: 'var(--text-soft)',
                  lineHeight: 1.6, flex: 1,
                }}>
                  {post.excerpt}
                </p>

                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  fontSize: 13, fontWeight: 600, color: 'var(--hot)',
                  marginTop: 14,
                }}>
                  Leer más
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📝</div>
          <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>No hay posts en esta categoría aún.</p>
        </div>
      )}
    </div>
  );
}
