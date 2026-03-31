import { PaginationMeta } from '../types';
import crypto from 'crypto';

export function formatAmount(amount: string, decimals: number): string {
  const num = BigInt(amount);
  const divisor = BigInt(10 ** decimals);
  const whole = num / divisor;
  const remainder = num % divisor;
  const remainderStr = remainder.toString().padStart(decimals, '0').replace(/0+$/, '');
  return remainderStr ? `${whole}.${remainderStr}` : whole.toString();
}

export function parseAmount(amount: string, decimals: number): bigint {
  const [whole, fraction = ''] = amount.split('.');
  const paddedFraction = fraction.padEnd(decimals, '0').slice(0, decimals);
  return BigInt(whole + paddedFraction);
}

export function toUsdValue(amount: string, price: number, decimals: number): number {
  const formatted = parseFloat(formatAmount(amount, decimals));
  return formatted * price;
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function retry<T>(
  fn: () => Promise<T>,
  attempts: number,
  delay: number
): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (i < attempts - 1) await sleep(delay * (i + 1));
    }
  }
  throw lastError;
}

export function paginate<T>(
  items: T[],
  page: number,
  limit: number
): { items: T[]; meta: PaginationMeta } {
  const offset = (page - 1) * limit;
  const paginatedItems = items.slice(offset, offset + limit);
  return {
    items: paginatedItems,
    meta: {
      page,
      limit,
      total: items.length,
      hasMore: offset + limit < items.length,
    },
  };
}

export function maskAddress(address: string): string {
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj };
  keys.forEach((key) => delete result[key]);
  return result as Omit<T, K>;
}
