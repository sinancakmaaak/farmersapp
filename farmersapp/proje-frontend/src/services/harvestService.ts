import api from '../api';
import { Harvest } from '../types/index';

interface HarvestBackendData {
  date: string;
  plantingId: number;
  fieldId: number;
  quantity: number;
  unit: string;
  notes?: string;
}

export const createHarvest = async (data: HarvestBackendData) => {
  try {
    // Ensure date is in YYYY-MM-DD format
    const formattedData = {
      ...data,
      date: data.date ? new Date(data.date).toISOString().split('T')[0] : undefined
    };

    console.log('Service sending data:', formattedData);
    const response = await api.post('/api/harvests', formattedData);
    return response.data;
  } catch (error) {
    console.error('Error creating harvest:', error);
    throw error;
  }
};

interface RawHarvestData {
  id?: string | number;
  fieldId?: string | number;
  plantingId: string | number;
  date: string;
  quantity: string | number;
  unit: string;
  notes?: string;
}

const validateAndParseId = (id: any, isOptional: boolean = false): number => {
  if (id === null || id === undefined) {
    if (isOptional) {
      return 0; // Return default value for optional IDs
    }
    console.error('ID is null or undefined:', id);
    throw new Error('Invalid ID: null or undefined');
  }
  
  const parsedId = Number(id);
  if (isNaN(parsedId)) {
    console.error('Invalid ID value:', id, 'parsed as:', parsedId);
    throw new Error(`Invalid ID value: ${id}`);
  }
  
  return parsedId;
};

const validateAndParseNumber = (value: any, fieldName: string): number => {
  if (value === null || value === undefined) {
    console.error(`${fieldName} is null or undefined:`, value);
    throw new Error(`Invalid ${fieldName}: null or undefined`);
  }
  
  const parsedValue = Number(value);
  if (isNaN(parsedValue)) {
    console.error(`Invalid ${fieldName} value:`, value, 'parsed as:', parsedValue);
    throw new Error(`Invalid ${fieldName} value: ${value}`);
  }
  
  return parsedValue;
};

export const getHarvests = async (): Promise<Harvest[]> => {
  try {
    console.log('Fetching harvests from API...');
    const response = await api.get('/api/harvests');
    console.log('Raw API response:', response.data);
    
    if (!Array.isArray(response.data)) {
      console.error('API response is not an array:', response.data);
      throw new Error('Invalid API response: expected an array');
    }

    // Transform and validate each harvest record
    const harvests = response.data.map((rawHarvest: RawHarvestData, index: number) => {
      console.log(`Processing harvest ${index}:`, rawHarvest);
      
      try {
        // Backend'den gelen ID'yi kullan
        const id = rawHarvest.id ? Number(rawHarvest.id) : null;
        if (!id) {
          console.error('Missing or invalid ID in harvest:', rawHarvest);
          throw new Error('Invalid harvest data: missing ID');
        }

        // PlantingId kontrolü
        const plantingId = validateAndParseId(rawHarvest.plantingId, false);
        
        const harvest: Harvest = {
          id: id,
          fieldId: validateAndParseId(rawHarvest.fieldId, true) || 0,
          plantingId: plantingId,
          harvestDate: rawHarvest.date,
          quantity: validateAndParseNumber(rawHarvest.quantity, 'quantity'),
          unit: rawHarvest.unit,
          notes: rawHarvest.notes
        };
        
        console.log(`Successfully processed harvest ${index}:`, harvest);
        return harvest;
      } catch (error) {
        console.error(`Error processing harvest ${index}:`, error);
        return null;
      }
    }).filter((harvest): harvest is Harvest => harvest !== null);
    
    console.log('All harvests processed successfully:', harvests);
    return harvests;
  } catch (error) {
    console.error('Error in getHarvests:', error);
    throw error;
  }
};

export const updateHarvest = async (id: number, data: HarvestBackendData) => {
  try {
    if (!id) {
      throw new Error('Hasat ID bulunamadı');
    }

    // Ensure date is in YYYY-MM-DD format and map harvestDate to date
    const formattedData = {
      ...data,
      date: data.date ? new Date(data.date).toISOString().split('T')[0] : undefined
    };

    console.log('Service sending update data:', formattedData);
    const response = await api.post(`/api/harvests/${id}/update`, formattedData);
    return response.data;
  } catch (error) {
    console.error('Error updating harvest:', error);
    throw error;
  }
};

export const deleteHarvest = async (id: number): Promise<boolean> => {
  try {
    if (!id) {
      console.error('No harvest ID provided');
      throw new Error('Hasat ID bulunamadı');
    }

    console.log('Attempting to delete harvest with ID:', id);
    
    try {
      const response = await api.delete(`/api/harvests/${id}`);
      console.log('Delete response:', response);
      return true;
    } catch (error: any) {
      console.error('Error in deleteHarvest:', error);
      
      // Handle specific error cases
      if (error.response?.status === 404) {
        throw new Error('Hasat kaydı bulunamadı');
      }
      
      if (error.response?.status === 403) {
        throw new Error('Bu işlem için yetkiniz bulunmamaktadır');
      }

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      // Generic error message
      throw new Error('Silme işlemi sırasında bir hata oluştu');
    }
  } catch (error: any) {
    console.error('Error in deleteHarvest:', error);
    throw error;
  }
};
