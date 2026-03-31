import axios from 'axios';
import { ethers } from 'ethers';

const LIDO_CONTRACT = '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84';
const LIDO_ABI = [
  'function submit(address _referral) external payable returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
];

export async function getLidoApy(): Promise<number> {
  try {
    const response = await axios.get<{ data: { aprs: { timeUnix: number; apr: number }[] } }>(
      'https://eth-api.lido.fi/v1/protocol/steth/apr/last'
    );
    return response.data.data.aprs[0]?.apr ?? 4.2;
  } catch {
    return 4.2; // fallback APY
  }
}

export async function getStethBalance(userAddress: string): Promise<string> {
  const provider = new ethers.JsonRpcProvider(process.env['ETHEREUM_RPC_URL'] ?? 'https://eth-mainnet.g.alchemy.com/v2/demo');
  const lido = new ethers.Contract(LIDO_CONTRACT, LIDO_ABI, provider);
  const balance = await (lido['balanceOf'] as (addr: string) => Promise<bigint>)(userAddress);
  return balance.toString();
}
