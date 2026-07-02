import api from '../api';
import { SupplierCompany } from '../types/index';

export const getAllSuppliers = async (): Promise<SupplierCompany[]> => {
  try {
    const response = await api.get('/api/supplier-companies');
    return response.data;
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    throw error;
  }
};

export const getSupplierById = async (id: number): Promise<SupplierCompany> => {
  try {
    const response = await api.get(`/api/supplier-companies/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching supplier:', error);
    throw error;
  }
};

export const createSupplier = async (supplier: Omit<SupplierCompany, 'id'>): Promise<SupplierCompany> => {
  try {
    const response = await api.post('/api/supplier-companies', supplier);
    return response.data;
  } catch (error) {
    console.error('Error creating supplier:', error);
    throw error;
  }
};

export const updateSupplier = async (id: number, supplier: Omit<SupplierCompany, 'id'>): Promise<SupplierCompany> => {
  try {
    const response = await api.put(`/api/supplier-companies/${id}`, supplier);
    return response.data;
  } catch (error) {
    console.error('Error updating supplier:', error);
    throw error;
  }
};

export const deleteSupplier = async (id: number): Promise<void> => {
  try {
    await api.delete(`/api/supplier-companies/${id}`);
  } catch (error) {
    console.error('Error deleting supplier:', error);
    throw error;
  }
}; 