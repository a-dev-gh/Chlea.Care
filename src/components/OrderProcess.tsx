/**
 * OrderProcess — 3-step "how it works" section.
 * Uses Intersection Observer to trigger staggered fade-in animations.
 */

import { useEffect, useRef, useState } from 'react';

// ── Inline SVG Icons (64px, stroked in var(--hot)) ──

function CartIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Cart body */}
      <path d="M10 12h6l8 32h24l6-22H22" stroke="var(--hot)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Cart basket */}
      <path d="M24 44h20a2 2 0 0 0 2-1.6L52 20H18" stroke="var(--hot)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Wheels */}
      <circle cx="26" cy="50" r="3" stroke="var(--hot)" strokeWidth="2.5" />
      <circle cx="42" cy="50" r="3" stroke="var(--hot)" strokeWidth="2.5" />
      {/* Item 1 — small box */}
      <rect x="28" y="26" width="6" height="8" rx="1" stroke="var(--hot)" strokeWidth="1.8" />
      <line x1="31" y1="26" x2="31" y2="34" stroke="var(--hot)" strokeWidth="1" />
      {/* Item 2 — bottle */}
      <rect x="37" y="24" width="5" height="10" rx="2" stroke="var(--hot)" strokeWidth="1.8" />
      <rect x="38.5" y="22" width="2" height="3" rx="0.5" stroke="var(--hot)" strokeWidth="1.2" />
      {/* Sparkle */}
      <circle cx="46" cy="14" r="1.5" fill="var(--hot)" opacity="0.6" />
      <path d="M48 10l1 2.5L51.5 14l-2.5 1L48 17.5 47 15l-2.5-1L47 13z" fill="var(--hot)" opacity="0.4" />
    </svg>
  );
}

function CashIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Back bill */}
      <rect x="12" y="16" width="40" height="24" rx="3" stroke="var(--hot)" strokeWidth="2" opacity="0.4" />
      {/* Front bill */}
      <rect x="8" y="22" width="40" height="24" rx="3" stroke="var(--hot)" strokeWidth="2.5" />
      {/* Dollar circle on bill */}
      <circle cx="28" cy="34" r="7" stroke="var(--hot)" strokeWidth="2" />
      {/* Dollar sign */}
      <path d="M28 29v10M25.5 31.5c0-1.2 1.1-2 2.5-2s2.5.8 2.5 2c0 1.5-2.5 1.5-2.5 3 0 1.2 1.1 2 2.5 2s2.5-.8 2.5-2" stroke="var(--hot)" strokeWidth="1.6" strokeLinecap="round" />
      {/* Bill lines */}
      <line x1="14" y1="29" x2="18" y2="29" stroke="var(--hot)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="14" y1="33" x2="17" y2="33" stroke="var(--hot)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="38" y1="29" x2="42" y2="29" stroke="var(--hot)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="39" y1="33" x2="42" y2="33" stroke="var(--hot)" strokeWidth="1.5" strokeLinecap="round" />
      {/* Coins */}
      <ellipse cx="50" cy="46" rx="7" ry="5" stroke="var(--hot)" strokeWidth="2" />
      <ellipse cx="50" cy="43" rx="7" ry="5" stroke="var(--hot)" strokeWidth="2" fill="var(--cream)" />
      <path d="M50 40v6" stroke="var(--hot)" strokeWidth="1.2" />
      <path d="M48 43h4" stroke="var(--hot)" strokeWidth="1.2" />
    </svg>
  );
}

function ScooterIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Back wheel */}
      <circle cx="16" cy="46" r="7" stroke="var(--hot)" strokeWidth="2.5" />
      <circle cx="16" cy="46" r="2" fill="var(--hot)" opacity="0.3" />
      {/* Front wheel */}
      <circle cx="50" cy="46" r="7" stroke="var(--hot)" strokeWidth="2.5" />
      <circle cx="50" cy="46" r="2" fill="var(--hot)" opacity="0.3" />
      {/* Frame — scooter body */}
      <path d="M16 46L22 30h16l4-8h6" stroke="var(--hot)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Seat */}
      <path d="M28 30h10" stroke="var(--hot)" strokeWidth="3" strokeLinecap="round" />
      {/* Front fork */}
      <path d="M42 30l8 16" stroke="var(--hot)" strokeWidth="2.5" strokeLinecap="round" />
      {/* Handlebar */}
      <path d="M44 20h8" stroke="var(--hot)" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M48 20v4" stroke="var(--hot)" strokeWidth="2.5" strokeLinecap="round" />
      {/* Delivery box on back */}
      <rect x="10" y="22" width="14" height="10" rx="2" stroke="var(--hot)" strokeWidth="2" />
      <line x1="17" y1="22" x2="17" y2="32" stroke="var(--hot)" strokeWidth="1.5" />
      {/* Sparkle — speed lines */}
      <line x1="4" y1="38" x2="9" y2="38" stroke="var(--hot)" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <line x1="2" y1="42" x2="8" y2="42" stroke="var(--hot)" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <line x1="3" y1="46" x2="7" y2="46" stroke="var(--hot)" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
    </svg>
  );
}

const STEPS = [
  {
    icon: <CartIcon />,
    heading: 'Arma tu carrito',
    text: 'Revisa el catálogo y selecciona tus productos favoritos',
  },
  {
    icon: <CashIcon />,
    heading: 'Elige pago y entrega',
    text: 'Selecciona tu método de pago y entrega favorito',
  },
  {
    icon: <ScooterIcon />,
    heading: 'Recibe tu pedido',
    text: '2–24 horas en Santo Domingo · 5 días laborables en provincias',
  },
];

export function OrderProcess() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        padding: '72px 24px',
        background: 'linear-gradient(180deg, var(--cream) 0%, #fff5f8 100%)',
      }}
    >
      <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
        {/* Section header */}
        <p style={{
          fontSize: 10, fontWeight: 700, letterSpacing: 2,
          textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8,
        }}>
          Tu pedido, fácil y seguro
        </p>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
          fontWeight: 400, fontStyle: 'italic',
          color: 'var(--hot)', marginBottom: 48,
        }}>
          ¿Cómo funciona?
        </h2>

        {/* Steps row */}
        <div className="order-steps-row">
          {STEPS.map((step, i) => (
            <div
              key={i}
              className="order-step"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateX(0)' : 'translateX(-40px)',
                transition: `opacity 0.6s ease ${i * 0.3}s, transform 0.6s ease ${i * 0.3}s`,
              }}
            >
              {/* Icon container */}
              <div style={{
                width: 100, height: 100, borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1.5px solid rgba(235, 25, 130, 0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
                position: 'relative',
                boxShadow: '0 4px 20px rgba(235,25,130,0.08)',
              }}>
                {step.icon}
                {/* Step number badge */}
                <span style={{
                  position: 'absolute', top: -4, right: -4,
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'var(--hot)', color: '#fff',
                  fontSize: 13, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(235,25,130,0.3)',
                  fontFamily: 'var(--font-body)',
                }}>
                  {i + 1}
                </span>
              </div>

              {/* Heading */}
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 20, fontWeight: 600,
                color: 'var(--text)', marginBottom: 8,
              }}>
                {step.heading}
              </h3>

              {/* Description */}
              <p style={{
                fontSize: 14, color: 'var(--text-soft)',
                lineHeight: 1.7, maxWidth: 260, margin: '0 auto',
                fontFamily: 'var(--font-body)',
              }}>
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .order-steps-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 40px;
          align-items: start;
        }

        .order-step {
          text-align: center;
        }

        @media (max-width: 700px) {
          .order-steps-row {
            grid-template-columns: 1fr;
            gap: 48px;
            max-width: 360px;
            margin: 0 auto;
          }
        }
      `}</style>
    </section>
  );
}
