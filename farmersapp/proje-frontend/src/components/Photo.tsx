import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { PageHeader } from './PageHeader';
import api from '../api';
import { useAuth } from '../hooks/useAuth';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ImageIcon from '@mui/icons-material/Image';
import BrokenImageIcon from '@mui/icons-material/BrokenImage';

interface PhotoType {
  id: number;
  url: string;
  uploadDate: string;
  fieldId?: number;
  vehicleId?: number;
  greenhouseId?: number;
  notes?: string;
}

interface Field {
  id: number;
  name: string;
}

interface Vehicle {
  id: number;
  licensePlate: string;
  type: string;
}

interface Greenhouse {
  id: number;
  name: string;
}

const Photo: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [photos, setPhotos] = useState<PhotoType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [fields, setFields] = useState<Field[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [greenhouses, setGreenhouses] = useState<Greenhouse[]>([]);
  const [selectedEntityType, setSelectedEntityType] = useState<'field' | 'vehicle' | 'greenhouse' | null>(null);
  const [selectedEntityId, setSelectedEntityId] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<PhotoType | null>(null);
  const [formData, setFormData] = useState({
    notes: ''
  });

  const loadData = async () => {
    try {
      const [fieldsRes, vehiclesRes, greenhousesRes] = await Promise.all([
        api.get('/api/fields'),
        api.get('/api/vehicles'),
        api.get('/api/greenhouses')
      ]);
      setFields(fieldsRes.data);
      setVehicles(vehiclesRes.data);
      setGreenhouses(greenhousesRes.data);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Veriler yüklenirken bir hata oluştu.');
    }
  };

  const loadPhotos = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/photos');
      setPhotos(response.data);
    } catch (err) {
      setError('Fotoğraflar yüklenirken bir hata oluştu.');
      console.error('Error loading photos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadPhotos();
      loadData();
    }
  }, [isAuthenticated]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      
      if (selectedFiles.length > 6) {
        setError('En fazla 6 fotoğraf seçebilirsiniz.');
        return;
      }

      // Check if any file is larger than 5MB
      const maxSize = 5 * 1024 * 1024; // 5MB
      const oversizedFiles = selectedFiles.filter(file => file.size > maxSize);
      if (oversizedFiles.length > 0) {
        setError('Seçilen fotoğraflardan bazıları 5MB\'dan büyük. Lütfen daha küçük boyutlu fotoğraflar seçin.');
        return;
      }

      setFiles(selectedFiles);
      
      // Create preview URLs for all selected files
      const newPreviewUrls = selectedFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls(newPreviewUrls);
      setError(null);
    }
  };

  const handleDownload = async (photo: PhotoType) => {
    try {
      const response = await api.get(`/api/photos/${photo.id}/download`, {
        responseType: 'blob'
      });

      const contentType = response.headers['content-type'];
      const blob = new Blob([response.data], { type: contentType });
      const fileName = `photo_${photo.id}${getFileExtension(contentType)}`;

      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.download = fileName;

      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(downloadLink.href);
    } catch (error) {
      console.error('Fotoğraf indirme hatası:', error);
      setError('Fotoğraf indirilirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const getFileExtension = (contentType: string) => {
    switch (contentType) {
      case 'image/jpeg':
        return '.jpg';
      case 'image/png':
        return '.png';
      default:
        return '.jpg';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      setError('Lütfen en az bir fotoğraf seçin.');
      return;
    }

    if (!selectedEntityType || !selectedEntityId) {
      setError('Lütfen bir tarla, araç veya sera seçin.');
      return;
    }

    setIsLoading(true);
    setUploadProgress(0);
    let successCount = 0;

    try {
      for (let i = 0; i < files.length; i++) {
        const formDataToSend = new FormData();
        if (selectedEntityType === 'field') formDataToSend.append('fieldId', selectedEntityId);
        if (selectedEntityType === 'vehicle') formDataToSend.append('vehicleId', selectedEntityId);
        if (selectedEntityType === 'greenhouse') formDataToSend.append('greenhouseId', selectedEntityId);
        if (formData.notes) formDataToSend.append('notes', formData.notes);
        formDataToSend.append('file', files[i]);

        const response = await api.post('/api/photos', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const progress = (progressEvent.loaded / progressEvent.total) * 100;
              setUploadProgress((prevProgress) => 
                (prevProgress * i + progress) / (files.length)
              );
            }
          }
        });
        
        successCount++;
        setPhotos(prevPhotos => [...prevPhotos, response.data]);
      }
      
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      setError(`${successCount} fotoğraf yüklendi, ancak bazı fotoğraflar yüklenirken hata oluştu.`);
      console.error('Error saving photos:', err);
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bu fotoğrafı silmek istediğinizden emin misiniz?')) {
      try {
        setIsLoading(true);
        await api.delete(`/api/photos/${id}`);
        loadPhotos();
      } catch (err) {
        setError('Fotoğraf silinirken bir hata oluştu.');
        console.error('Error deleting photo:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({ notes: '' });
    setFiles([]);
    setPreviewUrls([]);
    setSelectedPhoto(null);
    setSelectedEntityType(null);
    setSelectedEntityId('');
    setError(null);
    setUploadProgress(0);
  };

  const getEntityName = (photo: PhotoType) => {
    if (photo.fieldId) {
      const field = fields.find(f => f.id === photo.fieldId);
      return field?.name || 'Bilinmiyor';
    }
    if (photo.vehicleId) {
      const vehicle = vehicles.find(v => v.id === photo.vehicleId);
      return `${vehicle?.licensePlate || 'Bilinmiyor'} (${vehicle?.type || 'Bilinmiyor'})`;
    }
    if (photo.greenhouseId) {
      const greenhouse = greenhouses.find(g => g.id === photo.greenhouseId);
      return greenhouse?.name || 'Bilinmiyor';
    }
    return 'Bilinmiyor';
  };

  const handlePreviewClick = (photo: PhotoType) => {
    setPreviewPhoto(photo);
    setIsPreviewModalOpen(true);
  };

  const getPhotoUrl = (photo: PhotoType) => {
    if (!photo.id) return '';
    return `${api.defaults.baseURL}/api/photos/${photo.id}/view`;
  };

  const renderPhotoListItem = (photo: PhotoType) => (
    <div key={photo.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="relative w-full pb-[60%] cursor-pointer" onClick={() => handlePreviewClick(photo)}>
        <img
          src={getPhotoUrl(photo)}
          alt={`Fotoğraf ${photo.id}`}
          className="absolute inset-0 w-full h-full object-contain bg-gray-100"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              while (parent.firstChild) {
                parent.removeChild(parent.firstChild);
              }
              const iconContainer = document.createElement('div');
              iconContainer.className = 'absolute inset-0 flex items-center justify-center bg-gray-100';
              const icon = document.createElement('div');
              icon.className = 'text-gray-400';
              icon.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              `;
              iconContainer.appendChild(icon);
              parent.appendChild(iconContainer);
            }
          }}
        />
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-sm text-gray-500">
              {format(new Date(photo.uploadDate), 'dd MMMM yyyy', { locale: tr })}
            </p>
            <p className="text-sm font-medium text-gray-700">
              {getEntityName(photo)}
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handleDownload(photo)}
              className="p-1.5 text-gray-600 hover:text-green-600 transition-colors"
              title="İndir"
            >
              <DownloadIcon sx={{ fontSize: 20 }} />
            </button>
            <button
              onClick={() => handleDelete(photo.id)}
              className="p-1.5 text-gray-600 hover:text-red-600 transition-colors"
              title="Sil"
            >
              <DeleteIcon sx={{ fontSize: 20 }} />
            </button>
          </div>
        </div>
        {photo.notes && (
          <p className="text-sm text-gray-600 line-clamp-2 mt-1">{photo.notes}</p>
        )}
      </div>
    </div>
  );

  const fieldPhotos = photos.filter(p => p.fieldId);
  const vehiclePhotos = photos.filter(p => p.vehicleId);
  const greenhousePhotos = photos.filter(p => p.greenhouseId);

  if (isLoading && !photos.length) {
    return <div className="text-center p-4">Yükleniyor...</div>;
  }

  return (
    <div>
      <PageHeader
        title="Fotoğraflar"
        description="Tüm fotoğrafların listesi ve yönetimi"
        action={
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="btn-primary"
          >
            Yeni Fotoğraf Ekle
          </button>
        }
      />

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 grid grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-xl font-semibold mb-4 sticky top-0 bg-white pb-2 border-b">
            Tarla Fotoğrafları
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({fieldPhotos.length})
            </span>
          </h2>
          <div className="overflow-y-auto h-[calc(100vh-300px)]">
            <div className="grid grid-cols-1 gap-4">
              {fieldPhotos.map(renderPhotoListItem)}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-xl font-semibold mb-4 sticky top-0 bg-white pb-2 border-b">
            Araç Fotoğrafları
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({vehiclePhotos.length})
            </span>
          </h2>
          <div className="overflow-y-auto h-[calc(100vh-300px)]">
            <div className="grid grid-cols-1 gap-4">
              {vehiclePhotos.map(renderPhotoListItem)}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-xl font-semibold mb-4 sticky top-0 bg-white pb-2 border-b">
            Sera Fotoğrafları
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({greenhousePhotos.length})
            </span>
          </h2>
          <div className="overflow-y-auto h-[calc(100vh-300px)]">
            <div className="grid grid-cols-1 gap-4">
              {greenhousePhotos.map(renderPhotoListItem)}
            </div>
          </div>
        </div>
      </div>

      {/* Fotoğraf Önizleme Modalı */}
      {isPreviewModalOpen && previewPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-6xl w-full h-[90vh] bg-white rounded-lg overflow-hidden">
            <div className="absolute top-4 right-4 flex space-x-2 z-10">
              <button
                onClick={() => handleDownload(previewPhoto)}
                className="p-2 bg-white rounded-full text-gray-700 hover:text-blue-600 transition-colors duration-200 shadow-lg"
                title="İndir"
              >
                <DownloadIcon />
              </button>
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="p-2 bg-white rounded-full text-gray-700 hover:text-red-600 transition-colors duration-200 shadow-lg"
                title="Kapat"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-hidden relative">
                <img
                  src={getPhotoUrl(previewPhoto)}
                  alt={`Fotoğraf ${previewPhoto.id}`}
                  className="absolute inset-0 w-full h-full object-contain"
                />
              </div>
              <div className="p-4 bg-white border-t">
                <p className="text-sm text-gray-500">
                  {format(new Date(previewPhoto.uploadDate), 'dd MMMM yyyy', { locale: tr })}
                </p>
                <p className="text-sm font-medium text-gray-700 mt-1">
                  {getEntityName(previewPhoto)}
                </p>
                {previewPhoto.notes && (
                  <p className="mt-2 text-sm text-gray-700">{previewPhoto.notes}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fotoğraf Ekleme Modalı */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity">
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="file" className="form-label">
                        Fotoğraflar (En fazla 6 adet, her biri max. 5MB)
                      </label>
                      <input
                        type="file"
                        id="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="form-input"
                        required
                        multiple
                        max="6"
                      />
                    </div>

                    {previewUrls.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {previewUrls.map((url, index) => (
                          <div key={index} className="relative w-full pb-[60%]">
                            <div className="absolute inset-0">
                              <img
                                src={url}
                                alt={`Önizleme ${index + 1}`}
                                className="w-full h-full object-contain bg-gray-100 rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const newFiles = files.filter((_, i) => i !== index);
                                  const newPreviewUrls = previewUrls.filter((_, i) => i !== index);
                                  setFiles(newFiles);
                                  setPreviewUrls(newPreviewUrls);
                                }}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {uploadProgress > 0 && (
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    )}

                    <div>
                      <label className="form-label">Fotoğraf Türü</label>
                      <div className="mt-2 space-x-4">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedEntityType('field');
                            setSelectedEntityId('');
                          }}
                          className={`px-4 py-2 rounded ${
                            selectedEntityType === 'field'
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          Tarla
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedEntityType('vehicle');
                            setSelectedEntityId('');
                          }}
                          className={`px-4 py-2 rounded ${
                            selectedEntityType === 'vehicle'
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          Araç
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedEntityType('greenhouse');
                            setSelectedEntityId('');
                          }}
                          className={`px-4 py-2 rounded ${
                            selectedEntityType === 'greenhouse'
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          Sera
                        </button>
                      </div>
                    </div>

                    {selectedEntityType && (
                      <div>
                        <label htmlFor="entitySelect" className="form-label">
                          {selectedEntityType === 'field' && 'Tarla Seçin'}
                          {selectedEntityType === 'vehicle' && 'Araç Seçin'}
                          {selectedEntityType === 'greenhouse' && 'Sera Seçin'}
                        </label>
                        <select
                          id="entitySelect"
                          value={selectedEntityId}
                          onChange={(e) => setSelectedEntityId(e.target.value)}
                          className="form-input"
                          required
                        >
                          <option value="">Seçiniz...</option>
                          {selectedEntityType === 'field' && fields.map(field => (
                            <option key={field.id} value={field.id}>{field.name}</option>
                          ))}
                          {selectedEntityType === 'vehicle' && vehicles.map(vehicle => (
                            <option key={vehicle.id} value={vehicle.id}>
                              {vehicle.licensePlate} - {vehicle.type}
                            </option>
                          ))}
                          {selectedEntityType === 'greenhouse' && greenhouses.map(greenhouse => (
                            <option key={greenhouse.id} value={greenhouse.id}>{greenhouse.name}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div>
                      <label htmlFor="notes" className="form-label">
                        Notlar
                      </label>
                      <textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="form-input"
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn-primary"
                    >
                      {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        resetForm();
                      }}
                      className="btn-secondary"
                    >
                      İptal
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Photo; 