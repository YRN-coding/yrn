'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface Deposit {
  id: string;
  userId: string;
  method: 'WIRE_TRANSFER' | 'CRYPTO';
  currency: string;
  amount: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  proofUrl: string | null;
  proofFileName: string | null;
  txHash: string | null;
  adminNotes: string | null;
  createdAt: string;
  user?: { email: string; kycTier: string };
}

type StatusFilter = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED';

export default function AdminDeposits() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [filter, setFilter] = useState<StatusFilter>('PENDING');
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<Deposit | null>(null);
  const [toast, setToast] = useState('');

  const fetchDeposits = () => {
    setLoading(true);
    const params = filter !== 'ALL' ? `?status=${filter}&limit=50` : '?limit=50';
    api.get(`/api/v1/deposits${params}`)
      .then(res => setDeposits(res.data?.data ?? []))
      .catch(() => setDeposits([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDeposits(); }, [filter]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleReview = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    setReviewing(id);
    try {
      await api.patch(`/api/v1/deposits/${id}`, { status, adminNotes: notes[id] || undefined });
      showToast(`Deposit ${status === 'APPROVED' ? 'approved' : 'rejected'} successfully`);
      setSelected(null);
      fetchDeposits();
    } catch {
      showToast('Action failed. Please try again.');
    } finally {
      setReviewing(null);
    }
  };

  const filters: StatusFilter[] = ['PENDING', 'APPROVED', 'REJECTED', 'ALL'];

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      PENDING: 'bg-warning/10 text-warning border-warning/20',
      APPROVED: 'bg-success/10 text-success border-success/20',
      REJECTED: 'bg-error/10 text-error border-error/20',
    };
    return `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${map[s] ?? ''}`;
  };

  const methodIcon = (m: string) => m === 'WIRE_TRANSFER' ? '🏦' : '₿';

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Deposit Requests</h1>
          <p className="text-muted text-sm mt-1">Review and approve or reject user deposit submissions</p>
        </div>
        <button onClick={fetchDeposits} className="px-4 py-2 rounded-xl border border-white/10 text-sm hover:border-lime/30 text-muted hover:text-white transition-all">
          ↻ Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 p-1 bg-white/[0.04] rounded-xl mb-6 w-fit">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              filter === f
                ? 'bg-lime/10 text-lime border border-lime/20'
                : 'text-muted hover:text-white'
            }`}
          >
            {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-20 text-muted">Loading deposits...</div>
      ) : deposits.length === 0 ? (
        <div className="text-center py-20 glass-card rounded-2xl border border-white/5">
          <div className="text-4xl mb-3">📭</div>
          <div className="text-muted">No {filter !== 'ALL' ? filter.toLowerCase() : ''} deposits found</div>
        </div>
      ) : (
        <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {['Method', 'User', 'Currency', 'Amount', 'Status', 'Date', 'Action'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs uppercase tracking-wider text-muted font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {deposits.map(d => (
                  <tr key={d.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-lg" title={d.method}>{methodIcon(d.method)}</span>
                    </td>
                    <td className="px-4 py-3 text-muted text-xs font-mono">
                      {d.user?.email ?? d.userId.slice(0, 8) + '...'}
                    </td>
                    <td className="px-4 py-3 font-semibold">{d.currency}</td>
                    <td className="px-4 py-3 font-mono">
                      {d.amount ? Number(d.amount).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={statusBadge(d.status)}>{d.status}</span>
                    </td>
                    <td className="px-4 py-3 text-muted text-xs">
                      {new Date(d.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelected(d)}
                        className="px-3 py-1.5 rounded-lg border border-white/10 text-xs hover:border-lime/30 hover:text-lime transition-all"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
          <div className="bg-navy-deep border border-white/10 rounded-2xl p-6 max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold">Review Deposit</h3>
              <button onClick={() => setSelected(null)} className="text-muted hover:text-white text-xl">×</button>
            </div>

            <div className="space-y-3 mb-5">
              {[
                { label: 'Method', value: selected.method.replace('_', ' ') },
                { label: 'Currency', value: selected.currency },
                { label: 'Amount', value: selected.amount ? `${Number(selected.amount).toLocaleString()} ${selected.currency}` : 'Not specified' },
                { label: 'Status', value: selected.status },
                { label: 'Submitted', value: new Date(selected.createdAt).toLocaleString() },
                ...(selected.txHash ? [{ label: 'TX Hash', value: selected.txHash }] : []),
              ].map(item => (
                <div key={item.label} className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-xs text-muted uppercase tracking-wider">{item.label}</span>
                  <span className="text-sm font-medium font-mono">{item.value}</span>
                </div>
              ))}
            </div>

            {/* Proof of Payment */}
            {selected.proofUrl && (
              <div className="mb-4 p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="text-xs text-muted mb-2 uppercase tracking-wider">Proof of Payment</div>
                <a
                  href={selected.proofUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-lime text-sm hover:underline"
                >
                  📄 {selected.proofFileName ?? 'View Proof'} ↗
                </a>
              </div>
            )}

            {/* Admin Notes */}
            <div className="mb-5">
              <label className="text-xs text-muted uppercase tracking-wider block mb-1.5">Admin Notes (optional)</label>
              <textarea
                value={notes[selected.id] ?? ''}
                onChange={e => setNotes(n => ({ ...n, [selected.id]: e.target.value }))}
                placeholder="Add notes for this review..."
                rows={3}
                className="w-full p-3 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-white resize-none focus:outline-none focus:border-lime/40"
              />
            </div>

            {selected.status === 'PENDING' && (
              <div className="flex gap-3">
                <button
                  onClick={() => handleReview(selected.id, 'APPROVED')}
                  disabled={reviewing === selected.id}
                  className="flex-1 py-3 rounded-xl bg-success/20 text-success border border-success/30 font-semibold text-sm hover:bg-success/30 transition-all disabled:opacity-50"
                >
                  ✓ Approve
                </button>
                <button
                  onClick={() => handleReview(selected.id, 'REJECTED')}
                  disabled={reviewing === selected.id}
                  className="flex-1 py-3 rounded-xl bg-error/20 text-error border border-error/30 font-semibold text-sm hover:bg-error/30 transition-all disabled:opacity-50"
                >
                  ✕ Reject
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-navy-deep border border-lime/20 text-lime px-5 py-3 rounded-xl text-sm font-semibold shadow-xl z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
