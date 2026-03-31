import { WebSocketServer, WebSocket } from 'ws';
import { getTop100 } from './coinmarketcap.service';

interface PriceUpdate {
  type: 'price_update';
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  timestamp: number;
}

// Subscriptions: symbol -> Set of client WebSockets
const subscriptions = new Map<string, Set<WebSocket>>();

export function subscribe(ws: WebSocket, symbols: string[]): void {
  for (const symbol of symbols) {
    if (!subscriptions.has(symbol)) subscriptions.set(symbol, new Set());
    subscriptions.get(symbol)!.add(ws);
  }
}

export function unsubscribe(ws: WebSocket): void {
  for (const clients of subscriptions.values()) {
    clients.delete(ws);
  }
}

export async function startPricePolling(wss: WebSocketServer): Promise<void> {
  if (wss.clients.size === 0) return;

  try {
    const coins = await getTop100();
    const now = Date.now();

    for (const coin of coins) {
      const clients = subscriptions.get(coin.symbol);
      if (!clients || clients.size === 0) continue;

      const update: PriceUpdate = {
        type: 'price_update',
        symbol: coin.symbol,
        price: coin.quote.USD.price,
        change24h: coin.quote.USD.percent_change_24h,
        volume24h: coin.quote.USD.volume_24h,
        timestamp: now,
      };

      const message = JSON.stringify(update);
      for (const client of clients) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        } else {
          clients.delete(client);
        }
      }
    }
  } catch (err) {
    console.error('[WS] Price polling error:', err);
  }
}
