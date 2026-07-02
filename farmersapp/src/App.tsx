import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
import { 
  DashboardOutlined, 
  AttachMoney, 
  Agriculture, 
  LocalShipping, 
  Warehouse,
  Assignment,
  Description,
  Science,
  Task,
  MonetizationOn,
  PhotoCamera
} from '@mui/icons-material';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import DashboardComponent from './components/Dashboard';
import Fields from './components/Fields';
import Vehicles from './components/Vehicles';
import Greenhouses from './components/Greenhouses';
import Tasks from './components/Tasks';
import Documents from './components/Documents';
import SoilTests from './components/SoilTests';
import Harvests from './components/Harvests';
import Revenues from './components/Revenues';
import Photos from './components/Photos';
import ExchangeRates from './components/ExchangeRates';

const routes = [
  {
    path: "/",
    element: <DashboardComponent />,
    name: "Dashboard",
    icon: <DashboardOutlined />
  },
  {
    path: "/fields",
    element: <Fields />,
    name: "Tarlalar",
    icon: <Agriculture />
  },
  {
    path: "/vehicles",
    element: <Vehicles />,
    name: "Araçlar",
    icon: <LocalShipping />
  },
  {
    path: "/greenhouses",
    element: <Greenhouses />,
    name: "Seralar",
    icon: <Warehouse />
  },
  {
    path: "/tasks",
    element: <Tasks />,
    name: "Görevler",
    icon: <Assignment />
  },
  {
    path: "/documents",
    element: <Documents />,
    name: "Belgeler",
    icon: <Description />
  },
  {
    path: "/soil-tests",
    element: <SoilTests />,
    name: "Toprak Testleri",
    icon: <Science />
  },
  {
    path: "/harvests",
    element: <Harvests />,
    name: "Hasatlar",
    icon: <Task />
  },
  {
    path: "/revenues",
    element: <Revenues />,
    name: "Gelirler",
    icon: <MonetizationOn />
  },
  {
    path: "/photos",
    element: <Photos />,
    name: "Fotoğraflar",
    icon: <PhotoCamera />
  },
  {
    path: "/exchange-rates",
    element: <ExchangeRates />,
    name: "Döviz Kurları",
    icon: <AttachMoney />
  }
];

const App: React.FC = () => {
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Navbar />
      <Sidebar routes={routes} />
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        <Routes>
          {routes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={route.element}
            />
          ))}
        </Routes>
      </Box>
    </Box>
  );
};

export default App; 