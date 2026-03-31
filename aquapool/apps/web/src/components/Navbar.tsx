'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useMarketData } from '@/lib/useMarketData';

/* ── Static fallbacks (stocks + crypto loading state) ────── */
const STATIC_TICKERS = [
  { symbol: 'BTC',  price: null as number | null, change:  2.1 },
  { symbol: 'ETH',  price: null as number | null, change:  3.4 },
  { symbol: 'SOL',  price: null as number | null, change: -1.2 },
  { symbol: 'BNB',  price: null as number | null, change: -0.8 },
  { symbol: 'AAPL', price: null as number | null, change:  0.9 },
  { symbol: 'TSLA', price: null as number | null, change:  1.5 },
  { symbol: 'NVDA', price: null as number | null, change:  4.2 },
];

const CRYPTO_SYMBOLS = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP'];

function formatPrice(price: number): string {
  if (price >= 1000)
    return '$' + price.toLocaleString('en-US', { maximumFractionDigits: 0 });
  if (price >= 1)
    return '$' + price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return '$' + price.toFixed(4);
}

/* ── Nav links ───────────────────────────────────────────── */
const NAV_LINKS = [
  { label: 'Markets',       href: '/markets' },
  { label: 'Crypto',        href: '/crypto' },
  { label: 'Stocks',        href: '/stocks' },
  { label: 'DeFi',          href: '/defi' },
  { label: 'Earn',          href: '/earn' },
  { label: 'Send & Receive', href: '/send' },
];

/* ── TickerBar ───────────────────────────────────────────── */
function TickerBar() {
  const { assets } = useMarketData(CRYPTO_SYMBOLS);

  // Build ticker: live crypto prices merged with static stock fallbacks
  const liveCrypto = (assets ?? [])
    .filter((a) => CRYPTO_SYMBOLS.includes(a.symbol))
    .map((a) => ({ symbol: a.symbol, price: a.price, change: a.change24h }));

  const stockTickers = STATIC_TICKERS.filter((t) =>
    ['AAPL', 'TSLA', 'NVDA'].includes(t.symbol)
  );

  const tickers =
    liveCrypto.length > 0
      ? [...liveCrypto, ...stockTickers]
      : STATIC_TICKERS;

  // Duplicate for seamless loop — CSS animates the inner track
  const items = [...tickers, ...tickers];

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[51] h-8 overflow-hidden flex items-center"
      style={{ backgroundColor: '#060B14', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="flex items-center animate-ticker whitespace-nowrap gap-0">
        {items.map(({ symbol, price, change }, i) => {
          const isPositive = change >= 0;
          return (
            <span key={i} className="inline-flex items-center gap-1.5 px-4 text-xs">
              <span className="font-semibold text-[#F0F4FF]/70">{symbol}</span>
              {price != null && (
                <span className="text-[#F0F4FF]/50">{formatPrice(price)}</span>
              )}
              <span
                className="font-medium"
                style={{
                  color: isPositive ? '#BAFF39' : '#EF4444',
                  filter: isPositive ? 'drop-shadow(0 0 4px rgba(186,255,57,0.5))' : undefined,
                }}
              >
                {isPositive ? '+' : ''}{change.toFixed(2)}%
              </span>
              <span className="text-[#4B5563] mx-1">·</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

/* ── Navbar ──────────────────────────────────────────────── */
export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const { scrollY } = useScroll();
  const navBg     = useTransform(scrollY, [0, 60], ['rgba(6,11,20,0)',    'rgba(6,11,20,0.92)']);
  const navBlur   = useTransform(scrollY, [0, 60], ['blur(0px)',          'blur(20px)']);
  const navBorder = useTransform(scrollY, [0, 60], ['rgba(255,255,255,0)', 'rgba(255,255,255,0.06)']);

  return (
    <>
      <TickerBar />

      {/* Main nav — sits 32px below ticker */}
      <motion.header
        style={{ backgroundColor: navBg, backdropFilter: navBlur, borderBottomColor: navBorder }}
        className="fixed top-8 left-0 right-0 z-50 h-16 border-b"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">

          {/* LEFT — logo + beta badge */}
          <Link href="/" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
            <span className="w-8 h-8 rounded-lg bg-[#C8FF00] flex items-center justify-center text-[#050D1A] text-sm font-black">
              A
            </span>
            <span className="font-bold text-xl text-[#F0F4FF]">
              Aqua<span className="text-[#C8FF00]">pool</span>
            </span>
            <span className="ml-1 px-2 py-0.5 rounded-full border border-white/15 text-[10px] font-medium text-[#6B7280]">
              Beta
            </span>
          </Link>

          {/* CENTER — desktop nav */}
          <nav className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map(({ label, href }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`text-sm font-medium transition-colors pb-0.5 ${
                    active
                      ? 'text-[#F0F4FF] border-b-2 border-[#C8FF00]'
                      : 'text-[#6B7280] hover:text-[#F0F4FF] border-b-2 border-transparent'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* RIGHT — auth CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/signin"
              className="text-sm font-medium text-[#F0F4FF]/80 hover:text-[#F0F4FF] transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="px-5 py-2 rounded-full bg-[#C8FF00] text-[#050D1A] text-sm font-semibold hover:bg-[#d4ff33] transition-colors"
            >
              Open account
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-[#6B7280] hover:text-[#F0F4FF] transition-colors"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </motion.header>

      {/* Mobile full-height drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[99]"
              style={{ backgroundColor: 'rgba(6,11,20,0.6)', backdropFilter: 'blur(4px)' }}
              onClick={() => setMenuOpen(false)}
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed top-0 right-0 bottom-0 w-72 z-[100] flex flex-col"
              style={{ backgroundColor: 'rgba(6,11,20,0.98)', backdropFilter: 'blur(20px)', borderLeft: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex items-center justify-between px-6 pt-8 pb-6">
                <span className="font-bold text-lg text-[#F0F4FF]">
                  Aqua<span className="text-[#C8FF00]">pool</span>
                </span>
                <button onClick={() => setMenuOpen(false)} className="p-1 text-[#6B7280] hover:text-[#F0F4FF]">
                  <X size={20} />
                </button>
              </div>

              <nav className="flex-1 px-6 space-y-1">
                {NAV_LINKS.map(({ label, href }) => {
                  const active = pathname === href;
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
                        active
                          ? 'bg-[rgba(200,255,0,0.08)] text-[#C8FF00]'
                          : 'text-[#6B7280] hover:text-[#F0F4FF] hover:bg-white/5'
                      }`}
                    >
                      {label}
                    </Link>
                  );
                })}
              </nav>

              <div className="px-6 pb-10 space-y-3">
                <Link
                  href="/signin"
                  onClick={() => setMenuOpen(false)}
                  className="block w-full text-center py-3 rounded-xl border border-white/10 text-sm font-medium text-[#F0F4FF] hover:bg-white/5 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMenuOpen(false)}
                  className="block w-full text-center py-3 rounded-full bg-[#C8FF00] text-[#050D1A] text-sm font-semibold hover:bg-[#d4ff33] transition-colors"
                >
                  Open account
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
