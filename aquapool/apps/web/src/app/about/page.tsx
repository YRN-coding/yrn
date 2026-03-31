'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, Globe, Eye, Users, ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const TEAM = [
  { img: 1,  name: 'Elena Vasquez',  role: 'Co-founder & CEO',      bio: 'Ex-Goldman Sachs. 15 years in institutional finance and fintech.' },
  { img: 2,  name: 'Marcus Obi',     role: 'Co-founder & CTO',      bio: 'Former engineering lead at Coinbase. Built infra serving $10B+ daily.' },
  { img: 3,  name: 'Priya Sharma',   role: 'Chief Product Officer', bio: 'Previously head of product at Revolut. Loves building zero-friction UX.' },
  { img: 4,  name: 'James Thornton', role: 'VP of Compliance',      bio: 'Former FCA regulator. Keeps Aquapool MiCA-compliant across 180+ markets.' },
  { img: 5,  name: 'Amara Nwosu',    role: 'Head of Growth',        bio: 'Scaled Chipper Cash to 5M users. Obsessed with emerging market adoption.' },
  { img: 6,  name: 'Li Wei',         role: 'Head of Security',      bio: 'Ex-Fireblocks. MPC architecture and SOC 2 compliance are his love language.' },
];

const VALUES = [
  { icon: Shield, color: 'text-lime',   bg: 'bg-lime/10',   title: 'Security First',       desc: 'Every product decision starts with: is this secure? MPC wallets, AES-256 encryption, and real-time AML screening are non-negotiable.' },
  { icon: Eye,    color: 'text-cyan',   bg: 'bg-cyan/10',   title: 'Radical Transparency', desc: 'No hidden fees. No fine print. We publish our audits, our fees, and our incident reports publicly.' },
  { icon: Globe,  color: 'text-violet', bg: 'bg-violet/10', title: 'Global by Default',    desc: "Finance has been a local product for too long. We build for the 8 billion, not the privileged few." },
  { icon: Users,  color: 'text-lime',   bg: 'bg-lime/10',   title: 'User First',           desc: "If something takes more than 3 taps, we redesign it. We hire obsessive product people who feel user pain personally." },
];

