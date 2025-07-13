import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ref, push, set, onValue, off, update } from 'firebase/database';
import { database } from '../../utils/firebase';
import { Plant, Entry } from '../../types';
import { EntryList } from '../Entries/EntryList';
import { useAuthContext } from '../Auth/AuthProvider';

export const PlantDetail: React.FC = () => {
  const { gardenId, plantId } = useParams<{ gardenId: string; plantId: string }>();
  const { user } = useAuthContext();
  const navigate = useNavigate();
  
  const [plant, setPlant] = useState<Plant | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    plantType: '',
    nickname: '',
    description: '',
    dateAcquired: '',
    ageWhenAcquired: ''
  });

  useEffect(() => {
    if (!plantId) return;

    const plantRef = ref(database, `plants/${plantId}`);
    
    const unsubscribe = onValue(plantRef, (snapshot) => {
      if (snapshot.exists()) {
        const plantData = snapshot.val();
        const plantWithId = { id: plantId, ...plantData };
        setPlant(plantWithId);
        
        // Update edit form with current plant data
        setEditForm({
          plantType: plantData.plantType || '',
          nickname: plantData.nickname || '',
          description: plantData.description || '',
          dateAcquired: plantData.dateAcquired || '',
          ageWhenAcquired: plantData.ageWhenAcquired || ''
        });
        
        if (plantData.entries) {
          const entriesList = Object.entries(plantData.entries)
            .map(([id, entry]: [string, any]) => ({
              id,
              ...entry
            })) as Entry[];
          
          setEntries(entriesList);
        } else {
          setEntries([]);
        }
      }
      setLoading(false);
    });

    return () => off(plantRef, 'value', unsubscribe);
  }, [plantId]);

  const handleCreateEntry = async () => {
    if (!user || !plantId) return;

    try {
      const entryRef = push(ref(database, `plants/${plantId}/entries`));
      const entryId = entryRef.key!;
      
      const now = new Date().toISOString();
      const entryData = {
        createdAt: now,
        entryDate: now.split('T')[0], // Default to today's date in YYYY-MM-DD format
        name: '',
        summary: '',
        humanSummary: '',
        messages: {}
      };

      await set(entryRef, entryData);
      navigate(`/garden/${gardenId}/plant/${plantId}/entry/${entryId}`);
    } catch (error) {
      console.error('Error creating entry:', error);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!plantId) return;

    try {
      const plantRef = ref(database, `plants/${plantId}`);
      await update(plantRef, {
        plantType: editForm.plantType,
        nickname: editForm.nickname,
        description: editForm.description,
        dateAcquired: editForm.dateAcquired,
        ageWhenAcquired: editForm.ageWhenAcquired
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating plant:', error);
    }
  };

  const handleCancelEdit = () => {
    // Reset form to current plant data
    if (plant) {
      setEditForm({
        plantType: plant.plantType || '',
        nickname: plant.nickname || '',
        description: plant.description || '',
        dateAcquired: plant.dateAcquired || '',
        ageWhenAcquired: plant.ageWhenAcquired || ''
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

  if (!plant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">Plant not found</div>
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
                onClick={() => navigate(`/garden/${gardenId}`)}
                className="text-gray-600 hover:text-gray-900"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-3xl font-bold text-gray-900">
                Plant {plant.id.slice(-6)}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Plant Overview</h2>
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
                  Plant Type
                </label>
                <input
                  type="text"
                  value={editForm.plantType}
                  onChange={(e) => handleInputChange('plantType', e.target.value)}
                  placeholder="e.g., Tomato, Rose, Basil"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nickname
                </label>
                <input
                  type="text"
                  value={editForm.nickname}
                  onChange={(e) => handleInputChange('nickname', e.target.value)}
                  placeholder="Give your plant a name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date Acquired
                  </label>
                  <input
                    type="date"
                    value={editForm.dateAcquired}
                    onChange={(e) => handleInputChange('dateAcquired', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age When Acquired
                  </label>
                  <input
                    type="text"
                    value={editForm.ageWhenAcquired}
                    onChange={(e) => handleInputChange('ageWhenAcquired', e.target.value)}
                    placeholder="e.g., 6 months, 2 weeks, seedling"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Notes about your plant, care instructions, or observations"
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
              {plant.nickname && (
                <div>
                  <span className="font-medium text-gray-700">Nickname:</span>
                  <span className="ml-2 text-gray-900">{plant.nickname}</span>
                </div>
              )}
              
              {plant.plantType && (
                <div>
                  <span className="font-medium text-gray-700">Plant Type:</span>
                  <span className="ml-2 text-gray-900">{plant.plantType}</span>
                </div>
              )}
              
              {(plant.dateAcquired || plant.ageWhenAcquired) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {plant.dateAcquired && (
                    <div>
                      <span className="font-medium text-gray-700">Date Acquired:</span>
                      <span className="ml-2 text-gray-900">
                        {new Date(plant.dateAcquired).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  
                  {plant.ageWhenAcquired && (
                    <div>
                      <span className="font-medium text-gray-700">Age When Acquired:</span>
                      <span className="ml-2 text-gray-900">{plant.ageWhenAcquired}</span>
                    </div>
                  )}
                </div>
              )}
              
              {plant.description && (
                <div>
                  <span className="font-medium text-gray-700">Description:</span>
                  <p className="mt-1 text-gray-900">{plant.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 pt-4 border-t border-gray-100">
                <div>
                  <span className="font-medium">Created:</span> {new Date(plant.createdAt || '').toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Total Entries:</span> {entries.length}
                </div>
              </div>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Conversation Entries</h2>
          <EntryList entries={entries} onCreateEntry={handleCreateEntry} />
        </div>

        {entries.length === 0 && (
          <div className="text-center mt-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No entries yet</h3>
            <p className="text-gray-600">Start your first conversation about this plant!</p>
          </div>
        )}
      </div>
    </div>
  );
};