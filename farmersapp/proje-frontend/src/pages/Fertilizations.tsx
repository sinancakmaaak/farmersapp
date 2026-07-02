import React, { useState, useEffect } from 'react';
import type { Fertilization, Planting, Product } from '../types/index';
import { getAllFertilizations, createFertilization, updateFertilization, deleteFertilization } from '../services/fertilizationService';
import { getAllPlantings } from '../services/plantingService';
import { getAllProducts } from '../services/productService';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const Fertilizations: React.FC = () => {
  const [fertilizations, setFertilizations] = useState<Fertilization[]>([]);
  const [plantings, setPlantings] = useState<Planting[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFertilization, setSelectedFertilization] = useState<Fertilization | null>(null);

  const initialFormData = {
    date: new Date().toISOString().split('T')[0],
    plantingId: 0,
    productId: 0,
    notes: ''
  };

  const [formData, setFormData] = useState(initialFormData);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [fertilizationsData, plantingsData, productsData] = await Promise.all([
        getAllFertilizations(),
        getAllPlantings(),
        getAllProducts()
      ]);
      setFertilizations(Array.isArray(fertilizationsData) ? fertilizationsData : []);
      setPlantings(Array.isArray(plantingsData) ? plantingsData : []);
      // Filter products to only show fertilizers
      const fertilizers = Array.isArray(productsData) ? productsData.filter(p => p.type === 'Gübre') : [];
      setProducts(fertilizers);
    } catch (err) {
      setError('Veriler yüklenirken bir hata oluştu.');
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      if (!formData.plantingId || formData.plantingId === 0) {
        throw new Error('Lütfen bir ekim seçin');
      }

      if (!formData.productId || formData.productId === 0) {
        throw new Error('Lütfen bir gübre seçin');
      }

      const submitData = {
        ...formData,
        plantingId: Number(formData.plantingId),
        productId: Number(formData.productId),
        date: formData.date
      };

      if (selectedFertilization) {
        await updateFertilization(selectedFertilization.id, submitData);
      } else {
        await createFertilization(submitData);
      }

      loadData();
      setIsModalOpen(false);
      setFormData(initialFormData);
      setSelectedFertilization(null);
    } catch (err) {
      console.error('Error submitting fertilization:', err);
      setError(err instanceof Error ? err.message : 'İşlem sırasında bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bu gübreleme kaydını silmek istediğinizden emin misiniz?')) {
      setIsLoading(true);
      setError(null);
      try {
        await deleteFertilization(id);
        loadData();
      } catch (err) {
        setError('Silme işlemi sırasında bir hata oluştu.');
        console.error('Error deleting fertilization:', err);
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

  if (isLoading && !fertilizations.length) {
    return <div className="text-center p-4">Yükleniyor...</div>;
  }

  if (error && !fertilizations.length) {
    return <div className="text-center text-red-600 p-4">{error}</div>;
  }

  return (
    <div>
      <div className="sm:flex sm:items-center mb-6">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Gübreleme Kayıtları</h1>
          <p className="mt-2 text-sm text-gray-700">
            Tüm gübreleme kayıtlarının listesi ve yönetimi
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={() => {
              setSelectedFertilization(null);
              setFormData(initialFormData);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            Yeni Gübreleme Kaydı Ekle
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
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Ekim
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Gübre
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Gübreleme Tarihi
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Notlar
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">İşlemler</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {fertilizations.map((fertilization) => {
                    const planting = plantings.find(p => p.id === fertilization.plantingId);
                    const product = products.find(p => p.id === fertilization.productId);
                    
                    return (
                      <tr key={fertilization.id}>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {planting ? getPlantingInfo(planting) : 'Bilinmiyor'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {product?.name || 'Bilinmiyor'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {format(new Date(fertilization.date), 'dd MMMM yyyy', { locale: tr })}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {fertilization.notes}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button
                            onClick={() => {
                              setSelectedFertilization(fertilization);
                              setFormData({
                                date: fertilization.date,
                                plantingId: fertilization.plantingId,
                                productId: fertilization.productId,
                                notes: fertilization.notes || ''
                              });
                              setIsModalOpen(true);
                            }}
                            className="text-green-600 hover:text-green-900 mr-4"
                          >
                            Düzenle
                          </button>
                          <button
                            onClick={() => handleDelete(fertilization.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Sil
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
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Ekim
                    </label>
                    <select
                      value={formData.plantingId}
                      onChange={(e) => setFormData({ ...formData, plantingId: Number(e.target.value) })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                      required
                    >
                      <option value={0}>Ekim seçiniz</option>
                      {plantings.map((planting) => (
                        <option key={planting.id} value={planting.id}>
                          {getPlantingInfo(planting)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Gübre
                    </label>
                    <select
                      value={formData.productId}
                      onChange={(e) => setFormData({ ...formData, productId: Number(e.target.value) })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                      required
                    >
                      <option value={0}>Gübre seçiniz</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Gübreleme Tarihi
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Notlar
                    </label>
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
                    disabled={isLoading}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:col-start-2 sm:text-sm disabled:opacity-50"
                  >
                    {isLoading ? 'Kaydediliyor...' : selectedFertilization ? 'Güncelle' : 'Kaydet'}
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
        </div>
      )}
    </div>
  );
};

export default Fertilizations; 