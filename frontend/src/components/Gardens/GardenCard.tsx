import React from 'react';
import { Garden } from '../../types';

interface GardenCardProps {
  garden: Garden;
  onClick: () => void;
}

export const GardenCard: React.FC<GardenCardProps> = ({ garden, onClick }) => {
  const plantCount = garden.plants ? Object.keys(garden.plants).length : 0;

  return (
    <div 
      className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow border border-gray-200"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {garden.name || "My Garden"}
        </h3>
        <div className="text-sm text-gray-500">
          {plantCount} plant{plantCount !== 1 ? 's' : ''}
        </div>
      </div>
      
      <div className="text-sm text-gray-600">
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span>Click to view plants</span>
        </div>
      </div>
    </div>
  );
};