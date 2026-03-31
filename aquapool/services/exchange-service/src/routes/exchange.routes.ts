import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { getSwapQuote } from '../services/dex-aggregator.service';
import { placeOrder, cancelOrder } from '../services/tradfi.service';
import { prisma } from '@aquapool/database';
import { OrderSide, OrderType } from '@aquapool/shared';
import { emitOrderCreated } from '../kafka/producer';

export const exchangeRouter = Router();

// Per-user rate limiter for market data / reads (100 req / 15 min per user)
const financialOperationsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  keyGenerator: (req) => (req.headers['x-user-id'] as string) ?? req.ip ?? 'unknown',
  message: { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests, please try again later' } },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limiter for order placement (20 orders / 15 min per user)
const orderPlacementLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  keyGenerator: (req) => (req.headers['x-user-id'] as string) ?? req.ip ?? 'unknown',
  message: { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Order placement rate limit exceeded' } },
  standardHeaders: true,
  legacyHeaders: false,
});

function getUserId(req: Request): string | undefined {
  return req.headers['x-user-id'] as string | undefined;
}

// GET /quote
exchangeRouter.get('/quote', financialOperationsLimiter, async (req: Request, res: Response) => {
  const { fromAsset, toAsset, amount, chainId } = req.query as Record<string, string>;
  if (!fromAsset || !toAsset || !amount) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'fromAsset, toAsset, amount required' } });
    return;
  }
  try {
    const quote = await getSwapQuote(fromAsset, toAsset, amount, parseInt(chainId ?? '1', 10));
    res.json({ success: true, data: quote });
  } catch (err) {
    res.status(502).json({ success: false, error: { code: 'QUOTE_FAILED', message: String(err) } });
  }
});

// POST /order
exchangeRouter.post('/order', orderPlacementLimiter, async (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) { res.status(401).json({ success: false }); return; }

  const { assetId, symbol, side, type, quantity, limitPrice } = req.body as {
    assetId?: string; symbol?: string; side: OrderSide; type: OrderType;
    quantity: string; limitPrice?: number;
  };

  if (!symbol || !side || !type || !quantity) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'symbol, side, type, quantity required' } });
    return;
  }

  try {
    const brokerOrder = await placeOrder(symbol, quantity, side, type, limitPrice);
    const order = await prisma.order.create({
      data: {
        userId,
        assetId: assetId ?? symbol,
        side,
        type,
        status: 'PENDING',
        quantity,
        filledQuantity: '0',
        limitPrice: limitPrice ?? null,
        externalOrderId: brokerOrder.id,
      },
    });
    void emitOrderCreated(userId, order.id, symbol, side, quantity);
    res.status(201).json({ success: true, data: order });
  } catch (err) {
    res.status(502).json({ success: false, error: { code: 'ORDER_FAILED', message: String(err) } });
  }
});

// GET /orders
exchangeRouter.get('/orders', financialOperationsLimiter, async (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) { res.status(401).json({ success: false }); return; }

  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  res.json({ success: true, data: orders });
});

// GET /orders/:orderId
exchangeRouter.get('/orders/:orderId', async (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) { res.status(401).json({ success: false }); return; }

  const order = await prisma.order.findFirst({ where: { id: req.params['orderId'] as string, userId } });
  if (!order) { res.status(404).json({ success: false }); return; }
  res.json({ success: true, data: order });
});

// DELETE /orders/:orderId
exchangeRouter.delete('/orders/:orderId', async (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) { res.status(401).json({ success: false }); return; }

  const order = await prisma.order.findFirst({ where: { id: req.params['orderId'] as string, userId } });
  if (!order) { res.status(404).json({ success: false }); return; }
  if (order.externalOrderId) await cancelOrder(order.externalOrderId);

  await prisma.order.update({ where: { id: order.id }, data: { status: 'CANCELLED' } });
  res.json({ success: true, data: { message: 'Order cancelled' } });
});
