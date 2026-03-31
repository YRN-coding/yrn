import { Router, Request, Response } from 'express';
import { prisma } from '@aquapool/database';
import { Network, WalletType, TransactionStatus } from '@aquapool/shared';
import { getEthereumBalance } from '../services/ethereum.service';
import { emitTransactionInitiated } from '../kafka/producer';
import { verifyEip712Signature } from '../middleware/eip712.middleware';

export const walletRouter = Router();

function getUserId(req: Request): string | undefined {
  const val = req.headers['x-user-id'];
  return Array.isArray(val) ? val[0] : val;
}

// POST / — create wallet
walletRouter.post('/', async (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) { res.status(401).json({ success: false }); return; }

  const { network, type = WalletType.MANAGED } = req.body as { network: Network; type?: WalletType };

  const existing = await prisma.wallet.findFirst({ where: { userId, network } });
  if (existing) {
    res.status(409).json({ success: false, error: { code: 'CONFLICT', message: 'Wallet already exists for this network' } });
    return;
  }

  // In production: call MPC vault to derive address
  const mockAddress = `0x${Buffer.from(userId + network).toString('hex').slice(0, 40)}`;

  const wallet = await prisma.wallet.create({
    data: { userId, network, type, address: mockAddress, isDefault: true },
  });

  res.status(201).json({ success: true, data: wallet });
});

// GET / — list wallets
walletRouter.get('/', async (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) { res.status(401).json({ success: false }); return; }

  const wallets = await prisma.wallet.findMany({ where: { userId }, include: { balances: true } });
  res.json({ success: true, data: wallets });
});

// GET /:walletId — get wallet
walletRouter.get('/:walletId', async (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) { res.status(401).json({ success: false }); return; }

  const wallet = await prisma.wallet.findFirst({
    where: { id: req.params['walletId'] as string, userId },
    include: { balances: { include: { asset: true } } },
  });

  if (!wallet) { res.status(404).json({ success: false }); return; }
  res.json({ success: true, data: wallet });
});

// GET /:walletId/balances
walletRouter.get('/:walletId/balances', async (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) { res.status(401).json({ success: false }); return; }

  const wallet = await prisma.wallet.findFirst({ where: { id: req.params['walletId'] as string, userId } });
  if (!wallet) { res.status(404).json({ success: false }); return; }

  let onChainBalance = '0';
  if (wallet.network === Network.ETHEREUM) {
    onChainBalance = await getEthereumBalance(wallet.address).catch(() => '0');
  }

  res.json({ success: true, data: { walletId: wallet.id, address: wallet.address, network: wallet.network, nativeBalance: onChainBalance } });
});

// POST /:walletId/send
walletRouter.post('/:walletId/send', verifyEip712Signature, async (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) { res.status(401).json({ success: false }); return; }

  const { toAddress, amount, assetSymbol, memo } = req.body as {
    toAddress: string; amount: string; assetSymbol: string; memo?: string;
  };

  if (!toAddress || !amount || !assetSymbol) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'toAddress, amount, assetSymbol required' } });
    return;
  }

  const wallet = await prisma.wallet.findFirst({ where: { id: req.params['walletId'] as string, userId } });
  if (!wallet) { res.status(404).json({ success: false }); return; }

  // Look up or create an asset record for the given symbol
  const asset = await prisma.asset.findFirst({ where: { symbol: assetSymbol } })
    ?? await prisma.asset.create({
      data: { symbol: assetSymbol, name: assetSymbol, type: 'CRYPTO', network: wallet.network },
    });

  const tx = await prisma.transaction.create({
    data: {
      userId,
      fromWalletId: wallet.id,
      assetId: asset.id,
      amount,
      network: wallet.network,
      status: TransactionStatus.PENDING,
      metadata: { toAddress, ...(memo && { memo }) },
    },
  });

  void emitTransactionInitiated(userId, tx.id, toAddress, amount, wallet.network);
  res.status(201).json({ success: true, data: tx });
});

// GET /:walletId/transactions
walletRouter.get('/:walletId/transactions', async (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) { res.status(401).json({ success: false }); return; }

  const page = parseInt(req.query['page'] as string ?? '1', 10);
  const limit = parseInt(req.query['limit'] as string ?? '20', 10);

  const [txs, total] = await Promise.all([
    prisma.transaction.findMany({
      where: { fromWalletId: req.params['walletId'] as string, userId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.transaction.count({ where: { fromWalletId: req.params['walletId'] as string, userId } }),
  ]);

  res.json({ success: true, data: txs, meta: { page, limit, total, hasMore: page * limit < total } });
});
