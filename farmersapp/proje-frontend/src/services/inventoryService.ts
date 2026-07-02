import api from '../api';
import { Inventory } from '../types/index';

export const getAllInventory = async (): Promise<Inventory[]> => {
  try {
    const response = await api.get('/api/inventory');
    return response.data;
  } catch (error) {
    console.error('Error fetching inventory:', error);
    throw error;
  }
};

export const getInventoryById = async (id: number): Promise<Inventory> => {
  try {
    const response = await api.get(`/api/inventory/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    throw error;
  }
};

export const createInventory = async (inventory: Omit<Inventory, 'id'>): Promise<Inventory> => {
  try {
    const response = await api.post('/api/inventory', inventory);
    return response.data;
  } catch (error) {
    console.error('Error creating inventory item:', error);
    throw error;
  }
};

export const updateInventory = async (id: number, inventory: Omit<Inventory, 'id'>): Promise<Inventory> => {
  try {
    const response = await api.put(`/api/inventory/${id}`, inventory);
    return response.data;
  } catch (error) {
    console.error('Error updating inventory item:', error);
    throw error;
  }
};

export const deleteInventory = async (id: number): Promise<void> => {
  try {
    await api.delete(`/api/inventory/${id}`);
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    throw error;
  }
}; 