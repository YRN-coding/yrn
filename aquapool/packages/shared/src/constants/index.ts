import { Network } from '../types';

export interface NetworkMetadata {
  name: string;
  chainId: number | null;
  rpcEnvVar: string;
  nativeCurrency: string;
  blockExplorer: string;
}

export const SUPPORTED_NETWORKS: Record<Network, NetworkMetadata> = {
  [Network.ETHEREUM]: {
    name: 'Ethereum',
    chainId: 1,
    rpcEnvVar: 'ETHEREUM_RPC_URL',
    nativeCurrency: 'ETH',
    blockExplorer: 'https://etherscan.io',
  },
  [Network.BITCOIN]: {
    name: 'Bitcoin',
    chainId: null,
    rpcEnvVar: 'BITCOIN_RPC_URL',
    nativeCurrency: 'BTC',
    blockExplorer: 'https://blockstream.info',
  },
  [Network.BSC]: {
    name: 'BNB Smart Chain',
    chainId: 56,
    rpcEnvVar: 'BSC_RPC_URL',
    nativeCurrency: 'BNB',
    blockExplorer: 'https://bscscan.com',
  },
  [Network.SOLANA]: {
    name: 'Solana',
    chainId: null,
    rpcEnvVar: 'SOLANA_RPC_URL',
    nativeCurrency: 'SOL',
    blockExplorer: 'https://solscan.io',
  },
  [Network.XRP]: {
    name: 'XRP Ledger',
    chainId: null,
    rpcEnvVar: 'XRP_RPC_URL',
    nativeCurrency: 'XRP',
    blockExplorer: 'https://xrpscan.com',
  },
  [Network.POLYGON]: {
    name: 'Polygon',
    chainId: 137,
    rpcEnvVar: 'POLYGON_RPC_URL',
    nativeCurrency: 'MATIC',
    blockExplorer: 'https://polygonscan.com',
  },
  [Network.BASE]: {
    name: 'Base',
    chainId: 8453,
    rpcEnvVar: 'BASE_RPC_URL',
    nativeCurrency: 'ETH',
    blockExplorer: 'https://basescan.org',
  },
};

export const KYC_LIMITS: Record<string, number> = {
  TIER_0: 200,
  TIER_1: 10000,
  TIER_2: Infinity,
};

export const TRANSACTION_2FA_THRESHOLD = 50;

export const TOP_20_CRYPTO_SYMBOLS = [
  'BTC', 'ETH', 'USDT', 'BNB', 'SOL', 'USDC', 'XRP', 'STETH', 'TON',
  'DOGE', 'ADA', 'TRX', 'AVAX', 'SHIB', 'DOT', 'LINK', 'MATIC', 'WBTC', 'ICP', 'UNI',
];

export const SERVICE_NAMES = {
  AUTH: 'auth-service',
  USER: 'user-service',
  WALLET: 'wallet-service',
  EXCHANGE: 'exchange-service',
  MARKET_DATA: 'market-data-service',
  REMITTANCE: 'remittance-service',
  EARN: 'earn-service',
  COMPLIANCE: 'compliance-service',
  NOTIFICATION: 'notification-service',
} as const;

export const KAFKA_TOPICS = {
  USER_CREATED: 'user.created',
  USER_KYC_UPDATED: 'user.kyc-updated',
  WALLET_CREATED: 'wallet.created',
  TRANSACTION_INITIATED: 'transaction.initiated',
  TRANSACTION_CONFIRMED: 'transaction.confirmed',
  TRANSACTION_FAILED: 'transaction.failed',
  ORDER_CREATED: 'order.created',
  ORDER_FILLED: 'order.filled',
  COMPLIANCE_FLAG: 'compliance.flag',
  COMPLIANCE_PASSED: 'compliance.passed',
  REMITTANCE_INITIATED: 'remittance.initiated',
  REMITTANCE_SETTLED: 'remittance.settled',
  EARN_DEPOSIT: 'earn.deposit',
  EARN_WITHDRAW: 'earn.withdraw',
} as const;
