import api from '../api';
import type { Planting, Page } from '../types/index';

export const getAllPlantings = async (): Promise<Planting[]> => {
  try {
    console.log('Fetching all plantings...');
    const response = await api.get<Page<Planting>>('/api/plantings', {
      params: {
        size: 100, // Her sayfada 100 kayıt göster
        sort: 'plantingDate,desc' // Ekim tarihine göre azalan sıralama
      }
    });
    console.log('Received plantings response:', response.data);
    
    // Pageable response'dan content'i al
    if (response.data && response.data.content) {
      return response.data.content;
    }
    
    // Eğer düz array dönerse onu kullan
    if (Array.isArray(response.data)) {
      return response.data;
    }
    
    // Hiçbir şey bulunamazsa boş array dön
    return [];
  } catch (error) {
    console.error('Error fetching plantings:', error);
    throw error;
  }
};

export const getPlantingById = async (id: number): Promise<Planting> => {
  try {
    const response = await api.get(`/api/plantings/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching planting:', error);
    throw error;
  }
};

export const createPlanting = async (planting: Omit<Planting, 'id'>): Promise<Planting> => {
  try {
    console.log('Sending planting data to backend:', planting);
    const response = await api.post('/api/plantings', planting);
    return response.data;
  } catch (error: any) {
    console.error('Error creating planting:', error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
    }
    throw error;
  }
};

export const updatePlanting = async (id: number, planting: Omit<Planting, 'id'>): Promise<Planting> => {
  try {
    const response = await api.put(`/api/plantings/${id}`, planting);
    return response.data;
  } catch (error) {
    console.error('Error updating planting:', error);
    throw error;
  }
};

export const deletePlanting = async (id: number) => {
  try {
    if (!id) {
      throw new Error('Silinecek ekim/dikim kaydı bulunamadı');
    }
    
    console.log('Deleting planting with id:', id);
    const response = await api.delete(`/api/plantings/${id}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 204 || response.status === 200) {
      console.log('Planting successfully deleted');
      return true;
    }
    
    throw new Error('Silme işlemi başarısız oldu');
  } catch (error: any) {
    console.error('Error deleting planting:', error);
    if (error.response?.status === 403) {
      throw new Error('Bu işlem için yetkiniz bulunmamaktadır');
    }
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
}; 