const TIMELINE = [
  { year: '2022', label: 'Founded',       desc: 'Team of 5 in stealth. Seed round from EQT Ventures.' },
  { year: '2023', label: 'Private Beta',  desc: '10,000 users across 12 countries. First $1B in transaction volume.' },
  { year: '2024', label: 'Public Launch', desc: 'Open to everyone. 50+ chains, 180+ countries, zero-fee transfers.' },
  { year: '2025', label: 'Global Scale',  desc: '2M+ users, $24B+ volume, MiCA compliant, Series B closed.' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white overflow-x-hidden">
      <Navbar />

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="relative min-h-[70vh] flex items-center justify-center pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0 animate-mesh" />
        <div className="absolute inset-0 animated-grid" />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full opacity-15 blur-3xl bg-lime animate-float-1 pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 w-72 h-72 rounded-full opacity-10 blur-3xl bg-cyan animate-float-2 pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.p
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-lime text-[11px] font-semibold uppercase tracking-widest mb-6"
          >
            About Aquapool
          </motion.p>

          <motion.div variants={stagger} initial="hidden" animate="visible">
            <motion.h1
              variants={fadeUp}
              className="font-serif text-6xl sm:text-7xl md:text-8xl font-black text-white leading-none tracking-tight"
            >
              Finance,<br />
              <span className="text-lime">Reimagined.</span>
            </motion.h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-8 text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed"
          >
            We started Aquapool because the global financial system excludes billions of people
            who deserve the same access to modern banking tools as anyone else. We&apos;re fixing that.
          </motion.p>
        </div>
      </section>

      {/* ── MISSION STATS ─────────────────────────────────────── */}
      <section className="py-20 border-y border-white/5" style={{ backgroundColor: 'rgba(10,22,40,0.8)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { number: '180+',  label: 'Countries', sub: 'Global reach from day one' },
              { number: '2M+',   label: 'Users',     sub: 'And growing every day' },
              { number: '$24B+', label: 'Volume',    sub: 'Processed and counting' },
            ].map(({ number, label, sub }) => (
              <div key={label} className="glass-card rounded-2xl p-8 text-center">
                <p className="font-serif text-6xl font-black text-lime leading-none">{number}</p>
                <p className="text-xl font-bold text-white mt-2">{label}</p>
                <p className="text-sm text-gray-500 mt-1">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── OUR STORY ─────────────────────────────────────────── */}
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 items-start">
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              className="lg:col-span-3 space-y-6"
            >
              <motion.h2 variants={fadeUp} className="font-serif text-4xl md:text-5xl font-black text-white">
                Our Story
              </motion.h2>
              <motion.p variants={fadeUp} className="text-gray-400 leading-relaxed">
                Aquapool was born in 2022 out of frustration. Our founders spent years in
                institutional finance and watched trillions of dollars move across borders — but
                always with the same broken experience for ordinary people: slow, expensive, opaque.
              </motion.p>
              <motion.p variants={fadeUp} className="text-gray-400 leading-relaxed">
                We believed the same cryptographic infrastructure powering institutional custody
                desks could be made accessible to everyone. So we built it — without compromising
                on security, compliance, or user experience.
              </motion.p>
              <motion.p variants={fadeUp} className="text-gray-400 leading-relaxed">
                Today, Aquapool processes billions in volume across 180+ countries. Regulated,
                audited, and built on infrastructure trusted by the world&apos;s largest custodians
                — but accessible to everyone.
              </motion.p>
            </motion.div>

            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              className="lg:col-span-2"
            >
              <div className="glass-card rounded-2xl p-8">
                <p className="text-[10px] text-lime font-semibold uppercase tracking-widest mb-6">Timeline</p>
                {TIMELINE.map(({ year, label, desc }, i) => (
                  <motion.div key={year} variants={fadeUp} className="flex gap-4 pb-8 last:pb-0 relative">
                    {i < TIMELINE.length - 1 && (
                      <div className="absolute left-[19px] top-10 bottom-0 w-px bg-white/8" />
                    )}
                    <div className="w-10 h-10 rounded-full border border-lime/30 bg-lime/5 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-lime">
                      {year.slice(2)}
                    </div>
                    <div className="pt-2">
                      <p className="font-bold text-white text-sm">
                        {label} <span className="text-gray-600 font-normal">· {year}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">{desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── VALUES ────────────────────────────────────────────── */}
      <section className="py-24 md:py-32" style={{ backgroundColor: 'rgba(10,22,40,0.4)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} className="text-lime text-[11px] font-semibold uppercase tracking-widest mb-3">
              What we stand for
            </motion.p>
            <motion.h2 variants={fadeUp} className="font-serif text-4xl md:text-5xl font-black text-white">
              Our Values
            </motion.h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {VALUES.map(({ icon: Icon, color, bg, title, desc }) => (
              <motion.div key={title} variants={fadeUp} className="glass-card rounded-2xl p-8">
                <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center mb-5`}>
                  <Icon size={22} className={color} />
                </div>
                <h3 className="font-serif text-xl font-bold text-white mb-3">{title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── TEAM ──────────────────────────────────────────────── */}
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} className="text-lime text-[11px] font-semibold uppercase tracking-widest mb-3">
              The people building it
            </motion.p>
            <motion.h2 variants={fadeUp} className="font-serif text-4xl md:text-5xl font-black text-white">
              Meet the Team
            </motion.h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8"
          >
            {TEAM.map(({ img, name, role, bio }) => (
              <motion.div key={name} variants={fadeUp} className="glass-card rounded-2xl p-7 text-center group">
                <div className="relative w-20 h-20 mx-auto mb-5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://i.pravatar.cc/150?img=${img}`}
                    alt={name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-lime/20 group-hover:border-lime/50 transition-colors"
                  />
                </div>
                <h3 className="font-serif text-lg font-bold text-white">{name}</h3>
                <p className="text-xs text-lime font-semibold uppercase tracking-wider mt-1 mb-3">{role}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{bio}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── JOIN US CTA ───────────────────────────────────────── */}
      <section className="py-24 md:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="glass-card rounded-3xl p-12 md:p-16 text-center border border-lime/10"
          >
            <motion.p variants={fadeUp} className="text-lime text-[11px] font-semibold uppercase tracking-widest mb-5">
              Ready to start?
            </motion.p>
            <motion.h2 variants={fadeUp} className="font-serif text-4xl md:text-6xl font-black text-white leading-tight">
              Join the Future<br />of Finance
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-6 text-gray-400 max-w-xl mx-auto leading-relaxed">
              Open an account in 60 seconds. No minimum balance, no hidden fees.
              Available in 180+ countries.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-lime text-[#050D1A] font-bold text-base hover:bg-[#d4ff33] transition-colors"
              >
                Open Account <ArrowRight size={18} />
              </Link>
              <Link
                href="#"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl border border-white/15 text-white font-semibold text-base hover:border-white/30 hover:bg-white/5 transition-colors"
              >
                Read Whitepaper
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
