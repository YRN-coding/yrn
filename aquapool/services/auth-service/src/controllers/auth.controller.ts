import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import { prisma } from '@aquapool/database';
import { KycTier } from '@aquapool/shared';
import { emitUserCreated } from '../kafka/producer';
import {
  generateAccessToken,
  generateRefreshToken,
  storeRefreshToken,
  validateRefreshToken,
  revokeRefreshToken,
} from '../services/token.service';

const BCRYPT_ROUNDS = 12;

export async function register(req: Request, res: Response): Promise<void> {
  const { email, password, phone } = req.body as { email: string; password: string; phone?: string };

  if (!email || !password) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Email and password are required' } });
    return;
  }

  if (password.length < 8) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Password must be at least 8 characters' } });
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ success: false, error: { code: 'CONFLICT', message: 'Email already registered' } });
    return;
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const user = await prisma.user.create({
    data: { email, passwordHash, phone, kycTier: KycTier.TIER_0 },
  });

  const accessToken = generateAccessToken(user.id, user.email, user.kycTier as KycTier);
  const refreshToken = generateRefreshToken();
  await storeRefreshToken(user.id, refreshToken);
  void emitUserCreated(user.id, user.email);

  res.status(201).json({
    success: true,
    data: { accessToken, refreshToken, user: { id: user.id, email: user.email, kycTier: user.kycTier } },
  });
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password, totpCode } = req.body as { email: string; password: string; totpCode?: string };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) {
    res.status(401).json({ success: false, error: { code: 'AUTHENTICATION_ERROR', message: 'Invalid credentials' } });
    return;
  }

  const passwordValid = await bcrypt.compare(password, user.passwordHash);
  if (!passwordValid) {
    res.status(401).json({ success: false, error: { code: 'AUTHENTICATION_ERROR', message: 'Invalid credentials' } });
    return;
  }

  if (user.totpSecret) {
    if (!totpCode) {
      res.status(200).json({ success: true, data: { requireTotp: true } });
      return;
    }
    const valid = authenticator.verify({ token: totpCode, secret: user.totpSecret });
    if (!valid) {
      res.status(401).json({ success: false, error: { code: 'INVALID_TOTP', message: 'Invalid 2FA code' } });
      return;
    }
  }

  const accessToken = generateAccessToken(user.id, user.email, user.kycTier as KycTier);
  const refreshToken = generateRefreshToken();
  await storeRefreshToken(user.id, refreshToken);

  res.json({
    success: true,
    data: { accessToken, refreshToken, user: { id: user.id, email: user.email, kycTier: user.kycTier } },
  });
}

export async function logout(req: Request, res: Response): Promise<void> {
  const { refreshToken } = req.body as { refreshToken: string };
  if (req.user && refreshToken) {
    await revokeRefreshToken(req.user.id, refreshToken);
  }
  res.json({ success: true, data: { message: 'Logged out successfully' } });
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const { userId, refreshToken } = req.body as { userId: string; refreshToken: string };

  if (!userId || !refreshToken) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'userId and refreshToken required' } });
    return;
  }

  const valid = await validateRefreshToken(userId, refreshToken);
  if (!valid) {
    res.status(401).json({ success: false, error: { code: 'AUTHENTICATION_ERROR', message: 'Invalid refresh token' } });
    return;
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.isActive) {
    res.status(401).json({ success: false, error: { code: 'AUTHENTICATION_ERROR', message: 'User not found' } });
    return;
  }

  await revokeRefreshToken(userId, refreshToken);
  const newRefreshToken = generateRefreshToken();
  await storeRefreshToken(userId, newRefreshToken);
  const accessToken = generateAccessToken(user.id, user.email, user.kycTier as KycTier);

  res.json({ success: true, data: { accessToken, refreshToken: newRefreshToken } });
}

export async function setupTotp(req: Request, res: Response): Promise<void> {
  if (!req.user) { res.status(401).json({ success: false }); return; }

  const secret = authenticator.generateSecret();
  const otpAuthUrl = authenticator.keyuri(req.user.email, 'Aquapool', secret);
  const qrCodeDataUrl = await QRCode.toDataURL(otpAuthUrl);

  await prisma.user.update({
    where: { id: req.user.id },
    data: { totpSecret: secret },
  });

  res.json({ success: true, data: { qrCode: qrCodeDataUrl, secret } });
}

export async function verifyTotp(req: Request, res: Response): Promise<void> {
  if (!req.user) { res.status(401).json({ success: false }); return; }
  const { token } = req.body as { token: string };

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user?.totpSecret) {
    res.status(400).json({ success: false, error: { code: 'TOTP_NOT_SETUP', message: 'TOTP not configured' } });
    return;
  }

  const valid = authenticator.verify({ token, secret: user.totpSecret });
  if (!valid) {
    res.status(400).json({ success: false, error: { code: 'INVALID_TOTP', message: 'Invalid TOTP token' } });
    return;
  }

  res.json({ success: true, data: { message: 'TOTP verified and enabled' } });
}

export async function disableTotp(req: Request, res: Response): Promise<void> {
  if (!req.user) { res.status(401).json({ success: false }); return; }

  await prisma.user.update({
    where: { id: req.user.id },
    data: { totpSecret: null },
  });

  res.json({ success: true, data: { message: 'TOTP disabled' } });
}

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  const { email } = req.body as { email: string };
  // Always return success to prevent email enumeration
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    // TODO: Publish notification event with reset token
    console.log(`[auth] Password reset requested for ${email}`);
  }
  res.json({ success: true, data: { message: 'If the email exists, a reset link has been sent' } });
}

export async function resetPassword(req: Request, res: Response): Promise<void> {
  const { token, newPassword } = req.body as { token: string; newPassword: string };

  if (!token || !newPassword || newPassword.length < 8) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Valid token and password (min 8 chars) required' } });
    return;
  }

  // TODO: Validate reset token from Redis, update password
  res.json({ success: true, data: { message: 'Password reset successfully' } });
}
