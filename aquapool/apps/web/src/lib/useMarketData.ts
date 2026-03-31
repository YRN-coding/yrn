'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import useSWR from 'swr';
import api from './api';

interface Asset {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
}

interface PriceUpdate {
  type: string;
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  timestamp: number;
}

const fetcher = (url: string) =>
  api.get<{ success: boolean; data: Asset[] }>(url).then((r: { data: { success: boolean; data: Asset[] } }) => r.data);

export function useMarketData(symbols?: string[]) {
  const { data, error, isLoading } = useSWR('/api/v1/market/top', fetcher, {
    refreshInterval: 60_000,
  });

  const [livePrices, setLivePrices] = useState<Record<string, PriceUpdate>>({});
  const wsRef = useRef<WebSocket | null>(null);

  const subscribe = useCallback((syms: string[]) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ type: 'subscribe', symbols: syms }));
  }, []);

  useEffect(() => {
    const wsUrl = process.env['NEXT_PUBLIC_WS_URL'] ?? 'ws://localhost:3005/ws';
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      if (symbols?.length) subscribe(symbols);
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data as string) as PriceUpdate;
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

  const assets = data?.data?.map((a: Asset) => ({
    ...a,
    price: livePrices[a.symbol]?.price ?? a.price,
    change24h: livePrices[a.symbol]?.change24h ?? a.change24h,
  }));

  return { assets, isLoading, error, subscribe };
}
