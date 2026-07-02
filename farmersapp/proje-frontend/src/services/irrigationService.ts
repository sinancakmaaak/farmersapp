import api from '../api';
import { Irrigation } from '../types';

const BASE_URL = '/api/irrigations';

export const createIrrigation = async (irrigationData: Partial<Irrigation>) => {
    try {
        // Ensure date is in YYYY-MM-DD format
        const formattedData = {
            ...irrigationData,
            date: irrigationData.date ? new Date(irrigationData.date).toISOString().split('T')[0] : undefined
        };

        const response = await api.post(BASE_URL, formattedData);
        return response.data;
    } catch (error) {
        console.error('Error creating irrigation:', error);
        throw error;
    }
};

export const getAllIrrigations = async () => {
    try {
        const response = await api.get(BASE_URL, {
            params: {
                size: 100, // Her sayfada 100 kayıt göster
                sort: 'date,desc' // Tarihe göre azalan sıralama
            }
        });
        console.log('Irrigation response:', response.data);
        
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
        console.error('Error fetching irrigations:', error);
        throw error;
    }
};

export const getIrrigationById = async (id: number) => {
    try {
        const response = await api.get(`${BASE_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching irrigation with id ${id}:`, error);
        throw error;
    }
};

export const updateIrrigation = async (id: number, irrigationData: Partial<Irrigation>) => {
    try {
        // Ensure date is in YYYY-MM-DD format
        const formattedData = {
            ...irrigationData,
            date: irrigationData.date ? new Date(irrigationData.date).toISOString().split('T')[0] : undefined
        };

        const response = await api.put(`${BASE_URL}/${id}`, formattedData);
        return response.data;
    } catch (error) {
        console.error(`Error updating irrigation with id ${id}:`, error);
        throw error;
    }
};

export const deleteIrrigation = async (id: number) => {
    try {
        await api.delete(`${BASE_URL}/${id}`);
    } catch (error) {
        console.error(`Error deleting irrigation with id ${id}:`, error);
        throw error;
    }
};

export const getIrrigationsByField = async (fieldId: number) => {
    try {
        const response = await api.get(`${BASE_URL}/field/${fieldId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching irrigations for field ${fieldId}:`, error);
        throw error;
    }
};
