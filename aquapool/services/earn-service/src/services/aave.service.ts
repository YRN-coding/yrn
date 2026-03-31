import { ethers } from 'ethers';

const AAVE_POOL_ABI = [
  'function getReserveData(address asset) view returns (tuple(uint256 configuration, uint128 liquidityIndex, uint128 currentLiquidityRate, uint128 variableBorrowIndex, uint128 currentVariableBorrowRate, uint128 currentStableBorrowRate, uint40 lastUpdateTimestamp, uint16 id, address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress, address interestRateStrategyAddress, uint128 accruedToTreasury, uint128 unbacked, uint128 isolationModeTotalDebt))',
];

export interface AaveReserveData {
  liquidityRate: number;
  variableBorrowRate: number;
  aTokenAddress: string;
}

export async function getAaveReserveData(assetAddress: string): Promise<AaveReserveData> {
  const provider = new ethers.JsonRpcProvider(process.env['ETHEREUM_RPC_URL'] ?? 'https://eth-mainnet.g.alchemy.com/v2/demo');
  const poolAddress = '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2'; // AAVE V3 Ethereum
  const pool = new ethers.Contract(poolAddress, AAVE_POOL_ABI, provider);

  const data = await (pool['getReserveData'] as (addr: string) => Promise<{
    currentLiquidityRate: bigint;
    currentVariableBorrowRate: bigint;
    aTokenAddress: string;
  }>)(assetAddress);

  const RAY = BigInt('1000000000000000000000000000'); // 10^27
  const liquidityRate = Number(data.currentLiquidityRate * BigInt(100) / RAY) / 100;
  const variableBorrowRate = Number(data.currentVariableBorrowRate * BigInt(100) / RAY) / 100;

  return { liquidityRate, variableBorrowRate, aTokenAddress: data.aTokenAddress };
}
