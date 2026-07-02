import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingOverlay from './LoadingOverlay';
import { BiotechOutlined } from '@mui/icons-material';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Sayfa değiştiğinde en üste scroll yapma
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      logout();
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const menuItems = [
    { path: '/', label: 'Ana Sayfa', icon: '🏠' },
    { path: '/fields', label: 'Tarlalar', icon: '🌾' },
    { path: '/greenhouses', label: 'Seralar', icon: '🏗️' },
    { path: '/products', label: 'Ürünler', icon: '🌱' },
    { path: '/plantings', label: 'Ekim/Dikim', icon: '🌿' },
    { path: '/fertilizations', label: 'Gübreleme', icon: '💩' },
    { path: '/pesticides', label: 'İlaçlama', icon: '🧪' },
    { path: '/harvests', label: 'Hasat', icon: '🚜' },
    { path: '/irrigation', label: 'Sulama', icon: '💧' },
    { path: '/inventory', label: 'Envanter', icon: '📦' },
    { path: '/suppliers', label: 'Tedarikçiler', icon: '🏢' },
    { path: '/soil-tests', label: 'Toprak Testleri', icon: '🧬' },
    { path: '/financial-analysis', label: 'Finansal Analiz', icon: '📊' },
    { path: '/exchange-rates', label: 'Döviz Kurları', icon: '💱' },
    { path: '/employees', label: 'Çalışanlar', icon: '👥' },
    { path: '/tasks', label: 'Görevler', icon: '📋' },
    { path: '/vehicles', label: 'Araçlar', icon: '🚗' },
    { path: '/documents', label: 'Dokümanlar', icon: '📄' },
    { path: '/invoices', label: 'Faturalar', icon: '🧾' },
    { path: '/photos', label: 'Fotoğraflar', icon: '📸' },
    { path: '/weather', label: 'Hava Durumu', icon: '🌤️' }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <LoadingOverlay isVisible={isLoggingOut} message="Çıkış yapılıyor..." />
      
      {/* Left Sidebar with custom scroll */}
      <div 
        className="w-64 bg-green-600 min-h-screen flex flex-col overflow-y-auto"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#16a34a #e5e7eb',
          msOverflowStyle: 'auto'
        }}
      >
        <div className="p-4 flex-1">
          {/* Logo */}
          <div className="mb-6">
            <img
              src="/farmers-logo.png"
              alt="Farmers App Logo"
              className="w-full h-auto max-h-35 object-contain"
            />
          </div>
          
          {/* Welcome message */}
          <div className="mb-9 text-white text-center">
            <span className="block text-base font-medium">Hoşgeldin,</span>
            <span className="block text-2xl font-bold">{user?.fullName}</span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`${
                  location.pathname === item.path
                    ? 'bg-green-700 text-white'
                    : 'text-white hover:bg-green-500'
                } flex items-center space-x-3 px-4 py-3 rounded-md font-medium w-full transition-colors duration-150 ease-in-out`}
              >
                <span className="text-2xl">{typeof item.icon === 'string' ? item.icon : item.icon}</span>
                <span className="text-base">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Logout button at bottom */}
        <div className="p-4 border-t border-green-500">
          <button
            onClick={handleLogout}
            className="w-full bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoggingOut}
          >
            {isLoggingOut ? 'Çıkış yapılıyor...' : 'Çıkış'}
          </button>
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 right-4">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="inline-flex items-center justify-center p-2 rounded-md text-green-600 hover:text-green-700 hover:bg-gray-100 focus:outline-none"
        >
          <svg
            className="h-6 w-6"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 24 24"
          >
            {isMobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`${
          isMobileMenuOpen ? 'block' : 'hidden'
        } md:hidden fixed inset-0 z-40`}
      >
        <div className="fixed inset-0 bg-black opacity-25" onClick={() => setIsMobileMenuOpen(false)}></div>
        <div className="fixed inset-y-0 left-0 w-64 bg-green-600 p-4 flex flex-col">
          <div className="flex-1">
            {/* Logo in mobile menu */}
            <div className="mb-6">
              <img
                src="/farmers-logo.png"
                alt="Farmers App Logo"
                className="w-full h-auto max-h-24 object-contain"
              />
            </div>
            
            <div className="mb-9 text-white text-center">
              <span className="block text-base font-medium">Hoşgeldin,</span>
              <span className="block text-2xl font-bold">{user?.fullName}</span>
            </div>
            <div className="space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`${
                    location.pathname === item.path
                      ? 'bg-green-700 text-white'
                      : 'text-white hover:bg-green-500'
                  } flex items-center space-x-3 px-4 py-3 rounded-md font-medium w-full`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="text-2xl">{typeof item.icon === 'string' ? item.icon : item.icon}</span>
                  <span className="text-base">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
          <div className="border-t border-green-500 pt-4">
            <button
              onClick={handleLogout}
              className="w-full bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoggingOut}
            >
              {isLoggingOut ? 'Çıkış yapılıyor...' : 'Çıkış'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content with custom scroll */}
      <div className="flex-1 flex flex-col">
        <div 
          className="flex-1 p-8 overflow-y-auto"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#94a3b8 #f1f5f9',
            msOverflowStyle: 'auto'
          }}
        >
          <Outlet />
        </div>
      </div>

      <style>{`
        /* Webkit scrollbar styles for left sidebar */
        .w-64::-webkit-scrollbar {
          width: 8px;
        }

        .w-64::-webkit-scrollbar-track {
          background: #1a472a;
        }

        .w-64::-webkit-scrollbar-thumb {
          background: #2d6a4f;
          border-radius: 4px;
        }

        .w-64::-webkit-scrollbar-thumb:hover {
          background: #3c8c6c;
        }

        /* Webkit scrollbar styles for main content */
        .flex-1::-webkit-scrollbar {
          width: 8px;
        }

        .flex-1::-webkit-scrollbar-track {
          background: #f1f1f1;
        }

        .flex-1::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 4px;
        }

        .flex-1::-webkit-scrollbar-thumb:hover {
          background: #555;
        }

        /* Firefox scrollbar styles */
        .w-64 {
          scrollbar-width: thin;
          scrollbar-color: #2d6a4f #1a472a;
        }

        .flex-1 {
          scrollbar-width: thin;
          scrollbar-color: #888 #f1f1f1;
        }

        /* Smooth scrolling for both */
        .w-64, .flex-1 {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
};

export default Layout;
