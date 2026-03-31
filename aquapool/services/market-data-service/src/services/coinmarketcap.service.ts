import axios from 'axios';
import { Redis } from 'ioredis';

const CMC_BASE = 'https://pro-api.coinmarketcap.com/v1';
const API_KEY = process.env['COINMARKETCAP_API_KEY'] ?? '';

const redis = new Redis(process.env['REDIS_URL'] ?? 'redis://localhost:6379');

export interface CmcQuote {
  id: number;
  name: string;
  symbol: string;
  slug: string;
  rank: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number | null;
  quote: {
    USD: {
      price: number;
      volume_24h: number;
      percent_change_1h: number;
      percent_change_24h: number;
      percent_change_7d: number;
      market_cap: number;
      last_updated: string;
    };
  };
}

export async function getTop100(): Promise<CmcQuote[]> {
  const cacheKey = 'cmc:top100';
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached) as CmcQuote[];

  const response = await axios.get<{ data: CmcQuote[] }>(`${CMC_BASE}/cryptocurrency/listings/latest`, {
    params: { limit: 100, convert: 'USD' },
    headers: { 'X-CMC_PRO_API_KEY': API_KEY },
  });

  const data = response.data.data;
  await redis.set(cacheKey, JSON.stringify(data), 'EX', 300); // 5 min cache
  return data;
}

export async function getQuotes(symbols: string[]): Promise<Record<string, CmcQuote>> {
  const symbolStr = symbols.join(',');
  const cacheKey = `cmc:quotes:${symbolStr}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached) as Record<string, CmcQuote>;

  const response = await axios.get<{ data: Record<string, CmcQuote> }>(`${CMC_BASE}/cryptocurrency/quotes/latest`, {
    params: { symbol: symbolStr, convert: 'USD' },
    headers: { 'X-CMC_PRO_API_KEY': API_KEY },
  });

  const data = response.data.data;
  await redis.set(cacheKey, JSON.stringify(data), 'EX', 30); // 30s cache
  return data;
}
