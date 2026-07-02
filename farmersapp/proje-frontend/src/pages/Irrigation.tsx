import React, { useState, useEffect } from 'react';
import { getAllIrrigations, createIrrigation, updateIrrigation, deleteIrrigation } from '../services/irrigationService';
import { getAllFields } from '../services/fieldService';
import { getAllProducts } from '../services/productService';
import { getAllGreenhouses } from '../services/greenhouseService';
import { Field, Greenhouse, Irrigation as IrrigationType, Product } from '../types';

const Irrigation = () => {
  const [irrigations, setIrrigations] = useState<IrrigationType[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [greenhouses, setGreenhouses] = useState<Greenhouse[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIrrigation, setSelectedIrrigation] = useState<IrrigationType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationType, setLocationType] = useState<'field' | 'greenhouse'>('field');
  const [formData, setFormData] = useState({
    fieldId: 0,
    greenhouseId: 0,
    productId: 0,
    date: '',
    notes: ''
  });

  useEffect(() => {
    loadIrrigations();
    loadFields();
    loadProducts();
    loadGreenhouses();
  }, []);

  const loadGreenhouses = async () => {
    try {
      const greenhouses = await getAllGreenhouses();
      setGreenhouses(Array.isArray(greenhouses) ? greenhouses : []);
    } catch (error) {
      console.error('Seralar yüklenirken hata:', error);
      setError('Seralar yüklenirken bir hata oluştu.');
    }
  };

  const loadIrrigations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAllIrrigations();
      setIrrigations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Sulama kayıtları yüklenirken hata:', error);
      setError('Sulama kayıtları yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadFields = async () => {
    try {
      const fields = await getAllFields();
      setFields(Array.isArray(fields) ? fields : []);
    } catch (error) {
      console.error('Tarlalar yüklenirken hata:', error);
      setError('Tarlalar yüklenirken bir hata oluştu.');
    }
  };

  const loadProducts = async () => {
    try {
      const products = await getAllProducts();
      setProducts(Array.isArray(products) ? products : []);
    } catch (error) {
      console.error('Ürünler yüklenirken hata:', error);
      setError('Ürünler yüklenirken bir hata oluştu.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      // Form validasyonu
      if (!formData.productId || formData.productId === 0) {
        throw new Error('Lütfen bir ürün seçin');
      }

      if (!formData.date) {
        throw new Error('Lütfen bir tarih seçin');
      }

      // Konum validasyonu
      if (locationType === 'field') {
        if (!formData.fieldId || formData.fieldId === 0) {
          throw new Error('Lütfen bir tarla seçin');
        }
      } else if (locationType === 'greenhouse') {
        if (!formData.greenhouseId || formData.greenhouseId === 0) {
          throw new Error('Lütfen bir sera seçin');
        }
      }

      const submitData = {
        fieldId: formData.fieldId > 0 ? Number(formData.fieldId) : undefined,
        greenhouseId: formData.greenhouseId > 0 ? Number(formData.greenhouseId) : undefined,
        productId: Number(formData.productId),
        date: formData.date,
        notes: formData.notes || ''
      };

      console.log('Gönderilen veri:', submitData);

      if (selectedIrrigation) {
        console.log('Updating irrigation with data:', submitData);
        await updateIrrigation(selectedIrrigation.id, submitData);
      } else {
        console.log('Creating new irrigation with data:', submitData);
        await createIrrigation(submitData);
      }
      setIsModalOpen(false);
      setSelectedIrrigation(null);
      setFormData({ fieldId: 0, greenhouseId: 0, productId: 0, date: '', notes: '' });
      loadIrrigations();
    } catch (error: any) {
      console.error('İşlem sırasında hata:', error);
      setError(error.message || 'İşlem sırasında bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bu sulama kaydını silmek istediğinizden emin misiniz?')) {
      setIsLoading(true);
      setError(null);
      try {
        await deleteIrrigation(id);
        loadIrrigations();
      } catch (error) {
        console.error('Silme işlemi sırasında hata:', error);
        setError('Silme işlemi sırasında bir hata oluştu.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (isLoading && !irrigations.length) {
    return <div className="text-center p-4">Yükleniyor...</div>;
  }

  if (error && !irrigations.length) {
    return <div className="text-center text-red-600 p-4">{error}</div>;
  }

  return (
    <div>
      <div className="sm:flex sm:items-center mb-6">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Sulama Kayıtları</h1>
          <p className="mt-2 text-sm text-gray-700">
            Tüm sulama kayıtlarının listesi ve yönetimi
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                                  <button
                          onClick={() => {
                            setSelectedIrrigation(null);
                            setFormData({ fieldId: 0, greenhouseId: 0, productId: 0, date: '', notes: '' });
                            setLocationType('field');
                            setIsModalOpen(true);
                          }}
                          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                        >
                          Yeni Sulama Kaydı Ekle
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
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tarla</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Ürün</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tarih</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Notlar</th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">İşlemler</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {irrigations.map((irrigation) => (
                    <tr key={irrigation.id}>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                        {irrigation.field 
                          ? `Tarla: ${irrigation.field.name}`
                          : irrigation.greenhouse
                            ? `Sera: ${irrigation.greenhouse.name}`
                            : 'Bilinmiyor'
                        }
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                        {irrigation.product ? irrigation.product.name : 'Bilinmiyor'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{irrigation.date}</td>
                      <td className="px-3 py-4 text-sm text-gray-900">{irrigation.notes}</td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          onClick={() => {
                            setSelectedIrrigation(irrigation);
                            // Konum tipini belirle
                            const newLocationType = irrigation.field ? 'field' : 'greenhouse';
                            setLocationType(newLocationType);
                            setFormData({
                              fieldId: irrigation.field?.id || 0,
                              greenhouseId: irrigation.greenhouse?.id || 0,
                              productId: irrigation.product?.id || 0,
                              date: irrigation.date,
                              notes: irrigation.notes || ''
                            });
                            setIsModalOpen(true);
                          }}
                          className="text-green-600 hover:text-green-900 mr-4"
                        >
                          Düzenle
                        </button>
                        <button
                          onClick={() => handleDelete(irrigation.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Sil
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
              {selectedIrrigation ? 'Sulama Kaydı Düzenle' : 'Yeni Sulama Kaydı Ekle'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Ürün
                  </label>
                  <select
                    value={formData.productId}
                    onChange={(e) => setFormData({ ...formData, productId: Number(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                    required
                  >
                    <option value="">Seçiniz</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Lokasyon Tipi
                    </label>
                    <div className="mt-1">
                      <select
                        value={locationType}
                        onChange={(e) => {
                          const newType = e.target.value as 'field' | 'greenhouse';
                          setLocationType(newType);
                          setFormData({
                            ...formData,
                            fieldId: newType === 'field' ? formData.fieldId : 0,
                            greenhouseId: newType === 'greenhouse' ? formData.greenhouseId : 0
                          });
                        }}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                      >
                        <option value="field">Tarla</option>
                        <option value="greenhouse">Sera</option>
                      </select>
                    </div>
                  </div>

                  {locationType === 'field' ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Tarla
                      </label>
                      <select
                        value={formData.fieldId}
                        onChange={(e) => setFormData({ ...formData, fieldId: Number(e.target.value), greenhouseId: 0 })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                        required
                      >
                        <option value="">Seçiniz</option>
                        {fields.map((field) => (
                          <option key={field.id} value={field.id}>
                            {field.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Sera
                      </label>
                      <select
                        value={formData.greenhouseId}
                        onChange={(e) => setFormData({ ...formData, greenhouseId: Number(e.target.value), fieldId: 0 })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                        required
                      >
                        <option value="">Seçiniz</option>
                        {greenhouses.map((greenhouse) => (
                          <option key={greenhouse.id} value={greenhouse.id}>
                            {greenhouse.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tarih
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
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                  />
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3">
                  <button
                    type="submit"
                    className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:text-sm"
                  >
                    {selectedIrrigation ? 'Güncelle' : 'Kaydet'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setSelectedIrrigation(null);
                      setFormData({ fieldId: 0, greenhouseId: 0, productId: 0, date: '', notes: '' });
                    }}
                    className="mt-3 sm:mt-0 inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:text-sm"
                  >
                    İptal
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Irrigation;
