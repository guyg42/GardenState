import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePlants } from '../../hooks/usePlants';
import { PlantCard } from './PlantCard';

export const PlantList: React.FC = () => {
  const { gardenId } = useParams<{ gardenId: string }>();
  const { plants, loading, createPlant } = usePlants(gardenId!);
  const navigate = useNavigate();

  const handleCreatePlant = async () => {
    console.log('handleCreatePlant: Button clicked');
    try {
      console.log('handleCreatePlant: Calling createPlant function');
      const plantId = await createPlant();
      console.log('handleCreatePlant: Plant created with ID:', plantId);
      console.log('handleCreatePlant: Navigating to plant detail');
      navigate(`/garden/${gardenId}/plant/${plantId}`);
    } catch (error) {
      console.error('handleCreatePlant: Error creating plant:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/gardens')}
                className="text-gray-600 hover:text-gray-900"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Plants</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {plants.map((plant) => (
            <PlantCard
              key={plant.id}
              plant={plant}
              onClick={() => navigate(`/garden/${gardenId}/plant/${plant.id}`)}
            />
          ))}
          
          <button
            onClick={handleCreatePlant}
            className="bg-white rounded-lg shadow-md p-6 border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors flex flex-col items-center justify-center min-h-[150px]"
          >
            <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-gray-600 font-medium">Add New Plant</span>
          </button>
        </div>

        {plants.length === 0 && (
          <div className="text-center mt-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No plants yet</h3>
            <p className="text-gray-600">Add your first plant to start tracking!</p>
          </div>
        )}
      </div>
    </div>
  );
};