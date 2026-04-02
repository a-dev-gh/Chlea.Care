import { useState, useEffect } from 'react';
import { openWhatsApp } from '../utils/whatsapp';

// Rotating speech bubble messages
const MESSAGES = [
  '¿Tienes dudas? ¡Escríbeme!',
  'Si tienes dudas antes de ordenar puedes enviarme un mensaje',
  '¡Hola! ¿En qué puedo ayudarte?',
];

export function WhatsAppFloat() {
  const [msgIndex, setMsgIndex] = useState(0);
  const [visible, setVisible] = useState(true); // bubble visibility
  const [fading, setFading] = useState(false);

  // Rotate messages every 5 seconds with a fade transition
  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setMsgIndex(prev => (prev + 1) % MESSAGES.length);
        setFading(false);
      }, 300);
    }, 5000);
    return () => clearInterval(interval);
  }, [visible]);

  function handleClick() {
    openWhatsApp('¡Hola! Me gustaría hacer una consulta.');
  }

  return (
    <>
      <div className="wa-float">
        {/* Speech bubble */}
        {visible && (
          <div className="wa-float__bubble" style={{ opacity: fading ? 0 : 1 }}>
            <span>{MESSAGES[msgIndex]}</span>
            <button
              className="wa-float__dismiss"
              onClick={(e) => { e.stopPropagation(); setVisible(false); }}
              aria-label="Cerrar burbuja"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            {/* Arrow pointing down to the button */}
            <div className="wa-float__arrow" />
          </div>
        )}

        {/* Green circle button */}
        <button
          className="wa-float__btn"
          onClick={handleClick}
          aria-label="Enviar mensaje por WhatsApp"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
          </svg>
        </button>
      </div>

      <style>{`
        .wa-float {
          position: fixed;
          right: 20px;
          bottom: 80px;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 10px;
        }

        @media (min-width: 769px) {
          .wa-float {
            bottom: 24px;
          }
        }

        .wa-float__bubble {
          position: relative;
          background: var(--white);
          border: 1.5px solid var(--pink);
          border-radius: var(--r-sm);
          padding: 10px 30px 10px 14px;
          max-width: 220px;
          font-size: 13px;
          line-height: 1.45;
          color: var(--text);
          font-family: var(--font-body);
          box-shadow: var(--shadow-sm);
          transition: opacity 0.3s ease;
        }

        .wa-float__dismiss {
          position: absolute;
          top: 6px;
          right: 6px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .wa-float__arrow {
          position: absolute;
          bottom: -7px;
          right: 18px;
          width: 12px;
          height: 12px;
          background: var(--white);
          border-right: 1.5px solid var(--pink);
          border-bottom: 1.5px solid var(--pink);
          transform: rotate(45deg);
        }

        .wa-float__btn {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #25D366;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 16px rgba(37, 211, 102, 0.35);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .wa-float__btn:hover {
          transform: scale(1.08);
          box-shadow: 0 6px 22px rgba(37, 211, 102, 0.45);
        }
      `}</style>
    </>
  );
}
