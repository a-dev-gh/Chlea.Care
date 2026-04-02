/**
 * TestimonialsCarousel — auto-scrolling marquee of customer reviews.
 * Fetches approved testimonials from Supabase; falls back to placeholder data.
 * Includes a "Dejar testimonio" button that opens a submission modal.
 */

import { useState, useEffect } from 'react';
import { fetchTestimonials, submitTestimonial } from '../utils/db';
import { Modal } from './ui/Modal';

// ---------------------------------------------------------------------------
// Placeholder data (used when DB is empty or unreachable)
// ---------------------------------------------------------------------------

const PLACEHOLDER_TESTIMONIALS = [
  { name: 'Adrian A.', rating: 5, text: 'Excelente calidad de productos y atención personalizada. La mejor tienda de belleza en RD.', photo: '' },
  { name: 'Angelis R.', rating: 5, text: 'Me encanta la variedad de marcas profesionales. Siempre encuentro lo que necesito para mi cabello.', photo: '' },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StarRating({ count }: { count: number }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="16" height="16" viewBox="0 0 24 24"
          fill={i < count ? 'var(--hot)' : 'none'}
          stroke={i < count ? 'var(--hot)' : 'var(--border2)'}
          strokeWidth="1.5">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

/** Clickable star rating for the submission form */
function FormStars({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <span style={{ display: 'inline-flex', gap: 4, cursor: 'pointer' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width={22} height={22} viewBox="0 0 24 24"
          fill={i <= value ? 'var(--hot)' : 'none'}
          stroke="var(--hot)" strokeWidth="1.8"
          onClick={() => onChange(i)} style={{ cursor: 'pointer' }}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Shape used internally by the carousel
// ---------------------------------------------------------------------------

interface CarouselItem {
  name: string;
  rating: number;
  text: string;
  photo: string;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function TestimonialsCarousel() {
  const [testimonials, setTestimonials] = useState<CarouselItem[]>(PLACEHOLDER_TESTIMONIALS);

  // Submission modal state
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formRating, setFormRating] = useState(5);
  const [formText, setFormText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch approved testimonials on mount; keep placeholders if DB is empty
  useEffect(() => {
    fetchTestimonials().then(data => {
      if (data.length > 0) {
        setTestimonials(data.map(t => ({
          name: t.name,
          rating: t.rating,
          text: t.text,
          photo: t.photo_url || '',
        })));
      }
    });
  }, []);

  // Reset form fields when modal closes
  function handleClose() {
    setShowForm(false);
    setFormName('');
    setFormRating(5);
    setFormText('');
    setSubmitted(false);
    setSubmitting(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formName.trim() || !formText.trim()) return;

    setSubmitting(true);
    await submitTestimonial({ name: formName.trim(), rating: formRating, text: formText.trim() });
    setSubmitting(false);
    setSubmitted(true);

    // Close after 3 s
    setTimeout(() => handleClose(), 3000);
  }

  // Duplicate for seamless infinite loop
  const items: CarouselItem[] = [...testimonials, ...testimonials];

  // Shared input style
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    border: '1.5px solid var(--border2)',
    borderRadius: 'var(--r-sm)',
    fontSize: 14,
    fontFamily: 'var(--font-body)',
    color: 'var(--text)',
    outline: 'none',
    background: 'var(--white)',
    boxSizing: 'border-box',
  };

  return (
    <>
      <div style={{ padding: '48px 0 0', overflow: 'hidden' }}>
        {/* Header row: title + CTA button */}
        <div style={{
          textAlign: 'center', marginBottom: 32, padding: '0 24px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
        }}>
          <div>
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
              color: 'var(--text)', margin: 0,
            }}>
              Opiniones reales
            </h2>
          </div>

          {/* "Leave a testimonial" button */}
          <button
            onClick={() => setShowForm(true)}
            style={{
              background: 'none',
              border: '1px solid var(--hot)',
              color: 'var(--hot)',
              borderRadius: 'var(--r-pill)',
              padding: '8px 20px',
              fontSize: 13,
              fontWeight: 600,
              fontFamily: 'var(--font-body)',
              cursor: 'pointer',
            }}
          >
            Dejar testimonio
          </button>
        </div>

        {/* Marquee track with edge fade */}
        <div className="testimonial-track">
          <div className="testimonial-strip">
            {items.map((t, i) => (
              <div key={i} className="testimonial-card">
                {/* Avatar + name */}
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

      {/* Testimonial submission modal */}
      <Modal open={showForm} onClose={handleClose} maxWidth={480}>
        <div style={{ padding: '32px 28px 28px' }}>
          {/* Modal header */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.4rem', fontWeight: 400, fontStyle: 'italic',
              color: 'var(--text)', margin: '0 0 4px',
            }}>
              Comparte tu experiencia
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
              Tu opinión será revisada antes de publicarse.
            </p>
          </div>

          {submitted ? (
            /* Success state */
            <div style={{
              textAlign: 'center', padding: '32px 0',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--hot), #ff6b9d)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p style={{
                fontSize: 15, fontWeight: 600,
                color: 'var(--text)', fontFamily: 'var(--font-body)', margin: 0,
              }}>
                ¡Gracias!
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, maxWidth: 280 }}>
                Tu testimonio será revisado antes de publicarse.
              </p>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Name */}
              <div>
                <label style={{
                  display: 'block', fontSize: 12, fontWeight: 600,
                  color: 'var(--text-muted)', marginBottom: 6,
                  textTransform: 'uppercase', letterSpacing: 0.8,
                }}>
                  Tu nombre
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="Ej. María G."
                  style={inputStyle}
                />
              </div>

              {/* Rating */}
              <div>
                <label style={{
                  display: 'block', fontSize: 12, fontWeight: 600,
                  color: 'var(--text-muted)', marginBottom: 8,
                  textTransform: 'uppercase', letterSpacing: 0.8,
                }}>
                  Calificación
                </label>
                <FormStars value={formRating} onChange={setFormRating} />
              </div>

              {/* Review text */}
              <div>
                <label style={{
                  display: 'block', fontSize: 12, fontWeight: 600,
                  color: 'var(--text-muted)', marginBottom: 6,
                  textTransform: 'uppercase', letterSpacing: 0.8,
                }}>
                  Tu opinión
                </label>
                <textarea
                  required
                  rows={4}
                  value={formText}
                  onChange={e => setFormText(e.target.value)}
                  placeholder="Cuéntanos sobre tu experiencia con Chlea Care..."
                  style={{ ...inputStyle, resize: 'vertical', minHeight: 100 }}
                />
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                <button
                  type="button"
                  onClick={handleClose}
                  style={{
                    background: 'none',
                    border: '1.5px solid var(--border2)',
                    color: 'var(--text-muted)',
                    borderRadius: 'var(--r-pill)',
                    padding: '10px 20px',
                    fontSize: 13,
                    fontWeight: 600,
                    fontFamily: 'var(--font-body)',
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    background: submitting ? 'var(--pink)' : 'var(--hot)',
                    border: 'none',
                    color: '#fff',
                    borderRadius: 'var(--r-pill)',
                    padding: '10px 24px',
                    fontSize: 13,
                    fontWeight: 700,
                    fontFamily: 'var(--font-body)',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    transition: 'background 0.2s',
                  }}
                >
                  {submitting ? 'Enviando...' : 'Enviar opinión'}
                </button>
              </div>
            </form>
          )}
        </div>
      </Modal>
    </>
  );
}
