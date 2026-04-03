import { Link } from 'react-router-dom';
import { useSiteSettings } from '../hooks/useSiteSettings';

/**
 * Parses plain text with **bold** markers and double-newline paragraph breaks.
 * Returns an array of React elements — no dangerouslySetInnerHTML.
 */
function parseFormattedText(text: string): React.ReactNode[] {
  const paragraphs = text.split(/\n\n+/);

  return paragraphs.map((para, pIdx) => {
    // Split by **bold** markers
    const parts = para.split(/(\*\*[^*]+\*\*)/g);
    const children = parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} style={{ color: 'var(--hot)', fontWeight: 600 }}>
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });

    return (
      <p
        key={pIdx}
        style={{
          fontSize: 15,
          lineHeight: 1.75,
          color: 'var(--text-soft)',
          marginBottom: 20,
        }}
      >
        {children}
      </p>
    );
  });
}

const DEFAULT_CONTENT = `**Información de Reembolsos**\nActualmente estamos preparando nuestra política de reembolsos. Por favor contáctanos vía WhatsApp para más información sobre devoluciones y reembolsos.\n\n**Contacto**\nEscríbenos al WhatsApp: +1 (809) 451-7690`;

export function PoliticasReembolsoPage() {
  const settings = useSiteSettings();
  const content = settings.politicas_reembolso || DEFAULT_CONTENT;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 20px 64px' }}>
      {/* Breadcrumb */}
      <nav style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
        <Link to="/" style={{ color: 'var(--hot)', textDecoration: 'none' }}>Inicio</Link>
        <span style={{ margin: '0 8px' }}>&gt;</span>
        <span>Políticas de Reembolso</span>
      </nav>

      {/* Title */}
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 32,
          fontWeight: 400,
          color: 'var(--hot)',
          marginBottom: 32,
        }}
      >
        Políticas de Reembolso
      </h1>

      {/* Body content */}
      <div>{parseFormattedText(content)}</div>
    </div>
  );
}
