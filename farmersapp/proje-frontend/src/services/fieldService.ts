import api from '../api';
import { Field } from '../types/index';

export const getAllFields = async (): Promise<Field[]> => {
  try {
    const response = await api.get('/api/fields');
    return response.data;
  } catch (error) {
    console.error('Error fetching fields:', error);
    throw error;
  }
};

export const getFieldById = async (id: number): Promise<Field> => {
  try {
    const response = await api.get(`/api/fields/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching field:', error);
    throw error;
  }
};

export const createField = async (field: Omit<Field, 'id'>): Promise<Field> => {
  try {
    const response = await api.post('/api/fields', field);
    return response.data;
  } catch (error) {
    console.error('Error creating field:', error);
    throw error;
  }
};

export const updateField = async (id: number, field: Omit<Field, 'id'>): Promise<Field> => {
  try {
    const response = await api.put(`/api/fields/${id}`, field);
    return response.data;
  } catch (error) {
    console.error('Error updating field:', error);
    throw error;
  }
};

export const deleteField = async (id: number): Promise<void> => {
  try {
    await api.delete(`/api/fields/${id}`);
  } catch (error) {
    console.error('Error deleting field:', error);
    throw error;
  }
};
