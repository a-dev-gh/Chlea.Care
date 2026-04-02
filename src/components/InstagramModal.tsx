import { useEffect } from 'react';

interface InstagramModalProps {
  url: string | null;
  type: 'post' | 'reel';
  onClose: () => void;
}

export function getEmbedUrl(url: string): string {
  // Convert Instagram post/reel URL to embed URL
  const cleaned = url.replace(/\?.*$/, '');
  return `${cleaned}embed/`;
}

export function InstagramModal({ url, type, onClose }: InstagramModalProps) {
  useEffect(() => {
    if (url) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [url]);

  if (!url) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(85,40,20,0.55)',
        backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="animate-scale-in"
        style={{
          background: 'var(--white)',
          borderRadius: 'var(--r-lg)',
          width: '100%',
          maxWidth: type === 'reel' ? 420 : 500,
          maxHeight: '90vh',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px',
          borderBottom: '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--hot)" strokeWidth="2">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <circle cx="12" cy="12" r="4"/>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
            </svg>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
              @chlea.carerd
            </span>
            <span style={{
              fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
              padding: '2px 8px', borderRadius: 'var(--r-pill)',
              background: 'rgba(235,25,130,0.08)', color: 'var(--hot)',
            }}>
              {type}
            </span>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            width: 32, height: 32, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-muted)', transition: 'background 0.15s',
          }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--cream)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Embed iframe */}
        <div style={{
          flex: 1,
          minHeight: type === 'reel' ? 600 : 500,
          overflow: 'hidden',
        }}>
          <iframe
            src={getEmbedUrl(url)}
            sandbox="allow-scripts allow-same-origin"
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              minHeight: type === 'reel' ? 600 : 500,
            }}
            allowFullScreen
            loading="lazy"
            title="Instagram post"
          />
        </div>

        {/* Footer — open on IG */}
        <div style={{
          padding: '12px 18px',
          borderTop: '1px solid var(--border)',
          display: 'flex', justifyContent: 'center',
        }}>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 13, fontWeight: 600, color: 'var(--hot)',
              textDecoration: 'none',
            }}
          >
            Abrir en Instagram
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
