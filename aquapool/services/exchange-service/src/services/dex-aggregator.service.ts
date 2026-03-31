import axios from 'axios';

export interface SwapQuote {
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  estimatedGas: string;
  priceImpact: number;
  provider: string;
  protocols: unknown[];
  tx?: {
    from: string;
    to: string;
    data: string;
    value: string;
    gas: string;
    gasPrice: string;
  };
}

export interface JupiterQuote {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  priceImpactPct: number;
  routePlan: unknown[];
}

const ONEINCH_BASE = 'https://api.1inch.dev/swap/v6.0';

export async function getSwapQuote(
  fromToken: string,
  toToken: string,
  amount: string,
  chainId: number
): Promise<SwapQuote> {
  try {
    const response = await axios.get<{
      dstAmount: string;
      gas: string;
      protocols: unknown[];
    }>(`${ONEINCH_BASE}/${chainId}/quote`, {
      params: { src: fromToken, dst: toToken, amount },
      headers: { Authorization: `Bearer ${process.env['ONEINCH_API_KEY'] ?? ''}` },
    });

    return {
      fromToken,
      toToken,
      fromAmount: amount,
      toAmount: response.data.dstAmount,
      estimatedGas: response.data.gas,
      priceImpact: 0,
      provider: '1inch',
      protocols: response.data.protocols,
    };
  } catch {
    // Fallback mock quote for development
    return {
      fromToken,
      toToken,
      fromAmount: amount,
      toAmount: (BigInt(amount) * BigInt(98) / BigInt(100)).toString(),
      estimatedGas: '150000',
      priceImpact: 0.3,
      provider: 'mock',
      protocols: [],
    };
  }
}

export async function getJupiterQuote(
  inputMint: string,
  outputMint: string,
  amount: string
): Promise<JupiterQuote> {
  const response = await axios.get<JupiterQuote>('https://quote-api.jup.ag/v6/quote', {
    params: { inputMint, outputMint, amount, slippageBps: 50 },
  });
  return response.data;
}
