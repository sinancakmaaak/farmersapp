import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { PageHeader } from '../components/PageHeader';
import api from '../api';
import { useAuth } from '../hooks/useAuth';

interface Invoice {
  id: number;
  title: string;
  url: string;
  uploadDate: string;
  description?: string;
}

const Invoice: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });

  const loadInvoices = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/invoices');
      setInvoices(response.data);
    } catch (err) {
      setError('Faturalar yüklenirken bir hata oluştu.');
      console.error('Error loading invoices:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadInvoices();
    }
  }, [isAuthenticated]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file && !selectedInvoice) {
      setError('Lütfen bir dosya seçin.');
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    if (formData.description) {
      formDataToSend.append('description', formData.description);
    }
    if (file) {
      formDataToSend.append('file', file);
    }

    try {
      setIsLoading(true);
      if (selectedInvoice) {
        await api.put(`/api/invoices/${selectedInvoice.id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/api/invoices', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      loadInvoices();
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      setError('Fatura kaydedilirken bir hata oluştu.');
      console.error('Error saving invoice:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bu faturayı silmek istediğinizden emin misiniz?')) {
      try {
        setIsLoading(true);
        await api.delete(`/api/invoices/${id}`);
        loadInvoices();
      } catch (err) {
        setError('Fatura silinirken bir hata oluştu.');
        console.error('Error deleting invoice:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDownload = async (invoice: Invoice) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get(`/api/invoices/${invoice.id}/download`, {
        responseType: 'blob'
      });

      // Check if the response is actually a blob
      if (!(response.data instanceof Blob)) {
        throw new Error('Invalid response format');
      }

      // Check if the blob is empty
      if (response.data.size === 0) {
        throw new Error('Empty file received');
      }

      // Get the filename from the content-disposition header or use the invoice title
      const contentDisposition = response.headers['content-disposition'];
      let filename = invoice.title;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }

      // Add file extension if missing
      const contentType = response.headers['content-type'];
      if (!filename.includes('.') && contentType) {
        const ext = contentType.split('/')[1];
        filename = `${filename}.${ext}`;
      }

      // Create and trigger download
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Error downloading invoice:', err);
      if (err.response?.status === 404) {
        setError('Fatura dosyası bulunamadı.');
      } else if (err.message === 'Empty file received') {
        setError('Boş dosya alındı. Lütfen sistem yöneticisi ile iletişime geçin.');
      } else if (err.message === 'Invalid response format') {
        setError('Geçersiz dosya formatı alındı. Lütfen sistem yöneticisi ile iletişime geçin.');
      } else {
        setError('Dosya indirilirken bir hata oluştu.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ title: '', description: '' });
    setFile(null);
    setSelectedInvoice(null);
    setError(null);
  };

  const handleEdit = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setFormData({
      title: invoice.title,
      description: invoice.description || ''
    });
    setIsModalOpen(true);
  };

  if (isLoading && !invoices.length) {
    return <div className="text-center p-4">Yükleniyor...</div>;
  }

  return (
    <div>
      <PageHeader
        title="Faturalar"
        description="Tüm faturaların listesi ve yönetimi"
        action={
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="btn-primary"
          >
            Yeni Fatura Ekle
          </button>
        }
      />

      {error && <div className="error-message">{error}</div>}

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="table-container">
              <table className="table-base">
                <thead className="table-header">
                  <tr>
                    <th className="table-header-cell">Başlık</th>
                    <th className="table-header-cell">Açıklama</th>
                    <th className="table-header-cell">Yükleme Tarihi</th>
                    <th className="table-header-cell">
                      <span className="sr-only">İşlemler</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="table-row">
                      <td className="table-cell">
                        <button
                          onClick={() => handleDownload(invoice)}
                          className="text-blue-600 hover:text-blue-900 hover:underline"
                          disabled={isLoading}
                        >
                          {invoice.title}
                        </button>
                      </td>
                      <td className="table-cell">{invoice.description || '-'}</td>
                      <td className="table-cell">
                        {format(new Date(invoice.uploadDate), 'dd MMMM yyyy', { locale: tr })}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          onClick={() => handleEdit(invoice)}
                          className="text-green-600 hover:text-green-900 mr-4"
                        >
                          Düzenle
                        </button>
                        <button
                          onClick={() => handleDelete(invoice.id)}
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
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity">
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="title" className="form-label">
                        Başlık
                      </label>
                      <input
                        type="text"
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="form-input"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="description" className="form-label">
                        Açıklama
                      </label>
                      <textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="form-input"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label htmlFor="file" className="form-label">
                        Dosya
                      </label>
                      <input
                        type="file"
                        id="file"
                        onChange={handleFileChange}
                        className="form-input"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.bmp,.tiff,.webp"
                        required={!selectedInvoice}
                      />
                      <p className="mt-1 text-sm text-gray-600">
                        PDF, Word (DOC/DOCX), Excel (XLS/XLSX), Resim (JPG/PNG/GIF/BMP/TIFF/WEBP) formatları desteklenir
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn-primary"
                    >
                      {isLoading ? 'Kaydediliyor...' : selectedInvoice ? 'Güncelle' : 'Kaydet'}
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

export default Invoice; 