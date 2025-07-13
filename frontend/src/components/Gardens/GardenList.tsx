import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGardens } from '../../hooks/useGardens';
import { GardenCard } from './GardenCard';
import { useAuthContext } from '../Auth/AuthProvider';

export const GardenList: React.FC = () => {
  const { gardens, loading, createGarden } = useGardens();
  const { logout } = useAuthContext();
  const navigate = useNavigate();

  const handleCreateGarden = async () => {
    console.log('handleCreateGarden: Button clicked');
    try {
      console.log('handleCreateGarden: Calling createGarden function');
      const gardenId = await createGarden();
      console.log('handleCreateGarden: Garden created with ID:', gardenId);
      console.log('handleCreateGarden: Navigating to garden');
      navigate(`/garden/${gardenId}`);
    } catch (error) {
      console.error('handleCreateGarden: Error creating garden:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
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
            <h1 className="text-3xl font-bold text-gray-900">My Gardens</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {gardens.map((garden) => (
            <GardenCard
              key={garden.id}
              garden={garden}
              onClick={() => navigate(`/garden/${garden.id}`)}
            />
          ))}
          
          <button
            onClick={handleCreateGarden}
            className="bg-white rounded-lg shadow-md p-6 border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors flex flex-col items-center justify-center min-h-[150px]"
          >
            <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-gray-600 font-medium">Create New Garden</span>
          </button>
        </div>

        {gardens.length === 0 && (
          <div className="text-center mt-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No gardens yet</h3>
            <p className="text-gray-600">Create your first garden to start tracking your plants!</p>
          </div>
        )}
      </div>
    </div>
  );
};