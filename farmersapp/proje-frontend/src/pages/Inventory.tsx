import React, { useState, useEffect } from 'react';
import { Inventory } from '../types/index';
import * as inventoryService from '../services/inventoryService';
import * as supplierService from '../services/supplierService';

const InventoryPage = () => {
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Inventory | null>(null);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    invoiceNumber: '',
    purchaseDate: '',
    supplierCompanyId: null as number | null
  });

  const loadInventory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await inventoryService.getAllInventory();
      setInventory(data);
    } catch (err) {
      setError('Envanter bilgileri yüklenirken bir hata oluştu.');
      console.error('Error loading inventory:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSuppliers = async () => {
    try {
      const data = await supplierService.getAllSuppliers();
      setSuppliers(data);
    } catch (err) {
      console.error('Error loading suppliers:', err);
    }
  };

  useEffect(() => {
    loadInventory();
    loadSuppliers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const submitData = {
        ...formData,
        supplierCompanyId: formData.supplierCompanyId ? Number(formData.supplierCompanyId) : null
      };
      
      if (selectedItem) {
        await inventoryService.updateInventory(selectedItem.id, submitData);
      } else {
        await inventoryService.createInventory(submitData);
      }
      loadInventory();
      setIsModalOpen(false);
      setFormData({
        name: '',
        description: '',
        invoiceNumber: '',
        purchaseDate: '',
        supplierCompanyId: null
      });
    } catch (err) {
      setError('İşlem sırasında bir hata oluştu.');
      console.error('Error submitting inventory:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bu envanter kaydını silmek istediğinizden emin misiniz?')) {
      setIsLoading(true);
      setError(null);
      try {
        await inventoryService.deleteInventory(id);
        loadInventory();
      } catch (err) {
        setError('Silme işlemi sırasında bir hata oluştu.');
        console.error('Error deleting inventory:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (isLoading && !inventory.length) {
    return <div className="text-center p-4">Yükleniyor...</div>;
  }

  if (error && !inventory.length) {
    return <div className="text-center text-red-600 p-4">{error}</div>;
  }

  return (
    <div>
      <div className="sm:flex sm:items-center mb-6">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Envanter</h1>
          <p className="mt-2 text-sm text-gray-700">
            Tüm envanter kayıtlarının listesi ve yönetimi
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={() => {
              setSelectedItem(null);
              setFormData({
                name: '',
                description: '',
                invoiceNumber: '',
                purchaseDate: '',
                supplierCompanyId: null
              });
              setIsModalOpen(true);
            }}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            Yeni Envanter Ekle
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
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Açıklama</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Fatura No</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Alım Tarihi</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tedarikçi</th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {inventory.map((item) => (
                    <tr key={item.id}>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{item.name}</td>
                      <td className="px-3 py-4 text-sm text-gray-900">{item.description}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{item.invoiceNumber}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                        {new Date(item.purchaseDate).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                        {item.supplierCompany?.companyName}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setFormData({
                              name: item.name,
                              description: item.description || '',
                              invoiceNumber: item.invoiceNumber || '',
                              purchaseDate: item.purchaseDate,
                              supplierCompanyId: item.supplierCompany?.id || null
                            });
                            setIsModalOpen(true);
                          }}
                          className="text-green-600 hover:text-green-900 mr-4"
                        >
                          Düzenle
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
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
              {selectedItem ? 'Envanter Düzenle' : 'Yeni Envanter Ekle'}
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
                    Açıklama
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Fatura No
                  </label>
                  <input
                    type="text"
                    value={formData.invoiceNumber}
                    onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Alım Tarihi
                  </label>
                  <input
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tedarikçi
                  </label>
                  <select
                    value={formData.supplierCompanyId || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      supplierCompanyId: e.target.value ? Number(e.target.value) : null 
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                  >
                    <option value="">Seçiniz</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.companyName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex w-full justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 sm:text-sm disabled:opacity-50"
                >
                  {isLoading ? 'Kaydediliyor...' : selectedItem ? 'Güncelle' : 'Ekle'}
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

export default InventoryPage; 