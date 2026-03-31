'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#050D1A' }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-2xl">
            <span className="w-9 h-9 rounded-xl bg-[#C8FF00] flex items-center justify-center text-[#050D1A] text-base font-black">
              A
            </span>
            <span className="text-[#F0F4FF]">Aqua<span className="text-[#C8FF00]">pool</span></span>
          </Link>
          <p className="text-[#6B7280] text-sm mt-3">Welcome back</p>
        </div>

        {/* Form */}
        <div
          className="rounded-2xl p-8 space-y-5"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-widest text-[#6B7280]">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="w-full rounded-xl px-4 py-3 text-sm text-[#F0F4FF] outline-none transition-colors placeholder:text-[#4B5563]"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-widest text-[#6B7280]">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full rounded-xl px-4 py-3 text-sm text-[#F0F4FF] outline-none transition-colors placeholder:text-[#4B5563]"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-full text-sm font-semibold transition-colors"
            style={{ backgroundColor: '#C8FF00', color: '#050D1A' }}
            onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.backgroundColor = '#d4ff33'; }}
            onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.backgroundColor = '#C8FF00'; }}
          >
            Sign in
          </button>
        </div>

        <p className="text-center text-sm text-[#6B7280] mt-6">
          New to Aquapool?{' '}
          <Link href="/register" className="text-[#C8FF00] font-medium hover:underline">
            Open account
          </Link>
        </p>
      </div>
    </div>
  );
}
