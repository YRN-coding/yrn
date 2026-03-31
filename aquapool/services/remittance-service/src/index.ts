import { initTelemetry, shutdownTelemetry, createLogger, createMetricsRegistry, metricsMiddleware } from '@aquapool/shared';
initTelemetry('remittance-service');

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { remittanceRouter } from './routes/remittance.routes';

const logger = createLogger('remittance-service');
const { register, httpRequestDuration, httpRequestTotal } = createMetricsRegistry('remittance-service');

const app = express();
const PORT = parseInt(process.env['REMITTANCE_SERVICE_PORT'] ?? '3006', 10);

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
  res.json({ status: 'ok', service: 'remittance-service', timestamp: new Date().toISOString() });
});

app.get('/metrics', metricsMiddleware(register));

app.use('/api/v1/remittance', remittanceRouter);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error({ err }, '[Error]');
  const status = (err as { statusCode?: number }).statusCode ?? 500;
  res.status(status).json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } });
});

const server = app.listen(PORT, () => logger.info(`[remittance-service] Listening on port ${PORT}`));

process.on('SIGTERM', () => {
  logger.info('[remittance-service] Shutting down gracefully...');
  server.close(async () => { await shutdownTelemetry(); process.exit(0); });
});

export default app;
