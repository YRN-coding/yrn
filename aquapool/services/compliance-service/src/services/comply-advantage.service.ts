import axios from 'axios';

const BASE_URL = 'https://api.complyadvantage.com';
const API_KEY = process.env['COMPLY_ADVANTAGE_API_KEY'] ?? '';

export interface ComplyAdvantageHit {
  matchType: string;
  name: string;
  types: string[];
  score: number;
}

export interface ComplyAdvantageResult {
  searchId: string;
  totalHits: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  hits: ComplyAdvantageHit[];
}

export async function screenEntity(
  name: string,
  dateOfBirth?: string,
  country?: string
): Promise<ComplyAdvantageResult> {
  try {
    const body: Record<string, unknown> = {
      search_term: name,
      fuzziness: 0.6,
      filters: { types: ['sanction', 'warning', 'fitness-probity', 'pep'] },
    };
    if (dateOfBirth) body['filters.birth_year'] = dateOfBirth.slice(0, 4);
    if (country) body['filters.citizenship'] = country;

    const response = await axios.post<{
      data: {
        id: string;
        total_hits: number;
        hits: Array<{ match_types: string[]; doc: { name: string; types: string[] }; score: number }>;
      };
    }>(`${BASE_URL}/searches`, body, {
      headers: { Authorization: `Token ${API_KEY}` },
    });

    const { id, total_hits, hits } = response.data.data;
    const riskLevel = total_hits === 0 ? 'LOW' : total_hits < 3 ? 'MEDIUM' : 'HIGH';

    return {
      searchId: id,
      totalHits: total_hits,
      riskLevel,
      hits: hits.map((h) => ({
        matchType: h.match_types[0] ?? 'unknown',
        name: h.doc.name,
        types: h.doc.types,
        score: h.score,
      })),
    };
  } catch {
    return { searchId: 'error', totalHits: 0, riskLevel: 'LOW', hits: [] };
  }
}

export async function screenUserKyc(_userId: string, fullName: string): Promise<{ passed: boolean; riskLevel: string }> {
  if (!fullName) return { passed: true, riskLevel: 'LOW' };
  const result = await screenEntity(fullName);
  return { passed: result.riskLevel !== 'HIGH', riskLevel: result.riskLevel };
}
