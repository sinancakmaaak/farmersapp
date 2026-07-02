import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';

interface Vehicle {
  id?: number;
  licensePlate: string;
  type: string;
  manufacturer: string;
  model: string;
  year: number;
  enginePower: number;
  fuelType: string;
  km?: number;
  purchaseDate?: string;
  notes?: string;
}

const initialVehicleForm: Vehicle = {
  licensePlate: '',
  type: '',
  manufacturer: '',
  model: '',
  year: new Date().getFullYear(),
  enginePower: 0,
  fuelType: '',
  km: 0,
  purchaseDate: '',
  notes: ''
};

const Vehicle: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [vehicleForm, setVehicleForm] = useState<Vehicle>(initialVehicleForm);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await api.get('/api/vehicles');
      setVehicles(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      setError('Araçlar yüklenirken bir hata oluştu.');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && vehicleForm.id) {
        await api.put(`/api/vehicles/${vehicleForm.id}`, vehicleForm);
      } else {
        await api.post('/api/vehicles', vehicleForm);
      }
      setShowModal(false);
      setVehicleForm(initialVehicleForm);
      fetchVehicles();
    } catch (err) {
      console.error('Error saving vehicle:', err);
      setError('Araç kaydedilirken bir hata oluştu.');
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setVehicleForm(vehicle);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bu aracı silmek istediğinizden emin misiniz?')) {
      try {
        await api.delete(`/api/vehicles/${id}`);
        fetchVehicles();
      } catch (err) {
        console.error('Error deleting vehicle:', err);
        setError('Araç silinirken bir hata oluştu.');
      }
    }
  };

  if (loading) return <div>Yükleniyor...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Araçlar</h1>
        <button
          onClick={() => {
            setVehicleForm(initialVehicleForm);
            setIsEditing(false);
            setShowModal(true);
          }}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
        >
          Yeni Araç Ekle
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plaka</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tip</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marka/Model</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Yıl</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Motor Gücü</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Yakıt Tipi</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">KM</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Satın Alma Tarihi</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notlar</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {vehicles.map((vehicle) => (
              <tr key={vehicle.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">{vehicle.licensePlate}</td>
                <td className="px-6 py-4 whitespace-nowrap">{vehicle.type}</td>
                <td className="px-6 py-4 whitespace-nowrap">{vehicle.manufacturer} {vehicle.model}</td>
                <td className="px-6 py-4 whitespace-nowrap">{vehicle.year}</td>
                <td className="px-6 py-4 whitespace-nowrap">{vehicle.enginePower} HP</td>
                <td className="px-6 py-4 whitespace-nowrap">{vehicle.fuelType}</td>
                <td className="px-6 py-4 whitespace-nowrap">{vehicle.km}</td>
                <td className="px-6 py-4 whitespace-nowrap">{vehicle.purchaseDate}</td>
                <td className="px-6 py-4 whitespace-normal max-w-xs truncate">{vehicle.notes}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleEdit(vehicle)}
                    className="text-green-600 hover:text-green-900 mr-4"
                  >
                    Düzenle
                  </button>
                  <button
                    onClick={() => vehicle.id && handleDelete(vehicle.id)}
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

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">{isEditing ? 'Araç Düzenle' : 'Yeni Araç Ekle'}</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Plaka</label>
                <input
                  type="text"
                  value={vehicleForm.licensePlate}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, licensePlate: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tip</label>
                <input
                  type="text"
                  value={vehicleForm.type}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, type: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Üretici</label>
                <input
                  type="text"
                  value={vehicleForm.manufacturer}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, manufacturer: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Model</label>
                <input
                  type="text"
                  value={vehicleForm.model}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, model: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Yıl</label>
                <input
                  type="number"
                  value={vehicleForm.year}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, year: parseInt(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Motor Gücü (HP)</label>
                <input
                  type="number"
                  value={vehicleForm.enginePower}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, enginePower: parseInt(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Yakıt Tipi</label>
                <select
                  value={vehicleForm.fuelType}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, fuelType: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  required
                >
                  <option value="">Seçiniz...</option>
                  <option value="Benzin">Benzin</option>
                  <option value="Dizel">Dizel</option>
                  <option value="LPG">LPG</option>
                  <option value="Elektrik">Elektrik</option>
                  <option value="Hibrit">Hibrit</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Kilometre</label>
                <input
                  type="number"
                  value={vehicleForm.km}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, km: parseInt(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Satın Alma Tarihi</label>
                <input
                  type="date"
                  value={vehicleForm.purchaseDate}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, purchaseDate: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Notlar</label>
                <textarea
                  value={vehicleForm.notes}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, notes: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                >
                  {isEditing ? 'Güncelle' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vehicle;