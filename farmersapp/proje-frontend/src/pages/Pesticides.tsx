import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Pesticide, Planting } from '../types';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { DatePicker } from '@mui/x-date-pickers';
import { getPlantingInfo } from '../utils/plantingUtils';

const Pesticides = () => {
  const [pesticides, setPesticides] = useState<Pesticide[]>([]);
  const [plantings, setPlantings] = useState<Planting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPesticide, setSelectedPesticide] = useState<Pesticide | null>(null);
  const [formData, setFormData] = useState({
    chemical: '',
    applicationDate: new Date(),
    plantingId: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pesticidesResponse, plantingsResponse] = await Promise.all([
        api.get('/api/pesticides'),
        api.get('/api/plantings')
      ]);
      setPesticides(pesticidesResponse.data);
      setPlantings(plantingsResponse.data.content);
      setError(null);
    } catch (err) {
      setError('İlaçlama kayıtları yüklenirken bir hata oluştu.');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedPesticide) {
        await api.put(`/api/pesticides/${selectedPesticide.id}`, formData);
      } else {
        await api.post('/api/pesticides', formData);
      }
      setIsModalOpen(false);
      loadData();
      resetForm();
    } catch (err) {
      console.error('Error saving pesticide:', err);
      setError('İlaçlama kaydı kaydedilirken bir hata oluştu.');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bu ilaçlama kaydını silmek istediğinizden emin misiniz?')) {
      try {
        await api.delete(`/api/pesticides/${id}`);
        loadData();
      } catch (err) {
        console.error('Error deleting pesticide:', err);
        setError('İlaçlama kaydı silinirken bir hata oluştu.');
      }
    }
  };

  const handleEdit = (pesticide: Pesticide) => {
    setSelectedPesticide(pesticide);
    setFormData({
      chemical: pesticide.chemical,
      applicationDate: new Date(pesticide.applicationDate),
      plantingId: pesticide.plantingId.toString(),
      notes: pesticide.notes || ''
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setSelectedPesticide(null);
    setFormData({
      chemical: '',
      applicationDate: new Date(),
      plantingId: '',
      notes: ''
    });
  };

  if (loading && !pesticides.length) {
    return <div className="text-center p-4">Yükleniyor...</div>;
  }

  if (error && !pesticides.length) {
    return <div className="text-center text-red-600 p-4">{error}</div>;
  }

  return (
    <div>
      <div className="sm:flex sm:items-center mb-6">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">İlaçlama Kayıtları</h1>
          <p className="mt-2 text-sm text-gray-700">
            Tüm ilaçlama kayıtlarının listesi ve yönetimi
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={() => {
              setSelectedPesticide(null);
              setFormData({
                chemical: '',
                applicationDate: new Date(),
                plantingId: '',
                notes: ''
              });
              setIsModalOpen(true);
            }}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            Yeni İlaçlama Kaydı Ekle
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
                  <tr>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tarih</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">İlaç</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Ekim Bilgisi</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Notlar</th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">İşlemler</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {pesticides.map((pesticide) => (
                    <tr key={pesticide.id}>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                        {format(new Date(pesticide.applicationDate), 'dd MMMM yyyy', { locale: tr })}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                        {pesticide.chemical}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                        {getPlantingInfo(
                          plantings.find((p) => p.id === pesticide.plantingId)
                        )}
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-900">{pesticide.notes}</td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          onClick={() => handleEdit(pesticide)}
                          className="text-green-600 hover:text-green-900 mr-4"
                          disabled={loading}
                        >
                          {loading ? 'İşlem yapılıyor...' : 'Düzenle'}
                        </button>
                        <button
                          onClick={() => handleDelete(pesticide.id)}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={loading}
                        >
                          {loading ? 'Siliniyor...' : 'Sil'}
                        </button>
                      </td>
                    </tr>
                  ))}
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
              {selectedPesticide ? 'İlaçlama Kaydını Düzenle' : 'Yeni İlaçlama Kaydı Ekle'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">İlaç</label>
                  <input
                    type="text"
                    value={formData.chemical}
                    onChange={(e) => setFormData({ ...formData, chemical: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tarih</label>
                  <DatePicker
                    value={formData.applicationDate}
                    onChange={(date) => setFormData({ ...formData, applicationDate: date || new Date() })}
                    format="dd/MM/yyyy"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ekim Seçin</label>
                  <select
                    value={formData.plantingId}
                    onChange={(e) => setFormData({ ...formData, plantingId: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                    required
                  >
                    <option value="">Seçiniz</option>
                    {plantings.map((planting) => (
                      <option key={planting.id} value={planting.id}>
                        {getPlantingInfo(planting)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notlar</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                    rows={3}
                  />
                </div>
              </div>

              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:col-start-2 sm:text-sm disabled:opacity-50"
                >
                  {loading ? 'Kaydediliyor...' : selectedPesticide ? 'Güncelle' : 'Kaydet'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
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

export default Pesticides; 