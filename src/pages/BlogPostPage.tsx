import { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { SEED_BLOG_POSTS } from '../data/seedBlog';
import { fetchBlogPosts } from '../utils/db';
import type { BlogPost } from '../types/database';

// Convert legacy plain-text (with **bold** markers) to HTML if needed.
// If the string already contains HTML tags, use it as-is.
function bodyToHtml(text: string): string {
  if (!text) return '';
  // If the body already contains HTML markup from the RTE, return it directly
  if (/<[a-z][\s\S]*>/i.test(text)) return text;
  // Otherwise convert the old plain-text markdown-ish format
  return text
    .split('\n')
    .map(line => {
      if (line.trim() === '') return '<br>';
      // Replace **bold** with <strong>
      const bolded = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return `<p style="margin-bottom:8px">${bolded}</p>`;
    })
    .join('');
}

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [dbPosts, setDbPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogPosts().then(data => {
      setDbPosts(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>Cargando...</p>
      </div>
    );
  }

  // Use Supabase data if available, fall back to seed for development
  const source = dbPosts.length > 0 ? dbPosts : SEED_BLOG_POSTS;
  const post = source.find(p => p.slug === slug && p.is_visible);

  if (!post) return <Navigate to="/blog" replace />;

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 80px' }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: 28 }}>
        <Link to="/blog" style={{
          fontSize: 13, color: 'var(--hot)', textDecoration: 'none', fontWeight: 600,
          display: 'inline-flex', alignItems: 'center', gap: 6,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Volver al blog
        </Link>
      </div>

      {/* Category + date */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <span style={{
          padding: '4px 12px',
          borderRadius: 'var(--r-pill)',
          background: 'rgba(235,25,130,0.08)',
          color: 'var(--hot)',
          fontSize: 12, fontWeight: 700,
        }}>
          {post.category}
        </span>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          {new Date(post.published_at).toLocaleDateString('es-DO', { day: 'numeric', month: 'long', year: 'numeric' })}
        </span>
      </div>

      {/* Title */}
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
        fontWeight: 400, fontStyle: 'italic',
        color: 'var(--text)',
        lineHeight: 1.2,
        marginBottom: 28,
      }}>
        {post.title}
      </h1>

      {/* Hero image */}
      {post.image_url && (
        <div style={{
          borderRadius: 'var(--r-md)',
          overflow: 'hidden',
          marginBottom: 32,
          aspectRatio: '16/9',
        }}>
          <img src={post.image_url} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}

      {/* Author */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        marginBottom: 32, paddingBottom: 24,
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          overflow: 'hidden',
          border: '2px solid var(--pink)',
        }}>
          <img
            src="/about-photo.webp"
            alt="Denisee Ventura"
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 15%' }}
          />
        </div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Denisee Ventura</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Fundadora de Chlea Care</p>
        </div>
      </div>

      {/* Body */}
      <div
        style={{
          fontSize: 16, color: 'var(--text-soft)',
          lineHeight: 1.85,
          fontFamily: 'var(--font-body)',
        }}
        dangerouslySetInnerHTML={{ __html: bodyToHtml(post.body) }}
      />

      {/* CTA */}
      <div style={{
        marginTop: 48, padding: 32,
        background: 'linear-gradient(135deg, #fff0f5, #ffeaf3)',
        borderRadius: 'var(--r-md)',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: 18, fontFamily: 'var(--font-display)', fontStyle: 'italic', color: 'var(--text)', marginBottom: 16 }}>
          ¿Te gustó este artículo?
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a
            href="https://wa.me/18094517690"
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 24px',
              background: '#25D366', color: '#fff',
              borderRadius: 'var(--r-pill)',
              fontSize: 14, fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Pregúntame por WhatsApp
          </a>
          <Link
            to="/catalogo"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 24px',
              background: 'var(--hot)', color: '#fff',
              borderRadius: 'var(--r-pill)',
              fontSize: 14, fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Ver catálogo
          </Link>
        </div>
      </div>
    </div>
  );
}
