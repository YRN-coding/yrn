'use client';

import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function SendPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen text-[#F0F4FF]" style={{ backgroundColor: '#050D1A' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-40 pb-16">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#C8FF00] mb-3">
            Global transfers
          </p>
          <h1 className="text-4xl md:text-5xl font-black text-[#F0F4FF] mb-4">
            Send & receive
          </h1>
          <p className="text-[#6B7280] max-w-lg text-base leading-relaxed">
            Send money to 180+ countries at 0.1% fees. Arrives in minutes via crypto rails — no banks, no delays.
          </p>
          <div
            className="mt-16 rounded-2xl h-80 flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <span className="text-[#4B5563] text-sm">Transfer interface coming soon</span>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
