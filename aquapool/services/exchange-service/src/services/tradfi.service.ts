import axios from 'axios';
import { OrderSide, OrderType, OrderStatus } from '@aquapool/shared';

const ALPACA_BASE = process.env['ALPACA_BASE_URL'] ?? 'https://paper-api.alpaca.markets';
const ALPACA_KEY = process.env['ALPACA_API_KEY'] ?? '';
const ALPACA_SECRET = process.env['ALPACA_SECRET_KEY'] ?? '';

const headers = {
  'APCA-API-KEY-ID': ALPACA_KEY,
  'APCA-API-SECRET-KEY': ALPACA_SECRET,
};

export interface AlpacaOrder {
  id: string;
  symbol: string;
  side: string;
  type: string;
  qty: string;
  filled_qty: string;
  filled_avg_price: string | null;
  status: string;
  limit_price: string | null;
  created_at: string;
  updated_at: string;
}

export function mapAlpacaStatus(status: string): OrderStatus {
  const map: Record<string, OrderStatus> = {
    new: OrderStatus.OPEN,
    partially_filled: OrderStatus.PARTIAL,
    filled: OrderStatus.FILLED,
    canceled: OrderStatus.CANCELLED,
    expired: OrderStatus.CANCELLED,
    rejected: OrderStatus.FAILED,
    pending_new: OrderStatus.PENDING,
  };
  return map[status] ?? OrderStatus.PENDING;
}

export async function placeOrder(
  symbol: string,
  qty: string,
  side: OrderSide,
  type: OrderType,
  limitPrice?: number
): Promise<AlpacaOrder> {
  const body: Record<string, unknown> = {
    symbol,
    qty,
    side: side.toLowerCase(),
    type: type.toLowerCase(),
    time_in_force: 'day',
  };
  if (type === OrderType.LIMIT && limitPrice) body['limit_price'] = limitPrice.toString();

  const response = await axios.post<AlpacaOrder>(`${ALPACA_BASE}/v2/orders`, body, { headers });
  return response.data;
}

export async function cancelOrder(orderId: string): Promise<void> {
  await axios.delete(`${ALPACA_BASE}/v2/orders/${orderId}`, { headers });
}

export async function getOrder(orderId: string): Promise<AlpacaOrder> {
  const response = await axios.get<AlpacaOrder>(`${ALPACA_BASE}/v2/orders/${orderId}`, { headers });
  return response.data;
}

export async function listOrders(status = 'open'): Promise<AlpacaOrder[]> {
  const response = await axios.get<AlpacaOrder[]>(`${ALPACA_BASE}/v2/orders`, {
    params: { status },
    headers,
  });
  return response.data;
}
