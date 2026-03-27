import { Link } from 'react-router-dom';
import { SEED_BRANDS } from '../data/seedData';

export function BrandsCarousel() {
  // Duplicate list for seamless infinite loop
  const brands = [...SEED_BRANDS, ...SEED_BRANDS];

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
          {brands.map((brand, i) => (
            <Link
              key={`r1-${i}`}
              to={`/marcas/${brand.slug}`}
              className="brand-pill"
            >
              <span className="brand-pill-initial">{brand.name.charAt(0)}</span>
              <span className="brand-pill-name">{brand.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Row 2 — scrolls right (reversed list for variety) */}
      <div className="marquee-track">
        <div className="marquee-strip marquee-right">
          {[...brands].reverse().map((brand, i) => (
            <Link
              key={`r2-${i}`}
              to={`/marcas/${brand.slug}`}
              className="brand-pill"
            >
              <span className="brand-pill-initial">{brand.name.charAt(0)}</span>
              <span className="brand-pill-name">{brand.name}</span>
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
          gap: 16px;
          width: max-content;
          will-change: transform;
        }

        .marquee-left {
          animation: marqueeLeft 45s linear infinite;
        }
        .marquee-right {
          animation: marqueeRight 50s linear infinite;
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
          gap: 10px;
          padding: 12px 24px;
          background: var(--white);
          border: 1.5px solid var(--border);
          border-radius: var(--r-pill);
          text-decoration: none;
          white-space: nowrap;
          flex-shrink: 0;
          transition: all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
          cursor: pointer;
        }

        .brand-pill:hover {
          border-color: var(--hot);
          transform: translateY(-4px) scale(1.05);
          box-shadow: 0 8px 24px rgba(235, 25, 130, 0.15);
          background: #fff5f9;
        }

        .brand-pill-initial {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--hot), #ff6b9d);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-size: 15px;
          font-weight: 600;
          font-style: italic;
          flex-shrink: 0;
        }

        .brand-pill-name {
          font-family: var(--font-body);
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
          letter-spacing: 0.3px;
        }

        .brand-pill:hover .brand-pill-name {
          color: var(--hot);
        }

        @media (max-width: 600px) {
          .brand-pill {
            padding: 10px 18px;
            gap: 8px;
          }
          .brand-pill-initial {
            width: 28px;
            height: 28px;
            font-size: 13px;
          }
          .brand-pill-name {
            font-size: 13px;
          }
        }
      `}</style>
    </section>
  );
}
