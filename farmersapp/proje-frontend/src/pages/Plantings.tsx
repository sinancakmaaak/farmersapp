import React, { useState, useEffect } from 'react';
import type { Planting, Field, Product, Greenhouse } from '../types/index';
import { getAllPlantings, createPlanting, updatePlanting, deletePlanting } from '../services/plantingService';
import { getAllFields } from '../services/fieldService';
import { getAllProducts } from '../services/productService';
import { getAllGreenhouses } from '../services/greenhouseService';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const Plantings: React.FC = () => {
  const [plantings, setPlantings] = useState<Planting[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [greenhouses, setGreenhouses] = useState<Greenhouse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlanting, setSelectedPlanting] = useState<Planting | null>(null);
  const [locationType, setLocationType] = useState<'field' | 'greenhouse'>('field');
  
  // Initialize form data with proper types
  const initialFormData: Omit<Planting, 'id' | 'createdAt' | 'updatedAt'> = {
    productId: 0,
    product: null,
    fieldId: 0,
    greenhouseId: 0,
    quantity: 0,
    plantedArea: 0,
    plantingDate: new Date().toISOString().split('T')[0],
    notes: '',
    status: 'active'
  };

  const [formData, setFormData] = useState(initialFormData);

  // Reset form to initial state
  const resetForm = () => {
    setFormData(initialFormData);
    setLocationType('field');
    setSelectedPlanting(null);
  };

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [plantingsData, fieldsData, productsData, greenhousesData] = await Promise.all([
        getAllPlantings(),
        getAllFields(),
        getAllProducts(),
        getAllGreenhouses()
      ]);
      setPlantings(Array.isArray(plantingsData) ? plantingsData : []);
      setFields(Array.isArray(fieldsData) ? fieldsData : []);
      setProducts(Array.isArray(productsData) ? productsData : []);
      setGreenhouses(Array.isArray(greenhousesData) ? greenhousesData : []);
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

  // Debug: Log plantings when they change
  useEffect(() => {
    console.log('Current plantings:', plantings);
  }, [plantings]);

  // Debug: Log fields and greenhouses when they change
  useEffect(() => {
    console.log('Current fields:', fields);
    console.log('Current greenhouses:', greenhouses);
  }, [fields, greenhouses]);

  useEffect(() => {
    if (selectedPlanting) {
      console.log('Selected planting in useEffect:', selectedPlanting);
      
      // Check if field exists and has an id
      const hasField = selectedPlanting.field && selectedPlanting.field.id > 0;
      // Check if greenhouse exists and has an id
      const hasGreenhouse = selectedPlanting.greenhouse && selectedPlanting.greenhouse.id > 0;
      
      // Determine location type based on which location is set
      const newLocationType = hasField ? 'field' : 'greenhouse';
      
      // Format date for the form
      const formattedDate = selectedPlanting.plantingDate ? 
        new Date(selectedPlanting.plantingDate).toISOString().split('T')[0] : 
        new Date().toISOString().split('T')[0];
      
      setLocationType(newLocationType);
      setFormData({
        productId: selectedPlanting.productId,
        product: selectedPlanting.product,
        fieldId: selectedPlanting.fieldId || 0,
        greenhouseId: selectedPlanting.greenhouseId || 0,
        quantity: selectedPlanting.quantity,
        plantedArea: selectedPlanting.plantedArea,
        plantingDate: formattedDate,
        notes: selectedPlanting.notes || '',
        status: selectedPlanting.status || 'active'
      });
    }
  }, [selectedPlanting]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      // Validate required fields
      if (!formData.productId || formData.productId === 0) {
        throw new Error('Lütfen bir ürün seçin');
      }

      if (locationType === 'field' && (!formData.fieldId || formData.fieldId === 0)) {
        throw new Error('Lütfen bir tarla seçin');
      }

      if (locationType === 'greenhouse' && (!formData.greenhouseId || formData.greenhouseId === 0)) {
        throw new Error('Lütfen bir sera seçin');
      }

      // Prepare data for backend
      const submitData = {
        ...formData,
        productId: Number(formData.productId),
        fieldId: locationType === 'field' ? Number(formData.fieldId) : undefined,
        greenhouseId: locationType === 'greenhouse' ? Number(formData.greenhouseId) : undefined,
        quantity: Number(formData.quantity),
        plantedArea: Number(formData.plantedArea),
        plantingDate: formData.plantingDate ? formData.plantingDate : new Date().toISOString().split('T')[0],
        notes: formData.notes || '',
        status: formData.status || 'active'
      };

      console.log('Submitting data to backend:', submitData); // Debug log
      console.log('Current location type:', locationType); // Debug log

      if (selectedPlanting) {
        const response = await updatePlanting(selectedPlanting.id, submitData);
        console.log('Update response:', response); // Debug log
      } else {
        const response = await createPlanting(submitData);
        console.log('Create response:', response); // Debug log
      }
      
      loadData();
      setIsModalOpen(false);
      resetForm();
    } catch (err: any) {
      console.error('Full error details:', err); // Debug log
      if (err.message) {
        setError(err.message);
      } else {
        const errorMessage = err.response?.data?.message || 'İşlem sırasında bir hata oluştu.';
        const errorDetails = err.response?.data?.details;
        setError(errorDetails ? `${errorMessage} (${errorDetails})` : errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bu ekim/dikim kaydını silmek istediğinizden emin misiniz?')) {
      setIsLoading(true);
      setError(null);
      try {
        await deletePlanting(id);
        loadData();
      } catch (err) {
        setError('Silme işlemi sırasında bir hata oluştu.');
        console.error('Error deleting planting:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getProductName = (planting: Planting) => {
    if (!planting.product) return '';
    return planting.product.name || '';
  };

  const getLocationName = (planting: Planting) => {
    if (planting.field) {
      return `Tarla: ${planting.field.name}`;
    }
    if (planting.greenhouse) {
      return `Sera: ${planting.greenhouse.name}`;
    }
    return '';
  };

  if (isLoading && !plantings.length) {
    return <div className="text-center p-4">Yükleniyor...</div>;
  }

  if (error && !plantings.length) {
    return <div className="text-center text-red-600 p-4">{error}</div>;
  }

  return (
    <div>
      <div className="sm:flex sm:items-center mb-6">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Ekim/Dikim</h1>
          <p className="mt-2 text-sm text-gray-700">
            Tüm ekim ve dikim kayıtlarının listesi ve yönetimi
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            Yeni Ekim/Dikim Ekle
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
                      Ürün
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Konum
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Miktar (adet)
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Alan (m²)
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Ekim Tarihi
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
                  {plantings.map((planting) => (
                    <tr key={planting.id}>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {getProductName(planting)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {getLocationName(planting)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {planting.quantity}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {planting.plantedArea}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {format(new Date(planting.plantingDate), 'dd MMMM yyyy', { locale: tr })}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {planting.notes}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          onClick={() => {
                            console.log('Editing planting:', planting); // Debug log
                            
                            // Check if field exists and has an id
                            const hasField = planting.field && planting.field.id > 0;
                            // Check if greenhouse exists and has an id
                            const hasGreenhouse = planting.greenhouse && planting.greenhouse.id > 0;
                            
                            // Determine location type based on which location is set
                            const newLocationType = hasField ? 'field' : 'greenhouse';
                            console.log('Location check:', { hasField, hasGreenhouse, newLocationType }); // Debug log
                            
                            // Format date to YYYY-MM-DD for the date input
                            const formattedDate = planting.plantingDate ? new Date(planting.plantingDate).toISOString().split('T')[0] : '';
                            
                            // First set the selected planting
                            setSelectedPlanting(planting);
                            
                            // Then set the form data
                            setLocationType(newLocationType);
                            setFormData({
                              productId: planting.productId,
                              product: planting.product,
                              fieldId: planting.fieldId || 0,
                              greenhouseId: planting.greenhouseId || 0,
                              quantity: planting.quantity,
                              plantedArea: planting.plantedArea,
                              plantingDate: formattedDate,
                              notes: planting.notes || '',
                              status: planting.status || 'active'
                            });
                            
                            // Finally open the modal
                            setIsModalOpen(true);
                          }}
                          className="text-green-600 hover:text-green-900 mr-4"
                        >
                          Düzenle
                        </button>
                        <button
                          onClick={() => handleDelete(planting.id)}
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
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Ürün
                    </label>
                    <select
                      value={formData.productId}
                      onChange={(e) => {
                        const newProductId = Number(e.target.value);
                        const selectedProduct = products.find(p => p.id === newProductId);
                        setFormData(prevData => ({
                          ...prevData,
                          productId: newProductId,
                          product: selectedProduct || null
                        }));
                      }}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                      required
                    >
                      <option value={0}>Ürün seçiniz</option>
                      {products.map((product) => (
                        <option 
                          key={product.id} 
                          value={product.id}
                        >
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Konum Tipi
                    </label>
                    <div className="mt-1 space-x-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="locationType"
                          value="field"
                          checked={locationType === 'field'}
                          onChange={() => {
                            console.log('Switching to field'); // Debug log
                            setLocationType('field');
                            setFormData(prev => ({
                              ...prev,
                              fieldId: prev.fieldId || fields[0]?.id || 0,
                              greenhouseId: 0
                            }));
                          }}
                          className="form-radio h-4 w-4 text-green-600"
                        />
                        <span className="ml-2">Tarla</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="locationType"
                          value="greenhouse"
                          checked={locationType === 'greenhouse'}
                          onChange={() => {
                            console.log('Switching to greenhouse'); // Debug log
                            setLocationType('greenhouse');
                            setFormData(prev => ({
                              ...prev,
                              fieldId: 0,
                              greenhouseId: prev.greenhouseId || greenhouses[0]?.id || 0
                            }));
                          }}
                          className="form-radio h-4 w-4 text-green-600"
                        />
                        <span className="ml-2">Sera</span>
                      </label>
                    </div>
                  </div>

                  {locationType === 'field' ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Tarla
                      </label>
                      <select
                        value={formData.fieldId || 0}
                        onChange={(e) => setFormData({ ...formData, fieldId: Number(e.target.value), greenhouseId: 0 })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                        required
                      >
                        <option value={0} disabled>Seçiniz</option>
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
                        value={formData.greenhouseId || 0}
                        onChange={(e) => setFormData({ ...formData, greenhouseId: Number(e.target.value), fieldId: 0 })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                        required
                      >
                        <option value={0} disabled>Seçiniz</option>
                        {greenhouses.map((greenhouse) => (
                          <option key={greenhouse.id} value={greenhouse.id}>
                            {greenhouse.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Miktar (adet)
                    </label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                      required
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Alan (m²)
                    </label>
                    <input
                      type="number"
                      value={formData.plantedArea}
                      onChange={(e) => setFormData({ ...formData, plantedArea: Number(e.target.value) })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Ekim Tarihi
                    </label>
                    <input
                      type="date"
                      value={formData.plantingDate || ''}
                      onChange={(e) => {
                        const date = e.target.value;
                        setFormData({ 
                          ...formData, 
                          plantingDate: date 
                        });
                      }}
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
                    {isLoading ? 'Kaydediliyor...' : selectedPlanting ? 'Güncelle' : 'Kaydet'}
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

export default Plantings; 