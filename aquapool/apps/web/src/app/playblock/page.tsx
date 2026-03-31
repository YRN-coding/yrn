'use client';

import { useState, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import {
  Shield, Zap, Copy, ExternalLink, CheckCircle,
  Code, Cpu, Clock, Layers, Database, Key, ArrowRight,
  ChevronRight, Lock, Repeat,
} from 'lucide-react';

/* ─── Chain constants ─────────────────────────────────── */
const CHAIN = {
  id: '1829',
  hex: '0x725',
  name: 'Playnance',
  rpc: 'https://playnance.drpc.org',
  symbol: 'PBG',
  explorer: 'https://explorer.playblock.io',
};

const GCOIN = {
  address: '0xC3B539972C522d883aaA904aAAdcfE69A2d9F26B',
  symbol: 'GCOIN',
  maxSupply: '77,000,000,000',
  circulating: '~24.37B',
  exchange: 'MEXC (GCOIN/USDT)',
};

const ADDRESSES = [
  { label: 'GCOIN Token', address: '0xC3B539972C522d883aaA904aAAdcfE69A2d9F26B', chain: 'PlayBlock' },
  { label: 'RollupProxy', address: '0x04ea347cC6A258A7F65D67aFb60B1d487062A1d0', chain: 'Arbitrum Nova' },
  { label: 'Bridge (Escrow)', address: '0xD4FE46D2533E7d03382ac6cACF0547F336e59DC0', chain: 'Arbitrum Nova' },
  { label: 'SequencerInbox', address: '0xe347C1223381b9Dcd6c0F61cf81c90175A7Bae77', chain: 'Arbitrum Nova' },
];

/* ─── Animation variants ──────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const } },
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

/* ─── Copy button ─────────────────────────────────────── */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const onCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }, [text]);
  return (
    <button
      onClick={onCopy}
      className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-muted hover:text-lime"
      title="Copy"
    >
      {copied ? <CheckCircle size={14} className="text-lime" /> : <Copy size={14} />}
    </button>
  );
}

