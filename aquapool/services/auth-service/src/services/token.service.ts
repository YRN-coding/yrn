import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { redis } from '../index';
import { JwtPayload, KycTier } from '@aquapool/shared';

const JWT_SECRET = process.env['JWT_SECRET'] ?? 'change_me_in_production';
const JWT_EXPIRES_IN = process.env['JWT_EXPIRES_IN'] ?? '15m';
const REFRESH_TOKEN_EXPIRES_IN = 7 * 24 * 60 * 60; // 7 days in seconds

export function generateAccessToken(userId: string, email: string, kycTier: KycTier): string {
  return jwt.sign({ sub: userId, email, kycTier }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function generateRefreshToken(): string {
  return crypto.randomBytes(64).toString('hex');
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

export async function storeRefreshToken(userId: string, token: string): Promise<void> {
  const key = `refresh:${userId}:${token}`;
  await redis.set(key, '1', 'EX', REFRESH_TOKEN_EXPIRES_IN);
}

export async function validateRefreshToken(userId: string, token: string): Promise<boolean> {
  const key = `refresh:${userId}:${token}`;
  const result = await redis.get(key);
  return result === '1';
}

export async function revokeRefreshToken(userId: string, token: string): Promise<void> {
  const key = `refresh:${userId}:${token}`;
  await redis.del(key);
}

export async function revokeAllUserTokens(userId: string): Promise<void> {
  const pattern = `refresh:${userId}:*`;
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}
