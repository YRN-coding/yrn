'use client';

interface PricePoint {
  time: string;
  price: number;
}

interface PriceChartProps {
  data: PricePoint[];
  positive?: boolean;
  height?: number;
}

export function PriceChart({ data, positive = true, height = 60 }: PriceChartProps) {
  if (!data.length) return <div style={{ height }} className="bg-white/5 rounded animate-pulse" />;

  const prices = data.map((d) => d.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const w = 300;
  const h = height;
  const pad = 2;

  const points = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = h - pad - ((d.price - min) / range) * (h - pad * 2);
    return `${x},${y}`;
  });

  const polyline = points.join(' ');
  const fillPath = `M${points[0]} ${points.slice(1).map((p) => `L${p}`).join(' ')} L${w - pad},${h} L${pad},${h} Z`;

  const color = positive ? '#00D4AA' : '#EF4444';
  const fillId = `grad-${positive ? 'pos' : 'neg'}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fillPath} fill={`url(#${fillId})`} />
      <polyline points={polyline} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Generates mock sparkline data for demo purposes
export function mockSparkline(basePrice: number, points = 20): PricePoint[] {
  return Array.from({ length: points }, (_, i) => ({
    time: new Date(Date.now() - (points - i) * 3600_000).toISOString(),
    price: basePrice * (1 + (Math.random() - 0.5) * 0.04),
  }));
}
