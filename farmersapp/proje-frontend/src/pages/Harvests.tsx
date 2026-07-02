import React, { useState, useEffect } from 'react';
import { Harvest, Planting } from '../types/index';
import * as harvestService from '../services/harvestService';
import * as plantingService from '../services/plantingService';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface HarvestFormData extends Omit<Harvest, 'id'> {
  plantingId: number;
  fieldId: number;
  harvestDate: string;
  quantity: number;
  unit: string;
  notes: string;
}

const Harvests = () => {
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [plantings, setPlantings] = useState<Planting[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHarvest, setSelectedHarvest] = useState<Harvest | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<HarvestFormData>({
    plantingId: 0,
    fieldId: 0,
    harvestDate: new Date().toISOString().split('T')[0],
    quantity: 0,
    unit: 'kg',
    notes: ''
  });

  useEffect(() => {
    loadHarvests();
    loadPlantings();
  }, []);

  const loadHarvests = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Loading harvests...');
      const data = await harvestService.getHarvests();
      console.log('Received harvests:', data);
      
      // Additional validation
      const validHarvests = data.filter(harvest => {
        if (!harvest || typeof harvest !== 'object') {
          console.error('Invalid harvest object:', harvest);
          return false;
        }
        
        // For display purposes, we need at least plantingId and harvestDate
        if (!harvest.plantingId || !harvest.harvestDate) {
          console.error('Missing required display fields:', harvest);
          return false;
        }
        
        return true;
      });

      console.log('Validated harvests:', validHarvests);
      setHarvests(validHarvests);
      
      if (validHarvests.length < data.length) {
        console.warn(`Filtered out ${data.length - validHarvests.length} invalid harvest records`);
        setError('Bazı hasat kayıtları geçersiz veri içerdiği için gösterilemiyor.');
      }
    } catch (error: any) {
      console.error('Error loading harvests:', error);
      let errorMessage = 'Hasatlar yüklenirken bir hata oluştu.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPlantings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await plantingService.getAllPlantings();
      setPlantings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Ekimler yüklenirken hata:', error);
      setError('Ekimler yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const selectedPlanting = plantings.find(p => p.id === formData.plantingId);
      if (!selectedPlanting) {
        throw new Error('Lütfen bir ekim seçin');
      }

      const submitData = {
        date: formData.harvestDate,
        plantingId: Number(formData.plantingId),
        fieldId: selectedPlanting.fieldId || 0,
        quantity: Number(formData.quantity),
        unit: formData.unit,
        notes: formData.notes || ''
      };

      console.log('Gönderilen veri:', submitData);

      let createdHarvest = null;

      if (selectedHarvest && selectedHarvest.id) {
        // Güncelleme işlemi
        console.log('Hasat güncelleniyor, ID:', selectedHarvest.id);
        await harvestService.updateHarvest(selectedHarvest.id, submitData);
      } else {
        // Yeni hasat kaydı
        createdHarvest = await harvestService.createHarvest(submitData);
        console.log('Hasat kaydı oluşturuldu:', createdHarvest);

        if (createdHarvest) {
          try {
            // Planting'i sil
            await plantingService.deletePlanting(submitData.plantingId);
            console.log('Planting başarıyla silindi:', submitData.plantingId);
          } catch (error) {
            console.error('Planting silinirken hata:', error);
            setError('Hasat kaydı oluşturuldu fakat ekim kaydı silinemedi.');
          }
        }
      }

      // Başarılı işlem sonrası
      setIsModalOpen(false);
      setSelectedHarvest(null);
      setFormData({
        plantingId: 0,
        fieldId: 0,
        harvestDate: new Date().toISOString().split('T')[0],
        quantity: 0,
        unit: 'kg',
        notes: ''
      });

      // Hem hasat listesini hem de planting listesini güncelle
      await Promise.all([loadHarvests(), loadPlantings()]);

    } catch (error: any) {
      console.error('İşlem sırasında hata:', error);
      let errorMessage = 'İşlem sırasında bir hata oluştu.';
      
      if (error.response?.data) {
        console.error('Backend yanıtı:', error.response.data);
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (typeof error.response.data.message === 'string') {
          errorMessage = error.response.data.message;
        } else if (typeof error.response.data.error === 'string') {
          errorMessage = error.response.data.error;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (harvestId: number | undefined) => {
    console.log('Delete requested for harvest ID:', harvestId);
    
    if (typeof harvestId !== 'number' || isNaN(harvestId) || harvestId <= 0) {
      console.error('Invalid harvest ID:', harvestId);
      setError('Geçersiz hasat ID\'si.');
      return;
    }

    const harvestToDelete = harvests.find(h => h.id === harvestId);
    if (!harvestToDelete) {
      console.error('Harvest not found with ID:', harvestId);
      setError('Silinecek hasat kaydı bulunamadı.');
      return;
    }

    console.log('Found harvest to delete:', harvestToDelete);

    if (window.confirm('Bu hasat kaydını silmek istediğinizden emin misiniz?')) {
      setIsLoading(true);
      setError(null);
      try {
        console.log('Attempting to delete harvest:', harvestToDelete);
        await harvestService.deleteHarvest(harvestId);
        console.log('Successfully deleted harvest');
        
        // Silme başarılı olduktan sonra UI'ı güncelle
        await loadHarvests(); // Tüm listeyi yeniden yükle
        
      } catch (error: any) {
        console.error('Error while deleting harvest:', error);
        
        // Handle specific error messages
        if (error.message === 'Bu işlem için yetkiniz bulunmamaktadır') {
          setError('Bu hasat kaydını silmek için yetkiniz bulunmamaktadır.');
        } else if (error.message === 'Hasat kaydı bulunamadı') {
          setError('Silinecek hasat kaydı bulunamadı. Sayfa yenileniyor...');
          await loadHarvests();
        } else {
          setError(error.message || 'Silme işlemi sırasında bir hata oluştu.');
          // Hata durumunda listeyi yeniden yükle
          await loadHarvests();
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getPlantingInfo = (planting: Planting) => {
    if (!planting) return 'Bilinmiyor';
    const product = planting.product?.name || 'Bilinmeyen Ürün';
    const location = planting.field?.name || planting.greenhouse?.name || 'Bilinmeyen Konum';
    const date = planting.plantingDate ? format(new Date(planting.plantingDate), 'dd MMMM yyyy', { locale: tr }) : '';
    return `${product} - ${location} (${date})`;
  };

  if (isLoading && !harvests.length) {
    return <div className="text-center p-4">Yükleniyor...</div>;
  }

  if (error && !harvests.length) {
    return <div className="text-center text-red-600 p-4">{error}</div>;
  }

  return (
    <div>
      <div className="sm:flex sm:items-center mb-6">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Hasat Kayıtları</h1>
          <p className="mt-2 text-sm text-gray-700">
            Tüm hasat kayıtlarının listesi ve yönetimi
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={() => {
              setSelectedHarvest(null);
              setFormData({
                plantingId: 0,
                fieldId: 0,
                harvestDate: new Date().toISOString().split('T')[0],
                quantity: 0,
                unit: 'kg',
                notes: ''
              });
              setIsModalOpen(true);
            }}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            Yeni Hasat Kaydı Ekle
          </button>
        </div>
      </div>

      {error && <div className="mb-4 text-red-600">{error}</div>}

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr key="header">
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Ekim Bilgisi</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Hasat Tarihi</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Miktar</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Notlar</th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">İşlemler</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {harvests.map((harvest, index) => {
                    console.log(`Rendering harvest ${index}:`, harvest);
                    
                    // Validate harvest object
                    if (!harvest || typeof harvest !== 'object') {
                      console.error(`Invalid harvest object at index ${index}:`, harvest);
                      return null;
                    }

                    // Validate required fields
                    if (!harvest.id || !harvest.plantingId || !harvest.harvestDate) {
                      console.error(`Missing required fields in harvest at index ${index}:`, harvest);
                      return null;
                    }

                    const planting = plantings.find(p => p.id === harvest.plantingId);
                    
                    return (
                      <tr key={`harvest-${harvest.id}-${index}`}>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                          {planting ? getPlantingInfo(planting) : 'Bilinmiyor'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                          {harvest.harvestDate ? format(new Date(harvest.harvestDate), 'dd MMMM yyyy', { locale: tr }) : ''}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                          {typeof harvest.quantity === 'number' ? `${harvest.quantity} ${harvest.unit}` : 'Geçersiz miktar'}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-900">{harvest.notes}</td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button
                            onClick={() => {
                              console.log('Edit button clicked for harvest:', harvest);
                              if (typeof harvest.id !== 'number' || isNaN(harvest.id)) {
                                console.error('Invalid harvest ID for edit:', harvest.id);
                                setError('Geçersiz hasat kaydı.');
                                return;
                              }
                              setSelectedHarvest(harvest);
                              setFormData({
                                plantingId: harvest.plantingId,
                                fieldId: harvest.fieldId,
                                harvestDate: harvest.harvestDate,
                                quantity: harvest.quantity,
                                unit: harvest.unit,
                                notes: harvest.notes || ''
                              });
                              setIsModalOpen(true);
                            }}
                            className="text-green-600 hover:text-green-900 mr-4"
                            disabled={isLoading}
                          >
                            {isLoading ? 'İşlem yapılıyor...' : 'Düzenle'}
                          </button>
                          <button
                            onClick={() => {
                              console.log('Delete button clicked for harvest:', harvest);
                              if (typeof harvest.id !== 'number' || isNaN(harvest.id)) {
                                console.error('Invalid harvest ID for deletion:', harvest.id);
                                setError('Geçersiz hasat kaydı.');
                                return;
                              }
                              handleDelete(harvest.id);
                            }}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isLoading}
                          >
                            {isLoading ? 'Siliniyor...' : 'Sil'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-medium mb-4">
              {selectedHarvest ? 'Hasat Kaydı Düzenle' : 'Yeni Hasat Kaydı Ekle'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Ekim Seçin
                  </label>
                  <select
                    value={formData.plantingId}
                    onChange={(e) => {
                      const selectedPlanting = plantings.find(p => p.id === Number(e.target.value));
                      setFormData(prev => ({
                        ...prev,
                        plantingId: Number(e.target.value),
                        fieldId: selectedPlanting?.fieldId || 0
                      }));
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                    required
                  >
                    <option key="default" value={0}>Seçiniz</option>
                    {plantings.map((planting) => (
                      <option key={planting.id} value={planting.id}>
                        {getPlantingInfo(planting)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Hasat Tarihi
                  </label>
                  <input
                    type="date"
                    value={formData.harvestDate}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      harvestDate: e.target.value
                    }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Miktar
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        quantity: Number(e.target.value)
                      }))}
                      className="flex-1 rounded-none rounded-l-md border-gray-300 focus:border-green-500 focus:ring-green-500 sm:text-sm"
                      required
                      min="0"
                      step="0.01"
                    />
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        unit: e.target.value
                      }))}
                      className="rounded-none rounded-r-md border-gray-300 focus:border-green-500 focus:ring-green-500 sm:text-sm"
                    >
                      <option value="kg">kg</option>
                      <option value="ton">ton</option>
                      <option value="adet">adet</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Notlar
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      notes: e.target.value
                    }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                    rows={3}
                  />
                </div>
              </div>

              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:col-start-2 sm:text-sm disabled:opacity-50"
                >
                  {isLoading ? 'Kaydediliyor...' : selectedHarvest ? 'Güncelle' : 'Kaydet'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Harvests;
