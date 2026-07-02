import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Refresh } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import api from '../utils/api';

interface ExchangeRate {
  id: number;
  currencyCode: string;
  currencyName: string;
  buyingRate: number;
  sellingRate: number;
  lastUpdated: string;
}

const ExchangeRates: React.FC = () => {
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const fetchRates = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/exchange-rates');
      setRates(response.data);
    } catch (error) {
      enqueueSnackbar('Döviz kurları yüklenirken bir hata oluştu', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      await api.post('/api/exchange-rates/update');
      await fetchRates();
      enqueueSnackbar('Döviz kurları güncellendi', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Döviz kurları güncellenirken bir hata oluştu', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Döviz Kurları
        </Typography>
        <Tooltip title="Kurları Güncelle">
          <IconButton onClick={handleRefresh} disabled={loading}>
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Döviz Kodu</TableCell>
              <TableCell>Döviz Adı</TableCell>
              <TableCell align="right">Alış</TableCell>
              <TableCell align="right">Satış</TableCell>
              <TableCell>Son Güncelleme</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rates.map((rate) => (
              <TableRow key={rate.id}>
                <TableCell>{rate.currencyCode}</TableCell>
                <TableCell>{rate.currencyName}</TableCell>
                <TableCell align="right">
                  {rate.buyingRate.toFixed(4)} ₺
                </TableCell>
                <TableCell align="right">
                  {rate.sellingRate.toFixed(4)} ₺
                </TableCell>
                <TableCell>
                  {new Date(rate.lastUpdated).toLocaleString('tr-TR')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ExchangeRates; 