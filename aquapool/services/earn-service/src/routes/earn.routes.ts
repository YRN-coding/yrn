import { Router, Request, Response } from 'express';
import { getAaveReserveData } from '../services/aave.service';
import { getLidoApy } from '../services/lido.service';
import { emitEarnDeposit } from '../kafka/producer';

export const earnRouter = Router();

const PRODUCTS = [
  { id: 'aave-usdc-eth', protocol: 'AAVE', network: 'ETHEREUM', asset: 'USDC', riskTier: 'LOW', contractAddress: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2' },
  { id: 'aave-eth-polygon', protocol: 'AAVE', network: 'POLYGON', asset: 'USDC', riskTier: 'LOW', contractAddress: '0x794a61358D6845594F94dc1DB02A252b5b4814aD' },
  { id: 'lido-steth', protocol: 'LIDO', network: 'ETHEREUM', asset: 'ETH', riskTier: 'MEDIUM', contractAddress: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84' },
  { id: 'compound-usdc', protocol: 'COMPOUND', network: 'ETHEREUM', asset: 'USDC', riskTier: 'LOW', contractAddress: '0xc3d688B66703497DAA19211EEdff47f25384cdc3' },
];

// GET /products
earnRouter.get('/products', async (_req: Request, res: Response) => {
  try {
    const [aaveData, lidoApy] = await Promise.allSettled([
      getAaveReserveData('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'),
      getLidoApy(),
    ]);

    const products = PRODUCTS.map((p) => ({
      ...p,
      apy: p.protocol === 'LIDO' && lidoApy.status === 'fulfilled'
        ? lidoApy.value
        : aaveData.status === 'fulfilled' ? aaveData.value.liquidityRate : null,
    }));

    res.json({ success: true, data: products });
  } catch {
    res.json({ success: true, data: PRODUCTS });
  }
});

// GET /products/:productId
earnRouter.get('/products/:productId', async (req: Request, res: Response) => {
  const product = PRODUCTS.find((p) => p.id === req.params['productId']);
  if (!product) { res.status(404).json({ success: false }); return; }
  res.json({ success: true, data: product });
});

// POST /positions
earnRouter.post('/positions', async (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string;
  if (!userId) { res.status(401).json({ success: false }); return; }

  const { productId, amount, walletId } = req.body as { productId: string; amount: string; walletId: string };
  if (!productId || !amount || !walletId) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'productId, amount, walletId required' } });
    return;
  }

  const product = PRODUCTS.find((p) => p.id === productId);
  if (!product) { res.status(404).json({ success: false }); return; }

  void emitEarnDeposit(userId, productId, amount, walletId);
  res.status(201).json({
    success: true,
    data: {
      positionId: `pos-${Date.now()}`,
      userId, productId, amount, walletId,
      status: 'PENDING',
      message: 'Deposit transaction prepared. Sign and broadcast via wallet-service.',
    },
  });
});

// GET /positions
earnRouter.get('/positions', async (req: Request, res: Response) => {
  const userId = req.headers['x-user-id'] as string;
  if (!userId) { res.status(401).json({ success: false }); return; }
  // TODO: fetch from DB
  res.json({ success: true, data: [] });
});
