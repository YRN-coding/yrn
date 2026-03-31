import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  register, login, logout, refresh,
  setupTotp, verifyTotp, disableTotp,
  forgotPassword, resetPassword,
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

export const authRouter = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many login attempts' } },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

authRouter.post('/register', generalLimiter, register);
authRouter.post('/login', loginLimiter, login);
authRouter.post('/logout', authenticate, logout);
authRouter.post('/refresh', generalLimiter, refresh);

authRouter.post('/totp/setup', authenticate, setupTotp);
authRouter.post('/totp/verify', authenticate, verifyTotp);
authRouter.post('/totp/disable', authenticate, disableTotp);

authRouter.post('/password/forgot', generalLimiter, forgotPassword);
authRouter.post('/password/reset', generalLimiter, resetPassword);
