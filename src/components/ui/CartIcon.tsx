interface CartIconProps {
  size?: number;
  color?: string;
}

export function CartIcon({ size = 22, color = '#EB1982' }: CartIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Cart body */}
      <path
        d="M12 20h4l6 24h28l6-18H22"
        fill="none"
        stroke={color}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Cart basket fill */}
      <path
        d="M22 26h30l-5 14H24L22 26z"
        fill={color}
        fillOpacity="0.15"
        stroke="none"
      />
      {/* Left wheel */}
      <circle cx="26" cy="50" r="4" fill={color} />
      {/* Right wheel */}
      <circle cx="46" cy="50" r="4" fill={color} />
      {/* Heart floating above */}
      <path
        d="M32 6c-1.5-2.5-5-3.5-7-1.5s-2.5 5.5 0 8L32 18l7-5.5c2.5-2.5 2-6 0-8s-5.5-1-7 1.5z"
        fill={color}
        fillOpacity="0.9"
      />
      {/* Heart shine */}
      <ellipse cx="28" cy="8" rx="1.5" ry="1" fill="white" fillOpacity="0.5" />
    </svg>
  );
}
