import api from '../api';

interface FinancialSummary {
  netIncome: number;
  totalRevenue?: number;
  totalExpenses?: number;
  lastUpdated?: string;
}

export const getFinancialSummary = async (): Promise<FinancialSummary> => {
  try {
    const response = await api.get('/api/financial/summary');
    return response.data;
  } catch (error) {
    console.error('Error fetching financial summary:', error);
    throw error;
  }
}; 