import { clsx } from 'clsx';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  lines?: number;
}

export function Skeleton({ className, width, height, rounded = 'md', lines = 1 }: SkeletonProps) {
  if (lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={clsx('animate-pulse bg-white/10', `rounded-${rounded}`, className)}
            style={{
              width: i === lines - 1 ? '75%' : (width ?? '100%'),
              height: height ?? '1rem',
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={clsx('animate-pulse bg-white/10', `rounded-${rounded}`, className)}
      style={{ width: width ?? '100%', height: height ?? '1rem' }}
    />
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={clsx('glass rounded-2xl p-6 space-y-4', className)}>
      <div className="flex items-center gap-3">
        <Skeleton width={40} height={40} rounded="xl" />
        <div className="flex-1 space-y-2">
          <Skeleton width="60%" height="0.875rem" />
          <Skeleton width="40%" height="0.75rem" />
        </div>
        <Skeleton width={80} height="1.25rem" />
      </div>
      <Skeleton height="0.75rem" lines={3} />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-3 border-b border-white/5">
          <Skeleton width={40} height={40} rounded="xl" />
          <div className="flex-1 space-y-1.5">
            <Skeleton width="50%" height="0.875rem" />
            <Skeleton width="35%" height="0.75rem" />
          </div>
          <div className="text-right space-y-1.5">
            <Skeleton width={80} height="0.875rem" />
            <Skeleton width={60} height="0.75rem" />
          </div>
        </div>
      ))}
    </div>
  );
}
