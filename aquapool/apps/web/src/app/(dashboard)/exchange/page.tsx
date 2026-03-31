'use client';

import { useState } from 'react';

const tokens = ['ETH', 'BTC', 'SOL', 'USDC', 'USDT', 'XRP', 'BNB', 'MATIC'];

const mockPrices: Record<string, number> = {
  ETH: 3456, BTC: 95420, SOL: 143, USDC: 1, USDT: 1, XRP: 0.55, BNB: 720, MATIC: 0.85,
};

export default function ExchangePage() {
  const [fromToken, setFromToken] = useState('ETH');
  const [toToken, setToToken] = useState('USDC');
  const [fromAmount, setFromAmount] = useState('');
  const [slippage, setSlippage] = useState('0.5');

  const fromPrice = mockPrices[fromToken] ?? 1;
  const toPrice = mockPrices[toToken] ?? 1;
  const toAmount = fromAmount ? ((parseFloat(fromAmount) * fromPrice) / toPrice).toFixed(6) : '';
  const priceImpact = 0.12;
  const fee = fromAmount ? (parseFloat(fromAmount) * fromPrice * 0.003).toFixed(2) : '0.00';

  function swap() {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Swap</h1>
      <p className="text-muted text-sm">Best rates aggregated from 1inch, Jupiter, and more.</p>

      <div className="glass rounded-2xl p-6 space-y-3">
        {/* From */}
        <div className="bg-white/5 rounded-xl p-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted">From</span>
            <span className="text-xs text-muted">Balance: 1.245 {fromToken}</span>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={fromToken}
              onChange={(e) => setFromToken(e.target.value)}
              className="bg-white/10 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none border border-white/10 focus:border-primary/50"
            >
              {tokens.filter((t) => t !== toToken).map((t) => (
                <option key={t} value={t} className="bg-surface">{t}</option>
              ))}
            </select>
            <input
              type="number"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              placeholder="0.00"
              className="flex-1 bg-transparent text-2xl font-semibold text-right focus:outline-none placeholder:text-white/20"
            />
          </div>
          {fromAmount && (
            <p className="text-xs text-muted text-right">
              ≈ ${(parseFloat(fromAmount) * fromPrice).toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
          )}
        </div>

        {/* Swap button */}
        <div className="flex justify-center">
          <button
            onClick={swap}
            className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"
          >
            ⇅
          </button>
        </div>

        {/* To */}
        <div className="bg-white/5 rounded-xl p-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted">To</span>
            <span className="text-xs text-muted">Balance: 850.00 {toToken}</span>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={toToken}
              onChange={(e) => setToToken(e.target.value)}
              className="bg-white/10 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none border border-white/10 focus:border-primary/50"
            >
              {tokens.filter((t) => t !== fromToken).map((t) => (
                <option key={t} value={t} className="bg-surface">{t}</option>
              ))}
            </select>
            <span className="flex-1 text-2xl font-semibold text-right text-secondary">
              {toAmount || '0.00'}
            </span>
          </div>
          {toAmount && (
            <p className="text-xs text-muted text-right">
              ≈ ${(parseFloat(toAmount) * toPrice).toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
          )}
        </div>

        {/* Slippage */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Slippage tolerance</span>
          <div className="flex gap-1">
            {['0.1', '0.5', '1.0'].map((s) => (
              <button
                key={s}
                onClick={() => setSlippage(s)}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  slippage === s ? 'bg-primary text-white' : 'bg-white/5 text-muted hover:text-white'
                }`}
              >
                {s}%
              </button>
            ))}
          </div>
        </div>

        {/* Details */}
        {fromAmount && toAmount && (
          <div className="bg-white/3 rounded-xl p-3 space-y-2 text-xs text-muted">
            <div className="flex justify-between">
              <span>Rate</span>
              <span>1 {fromToken} = {(fromPrice / toPrice).toFixed(4)} {toToken}</span>
            </div>
            <div className="flex justify-between">
              <span>Price impact</span>
              <span className="text-success">{priceImpact}%</span>
            </div>
            <div className="flex justify-between">
              <span>Protocol fee (0.3%)</span>
              <span>${fee}</span>
            </div>
            <div className="flex justify-between">
              <span>Min received</span>
              <span>{(parseFloat(toAmount) * (1 - parseFloat(slippage) / 100)).toFixed(6)} {toToken}</span>
            </div>
          </div>
        )}

        <button
          disabled={!fromAmount || parseFloat(fromAmount) <= 0}
          className="w-full py-4 rounded-xl font-semibold text-sm transition-all bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {fromAmount ? `Swap ${fromToken} → ${toToken}` : 'Enter amount'}
        </button>
      </div>
    </div>
  );
}
