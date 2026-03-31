import { initTelemetry, shutdownTelemetry, createLogger, createMetricsRegistry, metricsMiddleware } from '@aquapool/shared';
initTelemetry('compliance-service');

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { complianceRouter } from './routes/compliance.routes';
import { initKafka } from './kafka/consumer';

const logger = createLogger('compliance-service');
const { register, httpRequestDuration, httpRequestTotal } = createMetricsRegistry('compliance-service');

const app = express();
const PORT = parseInt(process.env['COMPLIANCE_SERVICE_PORT'] ?? '3008', 10);

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
  res.json({ status: 'ok', service: 'compliance-service', timestamp: new Date().toISOString() });
});

app.get('/metrics', metricsMiddleware(register));

app.use('/api/v1/compliance', complianceRouter);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error({ err }, '[Error]');
  const status = (err as { statusCode?: number }).statusCode ?? 500;
  res.status(status).json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } });
});

const server = app.listen(PORT, () => {
  logger.info(`[compliance-service] Listening on port ${PORT}`);
  void initKafka();
});

process.on('SIGTERM', () => {
  logger.info('[compliance-service] Shutting down gracefully...');
  server.close(async () => { await shutdownTelemetry(); process.exit(0); });
});

export default app;
