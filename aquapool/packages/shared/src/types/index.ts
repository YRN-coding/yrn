export enum KycTier {
  TIER_0 = 'TIER_0',
  TIER_1 = 'TIER_1',
  TIER_2 = 'TIER_2',
}

export enum WalletType {
  SELF_CUSTODY = 'SELF_CUSTODY',
  MANAGED = 'MANAGED',
  EXTERNAL = 'EXTERNAL',
}

export enum Network {
  ETHEREUM = 'ETHEREUM',
  BITCOIN = 'BITCOIN',
  BSC = 'BSC',
  SOLANA = 'SOLANA',
  XRP = 'XRP',
  POLYGON = 'POLYGON',
  BASE = 'BASE',
}

export enum AssetType {
  CRYPTO = 'CRYPTO',
  STOCK = 'STOCK',
  ETF = 'ETF',
  FOREX = 'FOREX',
  COMMODITY = 'COMMODITY',
  RWA = 'RWA',
}

export enum OrderSide {
  BUY = 'BUY',
  SELL = 'SELL',
}

export enum OrderType {
  MARKET = 'MARKET',
  LIMIT = 'LIMIT',
  STOP_LOSS = 'STOP_LOSS',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  OPEN = 'OPEN',
  FILLED = 'FILLED',
  PARTIAL = 'PARTIAL',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  FAILED = 'FAILED',
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: PaginationMeta;
}

export interface User {
  id: string;
  email: string;
  phone?: string;
  kycTier: KycTier;
  createdAt: Date;
  updatedAt: Date;
}

export interface Wallet {
  id: string;
  userId: string;
  type: WalletType;
  network: Network;
  address: string;
  isDefault: boolean;
  createdAt: Date;
}

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  type: AssetType;
  network?: Network;
  contractAddress?: string;
  decimals: number;
  logoUrl?: string;
  rank?: number;
}

export interface Balance {
  walletId: string;
  assetId: string;
  amount: string;
  usdValue: number;
  updatedAt: Date;
}

export interface Order {
  id: string;
  userId: string;
  assetId: string;
  side: OrderSide;
  type: OrderType;
  status: OrderStatus;
  quantity: string;
  filledQuantity: string;
  limitPrice?: number;
  stopPrice?: number;
  avgFillPrice?: number;
  externalOrderId?: string;
  network?: Network;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  userId: string;
  fromWalletId: string;
  toWalletId?: string;
  assetId: string;
  amount: string;
  fee: string;
  status: TransactionStatus;
  txHash?: string;
  network: Network;
  blockNumber?: number;
  confirmations: number;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface JwtPayload {
  sub: string;
  email: string;
  kycTier: KycTier;
  iat: number;
  exp: number;
}
