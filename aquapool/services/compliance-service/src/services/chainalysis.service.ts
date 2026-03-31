import axios from 'axios';

const BASE_URL = 'https://api.chainalysis.com';
const API_KEY = process.env['CHAINALYSIS_API_KEY'] ?? '';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'SEVERE';

export interface ChainanalysisResult {
  address: string;
  network: string;
  riskScore: number;
  riskLevel: RiskLevel;
  categories: string[];
  cluster?: { name: string; category: string };
}

export async function screenAddress(address: string, network: string): Promise<ChainanalysisResult> {
  try {
    const response = await axios.post<{ data: { address: string; risk: string; riskReason: string[] } }>(
      `${BASE_URL}/api/v2/address/${address}`,
      { network },
      { headers: { Token: API_KEY } }
    );

    const risk = response.data.data.risk.toUpperCase() as RiskLevel;
    const riskScore = risk === 'LOW' ? 10 : risk === 'MEDIUM' ? 40 : risk === 'HIGH' ? 70 : 95;

    return { address, network, riskScore, riskLevel: risk, categories: response.data.data.riskReason };
  } catch {
    // Default to LOW risk if API fails (log in production)
    console.warn(`[Chainalysis] Screening failed for ${address}, defaulting to LOW risk`);
    return { address, network, riskScore: 5, riskLevel: 'LOW', categories: [] };
  }
}
