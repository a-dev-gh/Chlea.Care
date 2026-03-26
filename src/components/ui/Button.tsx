import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'whatsapp' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  style,
  ...props
}: ButtonProps) {
  const base: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 'var(--r-pill)',
    fontFamily: 'var(--font-body)',
    fontWeight: 600,
    letterSpacing: '0.3px',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    border: 'none',
    width: fullWidth ? '100%' : undefined,
  };

  const sizes: Record<string, React.CSSProperties> = {
    sm: { fontSize: 13, padding: '8px 18px' },
    md: { fontSize: 14, padding: '12px 26px' },
    lg: { fontSize: 16, padding: '15px 34px' },
  };

  const variants: Record<string, React.CSSProperties> = {
    primary: {
      background: 'var(--hot)',
      color: '#fff',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--hot)',
      border: '1.5px solid var(--hot)',
    },
    whatsapp: {
      background: '#25D366',
      color: '#fff',
    },
    outline: {
      background: 'transparent',
      color: 'var(--text)',
      border: '1.5px solid var(--border2)',
    },
  };

  return (
    <button
      style={{ ...base, ...sizes[size], ...variants[variant], ...style }}
      {...props}
    >
      {children}
    </button>
  );
}
