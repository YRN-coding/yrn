import { useEffect, useRef, useState, useCallback } from 'react';
import useSWR from 'swr';

const WS_URL = process.env['EXPO_PUBLIC_WS_URL'] ?? 'ws://localhost:3005/ws';
const API_URL = process.env['EXPO_PUBLIC_API_URL'] ?? 'http://localhost:3005';

interface PriceUpdate {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  timestamp: number;
}

interface Asset {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json()) as Promise<{ success: boolean; data: Asset[] }>;

export function useMarketData(symbols?: string[]) {
  const { data, error, isLoading } = useSWR(`${API_URL}/api/v1/market/top`, fetcher, {
    refreshInterval: 60_000,
  });

  const [livePrices, setLivePrices] = useState<Record<string, PriceUpdate>>({});
  const wsRef = useRef<WebSocket | null>(null);

  const subscribe = useCallback((syms: string[]) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ type: 'subscribe', symbols: syms }));
  }, []);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      if (symbols?.length) subscribe(symbols);
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data as string) as PriceUpdate & { type: string };
        if (msg.type === 'price_update') {
          setLivePrices((prev) => ({ ...prev, [msg.symbol]: msg }));
        }
      } catch {
        // ignore malformed messages
      }
    };

    ws.onerror = () => console.warn('[WS] Connection error');

    const ping = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) ws.send('ping');
    }, 30_000);

    return () => {
      clearInterval(ping);
      ws.close();
    };
  }, [symbols, subscribe]);

  const assets = data?.data?.map((a) => ({
    ...a,
    price: livePrices[a.symbol]?.price ?? a.price,
    change24h: livePrices[a.symbol]?.change24h ?? a.change24h,
  }));

  return { assets, isLoading, error, subscribe };
}
