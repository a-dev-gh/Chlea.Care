import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { SEED_BRANDS, SEED_PRODUCTS } from '../data/seedData';

export function BrandsCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scrollBy(dir: number) {
    scrollRef.current?.scrollBy({ left: dir * 340, behavior: 'smooth' });
  }

  return (
    <section style={{ padding: '72px 24px', background: 'var(--cream)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
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

        {/* Carousel */}
        <div style={{ position: 'relative' }}>
          <div
            ref={scrollRef}
            style={{
              display: 'flex',
              gap: 20,
              overflowX: 'auto',
              scrollSnapType: 'x mandatory',
              scrollbarWidth: 'none',
              padding: '4px 0 16px',
            }}
            className="brands-scroll"
          >
            {SEED_BRANDS.map(brand => {
              const productCount = SEED_PRODUCTS.filter(p => p.brand === brand.name).length;
              return (
                <Link
                  key={brand.slug}
                  to={`/marcas/${brand.slug}`}
                  style={{
                    minWidth: 300,
                    maxWidth: 300,
                    scrollSnapAlign: 'start',
                    flexShrink: 0,
                    textDecoration: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 'var(--r-md)',
                    overflow: 'hidden',
                    background: 'var(--white)',
                    border: '1px solid var(--border)',
                    transition: 'all 0.28s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget;
                    el.style.transform = 'translateY(-6px)';
                    el.style.boxShadow = 'var(--shadow-md)';
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget;
                    el.style.transform = 'translateY(0)';
                    el.style.boxShadow = 'none';
                  }}
                >
                  {/* Image placeholder — tall card like Alfaparf */}
                  <div style={{
                    height: 280,
                    background: 'linear-gradient(160deg, #f8f0f3 0%, #ffd6e7 50%, #ffeaf3 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative',
                  }}>
                    {/* Placeholder orb with brand initial */}
                    <div style={{
                      width: 90, height: 90, borderRadius: '50%',
                      background: 'rgba(255,255,255,0.7)',
                      backdropFilter: 'blur(8px)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'var(--font-display)',
                      fontSize: 36, fontWeight: 600, fontStyle: 'italic',
                      color: 'var(--hot)',
                      boxShadow: '0 4px 20px rgba(235,25,130,0.12)',
                    }}>
                      {brand.name.charAt(0)}
                    </div>
                  </div>

                  {/* Footer with name + arrow */}
                  <div style={{
                    padding: '20px 22px',
                    display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
                    gap: 12,
                  }}>
                    <div>
                      <h3 style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 20, fontWeight: 600,
                        color: 'var(--text)',
                        marginBottom: 4,
                        lineHeight: 1.2,
                      }}>
                        {brand.name}
                      </h3>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                        {brand.tagline}
                      </p>
                    </div>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: 'var(--cream)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'background 0.2s',
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-soft)" strokeWidth="2.5">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Navigation dots + arrows — Alfaparf style */}
          <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            gap: 20, marginTop: 24,
          }}>
            {/* Dot indicators */}
            <div style={{ display: 'flex', gap: 6 }}>
              {SEED_BRANDS.map((_, i) => (
                <div key={i} style={{
                  width: i === 0 ? 28 : 8, height: 4,
                  borderRadius: 2,
                  background: i === 0 ? 'var(--hot)' : 'var(--border2)',
                  transition: 'all 0.2s',
                }} />
              ))}
            </div>

            {/* Forward arrow button */}
            <button
              onClick={() => scrollBy(1)}
              style={{
                width: 48, height: 48, borderRadius: '50%',
                background: 'var(--hot)', border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(235,25,130,0.3)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.08)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .brands-scroll::-webkit-scrollbar { display: none; }
        @media (max-width: 600px) {
          .brands-scroll > a { min-width: 260px !important; max-width: 260px !important; }
        }
      `}</style>
    </section>
  );
}
