import Link from 'next/link';

const quickActions = [
  { label: 'Send', icon: '↗️', href: '/send', color: 'bg-primary/10 border-primary/20 text-primary' },
  { label: 'Receive', icon: '↙️', href: '/wallet', color: 'bg-secondary/10 border-secondary/20 text-secondary' },
  { label: 'Swap', icon: '🔄', href: '/exchange', color: 'bg-warning/10 border-warning/20 text-warning' },
  { label: 'Buy', icon: '🛒', href: '/markets', color: 'bg-success/10 border-success/20 text-success' },
];

const recentTransactions = [
  { id: '1', type: 'Received', asset: 'USDC', amount: '+250.00', usd: '+$250.00', time: '2 hours ago', status: 'confirmed' },
  { id: '2', type: 'Swapped', asset: 'ETH → USDC', amount: '0.1 ETH', usd: '-$345.00', time: '1 day ago', status: 'confirmed' },
  { id: '3', type: 'Sent', asset: 'XRP', amount: '-50.00', usd: '-$27.50', time: '2 days ago', status: 'confirmed' },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="glass rounded-2xl p-6">
        <p className="text-muted text-sm mb-1">Total Portfolio Value</p>
        <div className="flex items-end gap-3">
          <h2 className="text-4xl font-bold">$4,217.83</h2>
          <span className="text-success text-sm font-medium mb-1">+$124.50 (3.04%) today</span>
        </div>
        <div className="mt-4 h-1 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full" style={{ width: '68%' }} />
        </div>
        <div className="flex gap-6 mt-3 text-xs text-muted">
          <span><span className="w-2 h-2 rounded-full bg-primary inline-block mr-1" />Crypto 68%</span>
          <span><span className="w-2 h-2 rounded-full bg-secondary inline-block mr-1" />Stocks 22%</span>
          <span><span className="w-2 h-2 rounded-full bg-warning inline-block mr-1" />DeFi 10%</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-3">
        {quickActions.map((a) => (
          <Link
            key={a.label}
            href={a.href}
            className={`glass rounded-xl p-4 flex flex-col items-center gap-2 border hover:scale-105 transition-transform ${a.color}`}
          >
            <span className="text-2xl">{a.icon}</span>
            <span className="text-sm font-medium">{a.label}</span>
          </Link>
        ))}
      </div>

      {/* Recent Transactions */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Recent Transactions</h3>
          <Link href="/wallet" className="text-primary text-sm hover:underline">View all</Link>
        </div>
        <div className="space-y-3">
          {recentTransactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                  {tx.type === 'Received' ? '↙️' : tx.type === 'Sent' ? '↗️' : '🔄'}
                </div>
                <div>
                  <p className="text-sm font-medium">{tx.type}</p>
                  <p className="text-xs text-muted">{tx.asset} · {tx.time}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-medium ${tx.amount.startsWith('+') ? 'text-success' : 'text-white'}`}>
                  {tx.usd}
                </p>
                <span className="text-xs text-success">✓ {tx.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
