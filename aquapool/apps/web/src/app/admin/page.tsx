'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/api/v1/deposits?limit=1'),
      api.get('/api/v1/deposits?status=PENDING&limit=1'),
      api.get('/api/v1/deposits?status=APPROVED&limit=1'),
      api.get('/api/v1/deposits?status=REJECTED&limit=1'),
    ])
      .then(([all, pending, approved, rejected]) => {
        setStats({
          total: all.data?.meta?.total ?? 0,
          pending: pending.data?.meta?.total ?? 0,
          approved: approved.data?.meta?.total ?? 0,
          rejected: rejected.data?.meta?.total ?? 0,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Total Deposits', value: stats.total, color: 'lime', icon: '💳' },
    { label: 'Pending Review', value: stats.pending, color: 'warning', icon: '⏳' },
    { label: 'Approved', value: stats.approved, color: 'success', icon: '✅' },
    { label: 'Rejected', value: stats.rejected, color: 'error', icon: '❌' },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Admin Overview</h1>
        <p className="text-muted text-sm mt-1">Manage deposits, wire transfer details, and crypto addresses.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(card => (
          <div key={card.label} className="glass-card rounded-2xl p-5 border border-white/5">
            <div className="text-2xl mb-2">{card.icon}</div>
            <div className="text-xs text-muted uppercase tracking-wider mb-1">{card.label}</div>
            <div className="text-3xl font-black">{loading ? '—' : card.value}</div>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/admin/deposits" className="glass-card rounded-2xl p-6 border border-white/5 hover:border-lime/20 transition-all group">
          <div className="text-3xl mb-3">💳</div>
          <h2 className="text-base font-bold group-hover:text-lime transition-colors">Review Deposits</h2>
          <p className="text-sm text-muted mt-1">
            {stats.pending > 0
              ? <span className="text-warning font-semibold">{stats.pending} pending deposit{stats.pending !== 1 ? 's' : ''} awaiting review</span>
              : 'No pending deposits'}
          </p>
        </Link>
        <Link href="/admin/settings" className="glass-card rounded-2xl p-6 border border-white/5 hover:border-lime/20 transition-all group">
          <div className="text-3xl mb-3">⚙️</div>
          <h2 className="text-base font-bold group-hover:text-lime transition-colors">Manage Settings</h2>
          <p className="text-sm text-muted mt-1">Edit wire transfer details and crypto deposit addresses</p>
        </Link>
      </div>
    </div>
  );
}
