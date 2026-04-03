import React from 'react';

const BADGE_STYLES: Record<string, React.CSSProperties> = {
  Bestseller: { background: '#552814', color: '#fefafb' },
  Nuevo:      { background: '#EB1982', color: '#fff' },
  Viral:      { background: 'linear-gradient(90deg,#EB1982,#ff6b9d)', color: '#fff' },
  'Top Rated':{ background: '#7a4a38', color: '#fefafb' },
  Limited:    { background: '#1a1a2e', color: '#ffc2d1' },
  Hot:        { background: 'linear-gradient(90deg,#EB1982,#ff8c00)', color: '#fff' },
  Oferta:     { background: 'linear-gradient(90deg,#EB1982,#ff8c00)', color: '#fff' },
  default:    { background: 'rgba(235,25,130,0.1)', color: '#EB1982' },
};

interface BadgeProps {
  text?: string;
  salePercent?: number;
  style?: React.CSSProperties;
}

export function Badge({ text, salePercent, style }: BadgeProps) {
  if (!text && !salePercent) return null;

  // When salePercent is provided, always show sale label regardless of text
  const label = salePercent ? `${salePercent}% OFF` : (text || '');
  // Use sale style for sale badge; otherwise look up by text
  const badgeStyle = salePercent
    ? BADGE_STYLES['Oferta']
    : (BADGE_STYLES[text || ''] ?? BADGE_STYLES.default);

  return (
    <span
      style={{
        display: 'inline-block',
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.5px',
        textTransform: 'uppercase',
        padding: '3px 9px',
        borderRadius: 'var(--r-pill)',
        whiteSpace: 'nowrap',
        ...badgeStyle,
        ...style,
      }}
    >
      {label}
    </span>
  );
}
