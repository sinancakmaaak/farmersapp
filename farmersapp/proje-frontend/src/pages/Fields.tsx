import React, { useState, useEffect } from 'react';
import { Field } from '../types/index';
import * as fieldService from '../services/fieldService';

const Fields = () => {
  const [fields, setFields] = useState<Field[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    area: 0,
    soilType: '',
    notes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const loadFields = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fieldService.getAllFields();
      setFields(data);
    } catch (err) {
      setError('Tarla bilgileri yüklenirken bir hata oluştu.');
      console.error('Error loading fields:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFields();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      if (selectedField) {
        await fieldService.updateField(selectedField.id, formData);
      } else {
        await fieldService.createField(formData);
      }
      loadFields();
      setIsModalOpen(false);
      setFormData({
        name: '',
        location: '',
        area: 0,
        soilType: '',
        notes: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      setError('İşlem sırasında bir hata oluştu.');
      console.error('Error submitting field:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bu tarlayı silmek istediğinizden emin misiniz?')) {
      setIsLoading(true);
      setError(null);
      try {
        await fieldService.deleteField(id);
        loadFields();
      } catch (err) {
        setError('Silme işlemi sırasında bir hata oluştu.');
        console.error('Error deleting field:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (isLoading && !fields.length) {
    return <div className="text-center p-4">Yükleniyor...</div>;
  }

  if (error && !fields.length) {
    return <div className="text-center text-red-600 p-4">{error}</div>;
  }

  return (
    <div>
      <div className="sm:flex sm:items-center mb-6">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Tarlalar</h1>
          <p className="mt-2 text-sm text-gray-700">
            Tüm tarlaların listesi ve yönetimi
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={() => {
              setSelectedField(null);
              setFormData({
                name: '',
                location: '',
                area: 0,
                soilType: '',
                notes: '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              });
              setIsModalOpen(true);
            }}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            Yeni Tarla Ekle
          </button>
        </div>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">İsim</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Konum</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Alan (m²)</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Toprak Tipi</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Notlar</th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {fields.map((field) => (
                    <tr key={field.id}>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{field.name}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{field.location}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{field.area}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{field.soilType}</td>
                      <td className="px-3 py-4 text-sm text-gray-900">{field.notes}</td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          onClick={() => {
                            setSelectedField(field);
                            setFormData({
                              name: field.name,
                              location: field.location,
                              area: field.area,
                              soilType: field.soilType,
                              notes: field.notes || '',
                              createdAt: field.createdAt,
                              updatedAt: new Date().toISOString()
                            });
                            setIsModalOpen(true);
                          }}
                          className="text-green-600 hover:text-green-900 mr-4"
                        >
                          Düzenle
                        </button>
                        <button
                          onClick={() => handleDelete(field.id)}
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
              {selectedField ? 'Tarla Düzenle' : 'Yeni Tarla Ekle'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    İsim
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Konum
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Alan (m²)
                  </label>
                  <input
                    type="number"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: Number(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Toprak Tipi
                  </label>
                  <select
                    value={formData.soilType}
                    onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                    required
                  >
                    <option value="">Seçiniz</option>
                    <option value="Kumlu">Kumlu</option>
                    <option value="Killi">Killi</option>
                    <option value="Tınlı">Tınlı</option>
                    <option value="Humuslu">Humuslu</option>
                  </select>
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
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex w-full justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 sm:text-sm disabled:opacity-50"
                >
                  {isLoading ? 'Kaydediliyor...' : selectedField ? 'Güncelle' : 'Ekle'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 sm:mt-0 sm:text-sm"
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

export default Fields;
