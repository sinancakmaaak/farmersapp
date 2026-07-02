import React, { useState, useEffect, useMemo } from 'react';
import { Refresh, Add, Delete, KeyboardArrowDown } from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import api from '../api';

interface ExchangeRate {
  id: number;
  currencyCode: string;
  currencyName: string;
  buyingRate: number;
  sellingRate: number;
  lastUpdated: string;
}

const AVAILABLE_CURRENCIES = [
  { code: 'AUD', name: 'Avustralya Doları' },
  { code: 'CAD', name: 'Kanada Doları' },
  { code: 'CHF', name: 'İsviçre Frangı' },
  { code: 'CNY', name: 'Çin Yuanı' },
  { code: 'DKK', name: 'Danimarka Kronu' },
  { code: 'JPY', name: 'Japon Yeni' },
  { code: 'KWD', name: 'Kuveyt Dinarı' },
  { code: 'NOK', name: 'Norveç Kronu' },
  { code: 'SAR', name: 'Suudi Riyali' },
  { code: 'SEK', name: 'İsveç Kronu' },
  { code: 'AED', name: 'BAE Dirhemi' },
  { code: 'QAR', name: 'Katar Riyali' },
  { code: 'RUB', name: 'Rus Rublesi' },
  { code: 'IRR', name: 'İran Riyali' },
  { code: 'PKR', name: 'Pakistan Rupisi' }
];

const ExchangeRates: React.FC = () => {
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchRates = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/exchange-rates');
      setRates(response.data);
    } catch (error) {
      toast.error('Döviz kurları yüklenirken bir hata oluştu');
      console.error('Error fetching exchange rates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      await api.post('/api/exchange-rates/update');
      await fetchRates();
      toast.success('Döviz kurları güncellendi');
    } catch (error) {
      toast.error('Döviz kurları güncellenirken bir hata oluştu');
      console.error('Error updating exchange rates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCurrency = async (currencyCode: string, currencyName: string) => {
    try {
      setLoading(true);
      await api.post('/api/exchange-rates/add', { currencyCode, currencyName });
      await fetchRates();
      setShowCurrencyMenu(false);
      toast.success(`${currencyName} eklendi`);
    } catch (error) {
      toast.error('Döviz kuru eklenirken bir hata oluştu');
      console.error('Error adding currency:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCurrency = async (currencyCode: string) => {
    try {
      setLoading(true);
      await api.delete(`/api/exchange-rates/${currencyCode}`);
      await fetchRates();
      toast.success('Döviz kuru silindi');
    } catch (error) {
      toast.error('Döviz kuru silinirken bir hata oluştu');
      console.error('Error deleting currency:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const getAvailableCurrencies = () => {
    const existingCodes = rates.map(rate => rate.currencyCode);
    return AVAILABLE_CURRENCIES.filter(currency => !existingCodes.includes(currency.code));
  };

  const filteredCurrencies = useMemo(() => {
    const existingCodes = rates.map(rate => rate.currencyCode);
    return AVAILABLE_CURRENCIES
      .filter(currency => !existingCodes.includes(currency.code))
      .filter(currency => 
        currency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        currency.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [rates, searchTerm]);

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Döviz Kurları</h1>
            <div className="flex space-x-2">
              <div className="relative">
                <button
                  onClick={() => setShowCurrencyMenu(!showCurrencyMenu)}
                  className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg flex items-center transition-colors duration-200"
                  disabled={loading}
                >
                  <Add className="w-5 h-5 mr-1" />
                  Döviz Ekle
                  <KeyboardArrowDown className={`w-5 h-5 ml-1 transform transition-transform ${showCurrencyMenu ? 'rotate-180' : ''}`} />
                </button>
                {showCurrencyMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-10">
                    <div className="py-2 max-h-96 overflow-y-auto custom-scrollbar">
                      <div className="sticky top-0 bg-white px-4 py-2 border-b border-gray-200">
                        <input
                          type="text"
                          placeholder="Döviz Ara..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          onChange={(e) => setSearchTerm(e.target.value)}
                          value={searchTerm}
                        />
                      </div>
                      {filteredCurrencies.length > 0 ? (
                        filteredCurrencies.map((currency) => (
                          <button
                            key={currency.code}
                            onClick={() => handleAddCurrency(currency.code, currency.name)}
                            className="w-full px-4 py-3 text-left text-gray-700 hover:bg-green-50 flex items-center group transition-colors duration-200"
                            disabled={loading}
                          >
                            <Add className="w-4 h-4 mr-2 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                            <div>
                              <div className="font-medium">{currency.name}</div>
                              <div className="text-sm text-gray-500">{currency.code}</div>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-gray-500 text-sm text-center">
                          {searchTerm ? 'Sonuç bulunamadı' : 'Eklenebilecek döviz kalmadı'}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={handleRefresh}
                className="bg-green-600 hover:bg-green-500 text-white p-2 rounded-lg transition-colors duration-200"
                disabled={loading}
              >
                <Refresh className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Exchange Rates Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Döviz Kodu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Döviz Adı
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Alış
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Satış
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Son Güncelleme
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rates.map((rate) => (
                  <tr key={rate.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {rate.currencyCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {rate.currencyName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                      {rate.buyingRate.toFixed(4)} ₺
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                      {rate.sellingRate.toFixed(4)} ₺
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {new Date(rate.lastUpdated).toLocaleString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDeleteCurrency(rate.currencyCode)}
                        className="text-red-600 hover:text-red-800 transition-colors duration-200"
                        disabled={loading}
                      >
                        <Delete className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {rates.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      Döviz kuru bulunamadı
                    </td>
                  </tr>
                )}
                {loading && (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        <Refresh className="w-6 h-6 text-green-600 animate-spin" />
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExchangeRates; 