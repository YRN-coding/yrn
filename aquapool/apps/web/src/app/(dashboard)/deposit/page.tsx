'use client';

import { useState, useEffect, useCallback } from 'react';
import { useMarketData } from '@/lib/useMarketData';
import { uploadDepositProof } from '@/lib/supabase';
import api from '@/lib/api';

// ─── Types ───
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

type Tab = 'crypto' | 'wire';

// ─── Default configs (before admin sets them) ───
const DEFAULT_CRYPTO_ADDRESSES: CryptoAddress[] = [
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

export default function DepositPage() {
  const [tab, setTab] = useState<Tab>('crypto');
  const [cryptoAddresses, setCryptoAddresses] = useState<CryptoAddress[]>(DEFAULT_CRYPTO_ADDRESSES);
  const [wireDetails, setWireDetails] = useState<WireDetails>(DEFAULT_WIRE);
  const [selectedCrypto, setSelectedCrypto] = useState<string>('BTC');

  // Wire transfer form state
  const [wireAmount, setWireAmount] = useState('');
  const [wireCurrency, setWireCurrency] = useState('USD');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Crypto deposit form state
  const [cryptoAmount, setCryptoAmount] = useState('');
  const [cryptoTxHash, setCryptoTxHash] = useState('');
  const [showCryptoSuccess, setShowCryptoSuccess] = useState(false);

  const [copied, setCopied] = useState(false);
  const [copiedWire, setCopiedWire] = useState('');

  // Live market data
  const { assets } = useMarketData();

  // Load config from backend
  useEffect(() => {
    api.get('/api/v1/deposits/config/crypto_addresses')
      .then(res => {
        if (res.data?.data?.value) setCryptoAddresses(res.data.data.value);
      })
      .catch(() => {});

    api.get('/api/v1/deposits/config/wire_details')
      .then(res => {
        if (res.data?.data?.value) setWireDetails(res.data.data.value);
      })
      .catch(() => {});
  }, []);

  const selectedAddress = cryptoAddresses.find(c => c.symbol === selectedCrypto);
  const selectedPrice = assets?.find((a: { symbol: string }) => a.symbol === selectedCrypto);

  const copyToClipboard = useCallback((text: string, field?: string) => {
    navigator.clipboard.writeText(text);
    if (field) {
      setCopiedWire(field);
      setTimeout(() => setCopiedWire(''), 2000);
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, []);

  // ─── Wire Transfer Submit ───
  const handleWireSubmit = async () => {
    if (!proofFile || !wireAmount) return;
    setUploading(true);
    try {
      const userId = 'user-placeholder'; // Will be replaced by real auth
      const { url, fileName } = await uploadDepositProof(userId, proofFile);

      await api.post('/api/v1/deposits/wire', {
        currency: wireCurrency,
        amount: parseFloat(wireAmount),
        proofUrl: url,
        proofFileName: fileName,
      });

      setShowSuccess(true);
      setProofFile(null);
      setWireAmount('');
    } catch (err) {
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // ─── Crypto Deposit Submit ───
  const handleCryptoSubmit = async () => {
    if (!cryptoAmount) return;
    try {
      await api.post('/api/v1/deposits/crypto', {
        currency: selectedCrypto,
        amount: parseFloat(cryptoAmount),
        txHash: cryptoTxHash || undefined,
      });

      setShowCryptoSuccess(true);
      setCryptoAmount('');
      setCryptoTxHash('');
    } catch {
      alert('Submission failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Deposit Funds</h1>
        <p className="text-muted text-sm">Fund your Aquapool wallet via crypto or wire transfer</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-white/[0.04] rounded-xl mb-8 w-fit">
        <button
          onClick={() => setTab('crypto')}
          className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            tab === 'crypto'
              ? 'bg-lime/10 text-lime border border-lime/20'
              : 'text-muted hover:text-white'
          }`}
        >
          Crypto Deposit
        </button>
        <button
          onClick={() => setTab('wire')}
          className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            tab === 'wire'
              ? 'bg-lime/10 text-lime border border-lime/20'
              : 'text-muted hover:text-white'
          }`}
        >
          Wire Transfer
        </button>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* CRYPTO DEPOSIT TAB */}
      {/* ═══════════════════════════════════════════ */}
      {tab === 'crypto' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Select Currency */}
          <div className="glass-card p-6 rounded-2xl border border-white/5">
            <h2 className="text-base font-semibold mb-4">Select Currency</h2>
            <div className="grid grid-cols-2 gap-3">
              {cryptoAddresses.map(c => {
                const price = assets?.find((a: { symbol: string }) => a.symbol === c.symbol);
                return (
                  <button
                    key={c.symbol}
                    onClick={() => setSelectedCrypto(c.symbol)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                      selectedCrypto === c.symbol
                        ? 'border-lime/30 bg-lime/5'
                        : 'border-white/5 hover:border-white/10 bg-white/[0.02]'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs">
                      {c.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{c.symbol}</div>
                      <div className="text-xs text-muted">
                        {price ? `$${Number(price.price).toLocaleString('en-US', { maximumFractionDigits: 2 })}` : c.name}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Live Price Banner */}
            {selectedPrice && (
              <div className="mt-4 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted">Live Price</span>
                  <span className="text-xs font-mono text-lime">LIVE</span>
                </div>
                <div className="text-xl font-bold mt-1">
                  ${Number(selectedPrice.price).toLocaleString('en-US', { maximumFractionDigits: 2 })}
                </div>
                <div className={`text-xs font-semibold mt-0.5 ${
                  Number(selectedPrice.change24h) >= 0 ? 'text-success' : 'text-error'
                }`}>
                  {Number(selectedPrice.change24h) >= 0 ? '+' : ''}{Number(selectedPrice.change24h).toFixed(2)}% (24h)
                </div>
              </div>
            )}
          </div>

          {/* Right: Deposit Address */}
          <div className="glass-card p-6 rounded-2xl border border-white/5">
            <h2 className="text-base font-semibold mb-2">Deposit {selectedCrypto}</h2>
            <p className="text-xs text-muted mb-4">
              Send only <span className="text-lime font-semibold">{selectedCrypto}</span> on the <span className="font-semibold text-white">{selectedAddress?.network}</span> network to this address.
            </p>

            {selectedAddress?.address ? (
              <>
                {/* QR Code placeholder */}
                <div className="w-40 h-40 mx-auto bg-white rounded-xl p-2 mb-4 flex items-center justify-center">
                  <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMCAyMCI+PHJlY3QgZmlsbD0iIzAwMCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIi8+PHRleHQgZmlsbD0id2hpdGUiIHg9IjEwIiB5PSIxMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9ImNlbnRyYWwiIGZvbnQtc2l6ZT0iMyI+UVI8L3RleHQ+PC9zdmc+')] bg-cover rounded-lg" />
                </div>

                {/* Address */}
                <div className="bg-navy-mid rounded-xl p-4 mb-4">
                  <div className="text-xs text-muted mb-1">Deposit Address</div>
                  <div className="flex items-center gap-2">
                    <code className="text-xs font-mono text-white break-all flex-1">{selectedAddress.address}</code>
                    <button
                      onClick={() => copyToClipboard(selectedAddress.address)}
                      className="px-3 py-1.5 rounded-lg bg-lime/10 text-lime text-xs font-semibold hover:bg-lime/20 transition-all shrink-0"
                    >
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                {/* Notify form */}
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted block mb-1">Amount Sent</label>
                    <input
                      type="number"
                      value={cryptoAmount}
                      onChange={e => setCryptoAmount(e.target.value)}
                      placeholder={`0.00 ${selectedCrypto}`}
                      className="w-full p-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm font-mono focus:outline-none focus:border-lime/40"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted block mb-1">Transaction Hash (optional)</label>
                    <input
                      type="text"
                      value={cryptoTxHash}
                      onChange={e => setCryptoTxHash(e.target.value)}
                      placeholder="0x..."
                      className="w-full p-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm font-mono focus:outline-none focus:border-lime/40"
                    />
                  </div>
                  <button
                    onClick={handleCryptoSubmit}
                    disabled={!cryptoAmount}
                    className="w-full py-3 rounded-xl bg-lime text-dark font-bold text-sm hover:bg-lime-bright transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    I Have Sent {selectedCrypto}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">⚙️</div>
                <p className="text-sm text-muted">Deposit address not configured yet.</p>
                <p className="text-xs text-muted mt-1">Please contact support or check back later.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════ */}
      {/* WIRE TRANSFER TAB */}
      {/* ═══════════════════════════════════════════ */}
      {tab === 'wire' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Wire Details */}
          <div className="glass-card p-6 rounded-2xl border border-white/5">
            <h2 className="text-base font-semibold mb-2">Wire Transfer Details</h2>
            <p className="text-xs text-muted mb-5">
              Copy the following wire transfer details, go to your bank mobile app or branch and make payment, then come back and upload proof of payment for review.
            </p>

            {wireDetails.bankName ? (
              <div className="space-y-3">
                {[
                  { label: 'Bank Name', value: wireDetails.bankName, key: 'bankName' },
                  { label: 'Account Name', value: wireDetails.accountName, key: 'accountName' },
                  { label: 'Account Number', value: wireDetails.accountNumber, key: 'accountNumber' },
                  { label: 'Routing Number', value: wireDetails.routingNumber, key: 'routingNumber' },
                  { label: 'SWIFT/BIC Code', value: wireDetails.swiftCode, key: 'swiftCode' },
                  { label: 'Bank Address', value: wireDetails.bankAddress, key: 'bankAddress' },
                  { label: 'Reference', value: wireDetails.reference, key: 'reference' },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5">
                    <div>
                      <div className="text-[11px] text-muted uppercase tracking-wider">{item.label}</div>
                      <div className="text-sm font-medium mt-0.5">{item.value || '—'}</div>
                    </div>
                    {item.value && (
                      <button
                        onClick={() => copyToClipboard(item.value, item.key)}
                        className="px-2.5 py-1 rounded-lg bg-white/5 text-xs font-semibold hover:bg-white/10 transition-all"
                      >
                        {copiedWire === item.key ? '✓' : 'Copy'}
                      </button>
                    )}
                  </div>
                ))}

                <button
                  onClick={() => {
                    const all = Object.entries(wireDetails)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join('\n');
                    copyToClipboard(all, 'all');
                  }}
                  className="w-full py-2.5 rounded-xl border border-lime/20 text-lime text-sm font-semibold hover:bg-lime/5 transition-all"
                >
                  {copiedWire === 'all' ? '✓ Copied All Details' : 'Copy All Details'}
                </button>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">🏦</div>
                <p className="text-sm text-muted">Wire transfer details not configured yet.</p>
                <p className="text-xs text-muted mt-1">Please contact support.</p>
              </div>
            )}
          </div>

          {/* Right: Upload Proof */}
          <div className="glass-card p-6 rounded-2xl border border-white/5">
            <h2 className="text-base font-semibold mb-2">Upload Proof of Payment</h2>
            <p className="text-xs text-muted mb-5">
              After making payment, upload your wire transfer deposit slip below for review.
            </p>

            <div className="space-y-4">
              {/* Amount */}
              <div>
                <label className="text-xs text-muted block mb-1">Amount Deposited</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={wireAmount}
                    onChange={e => setWireAmount(e.target.value)}
                    placeholder="0.00"
                    className="flex-1 p-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm font-mono focus:outline-none focus:border-lime/40"
                  />
                  <select
                    value={wireCurrency}
                    onChange={e => setWireCurrency(e.target.value)}
                    className="px-3 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm focus:outline-none focus:border-lime/40"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="NGN">NGN</option>
                  </select>
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="text-xs text-muted block mb-1">Deposit Slip / Proof of Payment</label>
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer hover:border-lime/30 hover:bg-lime/[0.02] ${
                    proofFile ? 'border-lime/20 bg-lime/[0.03]' : 'border-white/10'
                  }`}
                  onClick={() => document.getElementById('proof-upload')?.click()}
                >
                  {proofFile ? (
                    <div>
                      <div className="text-2xl mb-2">📄</div>
                      <div className="text-sm font-semibold text-lime">{proofFile.name}</div>
                      <div className="text-xs text-muted mt-1">
                        {(proofFile.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); setProofFile(null); }}
                        className="text-xs text-error mt-2 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="text-3xl mb-2">📎</div>
                      <div className="text-sm text-muted">Click to upload deposit slip</div>
                      <div className="text-xs text-muted mt-1">JPG, PNG, PDF — Max 10MB</div>
                    </div>
                  )}
                </div>
                <input
                  id="proof-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file && file.size <= 10 * 1024 * 1024) {
                      setProofFile(file);
                    } else if (file) {
                      alert('File is too large. Maximum 10MB allowed.');
                    }
                  }}
                />
              </div>

              {/* I Have Paid Button */}
              <button
                onClick={handleWireSubmit}
                disabled={!proofFile || !wireAmount || uploading}
                className="w-full py-3.5 rounded-xl bg-lime text-dark font-bold text-sm hover:bg-lime-bright transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Uploading...
                  </>
                ) : (
                  'I Have Paid'
                )}
              </button>

              <p className="text-xs text-muted text-center">
                By clicking &quot;I Have Paid&quot;, your deposit will be submitted for admin review.
                You will be notified once your deposit is approved.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════ */}
      {/* SUCCESS MODALS */}
      {/* ═══════════════════════════════════════════ */}

      {/* Wire Transfer Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowSuccess(false)}>
          <div
            className="bg-navy-deep border border-lime/20 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-16 h-16 rounded-full bg-lime/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Deposit Submitted!</h3>
            <p className="text-sm text-muted mb-6">
              Your deposit is now <span className="text-warning font-semibold">pending review</span>.
              You will be notified after your deposit has been reviewed and approved by our team.
            </p>
            <button
              onClick={() => setShowSuccess(false)}
              className="w-full py-3 rounded-xl bg-lime text-dark font-bold text-sm hover:bg-lime-bright transition-all"
            >
              Got It
            </button>
          </div>
        </div>
      )}

      {/* Crypto Deposit Success Modal */}
      {showCryptoSuccess && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowCryptoSuccess(false)}>
          <div
            className="bg-navy-deep border border-lime/20 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-16 h-16 rounded-full bg-lime/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Deposit Submitted!</h3>
            <p className="text-sm text-muted mb-6">
              Your {selectedCrypto} deposit is now <span className="text-warning font-semibold">pending review</span>.
              You will be notified once the transaction has been verified on-chain and your account credited.
            </p>
            <button
              onClick={() => setShowCryptoSuccess(false)}
              className="w-full py-3 rounded-xl bg-lime text-dark font-bold text-sm hover:bg-lime-bright transition-all"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
