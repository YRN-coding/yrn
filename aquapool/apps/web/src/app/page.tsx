'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useInView,
  useReducedMotion,
} from 'framer-motion';
import Link from 'next/link';
import {
  Shield,
  Zap,
  Globe,
  TrendingUp,
  ChevronRight,
  Lock,
  Smartphone,
  CheckCircle,
  ArrowRight,
  Star,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

/* ─── Animation variants ──────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const staggerFast = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

/* ─── Count-up hook ───────────────────────────────────────── */
function useCountUp(target: number, duration = 1800) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, duration]);

  return { count, ref };
}

/* ─── 3-D tilt card ─────────────────────────────────────── */
function TiltCard({ children, className = '', style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  const shouldReduce = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [4, -4]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-4, 4]), { stiffness: 300, damping: 30 });

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduce || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }, [shouldReduce, x, y]);

  const onMouseLeave = useCallback(() => { x.set(0); y.set(0); }, [x, y]);

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={shouldReduce ? style : { rotateX, rotateY, transformPerspective: 800, ...style }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Stat item ─────────────────────────────────────────── */
function StatItem({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const { count, ref } = useCountUp(value);
  return (
    <div className="text-center px-6 py-4">
      <p className="text-3xl md:text-4xl font-bold text-offwhite">
        <span ref={ref}>{count.toLocaleString()}</span>{suffix}
      </p>
      <p className="text-sm text-muted mt-1">{label}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const shouldReduce = useReducedMotion();

  return (
    <div className="min-h-screen bg-navy text-offwhite overflow-x-hidden">

      <Navbar />

      {/* ── HERO ──────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center pt-24 overflow-hidden">
        {/* Mesh background */}
        <div className="absolute inset-0 animate-mesh" />
        <div className="absolute inset-0 animated-grid" />

        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl bg-lime animate-float-1 pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl bg-cyan animate-float-2 pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/2 w-72 h-72 rounded-full opacity-15 blur-3xl bg-violet animate-float-3 pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <motion.div
            initial={shouldReduce ? false : { opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-lime/20 bg-lime/5 text-lime text-xs font-medium mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse" />
            Now live in 180+ countries
            <ChevronRight size={12} />
          </motion.div>

          {/* Headline */}
          <motion.div
            variants={shouldReduce ? {} : staggerFast}
            initial="hidden"
            animate="visible"
          >
            {['Your Global', 'Finance Hub'].map((line) => (
              <div key={line} className="overflow-hidden">
                <motion.h1
                  variants={shouldReduce ? {} : fadeUp}
                  className="font-serif italic text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-none text-offwhite"
                >
                  {line === 'Finance Hub' ? (
                    <>Finance <span className="text-lime">Hub</span></>
                  ) : line}
                </motion.h1>
              </div>
            ))}
          </motion.div>

          {/* Subheadline */}
          <motion.p
            variants={shouldReduce ? {} : fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.4 }}
            className="mt-6 text-lg md:text-xl text-muted max-w-2xl mx-auto leading-relaxed"
          >
            Send, exchange, earn, and invest across 50+ blockchains and traditional markets —
            all in one beautifully simple app.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={shouldReduce ? {} : stagger}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.55 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.div variants={shouldReduce ? {} : fadeUp}>
              <Link
                href="/register"
                className="animate-pulse-ring inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-lime text-navy font-bold text-base hover:bg-lime-bright transition-colors shadow-lg"
              >
                Start for free <ArrowRight size={18} />
              </Link>
            </motion.div>
            <motion.div variants={shouldReduce ? {} : fadeUp}>
              <button className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl border border-white/15 text-offwhite font-semibold text-base hover:border-white/30 hover:bg-white/5 transition-colors">
                Watch Demo
              </button>
            </motion.div>
          </motion.div>

        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-xs text-muted">Scroll</span>
          <motion.div
            animate={shouldReduce ? {} : { y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-0.5 h-6 bg-gradient-to-b from-lime/60 to-transparent rounded-full"
          />
        </motion.div>
      </section>

      {/* ── TRUST BANNER ──────────────────────────────────── */}
      <section
        className="relative border-y border-white/5 py-5 overflow-hidden"
        style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
      >
        <div className="flex items-center gap-6 px-4 sm:px-6 lg:px-8">
          <p className="hidden sm:block text-[10px] text-muted uppercase tracking-widest whitespace-nowrap flex-shrink-0">
            Trusted by
          </p>
          <div className="flex-1 overflow-hidden">
            <div className="flex items-center gap-10 animate-partners whitespace-nowrap">
              {[...Array(2)].flatMap((_, d) =>
                ['Visa','Mastercard','Stripe','Plaid','Coinbase','Polygon','Solana','Binance','AWS','Fireblocks'].map((name, i) => (
                  <span
                    key={`${d}-${i}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-white/25 hover:text-white/50 transition-opacity cursor-default select-none"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white/15" />
                    {name}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ─────────────────────────────────────── */}
      <section className="relative border-y border-white/5" style={{ backgroundColor: 'rgba(10,22,40,0.8)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/5">
            <StatItem value={24} suffix="B+" label="Volume traded" />
            <StatItem value={180} suffix="+" label="Countries supported" />
            <StatItem value={2} suffix="M+" label="Active users" />
            <StatItem value={99} suffix=".9%" label="Uptime SLA" />
          </div>
        </div>
      </section>

      {/* ── PARTNER CREDIBILITY ───────────────────────────── */}
      <section className="border-b border-white/5 py-14" style={{ backgroundColor: '#0A1628' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={shouldReduce ? {} : stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            <motion.p variants={shouldReduce ? {} : fadeUp} className="text-center text-xs text-muted uppercase tracking-widest mb-10">
              Built with the industry&apos;s most trusted infrastructure
            </motion.p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 rounded-2xl overflow-hidden">
              {[
                {
                  label: 'Payment Methods',
                  color: 'text-lime',
                  partners: ['Visa', 'Mastercard', 'Swish', 'Klarna'],
                },
                {
                  label: 'Custody',
                  color: 'text-cyan',
                  partners: ['Fireblocks', 'Coinbase Custody', 'BitGo'],
                },
                {
                  label: 'Regulated By',
                  color: 'text-violet',
                  partners: ['MiCA Compliant', 'SOC 2 Type II', 'ISO 27001'],
                },
                {
                  label: 'Backed By',
                  color: 'text-lime',
                  partners: ['CoinShares', 'EQT Ventures', 'Northzone'],
                },
              ].map(({ label, color, partners }) => (
                <motion.div
                  key={label}
                  variants={shouldReduce ? {} : fadeUp}
                  className="px-6 py-8 flex flex-col gap-4"
                  style={{ backgroundColor: '#0A1628' }}
                >
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${color}`}>{label}</p>
                  <ul className="space-y-2.5">
                    {partners.map((p) => (
                      <li key={p} className="text-sm font-semibold text-offwhite/70">{p}</li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
            <motion.p variants={shouldReduce ? {} : fadeUp} className="text-center text-[10px] text-muted/50 italic mt-4">
              Partner relationships in progress. Some integrations pending launch.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────── */}
      <section id="features" className="py-24 md:py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={shouldReduce ? {} : stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="text-center mb-16"
          >
            <motion.p variants={shouldReduce ? {} : fadeUp} className="text-lime text-[11px] font-semibold uppercase tracking-widest mb-3">
              Everything you need
            </motion.p>
            <motion.h2 variants={shouldReduce ? {} : fadeUp} className="font-serif text-4xl md:text-5xl font-black text-offwhite">
              Built for the next billion
            </motion.h2>
            <motion.p variants={shouldReduce ? {} : fadeUp} className="mt-4 text-muted max-w-xl mx-auto">
              Professional-grade tools, zero complexity. Aquapool brings institutional finance to everyone.
            </motion.p>
          </motion.div>

          <motion.div
            variants={shouldReduce ? {} : stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {[
              {
                icon: Shield,
                colorClass: 'text-lime',
                bgClass: 'bg-lime/10',
                title: 'MPC Security',
                desc: 'Military-grade multi-party computation keeps your keys safe — no single point of failure.',
              },
              {
                icon: Zap,
                colorClass: 'text-cyan',
                bgClass: 'bg-cyan/10',
                title: 'Instant Swaps',
                desc: 'Best-rate DEX aggregation across 50+ chains in under 3 seconds with zero slippage surprises.',
              },
              {
                icon: Globe,
                colorClass: 'text-violet',
                bgClass: 'bg-violet/10',
                title: 'Global Remittance',
                desc: 'Send money to 180+ countries at 0.1% fees. Arrive in minutes, not days.',
              },
              {
                icon: TrendingUp,
                colorClass: 'text-lime',
                bgClass: 'bg-lime/10',
                title: 'Earn & Invest',
                desc: 'Auto-compounding DeFi yields, ETF exposure, and staking — all in one portfolio view.',
              },
            ].map(({ icon: Icon, colorClass, bgClass, title, desc }) => (
              <motion.div key={title} variants={shouldReduce ? {} : fadeUp} className="group">
                <TiltCard
                  className="h-full cursor-default rounded-2xl p-7 transition-colors duration-300"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <div className={`w-12 h-12 rounded-xl ${bgClass} flex items-center justify-center mb-6`}>
                    <Icon size={24} className={colorClass} />
                  </div>
                  <h3 className="text-lg font-bold text-offwhite mb-3">{title}</h3>
                  <p className="text-sm font-normal leading-relaxed" style={{ color: '#64748B' }}>{desc}</p>
                </TiltCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── HAPPY CUSTOMERS ───────────────────────────────── */}
      <section className="customer-showcase">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={shouldReduce ? {} : stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="mb-12"
          >
            <motion.p variants={shouldReduce ? {} : fadeUp} className="text-lime text-[11px] font-semibold uppercase tracking-widest mb-4">
              Our community
            </motion.p>
            <motion.h2 variants={shouldReduce ? {} : fadeUp} className="font-serif text-5xl md:text-7xl font-black text-offwhite text-left">
              Real People.<br />Real Returns.
            </motion.h2>
          </motion.div>

          <div className="customer-image-wrapper">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1556761175-4b46a572b786?w=1200&q=80"
              alt="Happy Aquapool customers"
            />
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                name: 'Sarah K.',
                role: 'Entrepreneur, Lagos',
                quote: 'Sending money home used to take days. Now it takes 30 seconds. Aquapool changed everything.',
              },
              {
                name: 'Marcus T.',
                role: 'Freelancer, Berlin',
                quote: 'I get paid in USDC, convert to EUR at the best rates, and withdraw instantly. The fees are insane.',
              },
              {
                name: 'Aisha M.',
                role: 'Investor, Dubai',
                quote: "The DeFi yields are genuinely the best I've seen. And the UI is so clean my parents could use it.",
              },
            ].map(({ name, role, quote }, i) => (
              <div
                key={name}
                className={`glass-card rounded-2xl p-6 text-left animate-on-load delay-${i + 1}`}
              >
                <p className="text-sm text-offwhite/80 leading-relaxed italic mb-4">&ldquo;{quote}&rdquo;</p>
                <p className="text-sm font-bold text-offwhite">{name}</p>
                <p className="text-xs text-muted">{role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ACCESS ANOTHER WORLD ─────────────────────────── */}
      <section className="relative py-24 md:py-36 overflow-hidden">
        <div className="absolute inset-0 animate-mesh opacity-70" />
        <div className="absolute inset-0 animated-grid" />
        <div className="absolute inset-0 bg-gradient-to-b from-navy/80 via-transparent to-navy/80" />
        <motion.div
          variants={shouldReduce ? {} : stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <motion.p variants={shouldReduce ? {} : fadeUp} className="text-lime/60 text-xs font-semibold uppercase tracking-widest mb-5">
            Exclusive access
          </motion.p>
          <motion.h2
            variants={shouldReduce ? {} : fadeUp}
            className="font-serif italic text-5xl md:text-7xl lg:text-8xl text-offwhite leading-tight"
          >
            Access another world
          </motion.h2>
          <motion.p variants={shouldReduce ? {} : fadeUp} className="mt-8 text-lg text-muted max-w-xl mx-auto leading-relaxed">
            From same-day international transfers to institutional DeFi yields —
            financial privileges once reserved for the ultra-wealthy, now unlocked for everyone.
          </motion.p>
          <motion.div variants={shouldReduce ? {} : fadeUp} className="mt-10">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 text-lime font-semibold hover:gap-3 transition-all"
            >
              Unlock your account <ArrowRight size={16} />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────── */}
      <section id="how-it-works" className="py-24 md:py-32 relative" style={{ backgroundColor: 'rgba(10,22,40,0.4)' }}>
        <div className="absolute inset-0 animated-grid opacity-50" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={shouldReduce ? {} : stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="text-center mb-16"
          >
            <motion.p variants={shouldReduce ? {} : fadeUp} className="text-lime text-sm font-semibold uppercase tracking-widest mb-3">
              Get started in minutes
            </motion.p>
            <motion.h2 variants={shouldReduce ? {} : fadeUp} className="font-serif text-4xl md:text-5xl font-black text-offwhite">
              Simple as 1-2-3
            </motion.h2>
          </motion.div>

          <div className="space-y-8">
            {[
              {
                num: '01',
                colorClass: 'text-lime',
                borderClass: 'border-lime/30',
                title: 'Create your account',
                desc: 'Sign up in 60 seconds with just your email. Upgrade your KYC tier anytime to unlock higher limits.',
              },
              {
                num: '02',
                colorClass: 'text-cyan',
                borderClass: 'border-cyan/30',
                title: 'Fund your wallet',
                desc: 'Deposit crypto from any chain, or buy directly with a card. Your MPC-secured wallet is ready instantly.',
              },
              {
                num: '03',
                colorClass: 'text-violet',
                borderClass: 'border-violet/30',
                title: 'Send, swap, earn',
                desc: 'Transfer to anyone worldwide, swap between assets at the best rates, or put your money to work in DeFi vaults.',
              },
            ].map(({ num, colorClass, borderClass, title, desc }, i) => (
              <motion.div
                key={num}
                variants={shouldReduce ? {} : fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: i * 0.15 }}
                className={`glass-card rounded-2xl p-6 border ${borderClass} flex items-start gap-5`}
              >
                <span className={`text-4xl font-black ${colorClass} opacity-40 leading-none pt-1`}>{num}</span>
                <div>
                  <h3 className="text-xl font-bold text-offwhite mb-1">{title}</h3>
                  <p className="text-muted text-sm leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECURITY ──────────────────────────────────────── */}
      <section id="security" className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: text */}
            <motion.div
              variants={shouldReduce ? {} : stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              className="space-y-6"
            >
              <motion.p variants={shouldReduce ? {} : fadeUp} className="text-lime text-sm font-semibold uppercase tracking-widest">
                Enterprise-grade security
              </motion.p>
              <motion.h2 variants={shouldReduce ? {} : fadeUp} className="font-serif text-4xl md:text-5xl font-black text-offwhite leading-tight">
                Your assets, always protected
              </motion.h2>
              <motion.p variants={shouldReduce ? {} : fadeUp} className="text-muted leading-relaxed">
                We use the same multi-party computation technology trusted by the world's largest custodians,
                combined with real-time AML screening and on-chain insurance.
              </motion.p>

              <motion.div variants={shouldReduce ? {} : stagger} className="space-y-3">
                {[
                  { label: 'SOC 2 Type II Certified', Icon: CheckCircle },
                  { label: 'ISO 27001 Compliant', Icon: CheckCircle },
                  { label: 'MPC — no seed phrases', Icon: Lock },
                  { label: '256-bit AES encryption at rest', Icon: Shield },
                  { label: 'Real-time Chainalysis AML screening', Icon: CheckCircle },
                  { label: '$200M on-chain insurance coverage', Icon: Star },
                ].map(({ label, Icon }) => (
                  <motion.div
                    key={label}
                    variants={shouldReduce ? {} : fadeUp}
                    className="flex items-center gap-3 text-sm text-offwhite/80"
                  >
                    <Icon size={16} className="text-lime flex-shrink-0" />
                    {label}
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right: animated shield graphic */}
            <motion.div
              initial={shouldReduce ? false : { opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center justify-center"
            >
              <div className="relative w-72 h-72">
                <div className="absolute inset-0 rounded-full border border-cyan/20 animate-spin-slow" />
                <div
                  className="absolute inset-4 rounded-full border border-lime/15 animate-spin-slow"
                  style={{ animationDirection: 'reverse', animationDuration: '12s' }}
                />
                <div className="absolute inset-12 rounded-full bg-lime/5 blur-2xl" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-40 h-40 rounded-3xl glass-card flex items-center justify-center glow-lime">
                    <Shield size={64} className="text-lime" strokeWidth={1.5} />
                  </div>
                </div>
                {[
                  { label: 'SOC 2', style: { top: '8%', left: '-8%' } },
                  { label: 'AES-256', style: { top: '8%', right: '-8%' } },
                  { label: 'MPC', style: { bottom: '8%', left: '-8%' } },
                  { label: 'ISO 27001', style: { bottom: '8%', right: '-8%' } },
                ].map(({ label, style }) => (
                  <div
                    key={label}
                    className="absolute px-2.5 py-1 rounded-full border border-lime/20 text-lime text-[10px] font-bold"
                    style={{ backgroundColor: '#0A1628', ...style }}
                  >
                    {label}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── MOBILE APP CTA ────────────────────────────────── */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 animate-mesh opacity-60" />
        <div className="absolute inset-0 animated-grid" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card rounded-3xl p-10 md:p-16 border border-lime/10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Text */}
              <motion.div
                variants={shouldReduce ? {} : stagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="space-y-6"
              >
                <motion.div variants={shouldReduce ? {} : fadeUp} className="flex items-center gap-2">
                  <Smartphone size={18} className="text-lime" />
                  <span className="text-lime text-sm font-semibold uppercase tracking-widest">Mobile App</span>
                </motion.div>
                <motion.h2 variants={shouldReduce ? {} : fadeUp} className="font-serif text-4xl md:text-5xl font-black text-offwhite">
                  Finance in your pocket
                </motion.h2>
                <motion.p variants={shouldReduce ? {} : fadeUp} className="text-muted leading-relaxed">
                  Everything on web, now on iOS and Android. Real-time push notifications,
                  biometric auth, and an interface so clean it feels like magic.
                </motion.p>
                <motion.div variants={shouldReduce ? {} : stagger} className="flex flex-wrap gap-3">
                  {[
                    { short: 'iOS', label: 'Download on the', store: 'App Store' },
                    { short: 'GP', label: 'Get it on', store: 'Google Play' },
                  ].map(({ short, label, store }) => (
                    <motion.a
                      key={store}
                      variants={shouldReduce ? {} : fadeUp}
                      href="#"
                      className="flex items-center gap-3 px-5 py-3 rounded-xl border border-white/10 hover:border-lime/30 hover:bg-white/5 transition-colors"
                      style={{ backgroundColor: 'rgba(240,244,255,0.04)' }}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ backgroundColor: 'rgba(240,244,255,0.08)' }}>
                        {short}
                      </div>
                      <div>
                        <p className="text-[10px] text-muted">{label}</p>
                        <p className="text-sm font-semibold text-offwhite">{store}</p>
                      </div>
                    </motion.a>
                  ))}
                </motion.div>
              </motion.div>

              {/* Phone mockup */}
              <motion.div
                initial={shouldReduce ? false : { opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="flex justify-center"
              >
                <div className="relative w-56 h-[440px]">
                  <div className="absolute inset-0 rounded-[40px] border-2 border-white/10 overflow-hidden" style={{ backgroundColor: '#050D1A' }}>
                    <div className="absolute inset-0 bg-gradient-to-b from-lime/10 via-transparent to-cyan/10" />
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-5 rounded-full border border-white/5" style={{ backgroundColor: '#050D1A' }} />
                    <div className="absolute top-14 left-4 right-4 space-y-3">
                      <div className="h-16 rounded-xl border border-lime/10 flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
                        <span className="text-lime font-bold text-lg">$24,831.50</span>
                      </div>
                      {[80, 60, 70, 50].map((w, i) => (
                        <div
                          key={i}
                          className="h-10 rounded-lg border border-white/5"
                          style={{ width: `${w}%`, backgroundColor: 'rgba(255,255,255,0.03)' }}
                        />
                      ))}
                    </div>
                    <div
                      className="absolute bottom-6 left-4 right-4 h-12 rounded-2xl border border-white/10 flex items-center justify-around"
                      style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
                    >
                      {[Globe, TrendingUp, Zap, Shield].map((Icon, i) => (
                        <Icon key={i} size={18} className={i === 0 ? 'text-lime' : 'text-muted'} />
                      ))}
                    </div>
                  </div>
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-40 h-8 blur-2xl rounded-full" style={{ backgroundColor: 'rgba(186,255,57,0.2)' }} />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
