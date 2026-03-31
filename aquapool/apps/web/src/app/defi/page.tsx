'use client';

import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function DeFiPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen text-[#F0F4FF]" style={{ backgroundColor: '#050D1A' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-40 pb-16">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#00E5FF] mb-3">
            Decentralized finance
          </p>
          <h1 className="text-4xl md:text-5xl font-black text-[#F0F4FF] mb-4">
            DeFi yields
          </h1>
          <p className="text-[#6B7280] max-w-lg text-base leading-relaxed">
            Access institutional-grade DeFi protocols — lending, staking, and liquidity pools — without leaving the Aquapool app.
          </p>
          <div
            className="mt-16 rounded-2xl h-80 flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <span className="text-[#4B5563] text-sm">Protocol explorer coming soon</span>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
