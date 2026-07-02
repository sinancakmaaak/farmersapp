import React, { useEffect, useState } from 'react';
import api from '../api';
import { PageHeader } from './PageHeader';
import { Button } from './ui/button';
import { Dialog } from '@mui/material';
import { useAuth } from '../hooks/useAuth';

interface Task {
  id: number;
  title: string;
  description: string;
  status: 'BEKLEMEDE' | 'DEVAM_EDIYOR' | 'TAMAMLANDI' | 'IPTAL_EDILDI';
  priority: 'DUSUK' | 'ORTA' | 'YUKSEK';
  dueDate: string;
  assignedToId?: number;
  createdById: number;
  relatedFieldId?: number;
  relatedGreenhouseId?: number;
  relatedPlantingId?: number;
}

interface User {
  id: number;
  fullName: string;
}

interface Field {
  id: number;
  name: string;
}

interface Greenhouse {
  id: number;
  name: string;
}

interface Planting {
  id: number;
  name: string;
  product: {
    id: number;
    name: string;
  };
  field?: {
    id: number;
    name: string;
  };
  greenhouse?: {
    id: number;
    name: string;
  };
  quantity: number;
  plantedArea: number;
  plantingDate: string;
  notes?: string;
}

const Tasks: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [greenhouses, setGreenhouses] = useState<Greenhouse[]>([]);
  const [plantings, setPlantings] = useState<Planting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const [taskForm, setTaskForm] = useState<Partial<Task>>({
    title: '',
    description: '',
    status: 'BEKLEMEDE',
    priority: 'ORTA',
    dueDate: new Date().toISOString().split('T')[0],
    createdById: user?.id,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksRes, usersRes, fieldsRes, greenhousesRes, plantingsRes] = await Promise.all([
        api.get('/api/tasks'),
        api.get('/api/users'),
        api.get('/api/fields'),
        api.get('/api/greenhouses'),
        api.get('/api/plantings')
      ]);

      console.log('Plantings API Response:', plantingsRes.data);

      setTasks(Array.isArray(tasksRes.data) ? tasksRes.data : []);
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
      setFields(Array.isArray(fieldsRes.data) ? fieldsRes.data : []);
      setGreenhouses(Array.isArray(greenhousesRes.data) ? greenhousesRes.data : []);
      
      // Plantings API returns a Page object, so we need to access the content array
      const plantingsData = plantingsRes.data.content || plantingsRes.data;
      setPlantings(Array.isArray(plantingsData) ? plantingsData : []);

      console.log('Plantings State:', plantingsData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Veriler yüklenirken bir hata oluştu.');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Convert date to the format expected by backend (YYYY-MM-DDTHH:mm:ss)
      const formattedDate = taskForm.dueDate ? `${taskForm.dueDate}T00:00:00` : null;
      
      const dataToSend = {
        ...taskForm,
        dueDate: formattedDate,
        createdById: taskForm.createdById || user?.id,
      };

      if (selectedTask) {
        await api.put(`/api/tasks/${selectedTask.id}`, dataToSend);
      } else {
        await api.post('/api/tasks', dataToSend);
      }
      setModalOpen(false);
      setSelectedTask(null);
      setTaskForm({
        title: '',
        description: '',
        status: 'BEKLEMEDE',
        priority: 'ORTA',
        dueDate: new Date().toISOString().split('T')[0],
        createdById: user?.id,
      });
      fetchData();
    } catch (err) {
      console.error('Error:', err);
      setError('Görev kaydedilirken bir hata oluştu.');
    }
  };

  const handleEdit = (task: Task) => {
    setSelectedTask(task);
    // Convert ISO date string to YYYY-MM-DD format for the date input
    const formattedDate = task.dueDate ? task.dueDate.split('T')[0] : new Date().toISOString().split('T')[0];
    
    setTaskForm({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: formattedDate,
      assignedToId: task.assignedToId,
      relatedFieldId: task.relatedFieldId,
      relatedGreenhouseId: task.relatedGreenhouseId,
      relatedPlantingId: task.relatedPlantingId,
      createdById: task.createdById || user?.id,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bu görevi silmek istediğinizden emin misiniz?')) {
      try {
        await api.delete(`/api/tasks/${id}`);
        fetchData();
      } catch (err) {
        setError('Görev silinirken bir hata oluştu.');
      }
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'BEKLEMEDE':
        return 'text-yellow-600 bg-yellow-100';
      case 'DEVAM_EDIYOR':
        return 'text-blue-600 bg-blue-100';
      case 'TAMAMLANDI':
        return 'text-green-600 bg-green-100';
      case 'IPTAL_EDILDI':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'YUKSEK':
        return 'text-red-600 bg-red-100';
      case 'ORTA':
        return 'text-yellow-600 bg-yellow-100';
      case 'DUSUK':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: Task['status']) => {
    switch (status) {
      case 'BEKLEMEDE':
        return 'Beklemede';
      case 'DEVAM_EDIYOR':
        return 'Devam Ediyor';
      case 'TAMAMLANDI':
        return 'Tamamlandı';
      case 'IPTAL_EDILDI':
        return 'İptal Edildi';
      default:
        return status;
    }
  };

  const getPriorityText = (priority: Task['priority']) => {
    switch (priority) {
      case 'YUKSEK':
        return 'Yüksek';
      case 'ORTA':
        return 'Orta';
      case 'DUSUK':
        return 'Düşük';
      default:
        return priority;
    }
  };

  if (loading) return <div>Yükleniyor...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-6 p-8 bg-gray-50 min-h-screen">
      <PageHeader
        title="Görevler"
        description="Görevleri yönetin ve takip edin"
      />

      {/* Görevler Tablosu */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Görev Listesi</h2>
            <Button
              onClick={() => {
                setModalOpen(true);
                setSelectedTask(null);
                setTaskForm({
                  title: '',
                  description: '',
                  status: 'BEKLEMEDE',
                  priority: 'ORTA',
                  dueDate: new Date().toISOString().split('T')[0],
                  createdById: user?.id,
                });
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Yeni Görev Ekle
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Başlık
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Öncelik
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Atanan
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bitiş Tarihi
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İlgili Alan
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İlgili Ekim
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Düzenle</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tasks.map((task) => {
                const assignedUser = users.find(u => u.id === task.assignedToId);
                const relatedField = fields.find(f => f.id === task.relatedFieldId);
                const relatedGreenhouse = greenhouses.find(g => g.id === task.relatedGreenhouseId);
                const relatedPlanting = plantings.find(p => p.id === task.relatedPlantingId);
                
                return (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{task.title}</div>
                      <div className="text-sm text-gray-500">{task.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(task.status)}`}>
                        {getStatusText(task.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                        {getPriorityText(task.priority)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {assignedUser?.fullName || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(task.dueDate).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex flex-col">
                        {relatedField && (
                          <div className="font-medium text-gray-900">
                            Tarla: {relatedField.name}
                          </div>
                        )}
                        {relatedGreenhouse && (
                          <div className="font-medium text-gray-900">
                            Sera: {relatedGreenhouse.name}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {relatedPlanting ? (
                        <div className="flex flex-col">
                          <div className="text-gray-900">
                            {relatedPlanting.product?.name}
                          </div>
                          <div className="text-gray-500 text-xs">
                            {new Date(relatedPlanting.plantingDate).toLocaleDateString('tr-TR')}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(task)}
                        className="text-green-600 hover:text-green-900 mr-4"
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => handleDelete(task.id)}
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

      {/* Görev Ekleme/Düzenleme Modal */}
      <Dialog
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedTask(null);
          setTaskForm({
            title: '',
            description: '',
            status: 'BEKLEMEDE',
            priority: 'ORTA',
            dueDate: new Date().toISOString().split('T')[0],
            createdById: user?.id,
          });
          setError(null);
        }}
      >
        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
            {selectedTask ? 'Görev Düzenle' : 'Yeni Görev Ekle'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Başlık</label>
              <input
                type="text"
                required
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Açıklama</label>
              <textarea
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Durum</label>
              <select
                value={taskForm.status}
                onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value as Task['status'] })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
              >
                <option value="BEKLEMEDE">Beklemede</option>
                <option value="DEVAM_EDIYOR">Devam Ediyor</option>
                <option value="TAMAMLANDI">Tamamlandı</option>
                <option value="IPTAL_EDILDI">İptal Edildi</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Öncelik</label>
              <select
                value={taskForm.priority}
                onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as Task['priority'] })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
              >
                <option value="DUSUK">Düşük</option>
                <option value="ORTA">Orta</option>
                <option value="YUKSEK">Yüksek</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Bitiş Tarihi</label>
              <input
                type="date"
                required
                value={taskForm.dueDate}
                onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Atanan Kişi</label>
              <select
                value={taskForm.assignedToId || ''}
                onChange={(e) => setTaskForm({ ...taskForm, assignedToId: e.target.value ? Number(e.target.value) : undefined })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
              >
                <option value="">Seçiniz...</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>{user.fullName}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              {/* Ekim Seçimi */}
              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700">İlgili Alan</label>
                <div className="mt-1">
                  <div className="flex flex-col space-y-2">
                    {/* Alan Tipi Seçimi */}
                    <select
                      value={taskForm.relatedFieldId ? 'field' : taskForm.relatedGreenhouseId ? 'greenhouse' : ''}
                      onChange={(e) => {
                        // Alan tipi değiştiğinde mevcut seçimleri sıfırla
                        setTaskForm({
                          ...taskForm,
                          relatedFieldId: undefined,
                          relatedGreenhouseId: undefined,
                          relatedPlantingId: undefined
                        });
                      }}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                    >
                      <option value="">Alan Tipi Seçiniz...</option>
                      <option value="field">Tarla</option>
                      <option value="greenhouse">Sera</option>
                    </select>

                    {/* Tarla Seçimi */}
                    {taskForm.relatedFieldId !== undefined || (!taskForm.relatedGreenhouseId && !taskForm.relatedFieldId) ? (
                      <select
                        value={taskForm.relatedFieldId || ''}
                        onChange={(e) => {
                          const value = e.target.value ? Number(e.target.value) : undefined;
                          setTaskForm({
                            ...taskForm,
                            relatedFieldId: value,
                            relatedGreenhouseId: undefined
                          });
                        }}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                      >
                        <option value="">Tarla Seçiniz...</option>
                        {fields.map((field) => (
                          <option key={field.id} value={field.id}>{field.name}</option>
                        ))}
                      </select>
                    ) : null}

                    {/* Sera Seçimi */}
                    {taskForm.relatedGreenhouseId !== undefined || (!taskForm.relatedFieldId && !taskForm.relatedGreenhouseId) ? (
                      <select
                        value={taskForm.relatedGreenhouseId || ''}
                        onChange={(e) => {
                          const value = e.target.value ? Number(e.target.value) : undefined;
                          setTaskForm({
                            ...taskForm,
                            relatedGreenhouseId: value,
                            relatedFieldId: undefined
                          });
                        }}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                      >
                        <option value="">Sera Seçiniz...</option>
                        {greenhouses.map((greenhouse) => (
                          <option key={greenhouse.id} value={greenhouse.id}>{greenhouse.name}</option>
                        ))}
                      </select>
                    ) : null}

                    {/* Ekim Seçimi */}
                    <select
                      value={taskForm.relatedPlantingId || ''}
                      onChange={(e) => {
                        const value = e.target.value ? Number(e.target.value) : undefined;
                        const selectedPlanting = value ? plantings.find(p => p.id === value) : null;
                        
                        setTaskForm({
                          ...taskForm,
                          relatedPlantingId: value,
                          // Eğer seçilen ekimin tarlası/serası varsa, onları da otomatik seç
                          relatedFieldId: selectedPlanting?.field?.id || taskForm.relatedFieldId,
                          relatedGreenhouseId: selectedPlanting?.greenhouse?.id || taskForm.relatedGreenhouseId
                        });
                      }}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                    >
                      <option value="">Ekim Seçiniz...</option>
                      {plantings
                        .filter(planting => 
                          // Seçili alana göre ekimleri filtrele
                          (!taskForm.relatedFieldId && !taskForm.relatedGreenhouseId) || // Hiçbir alan seçili değilse tümünü göster
                          (taskForm.relatedFieldId && planting.field?.id === taskForm.relatedFieldId) || // Tarla seçiliyse
                          (taskForm.relatedGreenhouseId && planting.greenhouse?.id === taskForm.relatedGreenhouseId) // Sera seçiliyse
                        )
                        .map((planting) => (
                          <option key={planting.id} value={planting.id}>
                            {planting.product?.name} - {new Date(planting.plantingDate).toLocaleDateString('tr-TR')}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Seçilen Ekimin Detayları */}
              {taskForm.relatedPlantingId && (
                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium text-gray-700">
                    İlgili Alan
                  </label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md">
                    {(() => {
                      const selectedPlanting = plantings.find(p => p.id === taskForm.relatedPlantingId);
                      if (!selectedPlanting) return null;

                      return (
                        <div className="space-y-2">
                          {selectedPlanting.field && (
                            <div>
                              <span className="font-medium">Tarla: </span>
                              <span>{selectedPlanting.field.name}</span>
                            </div>
                          )}
                          {selectedPlanting.greenhouse && (
                            <div>
                              <span className="font-medium">Sera: </span>
                              <span>{selectedPlanting.greenhouse.name}</span>
                            </div>
                          )}
                          <div>
                            <span className="font-medium">Ekim: </span>
                            <span>{selectedPlanting.product?.name}</span>
                          </div>
                          <div>
                            <span className="font-medium">Ekim Tarihi: </span>
                            <span>{new Date(selectedPlanting.plantingDate).toLocaleDateString('tr-TR')}</span>
                          </div>
                          <div>
                            <span className="font-medium">Ekilen Alan: </span>
                            <span>{selectedPlanting.plantedArea} m²</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-3 mt-5">
              <Button
                type="button"
                onClick={() => {
                  setModalOpen(false);
                  setSelectedTask(null);
                  setTaskForm({
                    title: '',
                    description: '',
                    status: 'BEKLEMEDE',
                    priority: 'ORTA',
                    dueDate: new Date().toISOString().split('T')[0],
                    createdById: user?.id,
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
                {selectedTask ? 'Güncelle' : 'Kaydet'}
              </Button>
            </div>
          </form>
        </div>
      </Dialog>
    </div>
  );
};

export default Tasks; 