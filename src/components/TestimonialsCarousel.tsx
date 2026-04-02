/**
 * TestimonialsCarousel — auto-scrolling marquee of customer reviews.
 * Uses the same infinite-loop technique as BrandsCarousel but slower.
 * Placeholder data until Supabase testimonials table is created.
 */

const PLACEHOLDER_TESTIMONIALS = [
  { name: 'Adrian A.', rating: 5, text: 'Excelente calidad de productos y atención personalizada. La mejor tienda de belleza en RD.', photo: '' },
  { name: 'Angelis R.', rating: 5, text: 'Me encanta la variedad de marcas profesionales. Siempre encuentro lo que necesito para mi cabello.', photo: '' },
];

function StarRating({ count }: { count: number }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill={i < count ? 'var(--hot)' : 'none'} stroke={i < count ? 'var(--hot)' : 'var(--border2)'} strokeWidth="1.5">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

export function TestimonialsCarousel() {
  const testimonials = PLACEHOLDER_TESTIMONIALS;

  if (testimonials.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 24px', color: 'var(--text-muted)', fontSize: 15 }}>
        Sé la primera en dejar tu opinión ✨
      </div>
    );
  }

  // Duplicate for seamless loop
  const items = [...testimonials, ...testimonials];

  return (
    <div style={{ padding: '48px 0 0', overflow: 'hidden' }}>
      <div style={{ textAlign: 'center', marginBottom: 32, padding: '0 24px' }}>
        <p style={{
          fontSize: 10, fontWeight: 700, letterSpacing: 2,
          textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8,
        }}>
          Lo que dicen nuestras clientas
        </p>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)',
          fontWeight: 400, fontStyle: 'italic',
          color: 'var(--text)',
        }}>
          Opiniones reales
        </h2>
      </div>

      {/* Marquee track with edge fade */}
      <div className="testimonial-track">
        <div className="testimonial-strip">
          {items.map((t, i) => (
            <div key={i} className="testimonial-card">
              {/* Avatar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
                  overflow: 'hidden',
                  background: t.photo ? 'transparent' : 'linear-gradient(135deg, var(--hot), #ff6b9d)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(235,25,130,0.15)',
                }}>
                  {t.photo ? (
                    <img src={t.photo} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{
                      color: '#fff', fontFamily: 'var(--font-display)',
                      fontSize: 20, fontWeight: 600, fontStyle: 'italic',
                    }}>
                      {t.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <p style={{
                    fontFamily: 'var(--font-display)', fontSize: 15,
                    fontWeight: 600, color: 'var(--text)', margin: 0,
                  }}>
                    {t.name}
                  </p>
                  <StarRating count={t.rating} />
                </div>
              </div>
              {/* Review text */}
              <p style={{
                fontSize: 14, color: 'var(--text-soft)', lineHeight: 1.65,
                fontFamily: 'var(--font-body)', margin: 0,
              }}>
                "{t.text}"
              </p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .testimonial-track {
          width: 100%;
          overflow: hidden;
          mask-image: linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%);
          -webkit-mask-image: linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%);
        }

        .testimonial-strip {
          display: flex;
          gap: 24px;
          width: max-content;
          will-change: transform;
          animation: testimonialScroll 120s linear infinite;
        }

        .testimonial-track:hover .testimonial-strip {
          animation-play-state: paused;
        }

        @keyframes testimonialScroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .testimonial-card {
          width: 320px;
          flex-shrink: 0;
          padding: 24px;
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.8);
          border-radius: var(--r-md);
          box-shadow: 0 4px 20px rgba(235, 25, 130, 0.06);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .testimonial-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 32px rgba(235, 25, 130, 0.12);
        }

        @media (max-width: 600px) {
          .testimonial-card {
            width: 280px;
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
}
