import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-green-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/" className="text-white font-bold text-xl">
                Çiftçi Yönetim
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link
                  to="/fields"
                  className="text-white hover:bg-green-500 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Tarlalar
                </Link>
                <Link
                  to="/greenhouses"
                  className="text-white hover:bg-green-500 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Seralar
                </Link>
                <Link
                  to="/plantings"
                  className="text-white hover:bg-green-500 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Ekim/Dikim
                </Link>
                <Link
                  to="/products"
                  className="text-white hover:bg-green-500 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Ürünler
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 