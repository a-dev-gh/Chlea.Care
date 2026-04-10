import { useSiteSettings } from '../hooks/useSiteSettings';

export function SobreNosotrasPage() {
  const settings = useSiteSettings();

  const aboutTitle = settings.about_title || 'Madre e hija, unidas por la belleza';
  const aboutSubtitle = settings.about_subtitle || 'Nuestra Historia';
  const aboutText = settings.about_text || '';
  const aboutExtra = settings.about_extra || '';

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px 80px' }}>
      {/* Header */}
      <p style={{
        fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase',
        color: 'var(--text-muted)', marginBottom: 8, textAlign: 'center',
      }}>
        {aboutSubtitle}
      </p>
      <h1 style={{
        fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3rem)',
        fontWeight: 400, fontStyle: 'italic', color: 'var(--hot)',
        textAlign: 'center', marginBottom: 40,
      }}>
        {aboutTitle}
      </h1>

      {/* Founder photos */}
      <div style={{
        display: 'flex', gap: 40, justifyContent: 'center', alignItems: 'center',
        flexWrap: 'wrap', marginBottom: 48,
      }}>
        {/* Cleo */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 220, height: 220, borderRadius: '50%', overflow: 'hidden',
            boxShadow: '0 0 0 5px var(--pink), 0 12px 40px rgba(235,25,130,0.18)',
            margin: '0 auto 14px',
          }}>
            <img
              src="/cleo-photo.webp" alt="Cleo Garcia"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 15%' }}
            />
          </div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 400, fontStyle: 'italic', color: 'var(--text)' }}>
            Cleo Garcia
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>
            Co-fundadora
          </p>
        </div>

        {/* Denisee */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 220, height: 220, borderRadius: '50%', overflow: 'hidden',
            boxShadow: '0 0 0 5px var(--pink), 0 12px 40px rgba(235,25,130,0.18)',
            margin: '0 auto 14px',
          }}>
            <img
              src="/denise-photo.webp" alt="Denisee Ventura"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 15%' }}
            />
          </div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 400, fontStyle: 'italic', color: 'var(--text)' }}>
            Denisee Ventura
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>
            Co-fundadora
          </p>
        </div>
      </div>

      {/* About text from CMS */}
      <div style={{
        fontSize: 16, color: 'var(--text-soft)', lineHeight: 1.9,
        textAlign: 'center', maxWidth: 640, margin: '0 auto',
      }}>
        {aboutText.split('\n\n').map((paragraph, i) => (
          <p key={i} style={{ marginBottom: 20 }}>
            {paragraph.split('**').map((segment, j) =>
              j % 2 === 1
                ? <strong key={j} style={{ color: 'var(--text)', fontWeight: 600 }}>{segment}</strong>
                : <span key={j}>{segment}</span>
            )}
          </p>
        ))}
      </div>

      {/* Extra text section from CMS */}
      {aboutExtra && (
        <div style={{
          marginTop: 48, padding: '32px', borderRadius: 'var(--r-md)',
          background: 'var(--cream)', border: '1px solid var(--border)',
        }}>
          <div style={{ fontSize: 15, color: 'var(--text-soft)', lineHeight: 1.8, textAlign: 'center' }}>
            {aboutExtra.split('\n\n').map((paragraph, i) => (
              <p key={i} style={{ marginBottom: 16 }}>
                {paragraph.split('**').map((segment, j) =>
                  j % 2 === 1
                    ? <strong key={j} style={{ color: 'var(--text)', fontWeight: 600 }}>{segment}</strong>
                    : <span key={j}>{segment}</span>
                )}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* WhatsApp CTA */}
      <div style={{ textAlign: 'center', marginTop: 48 }}>
        <a
          href="https://wa.me/18094517690"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '14px 32px', borderRadius: 'var(--r-pill)',
            background: 'var(--hot)', color: '#fff',
            fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 15,
            textDecoration: 'none',
          }}
        >
          Contáctanos
        </a>
      </div>

      <style>{`@media (max-width: 768px) {
        .sobre-orb { width: 170px !important; height: 170px !important; }
      }`}</style>
    </div>
  );
}
