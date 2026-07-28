import { api } from '../lib/api';
import type { FinanceSummary, FinancePeriod } from '../types';

export async function fetchFinanceSummary(period: FinancePeriod): Promise<FinanceSummary> {
  const res = await api.get('/finance', { params: { period } });
  return res.data;
}