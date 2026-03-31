import { initTelemetry, shutdownTelemetry, createLogger, createMetricsRegistry, metricsMiddleware } from '@aquapool/shared';
initTelemetry('notification-service');

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

const logger = createLogger('notification-service');
const { register, httpRequestDuration, httpRequestTotal } = createMetricsRegistry('notification-service');

const app = express();
const PORT = parseInt(process.env['NOTIFICATION_SERVICE_PORT'] ?? '3009', 10);

app.use(helmet());
app.use(cors({ origin: process.env['CORS_ORIGIN'] ?? '*' }));
app.use(express.json());

app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer({ method: req.method, route: req.path });
  res.on('finish', () => {
    end({ status_code: String(res.statusCode) });
    httpRequestTotal.inc({ method: req.method, route: req.path, status_code: String(res.statusCode) });
  });
  next();
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'notification-service', timestamp: new Date().toISOString() });
});

app.get('/metrics', metricsMiddleware(register));

// POST /api/v1/notifications/send (internal only)
app.post('/api/v1/notifications/send', async (req, res) => {
  const { type, userId, data } = req.body as { type: string; userId: string; data: Record<string, unknown> };
  logger.info({ type, userId, data }, '[notification] Sending notification');
  // In production: route to Firebase/Twilio/Nodemailer based on type
  res.json({ success: true, data: { queued: true } });
});

const server = app.listen(PORT, () => logger.info(`[notification-service] Listening on port ${PORT}`));

process.on('SIGTERM', () => {
  logger.info('[notification-service] Shutting down gracefully...');
  server.close(async () => { await shutdownTelemetry(); process.exit(0); });
});

export default app;
