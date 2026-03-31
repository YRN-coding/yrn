import { Router, Request, Response } from 'express';
import { screenAddress } from '../services/chainalysis.service';
import { screenEntity } from '../services/comply-advantage.service';
import { prisma } from '@aquapool/database';

export const complianceRouter = Router();

// POST /screen/address
complianceRouter.post('/screen/address', async (req: Request, res: Response) => {
  const { address, network } = req.body as { address: string; network: string };
  if (!address || !network) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'address and network required' } });
    return;
  }
  const result = await screenAddress(address, network);
  res.json({ success: true, data: result });
});

// POST /screen/entity
complianceRouter.post('/screen/entity', async (req: Request, res: Response) => {
  const { name, dateOfBirth, country } = req.body as { name: string; dateOfBirth?: string; country?: string };
  if (!name) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'name required' } });
    return;
  }
  const result = await screenEntity(name, dateOfBirth, country);
  res.json({ success: true, data: result });
});

// GET /flags
complianceRouter.get('/flags', async (_req: Request, res: Response) => {
  const flags = await prisma.complianceFlag.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { user: { select: { email: true } } },
  });
  res.json({ success: true, data: flags });
});

// PATCH /flags/:flagId
complianceRouter.patch('/flags/:flagId', async (req: Request, res: Response) => {
  const { status, notes } = req.body as { status: string; notes?: string };
  const flag = await prisma.complianceFlag.update({
    where: { id: req.params['flagId'] as string },
    data: { status: status as never, notes, updatedAt: new Date() },
  });
  res.json({ success: true, data: flag });
});

// GET /flags/user/:userId
complianceRouter.get('/flags/user/:userId', async (req: Request, res: Response) => {
  const flags = await prisma.complianceFlag.findMany({
    where: { userId: req.params['userId'] as string },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ success: true, data: flags });
});
