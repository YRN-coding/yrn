import { initTelemetry, shutdownTelemetry, createLogger, createMetricsRegistry, metricsMiddleware } from '@aquapool/shared';
initTelemetry('market-data-service');

import 'dotenv/config';
import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { WebSocketServer } from 'ws';
import cron from 'node-cron';
import { marketRouter } from './routes/market.routes';
import { startPricePolling } from './services/websocket.service';

const logger = createLogger('market-data-service');
const { register, httpRequestDuration, httpRequestTotal } = createMetricsRegistry('market-data-service');

const app = express();
const PORT = parseInt(process.env['MARKET_DATA_SERVICE_PORT'] ?? '3005', 10);

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
  res.json({ status: 'ok', service: 'market-data-service', timestamp: new Date().toISOString() });
});

app.get('/metrics', metricsMiddleware(register));

app.use('/api/v1/market', marketRouter);

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

export { wss };

wss.on('connection', (ws) => {
  logger.info('[WS] Client connected');
  ws.on('close', () => logger.info('[WS] Client disconnected'));
  ws.on('error', (err) => logger.error({ err }, '[WS] Error'));
});

// Poll prices every 5 seconds and broadcast
cron.schedule('*/5 * * * * *', () => startPricePolling(wss));

server.listen(PORT, () => logger.info(`[market-data-service] Listening on port ${PORT}`));

process.on('SIGTERM', () => {
  logger.info('[market-data-service] Shutting down gracefully...');
  server.close(async () => { await shutdownTelemetry(); process.exit(0); });
});

export default app;
