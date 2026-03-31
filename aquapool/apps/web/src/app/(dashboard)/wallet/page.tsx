'use client';

import { useState } from 'react';

const mockWallets = [
  { id: '1', network: 'ETHEREUM', address: '0x1234...5678', isDefault: true },
  { id: '2', network: 'SOLANA', address: 'Ax3k...9mNp', isDefault: false },
];

const mockBalances = [
  { symbol: 'ETH', name: 'Ethereum', amount: '1.245', usdValue: 4301.45, change24h: 2.3, logo: '⬡' },
  { symbol: 'USDC', name: 'USD Coin', amount: '850.00', usdValue: 850.00, change24h: 0.01, logo: '💵' },
  { symbol: 'SOL', name: 'Solana', amount: '12.5', usdValue: 1787.50, change24h: -1.2, logo: '◎' },
  { symbol: 'XRP', name: 'XRP', amount: '500', usdValue: 275.00, change24h: 0.8, logo: 'Ӿ' },
];

export default function WalletPage() {
  const [activeWallet, setActiveWallet] = useState(mockWallets[0]);

  return (
    <div className="space-y-6">
      {/* Wallet selector */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {mockWallets.map((w) => (
          <button
            key={w.id}
            onClick={() => setActiveWallet(w)}
            className={`flex-shrink-0 glass rounded-xl px-5 py-3 border transition-colors text-sm ${
              activeWallet?.id === w.id ? 'border-primary/50 text-primary' : 'border-white/10 text-muted hover:border-white/20'
            }`}
          >
            <p className="font-medium">{w.network}</p>
            <p className="text-xs font-mono mt-0.5">{w.address}</p>
          </button>
        ))}
        <button className="flex-shrink-0 glass rounded-xl px-5 py-3 border border-dashed border-white/20 text-muted hover:border-primary/30 hover:text-primary transition-colors text-sm">
          + Add Wallet
        </button>
      </div>

      {/* Balances */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Token Balances</h3>
          <span className="text-muted text-sm">Network: {activeWallet?.network}</span>
        </div>
        <div className="space-y-1">
          {mockBalances.map((token) => (
            <div key={token.symbol} className="flex items-center justify-between py-4 border-b border-white/5 last:border-0 hover:bg-white/2 rounded-xl px-2 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold">
                  {token.logo}
                </div>
                <div>
                  <p className="font-medium">{token.name}</p>
                  <p className="text-sm text-muted">{token.amount} {token.symbol}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">${token.usdValue.toLocaleString()}</p>
                <p className={`text-sm ${token.change24h >= 0 ? 'text-success' : 'text-error'}`}>
                  {token.change24h >= 0 ? '+' : ''}{token.change24h}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
