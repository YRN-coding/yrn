import request from 'supertest';
import express from 'express';
import { walletRouter } from '../routes/wallet.routes';

jest.mock('@aquapool/database', () => ({
  prisma: {
    wallet: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    asset: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    transaction: {
      findMany: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
  },
}));

jest.mock('ioredis', () => {
  return jest.fn(() => ({
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    on: jest.fn(),
  }));
});

jest.mock('../services/ethereum.service', () => ({
  getEthereumBalance: jest.fn().mockResolvedValue('1.5'),
}));

jest.mock('../kafka/producer', () => ({
  emitTransactionInitiated: jest.fn().mockResolvedValue(undefined),
}));

// Skip EIP-712 verification in tests
jest.mock('../middleware/eip712.middleware', () => ({
  verifyEip712Signature: (_req: any, _res: any, next: any) => next(),
}));

import { prisma } from '@aquapool/database';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/v1/wallets', walletRouter);

const TEST_USER_ID = 'test-user-123';

describe('Wallet Service — Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/wallets', () => {
    it('returns 401 when x-user-id header missing', async () => {
      const res = await request(app).get('/api/v1/wallets');
      expect(res.status).toBe(401);
    });

    it('returns wallet list for authenticated user', async () => {
      (mockPrisma.wallet.findMany as jest.Mock).mockResolvedValueOnce([
        { id: 'wallet-1', userId: TEST_USER_ID, network: 'ETHEREUM', address: '0xabc', balances: [] },
      ]);

      const res = await request(app)
        .get('/api/v1/wallets')
        .set('x-user-id', TEST_USER_ID);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('POST /api/v1/wallets', () => {
    it('returns 401 when x-user-id header missing', async () => {
      const res = await request(app)
        .post('/api/v1/wallets')
        .send({ network: 'ETHEREUM' });
      expect(res.status).toBe(401);
    });

    it('returns 409 when wallet already exists for network', async () => {
      (mockPrisma.wallet.findFirst as jest.Mock).mockResolvedValueOnce({
        id: 'existing-wallet',
        userId: TEST_USER_ID,
        network: 'ETHEREUM',
      });

      const res = await request(app)
        .post('/api/v1/wallets')
        .set('x-user-id', TEST_USER_ID)
        .send({ network: 'ETHEREUM' });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('CONFLICT');
    });

    it('creates a new wallet successfully', async () => {
      (mockPrisma.wallet.findFirst as jest.Mock).mockResolvedValueOnce(null);
      (mockPrisma.wallet.create as jest.Mock).mockResolvedValueOnce({
        id: 'new-wallet-id',
        userId: TEST_USER_ID,
        network: 'ETHEREUM',
        address: '0xabc123',
        type: 'MANAGED',
        isDefault: true,
      });

      const res = await request(app)
        .post('/api/v1/wallets')
        .set('x-user-id', TEST_USER_ID)
        .send({ network: 'ETHEREUM' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.network).toBe('ETHEREUM');
    });
  });

  describe('GET /api/v1/wallets/:walletId', () => {
    it('returns 401 when x-user-id missing', async () => {
      const res = await request(app).get('/api/v1/wallets/wallet-1');
      expect(res.status).toBe(401);
    });

    it('returns 404 when wallet not found', async () => {
      (mockPrisma.wallet.findFirst as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app)
        .get('/api/v1/wallets/nonexistent')
        .set('x-user-id', TEST_USER_ID);

      expect(res.status).toBe(404);
    });

    it('returns wallet details', async () => {
      (mockPrisma.wallet.findFirst as jest.Mock).mockResolvedValueOnce({
        id: 'wallet-1',
        userId: TEST_USER_ID,
        network: 'ETHEREUM',
        address: '0xabc123',
        balances: [],
      });

      const res = await request(app)
        .get('/api/v1/wallets/wallet-1')
        .set('x-user-id', TEST_USER_ID);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe('wallet-1');
    });
  });

  describe('POST /api/v1/wallets/:walletId/send', () => {
    it('returns 400 when required fields missing', async () => {
      (mockPrisma.wallet.findFirst as jest.Mock).mockResolvedValueOnce({
        id: 'wallet-1',
        userId: TEST_USER_ID,
        network: 'ETHEREUM',
        address: '0xabc',
      });

      const res = await request(app)
        .post('/api/v1/wallets/wallet-1/send')
        .set('x-user-id', TEST_USER_ID)
        .send({ toAddress: '0xdef' }); // missing amount and assetSymbol

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('creates a pending transaction', async () => {
      (mockPrisma.wallet.findFirst as jest.Mock).mockResolvedValueOnce({
        id: 'wallet-1',
        userId: TEST_USER_ID,
        network: 'ETHEREUM',
        address: '0xabc',
      });
      (mockPrisma.asset.findFirst as jest.Mock).mockResolvedValueOnce({
        id: 'asset-eth',
        symbol: 'ETH',
      });
      (mockPrisma.transaction.create as jest.Mock).mockResolvedValueOnce({
        id: 'tx-1',
        userId: TEST_USER_ID,
        amount: '0.1',
        status: 'PENDING',
        network: 'ETHEREUM',
      });

      const res = await request(app)
        .post('/api/v1/wallets/wallet-1/send')
        .set('x-user-id', TEST_USER_ID)
        .send({ toAddress: '0xdef123', amount: '0.1', assetSymbol: 'ETH' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('PENDING');
    });
  });
});
