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

const DEFAULT_CONTENT = `**Información de Envíos**\nActualmente estamos preparando nuestra política de envíos. Por favor contáctanos vía WhatsApp para más información sobre tiempos y costos de entrega.\n\n**Contacto**\nEscríbenos al WhatsApp: +1 (809) 775-6773`;

export function PoliticasEnvioPage() {
  const settings = useSiteSettings();
  const content = settings.politicas_envio || DEFAULT_CONTENT;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 20px 64px' }}>
      {/* Breadcrumb */}
      <nav style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
        <Link to="/" style={{ color: 'var(--hot)', textDecoration: 'none' }}>Inicio</Link>
        <span style={{ margin: '0 8px' }}>&gt;</span>
        <span>Políticas de Envío</span>
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
        Políticas de Envío
      </h1>

      {/* Body content */}
      <div>{parseFormattedText(content)}</div>
    </div>
  );
}
