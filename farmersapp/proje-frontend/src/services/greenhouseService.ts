import api from '../api';
import { Greenhouse } from '../types/index';

export const getAllGreenhouses = async (): Promise<Greenhouse[]> => {
  try {
    const response = await api.get('/api/greenhouses');
    return response.data;
  } catch (error) {
    console.error('Error fetching greenhouses:', error);
    throw error;
  }
};

export const getGreenhouseById = async (id: number): Promise<Greenhouse> => {
  try {
    const response = await api.get(`/api/greenhouses/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching greenhouse:', error);
    throw error;
  }
};

export const createGreenhouse = async (greenhouse: Omit<Greenhouse, 'id'>): Promise<Greenhouse> => {
  try {
    const response = await api.post('/api/greenhouses', greenhouse);
    return response.data;
  } catch (error) {
    console.error('Error creating greenhouse:', error);
    throw error;
  }
};

export const updateGreenhouse = async (id: number, greenhouse: Omit<Greenhouse, 'id'>): Promise<Greenhouse> => {
  try {
    const response = await api.put(`/api/greenhouses/${id}`, greenhouse);
    return response.data;
  } catch (error) {
    console.error('Error updating greenhouse:', error);
    throw error;
  }
};

export const deleteGreenhouse = async (id: number): Promise<void> => {
  try {
    await api.delete(`/api/greenhouses/${id}`);
  } catch (error) {
    console.error('Error deleting greenhouse:', error);
    throw error;
  }
}; 