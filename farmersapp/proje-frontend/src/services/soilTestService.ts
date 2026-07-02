import { SoilTest, SoilTestResult } from '../types';
import { api } from '../lib/api';

// SoilTest
export const getAllSoilTests = async (): Promise<SoilTest[]> => {
  const response = await api.get('/api/soil-tests');
  return response.data;
};

export const createSoilTest = async (data: Partial<SoilTest>): Promise<SoilTest> => {
  const response = await api.post('/api/soil-tests', data);
  return response.data;
};

export const updateSoilTest = async (id: number, data: Partial<SoilTest>): Promise<SoilTest> => {
  const response = await api.put(`/api/soil-tests/${id}`, data);
  return response.data;
};

export const deleteSoilTest = async (id: number): Promise<void> => {
  await api.delete(`/api/soil-tests/${id}`);
};

// SoilTestResult
export const getAllSoilTestResults = async (): Promise<SoilTestResult[]> => {
  const response = await api.get('/api/soil-test-results');
  return response.data;
};

export const createSoilTestResult = async (data: Partial<SoilTestResult>): Promise<SoilTestResult> => {
  const response = await api.post('/api/soil-test-results', data);
  return response.data;
};

export const updateSoilTestResult = async (id: number, data: Partial<SoilTestResult>): Promise<SoilTestResult> => {
  const response = await api.put(`/api/soil-test-results/${id}`, data);
  return response.data;
};

export const deleteSoilTestResult = async (id: number): Promise<void> => {
  await api.delete(`/api/soil-test-results/${id}`);
}; 