import { Router, Request, Response } from 'express';
import { prisma } from '@aquapool/database';

export const depositRouter = Router();

function getUserId(req: Request): string | undefined {
  const val = req.headers['x-user-id'];
  return Array.isArray(val) ? val[0] : val;
}

function isAdmin(req: Request): boolean {
  return req.headers['x-user-role'] === 'admin';
}

// ─── User Routes ───

// POST /deposits/wire — submit wire transfer deposit
depositRouter.post('/wire', async (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) { res.status(401).json({ success: false }); return; }

  const { currency, amount, proofUrl, proofFileName } = req.body as {
    currency: string; amount: number; proofUrl: string; proofFileName?: string;
  };

  if (!currency || !amount || !proofUrl) {
    res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'currency, amount, and proofUrl are required' },
    });
    return;
  }

  const deposit = await prisma.depositRequest.create({
    data: {
      userId,
      method: 'WIRE_TRANSFER',
      currency,
      amount,
      proofUrl,
      proofFileName: proofFileName ?? null,
      status: 'PENDING',
    },
  });

  res.status(201).json({ success: true, data: deposit });
});

// POST /deposits/crypto — submit crypto deposit notification
depositRouter.post('/crypto', async (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) { res.status(401).json({ success: false }); return; }

  const { currency, amount, txHash } = req.body as {
    currency: string; amount: number; txHash?: string;
  };

  if (!currency || !amount) {
    res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'currency and amount are required' },
    });
    return;
  }

  const deposit = await prisma.depositRequest.create({
    data: {
      userId,
      method: 'CRYPTO',
      currency,
      amount,
      txHash: txHash ?? null,
      status: 'PENDING',
    },
  });

  res.status(201).json({ success: true, data: deposit });
});

// GET /deposits/my — list user's own deposits
depositRouter.get('/my', async (req: Request, res: Response) => {
  const userId = getUserId(req);
  if (!userId) { res.status(401).json({ success: false }); return; }

  const page = parseInt(req.query['page'] as string ?? '1', 10);
  const limit = parseInt(req.query['limit'] as string ?? '20', 10);

  const [deposits, total] = await Promise.all([
    prisma.depositRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.depositRequest.count({ where: { userId } }),
  ]);

  res.json({ success: true, data: deposits, meta: { page, limit, total } });
});

// ─── Admin Routes ───

// GET /deposits — list all deposits (admin only)
depositRouter.get('/', async (req: Request, res: Response) => {
  if (!isAdmin(req)) { res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Admin access required' } }); return; }

  const status = req.query['status'] as string | undefined;
  const page = parseInt(req.query['page'] as string ?? '1', 10);
  const limit = parseInt(req.query['limit'] as string ?? '20', 10);

  const where = status ? { status: status as 'PENDING' | 'APPROVED' | 'REJECTED' } : {};

  const [deposits, total] = await Promise.all([
    prisma.depositRequest.findMany({
      where,
      include: { user: { select: { id: true, email: true, kycTier: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.depositRequest.count({ where }),
  ]);

  res.json({ success: true, data: deposits, meta: { page, limit, total } });
});

// PATCH /deposits/:id — approve or reject deposit (admin only)
depositRouter.patch('/:id', async (req: Request, res: Response) => {
  if (!isAdmin(req)) { res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Admin access required' } }); return; }

  const { status, adminNotes } = req.body as { status: 'APPROVED' | 'REJECTED'; adminNotes?: string };

  if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
    res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'status must be APPROVED or REJECTED' },
    });
    return;
  }

  const adminId = getUserId(req);

  const deposit = await prisma.depositRequest.update({
    where: { id: req.params['id'] as string },
    data: {
      status,
      adminNotes: adminNotes ?? null,
      reviewedBy: adminId ?? null,
      reviewedAt: new Date(),
    },
  });

  res.json({ success: true, data: deposit });
});

// ─── App Config Routes (admin-managed settings) ───

// GET /config/:key — get config value (public for deposit addresses/wire details)
depositRouter.get('/config/:key', async (req: Request, res: Response) => {
  const config = await prisma.appConfig.findUnique({ where: { key: req.params['key'] as string } });

  if (!config) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Config not found' } });
    return;
  }

  res.json({ success: true, data: config });
});

// PUT /config/:key — update config value (admin only)
depositRouter.put('/config/:key', async (req: Request, res: Response) => {
  if (!isAdmin(req)) { res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Admin access required' } }); return; }

  const adminId = getUserId(req);
  const { value } = req.body as { value: unknown };

  if (value === undefined) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'value is required' } });
    return;
  }

  const config = await prisma.appConfig.upsert({
    where: { key: req.params['key'] as string },
    update: { value: value as object, updatedBy: adminId ?? null },
    create: { key: req.params['key'] as string, value: value as object, updatedBy: adminId ?? null },
  });

  res.json({ success: true, data: config });
});
