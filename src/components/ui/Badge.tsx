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
  /** Custom emoji from BadgeEntry.emoji — prepended to the label */
  emoji?: string;
  /** Custom color from BadgeEntry.color — overrides the hardcoded style map */
  badgeColor?: string;
  style?: React.CSSProperties;
}

export function Badge({ text, salePercent, emoji, badgeColor, style }: BadgeProps) {
  if (!text && !salePercent) return null;

  // When salePercent is provided, always show sale label regardless of text
  const label = salePercent ? `${salePercent}% OFF` : (text || '');
  // Prepend custom emoji when provided
  const displayLabel = emoji ? `${emoji} ${label}` : label;
  // Use sale style for sale badge; custom color when provided; otherwise look up by text
  const badgeStyle = salePercent
    ? BADGE_STYLES['Oferta']
    : badgeColor
      ? { background: `${badgeColor}18`, color: badgeColor }
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
      {displayLabel}
    </span>
  );
}
