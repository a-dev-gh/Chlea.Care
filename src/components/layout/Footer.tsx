import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchBrands } from '../../utils/db';
import { SEED_BRANDS } from '../../data/seedData';
import type { Brand } from '../../types/database';

export function Footer() {
  // Load brands from DB, fallback to seed
  const [footerBrands, setFooterBrands] = useState<{ name: string; slug: string }[]>(
    SEED_BRANDS.slice(0, 6).map(b => ({ name: b.name, slug: b.slug }))
  );

  useEffect(() => {
    fetchBrands().then((brands: Brand[]) => {
      const premier = brands.filter(b => b.is_premier);
      if (premier.length > 0) {
        setFooterBrands(premier.slice(0, 6).map(b => ({ name: b.name, slug: b.slug })));
      }
    });
  }, []);

  return (
    <footer style={{ background: 'var(--deep)', color: 'rgba(255,255,255,0.85)', padding: '56px 24px 32px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 40,
          marginBottom: 48,
        }}>
          {/* Brand col */}
          <div>
            <img
              src="/chlea-care-logo.svg"
              alt="Chlea Care"
              style={{ height: 52, marginBottom: 14 }}
            />
            <p style={{ fontSize: 13, lineHeight: 1.6, opacity: 0.85, maxWidth: 240, fontWeight: 500 }}>
              Tu cuidado y belleza es nuestra prioridad
            </p>
          </div>

          {/* Tienda */}
          <div>
            <h4 style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16, color: 'var(--pink)' }}>
              Tienda
            </h4>
            {[
              { label: 'Catálogo',     to: '/catalogo' },
              { label: 'Ofertas',      to: '/catalogo?filtro=oferta' },
              { label: 'Lo más Hot',   to: '/catalogo?filtro=hot' },
              { label: 'Para Hombres', to: '/hombres' },
            ].map(l => (
              <Link key={l.label} to={l.to} style={{
                display: 'block', fontSize: 14, marginBottom: 10,
                color: 'rgba(255,255,255,0.7)', transition: 'color 0.2s',
                textDecoration: 'none',
              }}
                onMouseEnter={e => ((e.target as HTMLElement).style.color = 'var(--pink)')}
                onMouseLeave={e => ((e.target as HTMLElement).style.color = 'rgba(255,255,255,0.7)')}
              >{l.label}</Link>
            ))}
          </div>

          {/* Marcas — dedicated section */}
          <div>
            <h4 style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16, color: 'var(--pink)' }}>
              Marcas
            </h4>
            {footerBrands.map(b => (
              <Link key={b.slug} to={`/marcas/${b.slug}`} style={{
                display: 'block', fontSize: 14, marginBottom: 10,
                color: 'rgba(255,255,255,0.7)', transition: 'color 0.2s',
                textDecoration: 'none',
              }}
                onMouseEnter={e => ((e.target as HTMLElement).style.color = 'var(--pink)')}
                onMouseLeave={e => ((e.target as HTMLElement).style.color = 'rgba(255,255,255,0.7)')}
              >{b.name}</Link>
            ))}
            <Link to="/marcas" style={{
              display: 'block', fontSize: 13, marginTop: 4,
              color: 'var(--pink)', fontWeight: 600,
              textDecoration: 'none', opacity: 0.8,
            }}>
              Ver todas →
            </Link>
          </div>

          {/* Chlea Care */}
          <div>
            <h4 style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16, color: 'var(--pink)' }}>
              Chlea Care
            </h4>
            {[
              { label: 'Sobre Nosotros', href: '/sobre-nosotras', isRoute: true },
              { label: 'Contacto', href: 'https://wa.me/18094517690', external: true },
              { label: 'Políticas de Envío', href: '/politicas-envio', isRoute: true },
              { label: 'Políticas de Reembolso', href: '/politicas-reembolso', isRoute: true },
              { label: 'WhatsApp', href: 'https://wa.me/18094517690', external: true },
            ].map(l => l.isRoute ? (
              <Link key={l.label} to={l.href} style={{
                display: 'block', fontSize: 14, marginBottom: 10,
                color: 'rgba(255,255,255,0.7)', transition: 'color 0.2s',
                textDecoration: 'none',
              }}
                onMouseEnter={e => ((e.target as HTMLElement).style.color = 'var(--pink)')}
                onMouseLeave={e => ((e.target as HTMLElement).style.color = 'rgba(255,255,255,0.7)')}
              >{l.label}</Link>
            ) : (
              <a key={l.label} href={l.href} style={{
                display: 'block', fontSize: 14, marginBottom: 10,
                color: 'rgba(255,255,255,0.7)', transition: 'color 0.2s',
                textDecoration: 'none',
              }}
                target={l.external ? '_blank' : undefined}
                rel={l.external ? 'noreferrer' : undefined}
                onMouseEnter={e => ((e.target as HTMLElement).style.color = 'var(--pink)')}
                onMouseLeave={e => ((e.target as HTMLElement).style.color = 'rgba(255,255,255,0.7)')}
              >{l.label}</a>
            ))}
          </div>

          {/* Síguenos */}
          <div>
            <h4 style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16, color: 'var(--pink)' }}>
              Síguenos
            </h4>
            <div style={{ display: 'flex', gap: 12 }}>
              <a href="https://instagram.com/chlea.carerd" target="_blank" rel="noreferrer"
                style={{ color: 'rgba(255,255,255,0.7)', transition: 'color 0.2s' }}
                onMouseEnter={e => ((e.target as HTMLElement).style.color = 'var(--pink)')}
                onMouseLeave={e => ((e.target as HTMLElement).style.color = 'rgba(255,255,255,0.7)')}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
              <a href="https://www.tiktok.com/@chlea.carerd" target="_blank" rel="noreferrer"
                style={{ color: 'rgba(255,255,255,0.7)', transition: 'color 0.2s' }}
                onMouseEnter={e => ((e.target as HTMLElement).style.color = 'var(--pink)')}
                onMouseLeave={e => ((e.target as HTMLElement).style.color = 'rgba(255,255,255,0.7)')}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>
                </svg>
              </a>
              <a href="https://wa.me/18094517690" target="_blank" rel="noreferrer"
                style={{ color: 'rgba(255,255,255,0.7)', transition: 'color 0.2s' }}
                onMouseEnter={e => ((e.target as HTMLElement).style.color = 'var(--pink)')}
                onMouseLeave={e => ((e.target as HTMLElement).style.color = 'rgba(255,255,255,0.7)')}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: 24, textAlign: 'center', fontSize: 13, opacity: 0.55 }}>
          © {new Date().getFullYear()} Chlea Care · Tu cuidado y belleza es nuestra prioridad 🩷
        </div>
      </div>
    </footer>
  );
}
