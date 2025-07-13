import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ref, onValue, off, update } from 'firebase/database';
import { database } from '../../utils/firebase';
import { Garden, Plant } from '../../types';
import { PlantCard } from '../Plants/PlantCard';
import { usePlants } from '../../hooks/usePlants';

export const GardenDetail: React.FC = () => {
  const { gardenId } = useParams<{ gardenId: string }>();
  const navigate = useNavigate();
  const { plants, loading: plantsLoading, createPlant } = usePlants(gardenId!);
  
  const [garden, setGarden] = useState<Garden | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    if (!gardenId) return;

    const gardenRef = ref(database, `gardens/${gardenId}`);
    
    const unsubscribe = onValue(gardenRef, (snapshot) => {
      if (snapshot.exists()) {
        const gardenData = snapshot.val();
        const gardenWithId = { id: gardenId, ...gardenData };
        setGarden(gardenWithId);
        
        // Update edit form with current garden data
        setEditForm({
          name: gardenData.name || '',
          description: gardenData.description || ''
        });
      }
      setLoading(false);
    });

    return () => off(gardenRef, 'value', unsubscribe);
  }, [gardenId]);

  const handleCreatePlant = async () => {
    try {
      const plantId = await createPlant();
      navigate(`/garden/${gardenId}/plant/${plantId}`);
    } catch (error) {
      console.error('Error creating plant:', error);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!gardenId) return;

    try {
      const gardenRef = ref(database, `gardens/${gardenId}`);
      await update(gardenRef, {
        name: editForm.name,
        description: editForm.description
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating garden:', error);
    }
  };

  const handleCancelEdit = () => {
    // Reset form to current garden data
    if (garden) {
      setEditForm({
        name: garden.name || '',
        description: garden.description || ''
      });
    }
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!garden) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">Garden not found</div>
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
              <h1 className="text-3xl font-bold text-gray-900">
                {garden.name || `Garden ${garden.id.slice(-6)}`}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Garden Overview</h2>
            {!isEditing && (
              <button
                onClick={handleEditClick}
                className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Edit
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Garden Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Give your garden a name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your garden, its purpose, location, or any notes"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {garden.name && (
                <div>
                  <span className="font-medium text-gray-700">Name:</span>
                  <span className="ml-2 text-gray-900">{garden.name}</span>
                </div>
              )}
              
              {garden.description && (
                <div>
                  <span className="font-medium text-gray-700">Description:</span>
                  <p className="mt-1 text-gray-900">{garden.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 pt-4 border-t border-gray-100">
                <div>
                  <span className="font-medium">Created:</span> {new Date(garden.createdAt || '').toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Total Plants:</span> {plants.length}
                </div>
              </div>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Plants</h2>
          
          {plantsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-lg">Loading plants...</div>
            </div>
          ) : (
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
          )}

          {plants.length === 0 && !plantsLoading && (
            <div className="text-center mt-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No plants yet</h3>
              <p className="text-gray-600">Add your first plant to start tracking!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};