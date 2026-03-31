'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { Badge } from '@/components';

const kycInfo: Record<string, { label: string; limit: string; color: 'default' | 'warning' | 'success' }> = {
  TIER_0: { label: 'Tier 0 — Unverified', limit: '$200/month', color: 'default' },
  TIER_1: { label: 'Tier 1 — ID Verified', limit: '$10,000/month', color: 'warning' },
  TIER_2: { label: 'Tier 2 — Enhanced', limit: 'Unlimited', color: 'success' },
};

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const [totpEnabled] = useState(false);
  const kyc = kycInfo[user?.kycTier ?? 'TIER_0'] ?? kycInfo['TIER_0']!;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Profile & Settings</h1>

      {/* Account info */}
      <div className="glass rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold">Account</h2>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xl font-bold">
            {user?.email?.[0]?.toUpperCase() ?? 'A'}
          </div>
          <div>
            <p className="font-medium">{user?.email ?? 'Loading…'}</p>
            <Badge variant={kyc.color}>{kyc.label}</Badge>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-xs text-muted mb-1">Monthly limit</p>
            <p className="font-semibold">{kyc.limit}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-xs text-muted mb-1">User ID</p>
            <p className="font-mono text-xs text-muted truncate">{user?.id ?? '—'}</p>
          </div>
        </div>
      </div>

      {/* KYC upgrade */}
      <div className="glass rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Identity Verification</h2>
          <Badge variant={kyc.color}>{kyc.label}</Badge>
        </div>
        <div className="space-y-3">
          {[
            { tier: 'TIER_0', label: 'Tier 0', desc: 'Email only', limit: '$200/mo', done: true },
            { tier: 'TIER_1', label: 'Tier 1', desc: 'Government ID scan', limit: '$10,000/mo', done: user?.kycTier !== 'TIER_0' },
            { tier: 'TIER_2', label: 'Tier 2', desc: 'Enhanced due diligence', limit: 'Unlimited', done: user?.kycTier === 'TIER_2' },
          ].map((step) => (
            <div key={step.tier} className={`flex items-center justify-between p-4 rounded-xl border ${step.done ? 'border-success/20 bg-success/5' : 'border-white/10'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step.done ? 'bg-success text-white' : 'bg-white/10 text-muted'}`}>
                  {step.done ? '✓' : ''}
                </div>
                <div>
                  <p className="text-sm font-medium">{step.label}</p>
                  <p className="text-xs text-muted">{step.desc}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted">{step.limit}</p>
                {!step.done && (
                  <button className="text-xs text-primary hover:underline mt-1">Verify →</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security */}
      <div className="glass rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold">Security</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-3 border-b border-white/5">
            <div>
              <p className="text-sm font-medium">Two-Factor Authentication</p>
              <p className="text-xs text-muted">TOTP via authenticator app</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={totpEnabled ? 'success' : 'default'}>{totpEnabled ? 'Enabled' : 'Disabled'}</Badge>
              <button className="text-xs text-primary hover:underline">
                {totpEnabled ? 'Disable' : 'Enable'}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium">Password</p>
              <p className="text-xs text-muted">Last changed: never</p>
            </div>
            <button className="text-xs text-primary hover:underline">Change</button>
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="glass rounded-2xl p-6 border border-error/20">
        <h2 className="font-semibold text-error mb-4">Danger Zone</h2>
        <button
          onClick={() => {
            logout();
            window.location.href = '/';
          }}
          className="px-4 py-2 bg-error/10 border border-error/20 text-error rounded-lg text-sm font-medium hover:bg-error/20 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
