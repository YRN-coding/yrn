import { initTelemetry, shutdownTelemetry, createLogger, createMetricsRegistry, metricsMiddleware } from '@aquapool/shared';
initTelemetry('wallet-service');

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { walletRouter } from './routes/wallet.routes';
import { depositRouter } from './routes/deposit.routes';

const logger = createLogger('wallet-service');
const { register, httpRequestDuration, httpRequestTotal } = createMetricsRegistry('wallet-service');

const app = express();
const PORT = parseInt(process.env['WALLET_SERVICE_PORT'] ?? '3003', 10);

app.use(helmet());
app.use(cors({ origin: process.env['CORS_ORIGIN'] ?? '*', credentials: true }));
app.use(express.json({ limit: '10kb' }));

app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer({ method: req.method, route: req.path });
  res.on('finish', () => {
    end({ status_code: String(res.statusCode) });
    httpRequestTotal.inc({ method: req.method, route: req.path, status_code: String(res.statusCode) });
  });
  next();
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'wallet-service', timestamp: new Date().toISOString() });
});

app.get('/metrics', metricsMiddleware(register));

app.use('/api/v1/wallets', walletRouter);
app.use('/api/v1/deposits', depositRouter);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error({ err }, '[Error]');
  const status = (err as { statusCode?: number }).statusCode ?? 500;
  res.status(status).json({
    success: false,
    error: { code: (err as { code?: string }).code ?? 'INTERNAL_ERROR', message: err.message },
  });
});

const server = app.listen(PORT, () => logger.info(`[wallet-service] Listening on port ${PORT}`));

process.on('SIGTERM', () => {
  logger.info('[wallet-service] Shutting down gracefully...');
  server.close(async () => { await shutdownTelemetry(); process.exit(0); });
});

export default app;
