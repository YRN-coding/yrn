'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface CryptoAddress {
  symbol: string;
  name: string;
  network: string;
  address: string;
}

interface WireDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  routingNumber: string;
  swiftCode: string;
  bankAddress: string;
  reference: string;
}

const DEFAULT_CRYPTO: CryptoAddress[] = [
  { symbol: 'BTC', name: 'Bitcoin', network: 'Bitcoin', address: '' },
  { symbol: 'ETH', name: 'Ethereum', network: 'Ethereum (ERC-20)', address: '' },
  { symbol: 'USDT', name: 'Tether', network: 'Ethereum (ERC-20)', address: '' },
  { symbol: 'SOL', name: 'Solana', network: 'Solana', address: '' },
  { symbol: 'BNB', name: 'BNB', network: 'BNB Smart Chain (BEP-20)', address: '' },
  { symbol: 'XRP', name: 'XRP', network: 'XRP Ledger', address: '' },
];

const DEFAULT_WIRE: WireDetails = {
  bankName: '',
  accountName: '',
  accountNumber: '',
  routingNumber: '',
  swiftCode: '',
  bankAddress: '',
  reference: '',
};

type ActiveTab = 'wire' | 'crypto';

export default function AdminSettings() {
  const [tab, setTab] = useState<ActiveTab>('wire');
  const [wire, setWire] = useState<WireDetails>(DEFAULT_WIRE);
  const [crypto, setCrypto] = useState<CryptoAddress[]>(DEFAULT_CRYPTO);
  const [savingWire, setSavingWire] = useState(false);
  const [savingCrypto, setSavingCrypto] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    api.get('/api/v1/deposits/config/wire_details')
      .then(res => { if (res.data?.data?.value) setWire(res.data.data.value); })
      .catch(() => {});

    api.get('/api/v1/deposits/config/crypto_addresses')
      .then(res => { if (res.data?.data?.value) setCrypto(res.data.data.value); })
      .catch(() => {});
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const saveWire = async () => {
    setSavingWire(true);
    try {
      await api.put('/api/v1/deposits/config/wire_details', { value: wire });
      showToast('Wire transfer details saved!');
    } catch {
      showToast('Save failed. Please try again.');
    } finally {
      setSavingWire(false);
    }
  };

  const saveCrypto = async () => {
    setSavingCrypto(true);
    try {
      await api.put('/api/v1/deposits/config/crypto_addresses', { value: crypto });
      showToast('Crypto deposit addresses saved!');
    } catch {
      showToast('Save failed. Please try again.');
    } finally {
      setSavingCrypto(false);
    }
  };

  const updateCrypto = (index: number, field: keyof CryptoAddress, value: string) => {
    setCrypto(prev => prev.map((c, i) => i === index ? { ...c, [field]: value } : c));
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted text-sm mt-1">Manage deposit configuration shown to users</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-white/[0.04] rounded-xl mb-8 w-fit">
        <button
          onClick={() => setTab('wire')}
          className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            tab === 'wire' ? 'bg-lime/10 text-lime border border-lime/20' : 'text-muted hover:text-white'
          }`}
        >
          🏦 Wire Transfer
        </button>
        <button
          onClick={() => setTab('crypto')}
          className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            tab === 'crypto' ? 'bg-lime/10 text-lime border border-lime/20' : 'text-muted hover:text-white'
          }`}
        >
          ₿ Crypto Addresses
        </button>
      </div>

      {/* Wire Transfer Settings */}
      {tab === 'wire' && (
        <div className="glass-card rounded-2xl border border-white/5 p-6">
          <h2 className="text-base font-semibold mb-1">Wire Transfer Details</h2>
          <p className="text-xs text-muted mb-6">
            These details will be shown to users when they select wire transfer as their deposit method.
          </p>

          <div className="space-y-4">
            {([
              { field: 'bankName', label: 'Bank Name', placeholder: 'e.g. JPMorgan Chase' },
              { field: 'accountName', label: 'Account Name', placeholder: 'e.g. Aquapool Technologies Ltd' },
              { field: 'accountNumber', label: 'Account Number', placeholder: 'e.g. 123456789' },
              { field: 'routingNumber', label: 'Routing Number (ABA)', placeholder: 'e.g. 021000021' },
              { field: 'swiftCode', label: 'SWIFT / BIC Code', placeholder: 'e.g. CHASUS33' },
              { field: 'bankAddress', label: 'Bank Address', placeholder: 'e.g. 270 Park Avenue, New York, NY 10017' },
              { field: 'reference', label: 'Payment Reference', placeholder: 'e.g. AQUAPOOL-{USER_ID}' },
            ] as { field: keyof WireDetails; label: string; placeholder: string }[]).map(item => (
              <div key={item.field}>
                <label className="text-xs text-muted block mb-1.5 uppercase tracking-wider">{item.label}</label>
                <input
                  type="text"
                  value={wire[item.field]}
                  onChange={e => setWire(w => ({ ...w, [item.field]: e.target.value }))}
                  placeholder={item.placeholder}
                  className="w-full p-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm focus:outline-none focus:border-lime/40 transition-colors"
                />
              </div>
            ))}
          </div>

          <div className="mt-6 pt-5 border-t border-white/5 flex justify-end">
            <button
              onClick={saveWire}
              disabled={savingWire}
              className="px-8 py-3 rounded-xl bg-lime text-dark font-bold text-sm hover:bg-lime-bright transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {savingWire ? (
                <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>Saving...</>
              ) : 'Save Wire Details'}
            </button>
          </div>
        </div>
      )}

      {/* Crypto Address Settings */}
      {tab === 'crypto' && (
        <div className="glass-card rounded-2xl border border-white/5 p-6">
          <h2 className="text-base font-semibold mb-1">Crypto Deposit Addresses</h2>
          <p className="text-xs text-muted mb-6">
            Set the deposit address for each cryptocurrency. Users will send funds to these addresses.
            Leave blank to hide a currency from the deposit screen.
          </p>

          <div className="space-y-5">
            {crypto.map((c, idx) => (
              <div key={c.symbol} className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs">
                    {c.symbol.slice(0, 2)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{c.name} ({c.symbol})</div>
                    <div className="text-xs text-muted">{c.network}</div>
                  </div>
                  <span className={`ml-auto text-xs font-semibold px-2 py-1 rounded-lg ${
                    c.address ? 'bg-success/10 text-success' : 'bg-white/5 text-muted'
                  }`}>
                    {c.address ? 'Active' : 'Not Set'}
                  </span>
                </div>
                <div>
                  <label className="text-xs text-muted block mb-1">Deposit Address</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={c.address}
                      onChange={e => updateCrypto(idx, 'address', e.target.value)}
                      placeholder={`Enter ${c.symbol} deposit address...`}
                      className="flex-1 p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm font-mono focus:outline-none focus:border-lime/40 transition-colors"
                    />
                    {c.address && (
                      <button
                        onClick={() => updateCrypto(idx, 'address', '')}
                        className="px-3 py-2 rounded-xl border border-error/20 text-error text-xs hover:bg-error/10 transition-all"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-5 border-t border-white/5 flex justify-end">
            <button
              onClick={saveCrypto}
              disabled={savingCrypto}
              className="px-8 py-3 rounded-xl bg-lime text-dark font-bold text-sm hover:bg-lime-bright transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {savingCrypto ? (
                <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>Saving...</>
              ) : 'Save Crypto Addresses'}
            </button>
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
