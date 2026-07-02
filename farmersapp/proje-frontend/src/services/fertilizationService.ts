import api from '../api';
import { Fertilization } from '../types/index';

const BASE_URL = '/api/fertilizations';

export const getAllFertilizations = async (): Promise<Fertilization[]> => {
  try {
    const response = await api.get(BASE_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching fertilizations:', error);
    throw error;
  }
};

export const getFertilizationById = async (id: number): Promise<Fertilization> => {
  try {
    const response = await api.get(`${BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching fertilization with id ${id}:`, error);
    throw error;
  }
};

export const createFertilization = async (fertilizationData: Partial<Fertilization>): Promise<Fertilization> => {
  try {
    const response = await api.post(BASE_URL, fertilizationData);
    return response.data;
  } catch (error) {
    console.error('Error creating fertilization:', error);
    throw error;
  }
};

export const updateFertilization = async (id: number, fertilizationData: Partial<Fertilization>): Promise<Fertilization> => {
  try {
    const response = await api.put(`${BASE_URL}/${id}`, fertilizationData);
    return response.data;
  } catch (error) {
    console.error(`Error updating fertilization with id ${id}:`, error);
    throw error;
  }
};

export const deleteFertilization = async (id: number): Promise<void> => {
  try {
    await api.delete(`${BASE_URL}/${id}`);
  } catch (error) {
    console.error(`Error deleting fertilization with id ${id}:`, error);
    throw error;
  }
}; 