/* ─── Address row ─────────────────────────────────────── */
function AddressRow({ label, address, chain }: { label: string; address: string; chain: string }) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-white/5 last:border-0">
      <div>
        <p className="text-sm font-semibold text-offwhite">{label}</p>
        <p className="text-[10px] text-muted mt-0.5">{chain}</p>
      </div>
      <div className="flex items-center gap-1">
        <span className="font-mono text-xs text-muted hidden sm:block">
          {address.slice(0, 8)}…{address.slice(-6)}
        </span>
        <CopyButton text={address} />
        <a
          href={`${CHAIN.explorer}/address/${address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-muted hover:text-cyan"
        >
          <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════ */
export default function PlayBlockPage() {
  const shouldReduce = useReducedMotion();

  return (
    <div className="min-h-screen bg-navy text-offwhite overflow-x-hidden">

      {/* ── MINI NAVBAR ──────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5" style={{ backgroundColor: 'rgba(5,13,26,0.92)', backdropFilter: 'blur(16px)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm text-muted hover:text-offwhite transition-colors">
              ← Aquapool
            </Link>
            <span className="text-white/20">/</span>
            <span className="text-sm font-semibold text-violet">PlayBlock</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={CHAIN.explorer}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-xs text-muted hover:text-offwhite transition-colors"
            >
              Explorer <ExternalLink size={11} />
            </a>
            <a
              href="https://docs.playnance.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg border border-violet/30 text-violet text-xs font-medium hover:bg-violet/10 transition-colors"
            >
              Docs
            </a>
          </div>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 animate-mesh opacity-60" />
        <div className="absolute inset-0 animated-grid" />
        <div className="absolute top-20 left-1/4 w-72 h-72 rounded-full opacity-15 blur-3xl bg-violet animate-float-1 pointer-events-none" />
        <div className="absolute top-32 right-1/4 w-64 h-64 rounded-full opacity-10 blur-3xl bg-cyan animate-float-2 pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            variants={shouldReduce ? {} : stagger}
            initial="hidden"
            animate="visible"
          >
            {/* Chain ID badge */}
            <motion.div variants={shouldReduce ? {} : fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet/25 bg-violet/8 text-violet text-xs font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-violet animate-pulse" />
              Chain ID 1829 · Layer 3 on Arbitrum Nova
              <ChevronRight size={12} />
            </motion.div>

            <motion.h1
              variants={shouldReduce ? {} : fadeUp}
              className="font-serif italic text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-tight text-offwhite"
            >
              The Gasless<br />
              <span className="text-lime">Gaming Chain</span>
            </motion.h1>

            <motion.p
              variants={shouldReduce ? {} : fadeUp}
              className="mt-6 text-lg text-muted max-w-2xl mx-auto leading-relaxed"
            >
              PlayBlock is an Arbitrum Orbit L3 chain with 250ms block times, zero gas fees for users,
              and native ERC-4337 account abstraction — purpose-built for gaming at scale.
            </motion.p>

            <motion.div variants={shouldReduce ? {} : stagger} className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.div variants={shouldReduce ? {} : fadeUp}>
                <a
                  href="#setup"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-lime text-navy font-bold text-sm hover:bg-lime-bright transition-colors"
                >
                  Add to Wallet <ArrowRight size={16} />
                </a>
              </motion.div>
              <motion.div variants={shouldReduce ? {} : fadeUp}>
                <a
                  href={CHAIN.explorer}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-white/10 text-offwhite text-sm font-medium hover:border-cyan/30 hover:text-cyan transition-colors"
                >
                  Block Explorer <ExternalLink size={14} />
                </a>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── CHAIN STATS ──────────────────────────────────── */}
      <section className="border-y border-white/5" style={{ backgroundColor: 'rgba(10,22,40,0.9)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-3 md:grid-cols-6 divide-x divide-white/5">
            {[
              { label: 'Block Time', value: '250ms', color: 'text-lime' },
              { label: 'Max TPS', value: '~40K', color: 'text-cyan' },
              { label: 'Chain ID', value: '1829', color: 'text-violet' },
              { label: 'Gas Fees', value: 'Zero', color: 'text-lime' },
              { label: 'DA Layer', value: 'AnyTrust', color: 'text-cyan' },
              { label: 'Ethereum Layer', value: 'L3', color: 'text-violet' },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center px-4 py-5">
                <p className={`text-lg md:text-xl font-bold ${color}`}>{value}</p>
                <p className="text-[10px] text-muted uppercase tracking-widest mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GCOIN TOKEN ──────────────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={shouldReduce ? {} : stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start"
          >
            {/* Token info */}
            <div className="space-y-6">
              <motion.div variants={shouldReduce ? {} : fadeUp}>
                <p className="text-violet text-xs font-bold uppercase tracking-widest mb-2">Ecosystem Token</p>
                <h2 className="font-serif text-4xl md:text-5xl font-black text-offwhite">
                  G Coin <span className="text-muted font-normal text-2xl">GCOIN</span>
                </h2>
              </motion.div>
              <motion.p variants={shouldReduce ? {} : fadeUp} className="text-muted leading-relaxed">
                GCOIN is the ERC-20 utility token of the PlayBlock ecosystem — used for gameplay rewards,
                staking, and settlement. Separate from <span className="text-offwhite font-medium">PBG</span>,
                the native gas token that powers chain transactions.
              </motion.p>

              {/* Contract address */}
              <motion.div variants={shouldReduce ? {} : fadeUp} className="glass-card rounded-xl p-4">
                <p className="text-[10px] text-muted uppercase tracking-widest mb-2">Contract Address</p>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-offwhite/80 break-all">{GCOIN.address}</span>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <CopyButton text={GCOIN.address} />
                    <a
                      href={`${CHAIN.explorer}/token/${GCOIN.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg hover:bg-white/5 text-muted hover:text-cyan transition-colors"
                    >
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              </motion.div>

              {/* Token stats */}
              <motion.div variants={shouldReduce ? {} : stagger} className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Max Supply', value: '77B GCOIN' },
                  { label: 'Circulating', value: GCOIN.circulating },
                  { label: 'Model', value: 'Fixed supply' },
                  { label: 'Exchange', value: 'MEXC' },
                ].map(({ label, value }) => (
                  <motion.div key={label} variants={shouldReduce ? {} : fadeUp} className="glass-card rounded-xl p-4">
                    <p className="text-[10px] text-muted uppercase tracking-widest mb-1">{label}</p>
                    <p className="text-sm font-bold text-offwhite">{value}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Tokenomics breakdown */}
            <motion.div variants={shouldReduce ? {} : fadeUp} className="glass-card rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-semibold text-offwhite uppercase tracking-widest">Tokenomics</h3>
              {[
                { label: 'Platform rewards & gameplay', pct: 45, color: 'bg-lime' },
                { label: 'Ecosystem & partnerships', pct: 20, color: 'bg-cyan' },
                { label: 'Team (12mo cliff + 24mo vest)', pct: 15, color: 'bg-violet' },
                { label: 'Staking & liquidity', pct: 12, color: 'bg-primary' },
                { label: 'TGE public sale', pct: 8, color: 'bg-muted' },
              ].map(({ label, pct, color }) => (
                <div key={label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted">{label}</span>
                    <span className="font-bold text-offwhite">{pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5">
                    <motion.div
                      className={`h-full rounded-full ${color}`}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              ))}
              <div className="pt-3 border-t border-white/5 space-y-2">
                <div className="flex items-start gap-2 text-xs text-muted">
                  <span className="text-lime mt-0.5">•</span>
                  Step-based pricing: +2% per 54M tokens sold
                </div>
                <div className="flex items-start gap-2 text-xs text-muted">
                  <span className="text-cyan mt-0.5">•</span>
                  Daily burn: 25% of platform commissions
                </div>
                <div className="flex items-start gap-2 text-xs text-muted">
                  <span className="text-violet mt-0.5">•</span>
                  Staking: min 1,000 GCOIN — 6/9/12/18 month tiers
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────── */}
      <section className="py-20 md:py-28 relative" style={{ backgroundColor: 'rgba(10,22,40,0.5)' }}>
        <div className="absolute inset-0 animated-grid opacity-40" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={shouldReduce ? {} : stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="text-center mb-14"
          >
            <motion.p variants={shouldReduce ? {} : fadeUp} className="text-violet text-xs font-bold uppercase tracking-widest mb-3">
              Architecture
            </motion.p>
            <motion.h2 variants={shouldReduce ? {} : fadeUp} className="font-serif text-4xl md:text-5xl font-black text-offwhite">
              Built different
            </motion.h2>
          </motion.div>

          <motion.div
            variants={shouldReduce ? {} : stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {[
              {
                icon: Zap, color: 'text-lime', bg: 'bg-lime/10',
                title: 'Gelato Relayer · Gasless',
                desc: 'Gelato sponsors every transaction. Users never pay gas or approve gas payments — it\'s invisible infrastructure.',
              },
              {
                icon: Clock, color: 'text-cyan', bg: 'bg-cyan/10',
                title: '250ms Block Finality',
                desc: 'Sub-second finality with Arbitrum Nitro rollup technology. Optimistic challenge period: 30 minutes.',
              },
              {
                icon: Cpu, color: 'text-violet', bg: 'bg-violet/10',
                title: 'ERC-4337 Account Abstraction',
                desc: 'PlayWall wallet enables social login without seed phrases. No prior Web3 wallet setup required.',
              },
              {
                icon: Key, color: 'text-lime', bg: 'bg-lime/10',
                title: 'Session Keys',
                desc: 'Eliminate repeated confirmation dialogs during gameplay. One approval covers an entire gaming session.',
              },
              {
                icon: Layers, color: 'text-cyan', bg: 'bg-cyan/10',
                title: 'AnyTrust Data Availability',
                desc: 'External DAC committee rather than posting all data to L1 — cheaper operations while preserving security guarantees.',
              },
              {
                icon: Database, color: 'text-violet', bg: 'bg-violet/10',
                title: 'PBG Auto-Distribution',
                desc: 'Any user with a USDP balance > 0 automatically receives PBG gas tokens when connecting to a PlayBlock dApp.',
              },
            ].map(({ icon: Icon, color, bg, title, desc }) => (
              <motion.div key={title} variants={shouldReduce ? {} : fadeUp} className="glass-card rounded-2xl p-6">
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-4`}>
                  <Icon size={19} className={color} />
                </div>
                <h3 className="font-bold text-offwhite text-sm mb-2">{title}</h3>
                <p className="text-xs text-muted leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── METAMASK SETUP ───────────────────────────────── */}
      <section id="setup" className="py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={shouldReduce ? {} : stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            <motion.div variants={shouldReduce ? {} : fadeUp} className="text-center mb-12">
              <p className="text-lime text-xs font-bold uppercase tracking-widest mb-3">Network Setup</p>
              <h2 className="font-serif text-4xl md:text-5xl font-black text-offwhite">Add to MetaMask</h2>
              <p className="mt-4 text-muted">Configure any EVM wallet manually using these parameters.</p>
            </motion.div>

            <motion.div variants={shouldReduce ? {} : fadeUp} className="glass-card rounded-2xl overflow-hidden">
              {[
                { label: 'Network Name', value: CHAIN.name },
                { label: 'RPC URL', value: CHAIN.rpc },
                { label: 'Chain ID', value: CHAIN.id },
                { label: 'Currency Symbol', value: CHAIN.symbol },
                { label: 'Block Explorer URL', value: CHAIN.explorer },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex items-center justify-between px-6 py-4 border-b border-white/5 last:border-0"
                >
                  <div>
                    <p className="text-[10px] text-muted uppercase tracking-widest mb-1">{label}</p>
                    <p className="text-sm font-mono font-medium text-offwhite">{value}</p>
                  </div>
                  <CopyButton text={value} />
                </div>
              ))}
            </motion.div>

            <motion.div variants={shouldReduce ? {} : fadeUp} className="mt-4 text-center">
              <a
                href="https://drpc.org/chainlist/playnance"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-lime hover:underline"
              >
                One-click "Add to Wallet" on dRPC ChainList <ExternalLink size={13} />
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── CONTRACT ADDRESSES ───────────────────────────── */}
      <section className="py-20 relative" style={{ backgroundColor: 'rgba(10,22,40,0.6)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={shouldReduce ? {} : stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            <motion.div variants={shouldReduce ? {} : fadeUp} className="mb-10">
              <p className="text-cyan text-xs font-bold uppercase tracking-widest mb-2">On-chain</p>
              <h2 className="font-serif text-3xl md:text-4xl font-black text-offwhite">Contract Addresses</h2>
            </motion.div>

            <motion.div variants={shouldReduce ? {} : fadeUp} className="glass-card rounded-2xl px-6">
              {ADDRESSES.map(({ label, address, chain }) => (
                <AddressRow key={label} label={label} address={address} chain={chain} />
              ))}
            </motion.div>

            <motion.div variants={shouldReduce ? {} : stagger} className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'GitHub Contracts', href: 'https://github.com/playnance-games/PlayBlock', icon: Code, color: 'text-lime' },
                { label: 'L2BEAT Profile', href: 'https://l2beat.com/scaling/projects/playblock', icon: Shield, color: 'text-cyan' },
                { label: 'Bridge (CoinsExchange)', href: 'https://coinsexchange.com', icon: Repeat, color: 'text-violet' },
              ].map(({ label, href, icon: Icon, color }) => (
                <motion.a
                  key={label}
                  variants={shouldReduce ? {} : fadeUp}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-card rounded-xl p-4 flex items-center gap-3 hover:border-white/15 transition-colors group"
                >
                  <Icon size={16} className={color} />
                  <span className="text-sm font-medium text-offwhite/70 group-hover:text-offwhite transition-colors">{label}</span>
                  <ExternalLink size={12} className="ml-auto text-muted group-hover:text-offwhite transition-colors" />
                </motion.a>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── SECURITY NOTICE ──────────────────────────────── */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-warning/20 p-6" style={{ backgroundColor: 'rgba(245,158,11,0.05)' }}>
            <div className="flex items-start gap-3">
              <Lock size={16} className="text-warning mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-warning mb-1">Developer Due Diligence</p>
                <p className="text-xs text-muted leading-relaxed">
                  PlayBlock smart contracts can be upgraded by an EOA with no delay or exit window.
                  The fraud proof system relies on a single validator. L2BEAT flags these as critical risks.
                  The CertiK audit found 1 critical issue (acknowledged, not resolved). Conduct your own
                  risk assessment before committing significant value to the chain.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 animate-mesh opacity-50" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <motion.div
            variants={shouldReduce ? {} : stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.h2 variants={shouldReduce ? {} : fadeUp} className="font-serif italic text-4xl md:text-5xl font-black text-offwhite">
              Start building on PlayBlock
            </motion.h2>
            <motion.p variants={shouldReduce ? {} : fadeUp} className="mt-4 text-muted max-w-lg mx-auto">
              Full EVM compatibility, Solidity support, and a Blockscout-based explorer.
              Docs at docs.playnance.com.
            </motion.p>
            <motion.div variants={shouldReduce ? {} : stagger} className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.a
                variants={shouldReduce ? {} : fadeUp}
                href="https://docs.playnance.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-lime text-navy font-bold text-sm hover:bg-lime-bright transition-colors"
              >
                Read the Docs <ArrowRight size={16} />
              </motion.a>
              <motion.a
                variants={shouldReduce ? {} : fadeUp}
                href="https://github.com/playnance-games/PlayBlock"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-white/10 text-offwhite text-sm hover:border-lime/30 transition-colors"
              >
                <Code size={15} /> GitHub Contracts
              </motion.a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-8" style={{ backgroundColor: '#050D1A' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 text-sm font-bold">
            <span className="w-6 h-6 rounded-md bg-lime flex items-center justify-center text-navy text-[10px] font-black">A</span>
            <span className="text-offwhite">Aqua<span className="text-lime">pool</span></span>
          </Link>
          <p className="text-xs text-muted">
            PlayBlock is operated by Playnance. Aquapool is not affiliated with Playnance.
          </p>
        </div>
      </footer>
    </div>
  );
}
