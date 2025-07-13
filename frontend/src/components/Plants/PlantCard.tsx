import React from 'react';
import { Plant } from '../../types';

interface PlantCardProps {
  plant: Plant;
  onClick: () => void;
}

export const PlantCard: React.FC<PlantCardProps> = ({ plant, onClick }) => {
  const entryCount = plant.entries ? Object.keys(plant.entries).length : 0;
  const lastEntry = plant.entries ? 
    Object.values(plant.entries).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0] : null;

  return (
    <div 
      className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow border border-gray-200"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {plant.nickname || `Plant ${plant.id.slice(-6)}`}
          </h3>
          {plant.plantType && (
            <div className="text-sm text-gray-500">{plant.plantType}</div>
          )}
        </div>
        <div className="text-sm text-gray-500">
          {entryCount} entr{entryCount !== 1 ? 'ies' : 'y'}
        </div>
      </div>
      
      {lastEntry && (
        <div className="mb-3">
          <div className="text-sm text-gray-600 truncate">
            Last: {lastEntry.summary || 'No summary'}
          </div>
          <div className="text-xs text-gray-400">
            {new Date(lastEntry.createdAt).toLocaleDateString()}
          </div>
        </div>
      )}
      
      <div className="text-sm text-gray-600">
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Click to view entries</span>
        </div>
      </div>
    </div>
  );
};