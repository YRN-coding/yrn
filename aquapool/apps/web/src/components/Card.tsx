import { HTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  active?: boolean;
}

export function Card({ hover, active, className, children, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        'glass rounded-2xl border border-white/5',
        hover && 'hover:border-white/10 hover:scale-[1.01] transition-all cursor-pointer',
        active && 'border-primary/40 ring-1 ring-primary/20',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx('px-6 py-4 border-b border-white/5', className)} {...props}>
      {children}
    </div>
  );
}

export function CardBody({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx('p-6', className)} {...props}>
      {children}
    </div>
  );
}
