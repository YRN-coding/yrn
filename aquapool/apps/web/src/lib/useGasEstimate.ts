'use client';

import { useState, useCallback } from 'react';
import { usePublicClient, useAccount } from 'wagmi';
import { parseEther, formatEther, formatGwei } from 'viem';

interface GasEstimate {
  gasLimit: bigint;
  gasPrice: bigint;
  maxFeePerGas: bigint | undefined;
  maxPriorityFeePerGas: bigint | undefined;
  estimatedCostEth: string;
  estimatedCostGwei: string;
  isLoading: boolean;
  error: string | null;
}

interface GasEstimateOptions {
  to?: `0x${string}`;
  value?: string; // ETH amount as decimal string
  data?: `0x${string}`;
}

const DEFAULT_STATE: GasEstimate = {
  gasLimit: 0n,
  gasPrice: 0n,
  maxFeePerGas: undefined,
  maxPriorityFeePerGas: undefined,
  estimatedCostEth: '0',
  estimatedCostGwei: '0',
  isLoading: false,
  error: null,
};

export function useGasEstimate(options: GasEstimateOptions = {}) {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [estimate, setEstimate] = useState<GasEstimate>(DEFAULT_STATE);

  const estimateGas = useCallback(async (overrides?: GasEstimateOptions) => {
    const params = { ...options, ...overrides };
    if (!publicClient || !address || !params.to) return;

    setEstimate((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const [gasLimit, feeData] = await Promise.all([
        publicClient.estimateGas({
          account: address,
          to: params.to,
          value: params.value ? parseEther(params.value) : undefined,
          data: params.data,
        }),
        publicClient.estimateFeesPerGas(),
      ]);

      const maxFeePerGas = feeData.maxFeePerGas ?? 0n;
      const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas ?? 0n;
      const totalCostWei = gasLimit * maxFeePerGas;

      setEstimate({
        gasLimit,
        gasPrice: maxFeePerGas,
        maxFeePerGas,
        maxPriorityFeePerGas,
        estimatedCostEth: formatEther(totalCostWei),
        estimatedCostGwei: formatGwei(maxFeePerGas),
        isLoading: false,
        error: null,
      });
    } catch (err) {
      setEstimate((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Gas estimation failed',
      }));
    }
  }, [publicClient, address, options]);

  // Simulate a transaction without broadcasting — returns true if it would succeed
  const simulate = useCallback(async (overrides?: GasEstimateOptions): Promise<boolean> => {
    const params = { ...options, ...overrides };
    if (!publicClient || !address || !params.to) return false;

    try {
      await publicClient.call({
        account: address,
        to: params.to,
        value: params.value ? parseEther(params.value) : undefined,
        data: params.data,
      });
      return true;
    } catch {
      return false;
    }
  }, [publicClient, address, options]);

  return { ...estimate, estimateGas, simulate };
}
