import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchBrands } from '../utils/db';
import type { Brand } from '../types/database';

export function BrandsCarousel() {
  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => {
    fetchBrands().then(setBrands);
  }, []);

  // Duplicate list for seamless infinite loop
  const doubled = [...brands, ...brands];

  if (brands.length === 0) return null;

  return (
    <section style={{ padding: '64px 0', background: 'var(--cream)', overflow: 'hidden' }}>
      <div style={{ textAlign: 'center', marginBottom: 40, padding: '0 24px' }}>
        <p className="section-label" style={{ marginBottom: 8 }}>Calidad garantizada</p>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
          fontWeight: 600,
          fontStyle: 'italic',
          color: 'var(--text)',
        }}>
          Nuestras Marcas
        </h2>
      </div>

      {/* Row 1 — scrolls left */}
      <div className="marquee-track" style={{ marginBottom: 20 }}>
        <div className="marquee-strip marquee-left">
          {doubled.map((brand, i) => (
            <Link
              key={`r1-${i}`}
              to={`/marcas/${brand.slug}`}
              className="brand-pill"
              title={brand.name}
            >
              {brand.logo_url ? (
                <img src={brand.logo_url} alt={brand.name} className="brand-pill-logo" />
              ) : (
                <span className="brand-pill-initial">{brand.name.charAt(0)}</span>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Row 2 — scrolls right (reversed list for variety) */}
      <div className="marquee-track">
        <div className="marquee-strip marquee-right">
          {[...doubled].reverse().map((brand, i) => (
            <Link
              key={`r2-${i}`}
              to={`/marcas/${brand.slug}`}
              className="brand-pill"
              title={brand.name}
            >
              {brand.logo_url ? (
                <img src={brand.logo_url} alt={brand.name} className="brand-pill-logo" />
              ) : (
                <span className="brand-pill-initial">{brand.name.charAt(0)}</span>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ textAlign: 'center', marginTop: 36, padding: '0 24px' }}>
        <Link to="/marcas" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          color: 'var(--hot)', fontSize: 14, fontWeight: 600,
          textDecoration: 'none',
          borderBottom: '1.5px solid var(--hot)',
          paddingBottom: 2,
          transition: 'opacity 0.2s',
        }}>
          Ver todas las marcas →
        </Link>
      </div>

      <style>{`
        .marquee-track {
          width: 100%;
          overflow: hidden;
          mask-image: linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%);
          -webkit-mask-image: linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%);
        }

        .marquee-strip {
          display: flex;
          gap: 20px;
          width: max-content;
          will-change: transform;
        }

        .marquee-left {
          animation: marqueeLeft 90s linear infinite;
        }
        .marquee-right {
          animation: marqueeRight 100s linear infinite;
        }

        .marquee-track:hover .marquee-strip {
          animation-play-state: paused;
        }

        @keyframes marqueeLeft {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marqueeRight {
          0%   { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }

        .brand-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 18px 32px;
          background: rgba(255, 255, 255, 0.55);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.7);
          border-radius: var(--r-pill);
          text-decoration: none;
          flex-shrink: 0;
          transition: all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
          cursor: pointer;
          box-shadow: 0 2px 12px rgba(235, 25, 130, 0.06);
        }

        .brand-pill:hover {
          border-color: rgba(235, 25, 130, 0.3);
          transform: translateY(-4px) scale(1.08);
          box-shadow: 0 8px 28px rgba(235, 25, 130, 0.15);
          background: rgba(255, 245, 249, 0.75);
        }

        .brand-pill-logo {
          height: 56px;
          width: auto;
          max-width: 160px;
          object-fit: contain;
          flex-shrink: 0;
        }

        .brand-pill-initial {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--hot), #ff6b9d);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-size: 22px;
          font-weight: 600;
          font-style: italic;
          flex-shrink: 0;
        }

        @media (max-width: 600px) {
          .brand-pill {
            padding: 14px 24px;
          }
          .brand-pill-logo {
            height: 42px;
            max-width: 120px;
          }
          .brand-pill-initial {
            width: 42px;
            height: 42px;
            font-size: 18px;
          }
        }
      `}</style>
    </section>
  );
}
