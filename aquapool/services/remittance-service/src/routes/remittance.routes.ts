import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import axios from 'axios';
import { emitRemittanceInitiated } from '../kafka/producer';

export const remittanceRouter = Router();

// Strict rate limit for remittance — max 10 transfers per hour per user
const remittanceLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  keyGenerator: (req) => (req.headers['x-user-id'] as string) ?? req.ip ?? 'unknown',
  message: { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Remittance rate limit exceeded. Max 10 transfers per hour.' } },
  standardHeaders: true,
  legacyHeaders: false,
});

interface FeeBreakdown {
  exchangeRate: number;
  networkFee: number;
  partnerFee: number;
  totalFee: number;
  recipientReceives: number;
  settlementTime: string;
}

const CORRIDORS = [
  { from: 'US', to: 'PH', fromCurrency: 'USD', toCurrency: 'PHP', minAmount: 10, maxAmount: 5000, settlementTime: '< 30 minutes' },
  { from: 'US', to: 'NG', fromCurrency: 'USD', toCurrency: 'NGN', minAmount: 10, maxAmount: 5000, settlementTime: '< 1 hour' },
  { from: 'US', to: 'BD', fromCurrency: 'USD', toCurrency: 'BDT', minAmount: 10, maxAmount: 5000, settlementTime: '< 30 minutes' },
  { from: 'GB', to: 'KE', fromCurrency: 'GBP', toCurrency: 'KES', minAmount: 10, maxAmount: 5000, settlementTime: '< 30 minutes' },
  { from: 'AE', to: 'IN', fromCurrency: 'AED', toCurrency: 'INR', minAmount: 50, maxAmount: 10000, settlementTime: '< 1 hour' },
];

// POST /quote
remittanceRouter.post('/quote', async (req: Request, res: Response) => {
  const { fromCurrency, toCurrency, amount } = req.body as { fromCurrency: string; toCurrency: string; amount: number };

  if (!fromCurrency || !toCurrency || !amount) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'fromCurrency, toCurrency, amount required' } });
    return;
  }

  // Fetch FX rate (in production use a dedicated FX provider)
  let exchangeRate = 1;
  try {
    const fx = await axios.get<{ rates: Record<string, number> }>(
      `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`
    );
    exchangeRate = fx.data.rates[toCurrency] ?? 1;
  } catch {
    exchangeRate = toCurrency === 'PHP' ? 56.5 : toCurrency === 'NGN' ? 1600 : 1;
  }

  const fees: FeeBreakdown = {
    exchangeRate,
    networkFee: 0.50,
    partnerFee: amount * 0.005,
    totalFee: 0.50 + amount * 0.005,
    recipientReceives: (amount - 0.50 - amount * 0.005) * exchangeRate,
    settlementTime: '< 30 minutes',
  };

  res.json({ success: true, data: { fromCurrency, toCurrency, sendAmount: amount, ...fees } });
});

// POST /send
remittanceRouter.post('/send', remittanceLimiter, async (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string;
  if (!userId) { res.status(401).json({ success: false }); return; }

  const { fromCurrency, toCurrency, amount, recipientPhone } = req.body as {
    fromCurrency: string; toCurrency: string; amount: number; recipientPhone: string;
  };

  if (!fromCurrency || !toCurrency || !amount || !recipientPhone) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'All fields required' } });
    return;
  }

  const transferId = `TXF-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  void emitRemittanceInitiated(userId, transferId, fromCurrency, toCurrency, amount);
  res.status(201).json({
    success: true,
    data: {
      transferId,
      status: 'PENDING',
      fromCurrency,
      toCurrency,
      amount,
      recipientPhone,
      estimatedSettlement: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    },
  });
});

// GET /corridors
remittanceRouter.get('/corridors', (_req: Request, res: Response) => {
  res.json({ success: true, data: CORRIDORS });
});

// GET /transfers
remittanceRouter.get('/transfers', async (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string;
  if (!userId) { res.status(401).json({ success: false }); return; }
  // TODO: fetch from DB
  res.json({ success: true, data: [] });
});
