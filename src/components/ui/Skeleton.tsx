// Reusable skeleton loading component with pink pulse animation

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  style?: React.CSSProperties;
}

export function Skeleton({ width = '100%', height = 16, borderRadius = 'var(--r-sm)', style }: SkeletonProps) {
  return (
    <>
      <div className="skeleton-pulse" style={{
        width, height, borderRadius,
        background: 'linear-gradient(90deg, var(--cream) 25%, #fff0f5 50%, var(--cream) 75%)',
        backgroundSize: '200% 100%',
        ...style,
      }} />
      <style>{`
        .skeleton-pulse {
          animation: skeletonPulse 1.5s ease-in-out infinite;
        }
        @keyframes skeletonPulse {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </>
  );
}

export function ProductCardSkeleton() {
  return (
    <div style={{
      background: 'var(--white)',
      borderRadius: 'var(--r-lg)',
      overflow: 'hidden',
      border: '1px solid var(--border)',
    }}>
      <Skeleton height={240} borderRadius={0} />
      <div style={{ padding: '16px 14px' }}>
        <Skeleton width="60%" height={12} style={{ marginBottom: 8 }} />
        <Skeleton width="85%" height={14} style={{ marginBottom: 12 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Skeleton width={80} height={18} />
          <Skeleton width={70} height={32} borderRadius="var(--r-pill)" />
        </div>
      </div>
    </div>
  );
}
