import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Delete, Download, Search } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import api from '../utils/api';

interface Document {
  id: number;
  title: string;
  description: string;
  uploadDate: string;
}

const Documents: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { enqueueSnackbar } = useSnackbar();

  const fetchDocuments = async (search?: string) => {
    try {
      const endpoint = search ? `/api/documents/search?query=${encodeURIComponent(search)}` : '/api/documents';
      const response = await api.get(endpoint);
      setDocuments(response.data);
    } catch (error) {
      enqueueSnackbar('Dokümanlar yüklenirken bir hata oluştu', { variant: 'error' });
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleSearch = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    fetchDocuments(value);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    if (description) formData.append('description', description);

    try {
      await api.post('/api/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      enqueueSnackbar('Doküman başarıyla yüklendi', { variant: 'success' });
      setTitle('');
      setDescription('');
      setFile(null);
      fetchDocuments(searchTerm);
    } catch (error) {
      enqueueSnackbar('Doküman yüklenirken bir hata oluştu', { variant: 'error' });
    }
  };

  const handleDownload = async (id: number) => {
    try {
      const response = await api.get(`/api/documents/${id}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from Content-Disposition header
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'document';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename\*=UTF-8''(.+)/i);
        if (filenameMatch) {
          filename = decodeURIComponent(filenameMatch[1]);
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      enqueueSnackbar('Doküman indirilirken bir hata oluştu', { variant: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/api/documents/${id}`);
      enqueueSnackbar('Doküman başarıyla silindi', { variant: 'success' });
      fetchDocuments(searchTerm);
    } catch (error) {
      enqueueSnackbar('Doküman silinirken bir hata oluştu', { variant: 'error' });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dokümanlar
      </Typography>

      {/* Search Box */}
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Doküman ara..."
        value={searchTerm}
        onChange={handleSearch}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
      />

      {/* Upload Form */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <form onSubmit={handleUpload}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              required
              label="Başlık"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <TextField
              label="Açıklama"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={2}
            />
            <input
              accept=".pdf,.doc,.docx"
              type="file"
              onChange={handleFileChange}
              style={{ marginBottom: '1rem' }}
            />
            <Button
              variant="contained"
              type="submit"
              disabled={!file || !title}
            >
              Yükle
            </Button>
          </Box>
        </form>
      </Paper>

      {/* Documents Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Başlık</TableCell>
              <TableCell>Açıklama</TableCell>
              <TableCell>Yükleme Tarihi</TableCell>
              <TableCell align="right">İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {documents.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell>{doc.title}</TableCell>
                <TableCell>{doc.description}</TableCell>
                <TableCell>
                  {new Date(doc.uploadDate).toLocaleDateString('tr-TR')}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    color="primary"
                    onClick={() => handleDownload(doc.id)}
                  >
                    <Download />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(doc.id)}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Documents; 