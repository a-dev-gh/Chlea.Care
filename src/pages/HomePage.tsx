import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { ProductGrid } from '../components/product/ProductGrid';
import { SEED_PRODUCTS } from '../data/seedData';
import { BrandsCarousel } from '../components/BrandsCarousel';
import { InstagramModal, getEmbedUrl } from '../components/InstagramModal';

// Managed from admin — Denise can add/remove/reorder these
const INSTAGRAM_POSTS = [
  { url: 'https://www.instagram.com/p/DWEnZb4jn5w/', type: 'post' as const, placeholder: 'linear-gradient(135deg,#ffd6e7 0%,#e8b4c8 100%)' },
  { url: 'https://www.instagram.com/p/DPo41_dDkWh/', type: 'reel' as const, placeholder: 'linear-gradient(135deg,#f0d4df 0%,#d4a0b5 100%)' },
  { url: 'https://www.instagram.com/p/DGmNg0PPvCM/', type: 'post' as const, placeholder: 'linear-gradient(135deg,#fce4ef 0%,#e8c5d4 100%)' },
];

export function HomePage() {
  const settings = useSiteSettings();
  const hotProducts = SEED_PRODUCTS.filter(p => p.is_hot && p.category !== 'hombres').slice(0, 4);
  const menProducts = SEED_PRODUCTS.filter(p => p.category === 'hombres');
  const [menOpen, setMenOpen] = useState(false);
  const [igModal, setIgModal] = useState<{ url: string; type: 'post' | 'reel' } | null>(null);

  // ── Rotating Hero Slides ──
  const HERO_SLIDES = [
    {
      label: '✦ Envíos a todo el país',
      heading: 'Envíos a todo el país\nen 24 horas',
      sub: 'Tu pedido sale hoy y llega mañana. Eficiencia, responsabilidad y cuidado en cada entrega — porque tu tiempo importa tanto como tu belleza.',
      image: '/map-landing.webp',
      layout: 'image-left' as const,   // image left, text right
    },
    {
      label: '✦ Glow diferente',
      heading: 'Glow diferente,\nGlow Chlea',
      sub: settings.hero_sub,
      image: '/landing-photo.webp',
      layout: 'text-left' as const,    // text left, image right (original)
    },
    {
      label: '✦ Calidad profesional',
      heading: 'Productos profesionales\nque no te defraudarán',
      sub: 'Marcas de confianza, fórmulas que cumplen. Cada producto en nuestra tienda ha sido seleccionado por Denisee para garantizar resultados reales.',
      image: '/products-landing.webp',
      layout: 'image-left' as const,   // image left, text right
    },
  ];

  const [heroSlide, setHeroSlide] = useState(0);
  const [heroAnimating, setHeroAnimating] = useState(false);

  const goToSlide = useCallback((idx: number) => {
    setHeroAnimating(true);
    setTimeout(() => {
      setHeroSlide(idx);
      setHeroAnimating(false);
    }, 400);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      goToSlide((heroSlide + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroSlide, goToSlide, HERO_SLIDES.length]);

  const slide = HERO_SLIDES[heroSlide];
  const isImageLeft = slide.layout === 'image-left';

  return (
    <div>
      {/* ── Hero — Rotating 3-slide ── */}
      <section style={{
        background: 'linear-gradient(160deg,#fff0f5 0%,#fff5f9 50%,var(--white) 100%)',
        padding: '60px 24px 72px',
        overflow: 'hidden',
        position: 'relative',
        minHeight: 520,
      }}>
        <div style={{
          maxWidth: 1280, margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '48% 48%',
          gap: 48, alignItems: 'center',
          direction: isImageLeft ? 'rtl' : 'ltr',
        }} className="hero-grid">
          {/* Text side */}
          <div style={{
            direction: 'ltr',
            opacity: heroAnimating ? 0 : 1,
            transform: heroAnimating ? 'translateY(24px)' : 'translateY(0)',
            transition: 'opacity 0.5s ease, transform 0.5s ease',
          }}>
            <p className="section-label" style={{ marginBottom: 16 }}>{slide.label}</p>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.2rem, 5.5vw, 4rem)',
              fontWeight: 300,
              lineHeight: 1.1,
              color: 'var(--text)',
              marginBottom: 20,
              whiteSpace: 'pre-line',
            }}>
              {slide.heading.split('\n').map((line, i) => (
                <span key={i}>
                  {i === 1 ? (
                    <em style={{ background: 'linear-gradient(90deg,var(--hot),#ff6b9d)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      {line}
                    </em>
                  ) : line}
                  {i === 0 && <br />}
                </span>
              ))}
            </h1>
            <p style={{ fontSize: 16, color: 'var(--text-soft)', maxWidth: 440, lineHeight: 1.7, marginBottom: 36 }}>
              {slide.sub}
            </p>

            {/* CTA — glassmorphic with mana glow */}
            <div className="hero-cta-wrap" style={{ position: 'relative', display: 'inline-block' }}>
              <div className="cta-mana cta-mana-1" />
              <div className="cta-mana cta-mana-2" />
              <div className="cta-mana cta-mana-3" />
              <Link to="/catalogo" className="hero-cta" style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                background: 'rgba(235,25,130,0.72)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                color: '#fff',
                borderRadius: 'var(--r-pill)', padding: '16px 38px',
                fontSize: 16, fontWeight: 600, fontFamily: 'var(--font-body)',
                textDecoration: 'none',
                border: '1px solid rgba(255,255,255,0.3)',
                boxShadow: '0 0 20px rgba(235,25,130,0.4), 0 0 60px rgba(235,25,130,0.15), inset 0 1px 0 rgba(255,255,255,0.2)',
                transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                position: 'relative',
                overflow: 'hidden',
                zIndex: 1,
              }}>
                <span style={{ position: 'relative', zIndex: 1 }}>Ver catálogo</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ position: 'relative', zIndex: 1, transition: 'transform 0.3s' }}>
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
            </div>
          </div>

          {/* Image side */}
          <div style={{
            direction: 'ltr',
            aspectRatio: '4/5',
            borderRadius: 'var(--r-lg)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-md)',
            opacity: heroAnimating ? 0 : 1,
            transform: heroAnimating ? (isImageLeft ? 'translateX(-30px)' : 'translateX(30px)') : 'translateX(0)',
            transition: 'opacity 0.5s ease, transform 0.6s ease',
          }} className="hero-img">
            <img
              src={slide.image}
              alt={slide.heading}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </div>

        {/* Slide indicators */}
        <div style={{
          display: 'flex', gap: 10, justifyContent: 'center',
          marginTop: 36,
        }}>
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              style={{
                width: heroSlide === i ? 32 : 10,
                height: 10,
                borderRadius: 'var(--r-pill)',
                background: heroSlide === i ? 'var(--hot)' : 'var(--border2)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
                opacity: heroSlide === i ? 1 : 0.5,
              }}
            />
          ))}
        </div>

        <style>{`
          .hero-cta:hover {
            transform: translateY(-3px) scale(1.04);
            box-shadow: 0 0 30px rgba(235,25,130,0.55), 0 0 80px rgba(235,25,130,0.2), inset 0 1px 0 rgba(255,255,255,0.3) !important;
            background: rgba(235,25,130,0.88) !important;
          }
          .hero-cta:hover svg { transform: translateX(4px); }
          .hero-cta::after {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            transform: translateX(-100%);
            transition: transform 0.6s;
          }
          .hero-cta:hover::after { transform: translateX(100%); }

          /* Mana glow — pulsating hot pink energy rings */
          .cta-mana {
            position: absolute;
            inset: -8px;
            border-radius: var(--r-pill);
            pointer-events: none;
            z-index: 0;
          }
          .cta-mana-1 {
            background: radial-gradient(ellipse at center, rgba(235,25,130,0.25) 0%, transparent 70%);
            animation: manaGlow 3s ease-in-out infinite;
          }
          .cta-mana-2 {
            inset: -14px;
            border: 1.5px solid rgba(235,25,130,0.2);
            animation: manaRing 2.5s ease-in-out infinite;
          }
          .cta-mana-3 {
            inset: -22px;
            border: 1px solid rgba(235,25,130,0.1);
            animation: manaRing 2.5s ease-in-out infinite 1.25s;
          }

          @keyframes manaGlow {
            0%, 100% { opacity: 0.6; transform: scale(1); }
            50%      { opacity: 1;   transform: scale(1.08); }
          }
          @keyframes manaRing {
            0%   { opacity: 0.7; transform: scale(1); }
            60%  { opacity: 0;   transform: scale(1.25); }
            100% { opacity: 0;   transform: scale(1.25); }
          }

          @media (max-width: 900px) {
            .hero-grid {
              grid-template-columns: 1fr !important;
              direction: ltr !important;
            }
            .hero-img { aspect-ratio: 3/2 !important; }
          }
        `}</style>
      </section>

      {/* ── About Denisee ── */}
      <section style={{ padding: '80px 24px', background: 'var(--white)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', gap: 48, alignItems: 'center' }} className="about-grid">
          {/* Orb — extra large with photo */}
          <div style={{ flexShrink: 0 }}>
            <div style={{
              width: 360, height: 360,
              borderRadius: '50%',
              overflow: 'hidden',
              boxShadow: '0 0 0 8px var(--pink), 0 16px 60px rgba(235,25,130,0.22)',
              animation: 'pulse-ring 2.5s infinite',
            }}>
              <img
                src="/about-photo.webp"
                alt="Denisee Ventura"
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 15%' }}
              />
            </div>
          </div>
          {/* Text */}
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>
              La fundadora
            </p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 400, fontStyle: 'italic', color: 'var(--hot)', marginBottom: 14 }}>
              Denisee Ventura
            </h2>
            <p style={{ fontSize: 16, color: 'var(--text-soft)', lineHeight: 1.8 }}>
              {settings.about_text}
            </p>
          </div>
        </div>
        <style>{`@media (max-width: 768px) {
          .about-grid { flex-direction: column; text-align: center; align-items: center; }
          .about-grid > div:first-child > div { width: 280px !important; height: 280px !important; }
        }`}</style>
      </section>

      {/* ── Promo Editorial — Full-bleed hair sections ── */}
      {[
        {
          label: 'TRATAMIENTOS',
          title: 'Tu cabello,\ntu corona',
          body: 'Tratamientos profesionales que transforman, reparan y elevan tu cabello a otro nivel. Porque cada día merece ser un buen día de pelo.',
          cta: 'Explora tratamientos',
          href: '/catalogo?categoria=cabello',
          image: '/hairsection1.webp',
          align: 'left' as const,
        },
        {
          label: 'COLOR',
          title: 'Todos tus\nmatices',
          body: 'El color es la herramienta ideal para lucir tu verdadero yo. Productos que te ayudan a expresar cada matiz de tu personalidad con confianza.',
          cta: 'Explora la gama color',
          href: '/catalogo?categoria=cabello',
          image: '/hairsection2.webp',
          align: 'right' as const,
        },
      ].map((section, i) => (
        <section key={i} style={{
          position: 'relative',
          overflow: 'hidden',
          minHeight: 520,
          display: 'flex',
          alignItems: 'stretch',
        }} className={`editorial-${i}`}>
          {/* Full-bleed image background */}
          <img
            src={section.image}
            alt={section.title}
            className="editorial-bg"
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.6s ease',
            }}
          />

          {/* Content overlay — glassmorphic panel */}
          <div style={{
            position: 'relative', zIndex: 1,
            width: '100%',
            display: 'flex',
            justifyContent: section.align === 'right' ? 'flex-end' : 'flex-start',
            alignItems: 'center',
            padding: '64px 0',
          }}>
            <div style={{
              width: '48%', minWidth: 340, maxWidth: 560,
              padding: '56px 52px',
              background: 'rgba(255,255,255,0.75)',
              backdropFilter: 'blur(28px)',
              WebkitBackdropFilter: 'blur(28px)',
              borderRadius: section.align === 'left' ? '0 var(--r-lg) var(--r-lg) 0' : 'var(--r-lg) 0 0 var(--r-lg)',
              boxShadow: '0 8px 40px rgba(235,25,130,0.08)',
              border: '1px solid rgba(255,255,255,0.6)',
            }} className="editorial-panel">
              <p style={{
                fontSize: 11, fontWeight: 700, letterSpacing: 3,
                textTransform: 'uppercase', color: 'var(--hot)',
                marginBottom: 16, opacity: 0.8,
              }}>
                {section.label}
              </p>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2.2rem, 4.5vw, 3.6rem)',
                fontWeight: 300,
                lineHeight: 1.1,
                color: 'var(--text)',
                marginBottom: 20,
                whiteSpace: 'pre-line',
              }}>
                {section.title}
              </h2>
              <p style={{
                fontSize: 15, color: 'var(--text-soft)',
                lineHeight: 1.8, marginBottom: 32,
                maxWidth: 400,
              }}>
                {section.body}
              </p>
              <Link to={section.href} style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '14px 30px',
                borderRadius: 'var(--r-pill)',
                border: '1.5px solid var(--hot)',
                color: 'var(--hot)',
                fontSize: 13, fontWeight: 600,
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                textDecoration: 'none',
                transition: 'all 0.25s',
                background: 'rgba(255,255,255,0.6)',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--hot)'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.6)'; (e.currentTarget as HTMLElement).style.color = 'var(--hot)'; }}
              >
                {section.cta}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
            </div>
          </div>
        </section>
      ))}

      <style>{`
        .editorial-0:hover .editorial-bg,
        .editorial-1:hover .editorial-bg {
          transform: scale(1.06);
        }
        @media (max-width: 900px) {
          .editorial-panel {
            width: 100% !important;
            min-width: unset !important;
            border-radius: 0 !important;
            padding: 40px 24px !important;
            background: rgba(255,255,255,0.88) !important;
          }
        }
      `}</style>

      {/* ── Hot Products ── */}
      <section style={{ padding: '72px 24px', background: 'var(--white)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 36, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <p className="section-label" style={{ marginBottom: 6 }}>✦ Lo más pedido</p>
              <h2 className="section-title">Productos Hot</h2>
            </div>
            <Link to="/catalogo" style={{ fontSize: 14, color: 'var(--hot)', fontWeight: 600, textDecoration: 'none' }}>
              Ver todo →
            </Link>
          </div>
          <ProductGrid products={hotProducts} />
        </div>
      </section>

      {/* ── Brands Carousel — Alfaparf-inspired ── */}
      <BrandsCarousel />

      {/* ── Men's Section — Collapsible ── */}
      <section style={{ background: 'var(--deep)', padding: '48px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <button
            onClick={() => setMenOpen(!menOpen)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              width: '100%', background: 'none', border: 'none',
              cursor: 'pointer', padding: '8px 0',
            }}
          >
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--pink)', marginBottom: 8, textAlign: 'left' }}>
                Línea Platinum
              </p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 300, color: 'var(--cream)', textAlign: 'left' }}>
                Para ellos, también
              </h2>
            </div>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              border: '1.5px solid rgba(255,194,209,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.3s ease',
              transform: menOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              flexShrink: 0,
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--pink)" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
          </button>

          <div style={{
            overflow: 'hidden',
            maxHeight: menOpen ? 1200 : 0,
            opacity: menOpen ? 1 : 0,
            transition: 'max-height 0.5s cubic-bezier(0.4,0,0.2,1), opacity 0.4s ease',
            paddingTop: menOpen ? 32 : 0,
          }}>
            <ProductGrid products={menProducts} isMen />
            <div style={{ textAlign: 'center', marginTop: 28 }}>
              <Link to="/hombres" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                color: 'var(--pink)', fontSize: 14, fontWeight: 600,
                textDecoration: 'none', borderBottom: '1px solid rgba(255,194,209,0.3)', paddingBottom: 3,
              }}>
                Ver colección completa →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Instagram — Dosmiltres-style full-width grid ── */}
      <section style={{ background: 'var(--white)', paddingTop: 72 }}>
        <div style={{ textAlign: 'center', marginBottom: 36, padding: '0 24px' }}>
          <p className="section-label" style={{ marginBottom: 8 }}>Síguenos en Instagram</p>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
            fontWeight: 600, fontStyle: 'italic',
            color: 'var(--text)',
          }}>
            @chlea.carerd
          </h2>
        </div>

        {/* Full-width grid — edge to edge, equal height, only posts with URLs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${INSTAGRAM_POSTS.filter(p => p.url).length}, 1fr)`,
          gap: 3,
        }} className="ig-full-grid">
          {INSTAGRAM_POSTS.filter(p => p.url).map((post, i) => (
            <button
              key={i}
              onClick={() => setIgModal({ url: post.url, type: post.type })}
              style={{
                display: 'block',
                aspectRatio: '4/5',
                overflow: 'hidden',
                position: 'relative',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                background: post.placeholder,
              }}
            >
              {/* Instagram embed iframe — offset to hide IG chrome, show content */}
              <iframe
                src={getEmbedUrl(post.url)}
                scrolling="no"
                style={{
                  position: 'absolute',
                  top: '-54px',
                  left: 0,
                  width: '100%',
                  height: 'calc(100% + 140px)',
                  border: 'none',
                  pointerEvents: 'none',
                  overflow: 'hidden',
                }}
                loading="lazy"
                title={`Instagram ${post.type}`}
              />
              {/* Hover overlay */}
              <div style={{
                position: 'absolute', inset: 0, zIndex: 2,
                background: 'rgba(85,40,20,0.5)',
                opacity: 0,
                transition: 'opacity 0.3s',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column', gap: 8,
              }} className="ig-overlay">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
                <span style={{ color: '#fff', fontSize: 12, fontWeight: 600, letterSpacing: 1 }}>
                  {post.type === 'reel' ? 'VER REEL' : 'VER POST'}
                </span>
              </div>
            </button>
          ))}
        </div>

        <style>{`
          .ig-full-grid button:hover .ig-overlay { opacity: 1 !important; }
          @media (max-width: 600px) {
            .ig-full-grid { grid-template-columns: repeat(2, 1fr) !important; }
          }
        `}</style>
      </section>

      {/* Instagram Modal */}
      <InstagramModal
        url={igModal?.url ?? null}
        type={igModal?.type ?? 'post'}
        onClose={() => setIgModal(null)}
      />
    </div>
  );
}
