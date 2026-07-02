import React, { useEffect, useState } from 'react';
import api from '../api';
import { PageHeader } from './PageHeader';
import { Button } from './ui/button';
import { Dialog } from '@mui/material';

interface Employee {
  id: number;
  fullName: string;
  position: string;
  phoneNumber: string;
  email: string;
  salary: number;
  hireDate: string;
}

const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [employeeForm, setEmployeeForm] = useState<Partial<Employee>>({
    fullName: '',
    position: '',
    phoneNumber: '',
    email: '',
    salary: 0,
    hireDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/api/employees');
      setEmployees(response.data);
      setLoading(false);
    } catch (err) {
      setError('Çalışan verileri yüklenirken bir hata oluştu.');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedEmployee) {
        await api.put(`/api/employees/${selectedEmployee.id}`, employeeForm);
      } else {
        await api.post('/api/employees', employeeForm);
      }
      setModalOpen(false);
      setSelectedEmployee(null);
      setEmployeeForm({
        fullName: '',
        position: '',
        phoneNumber: '',
        email: '',
        salary: 0,
        hireDate: new Date().toISOString().split('T')[0]
      });
      fetchEmployees();
    } catch (err) {
      setError('Çalışan kaydı işlemi sırasında hata oluştu.');
    }
  };

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setEmployeeForm({
      fullName: employee.fullName,
      position: employee.position,
      phoneNumber: employee.phoneNumber,
      email: employee.email,
      salary: employee.salary,
      hireDate: employee.hireDate
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bu çalışanı silmek istediğinizden emin misiniz?')) {
      try {
        await api.delete(`/api/employees/${id}`);
        fetchEmployees();
      } catch (err) {
        setError('Çalışan silinirken bir hata oluştu.');
      }
    }
  };

  if (loading) return <div>Yükleniyor...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-6 p-8 bg-gray-50 min-h-screen">
      <PageHeader
        title="Çalışanlar"
        description="Çalışan bilgilerini yönetin"
      />

      {/* Çalışanlar Tablosu */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Çalışan Listesi</h2>
            <Button
              onClick={() => {
                setModalOpen(true);
                setSelectedEmployee(null);
                setEmployeeForm({
                  fullName: '',
                  position: '',
                  phoneNumber: '',
                  email: '',
                  salary: 0,
                  hireDate: new Date().toISOString().split('T')[0]
                });
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Yeni Çalışan Ekle
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ad Soyad</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pozisyon</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefon</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">E-posta</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Maaş</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşe Başlama</th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">İşlemler</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.fullName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.position}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.phoneNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                    {employee.salary.toLocaleString('tr-TR')} ₺
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(employee.hireDate).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(employee)}
                      className="text-green-600 hover:text-green-900 mr-4"
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => handleDelete(employee.id)}
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

      {/* Çalışan Ekleme/Düzenleme Modal */}
      <Dialog
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedEmployee(null);
          setEmployeeForm({
            fullName: '',
            position: '',
            phoneNumber: '',
            email: '',
            salary: 0,
            hireDate: new Date().toISOString().split('T')[0]
          });
          setError(null);
        }}
      >
        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
            {selectedEmployee ? 'Çalışan Düzenle' : 'Yeni Çalışan Ekle'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Ad Soyad</label>
              <input
                type="text"
                required
                value={employeeForm.fullName}
                onChange={(e) => setEmployeeForm({ ...employeeForm, fullName: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Pozisyon</label>
              <input
                type="text"
                required
                value={employeeForm.position}
                onChange={(e) => setEmployeeForm({ ...employeeForm, position: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Telefon Numarası</label>
              <input
                type="tel"
                required
                value={employeeForm.phoneNumber}
                onChange={(e) => setEmployeeForm({ ...employeeForm, phoneNumber: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">E-posta</label>
              <input
                type="email"
                required
                value={employeeForm.email}
                onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Maaş</label>
              <input
                type="number"
                required
                value={employeeForm.salary}
                onChange={(e) => setEmployeeForm({ ...employeeForm, salary: Number(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">İşe Başlama Tarihi</label>
              <input
                type="date"
                required
                value={employeeForm.hireDate}
                onChange={(e) => setEmployeeForm({ ...employeeForm, hireDate: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
              />
            </div>
            <div className="flex justify-end space-x-3 mt-5">
              <Button
                type="button"
                onClick={() => {
                  setModalOpen(false);
                  setSelectedEmployee(null);
                  setEmployeeForm({
                    fullName: '',
                    position: '',
                    phoneNumber: '',
                    email: '',
                    salary: 0,
                    hireDate: new Date().toISOString().split('T')[0]
                  });
                  setError(null);
                }}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                İptal
              </Button>
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                {selectedEmployee ? 'Güncelle' : 'Kaydet'}
              </Button>
            </div>
          </form>
        </div>
      </Dialog>
    </div>
  );
};

export default Employees; 