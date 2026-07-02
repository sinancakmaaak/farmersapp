import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`flex items-center justify-center ${className}`}>
    <div className="flex flex-col items-center">
      <div className="text-4xl font-bold text-green-600 flex items-center space-x-2">
        <span>🌾</span>
        <span>FarmersApp</span>
      </div>
    </div>
  </div>
);

export default Logo; 