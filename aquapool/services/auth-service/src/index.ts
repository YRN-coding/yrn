import { initTelemetry, shutdownTelemetry, createLogger, createMetricsRegistry, metricsMiddleware } from '@aquapool/shared';
initTelemetry('auth-service');

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { authRouter } from './routes/auth.routes';
import { Redis } from 'ioredis';

const logger = createLogger('auth-service');
const { register, httpRequestDuration, httpRequestTotal } = createMetricsRegistry('auth-service');

const app = express();
const PORT = parseInt(process.env['AUTH_SERVICE_PORT'] ?? '3001', 10);

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env['CORS_ORIGIN'] ?? '*', credentials: true }));
app.use(express.json({ limit: '10kb' }));

// Request metrics
app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer({ method: req.method, route: req.path });
  res.on('finish', () => {
    end({ status_code: String(res.statusCode) });
    httpRequestTotal.inc({ method: req.method, route: req.path, status_code: String(res.statusCode) });
  });
  next();
});

// Redis
export const redis = new Redis(process.env['REDIS_URL'] ?? 'redis://localhost:6379', {
  retryStrategy: (times: number) => Math.min(times * 100, 3000),
  maxRetriesPerRequest: 3,
});

redis.on('error', (err: Error) => logger.error({ err }, '[Redis] Connection error'));
redis.on('connect', () => logger.info('[Redis] Connected'));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'auth-service', timestamp: new Date().toISOString() });
});

// Metrics
app.get('/metrics', metricsMiddleware(register));

// Routes
app.use('/api/v1/auth', authRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Route not found' } });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error({ err }, '[Error]');
  const status = (err as { statusCode?: number }).statusCode ?? 500;
  res.status(status).json({
    success: false,
    error: { code: (err as { code?: string }).code ?? 'INTERNAL_ERROR', message: err.message },
  });
});

const server = app.listen(PORT, () => {
  logger.info(`[auth-service] Listening on port ${PORT}`);
});

process.on('SIGTERM', () => {
  logger.info('[auth-service] Shutting down gracefully...');
  server.close(async () => {
    redis.disconnect();
    await shutdownTelemetry();
    process.exit(0);
  });
});

export default app;
