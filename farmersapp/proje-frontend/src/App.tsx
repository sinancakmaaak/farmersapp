import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { tr } from 'date-fns/locale';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Fields from './pages/Fields';
import Greenhouse from './pages/Greenhouse';
import Irrigation from './pages/Irrigation';
import Products from './pages/Products';
import Plantings from './pages/Plantings';
import Fertilizations from './pages/Fertilizations';
import Harvests from './pages/Harvests';
import Inventory from './pages/Inventory';
import Suppliers from './pages/Suppliers';
import Pesticides from './pages/Pesticides';
import SoilTests from './pages/SoilTests';
import FinancialAnalysis from './pages/FinancialAnalysis';
import { AuthProvider } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import Employees from './components/Employees';
import Tasks from './components/Tasks';
import Vehicle from './components/Vehicle';
import Document from './components/Document';
import Photo from './components/Photo';
import Weather from './components/Weather';
import ExchangeRates from './components/ExchangeRates';
import Invoice from './pages/Invoice';

const router = {
  basename: '/',
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
};

const App: React.FC = () => {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
      <AuthProvider>
        <BrowserRouter {...router}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="fields" element={<Fields />} />
              <Route path="greenhouses" element={<Greenhouse />} />
              <Route path="irrigation/*" element={<Irrigation />} />
              <Route path="products" element={<Products />} />
              <Route path="plantings" element={<Plantings />} />
              <Route path="fertilizations" element={<Fertilizations />} />
              <Route path="harvests" element={<Harvests />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="suppliers" element={<Suppliers />} />
              <Route path="pesticides" element={<Pesticides />} />
              <Route path="soil-tests" element={<SoilTests />} />
              <Route path="financial-analysis" element={<FinancialAnalysis />} />
              <Route path="employees" element={<Employees />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="vehicles" element={<Vehicle />} />
              <Route path="documents" element={<Document />} />
              <Route path="photos" element={<Photo />} />
              <Route path="weather" element={<Weather />} />
              <Route path="exchange-rates" element={<ExchangeRates />} />
              <Route path="invoices" element={<Invoice />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LocalizationProvider>
  );
};

export default App;
