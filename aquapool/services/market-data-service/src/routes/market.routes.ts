import { Router, Request, Response } from 'express';
import { getTop100, getQuotes } from '../services/coinmarketcap.service';

export const marketRouter = Router();

// GET /top — top 100 by market cap
marketRouter.get('/top', async (_req: Request, res: Response) => {
  try {
    const coins = await getTop100();
    res.json({ success: true, data: coins });
  } catch (err) {
    res.status(502).json({ success: false, error: { code: 'EXTERNAL_SERVICE_ERROR', message: 'Failed to fetch market data' } });
  }
});

// GET /assets/:symbol — single asset
marketRouter.get('/assets/:symbol', async (req: Request, res: Response) => {
  try {
    const sym = Array.isArray(req.params['symbol']) ? req.params['symbol'][0] : req.params['symbol'];
    const quotes = await getQuotes([(sym ?? '').toUpperCase()]);
    const asset = Object.values(quotes)[0];
    if (!asset) { res.status(404).json({ success: false }); return; }
    res.json({ success: true, data: asset });
  } catch {
    res.status(502).json({ success: false, error: { code: 'EXTERNAL_SERVICE_ERROR', message: 'Failed to fetch asset' } });
  }
});

// GET /assets — all supported assets with prices
marketRouter.get('/assets', async (req: Request, res: Response) => {
  const { symbols } = req.query as { symbols?: string };
  const symbolList = symbols ? symbols.split(',') : [];
  try {
    const quotes = symbolList.length > 0 ? await getQuotes(symbolList) : await getTop100();
    res.json({ success: true, data: quotes });
  } catch {
    res.status(502).json({ success: false, error: { code: 'EXTERNAL_SERVICE_ERROR', message: 'Failed to fetch assets' } });
  }
});
