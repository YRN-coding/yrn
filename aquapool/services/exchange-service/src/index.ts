import { initTelemetry, shutdownTelemetry, createLogger, createMetricsRegistry, metricsMiddleware } from '@aquapool/shared';
initTelemetry('exchange-service');

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { exchangeRouter } from './routes/exchange.routes';

const logger = createLogger('exchange-service');
const { register, httpRequestDuration, httpRequestTotal } = createMetricsRegistry('exchange-service');

const app = express();
const PORT = parseInt(process.env['EXCHANGE_SERVICE_PORT'] ?? '3004', 10);

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
  res.json({ status: 'ok', service: 'exchange-service', timestamp: new Date().toISOString() });
});

app.get('/metrics', metricsMiddleware(register));

app.use('/api/v1/exchange', exchangeRouter);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error({ err }, '[Error]');
  const status = (err as { statusCode?: number }).statusCode ?? 500;
  res.status(status).json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } });
});

const server = app.listen(PORT, () => logger.info(`[exchange-service] Listening on port ${PORT}`));

process.on('SIGTERM', () => {
  logger.info('[exchange-service] Shutting down gracefully...');
  server.close(async () => { await shutdownTelemetry(); process.exit(0); });
});

export default app;
