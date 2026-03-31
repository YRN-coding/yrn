interface TokenBalanceProps {
  symbol: string;
  name: string;
  amount: string;
  usdValue: number;
  change24h: number;
  logo?: string;
}

export function TokenBalance({ symbol, name, amount, usdValue, change24h, logo }: TokenBalanceProps) {
  const isPositive = change24h >= 0;

  return (
    <div className="flex items-center justify-between py-4 hover:bg-white/2 rounded-xl px-2 transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-sm">
          {logo ?? symbol.slice(0, 2)}
        </div>
        <div>
          <p className="font-medium text-sm">{name}</p>
          <p className="text-xs text-muted">{amount} {symbol}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-medium text-sm">${usdValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        <p className={`text-xs ${isPositive ? 'text-success' : 'text-error'}`}>
          {isPositive ? '+' : ''}{change24h.toFixed(2)}%
        </p>
      </div>
    </div>
  );
}
