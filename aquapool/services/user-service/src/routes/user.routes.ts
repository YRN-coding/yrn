import { Router, Request, Response } from 'express';
import { prisma } from '@aquapool/database';

export const userRouter = Router();

// Internal middleware: expects X-User-Id header injected by API gateway
function getUser(req: Request): string | undefined {
  const val = req.headers['x-user-id'];
  return Array.isArray(val) ? val[0] : val;
}

// GET /me
userRouter.get('/me', async (req: Request, res: Response) => {
  const userId = getUser(req);
  if (!userId) { res.status(401).json({ success: false }); return; }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, phone: true, kycTier: true, kycStatus: true, createdAt: true },
  });

  if (!user) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } }); return; }
  res.json({ success: true, data: user });
});

// PATCH /me
userRouter.patch('/me', async (req: Request, res: Response) => {
  const userId = getUser(req);
  if (!userId) { res.status(401).json({ success: false }); return; }

  const { phone } = req.body as { phone?: string };
  const user = await prisma.user.update({
    where: { id: userId },
    data: { ...(phone && { phone }) },
    select: { id: true, email: true, phone: true, kycTier: true, updatedAt: true },
  });

  res.json({ success: true, data: user });
});

// GET /me/kyc
userRouter.get('/me/kyc', async (req: Request, res: Response) => {
  const userId = getUser(req);
  if (!userId) { res.status(401).json({ success: false }); return; }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { kycTier: true, kycStatus: true },
  });
  const documents = await prisma.kycDocument.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ success: true, data: { ...user, documents } });
});

// POST /me/kyc/initiate
userRouter.post('/me/kyc/initiate', async (req: Request, res: Response) => {
  const userId = getUser(req);
  if (!userId) { res.status(401).json({ success: false }); return; }

  const { documentType } = req.body as { documentType: string };

  // Create KYC document record
  const doc = await prisma.kycDocument.create({
    data: { userId, type: documentType as never, status: 'PENDING' },
  });

  // In production: call Sumsub/Onfido to create an applicant and return SDK token
  res.json({ success: true, data: { documentId: doc.id, sdkToken: 'sdk_token_placeholder', message: 'KYC initiation recorded' } });
});

// GET /:userId (internal service-to-service)
userRouter.get('/:userId', async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params['userId'] as string },
    select: { id: true, email: true, phone: true, kycTier: true, kycStatus: true, isActive: true },
  });

  if (!user) { res.status(404).json({ success: false }); return; }
  res.json({ success: true, data: user });
});
