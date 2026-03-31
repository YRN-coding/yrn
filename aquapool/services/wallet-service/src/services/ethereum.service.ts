import { ethers } from 'ethers';

function getProvider(): ethers.JsonRpcProvider {
  const rpcUrl = process.env['ETHEREUM_RPC_URL'] ?? 'https://eth-mainnet.g.alchemy.com/v2/demo';
  return new ethers.JsonRpcProvider(rpcUrl);
}

const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function transfer(address to, uint256 amount) returns (bool)',
];

export async function getEthereumBalance(address: string, tokenAddress?: string): Promise<string> {
  const provider = getProvider();
  if (!tokenAddress) {
    const balance = await provider.getBalance(address);
    return balance.toString();
  }
  const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
  const balance = await (contract['balanceOf'] as (addr: string) => Promise<bigint>)(address);
  return balance.toString();
}

export async function estimateGas(
  from: string,
  to: string,
  amount: string,
  tokenAddress?: string
): Promise<{ gasLimit: bigint; maxFeePerGas: bigint; maxPriorityFeePerGas: bigint; totalFeeEth: string }> {
  const provider = getProvider();
  const feeData = await provider.getFeeData();
  const maxFeePerGas = feeData.maxFeePerGas ?? BigInt(0);
  const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas ?? BigInt(0);

  let gasLimit: bigint;
  if (!tokenAddress) {
    gasLimit = await provider.estimateGas({ from, to, value: BigInt(amount) });
  } else {
    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    gasLimit = await contract['transfer'].estimateGas(to, BigInt(amount), { from });
  }

  const totalFeeWei = gasLimit * maxFeePerGas;
  const totalFeeEth = ethers.formatEther(totalFeeWei);

  return { gasLimit, maxFeePerGas, maxPriorityFeePerGas, totalFeeEth };
}

export async function getTransactionReceipt(txHash: string): Promise<ethers.TransactionReceipt | null> {
  const provider = getProvider();
  return provider.getTransactionReceipt(txHash);
}
