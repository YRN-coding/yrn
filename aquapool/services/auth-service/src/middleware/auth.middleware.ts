import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../services/token.service';
import { KycTier } from '@aquapool/shared';

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; email: string; kycTier: KycTier };
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: { code: 'AUTHENTICATION_ERROR', message: 'Bearer token required' } });
    return;
  }

  const token = authHeader.slice(7);
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, email: payload.email, kycTier: payload.kycTier };
    next();
  } catch {
    res.status(401).json({ success: false, error: { code: 'AUTHENTICATION_ERROR', message: 'Invalid or expired token' } });
  }
}

const kycTierOrder: Record<KycTier, number> = {
  [KycTier.TIER_0]: 0,
  [KycTier.TIER_1]: 1,
  [KycTier.TIER_2]: 2,
};

export function requireKyc(minTier: KycTier) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: { code: 'AUTHENTICATION_ERROR', message: 'Not authenticated' } });
      return;
    }
    if (kycTierOrder[req.user.kycTier] < kycTierOrder[minTier]) {
      res.status(403).json({ success: false, error: { code: 'KYC_REQUIRED', message: `KYC ${minTier} required` } });
      return;
    }
    next();
  };
}
