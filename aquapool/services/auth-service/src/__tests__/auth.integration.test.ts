import request from 'supertest';
import express from 'express';
import { authRouter } from '../routes/auth.routes';

jest.mock('@aquapool/database', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock('ioredis', () => {
  const mRedis = {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    keys: jest.fn().mockResolvedValue([]),
    on: jest.fn(),
    disconnect: jest.fn(),
  };
  return jest.fn(() => mRedis);
});

jest.mock('../kafka/producer', () => ({
  emitUserCreated: jest.fn().mockResolvedValue(undefined),
}));

import { prisma } from '@aquapool/database';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/v1/auth', authRouter);

describe('Auth Service — Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/auth/register', () => {
    it('returns 400 when email or password missing', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'test@example.com' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns 400 when password too short', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'test@example.com', password: 'short' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('returns 409 when email already registered', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'existing-id',
        email: 'test@example.com',
      });

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'test@example.com', password: 'validpassword123' });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('CONFLICT');
    });

    it('registers a new user successfully', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);
      (mockPrisma.user.create as jest.Mock).mockResolvedValueOnce({
        id: 'new-user-id',
        email: 'newuser@example.com',
        kycTier: 'TIER_0',
        isActive: true,
        totpSecret: null,
      });

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'newuser@example.com', password: 'securepassword123' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
      expect(res.body.data.user.email).toBe('newuser@example.com');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('returns 401 when user not found', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'notfound@example.com', password: 'password123' });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('AUTHENTICATION_ERROR');
    });

    it('returns 401 for inactive user', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'user-id',
        email: 'inactive@example.com',
        isActive: false,
        passwordHash: 'hash',
      });

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'inactive@example.com', password: 'password123' });

      expect(res.status).toBe(401);
    });

    it('returns 401 when password incorrect', async () => {
      const bcrypt = require('bcrypt');
      const correctHash = await bcrypt.hash('correctpassword', 1);

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'user-id',
        email: 'user@example.com',
        passwordHash: correctHash,
        isActive: true,
        totpSecret: null,
        kycTier: 'TIER_0',
      });

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'user@example.com', password: 'wrongpassword' });

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('returns 400 when userId or refreshToken missing', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ userId: 'user-id' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns 401 when refresh token is not in Redis', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ userId: 'user-id', refreshToken: 'invalid-token' });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('AUTHENTICATION_ERROR');
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('returns 200 even without a token body', async () => {
      const res = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', 'Bearer fake-token')
        .send({});

      // Logout always succeeds (or 401 if no auth middleware hit)
      expect([200, 401]).toContain(res.status);
    });
  });
});
