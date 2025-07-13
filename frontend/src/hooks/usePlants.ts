import { useState, useEffect } from 'react';
import { ref, push, set, onValue, off } from 'firebase/database';
import { database } from '../utils/firebase';
import { Plant } from '../types';
import { useAuthContext } from '../components/Auth/AuthProvider';

export const usePlants = (gardenId: string) => {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthContext();

  useEffect(() => {
    if (!user || !gardenId) {
      console.log('usePlants: No user or gardenId, setting loading to false');
      setPlants([]);
      setLoading(false);
      return;
    }

    console.log('usePlants: Setting up plants listener for garden:', gardenId);
    const plantsRef = ref(database, 'plants');
    
    // Set a timeout to ensure we don't hang forever
    const timeoutId = setTimeout(() => {
      console.log('usePlants: Timeout reached, setting loading to false');
      setLoading(false);
      setPlants([]);
    }, 5000);
    
    const unsubscribe = onValue(plantsRef, (snapshot) => {
      console.log('usePlants: Plants data received');
      try {
        if (snapshot.exists()) {
          console.log('usePlants: Plants exist, filtering for garden');
          const data = snapshot.val();
          const gardenPlants = Object.entries(data)
            .filter(([_, plant]: [string, any]) => plant.gardenId === gardenId)
            .map(([id, plant]: [string, any]) => ({
              id,
              ...plant
            })) as Plant[];
          
          console.log('usePlants: Garden plants found:', gardenPlants.length);
          setPlants(gardenPlants);
        } else {
          console.log('usePlants: No plants exist, setting empty array');
          setPlants([]);
        }
      } catch (error) {
        console.error('usePlants: Error processing plants data:', error);
        setPlants([]);
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
        console.log('usePlants: Loading set to false');
      }
    }, (error) => {
      console.error('usePlants: Database listener error:', error);
      clearTimeout(timeoutId);
      setLoading(false);
      setPlants([]);
    });

    return () => {
      clearTimeout(timeoutId);
      off(plantsRef, 'value', unsubscribe);
    };
  }, [user, gardenId]);

  const createPlant = async (name: string = 'New Plant') => {
    console.log('createPlant: Starting plant creation');
    if (!user || !gardenId) {
      console.error('createPlant: No user or gardenId');
      throw new Error('User not authenticated or no garden selected');
    }

    console.log('createPlant: Creating plant for garden:', gardenId);
    try {
      const plantRef = push(ref(database, 'plants'));
      const plantId = plantRef.key!;
      console.log('createPlant: Generated plant ID:', plantId);
      
      const plantData = {
        gardenId,
        name,
        entries: {},
        createdAt: new Date().toISOString(),
        createdBy: user.uid
      };

      console.log('createPlant: Setting plant data in database');
      await set(plantRef, plantData);
      console.log('createPlant: Plant data saved successfully');

      // Update garden's plants list
      console.log('createPlant: Updating garden plants list');
      const gardenPlantsRef = ref(database, `gardens/${gardenId}/plants/${plantId}`);
      await set(gardenPlantsRef, {
        createdAt: new Date().toISOString(),
        createdBy: user.uid
      });
      console.log('createPlant: Garden plants list updated');

      return plantId;
    } catch (error) {
      console.error('createPlant: Error creating plant:', error);
      throw error;
    }
  };

  return {
    plants,
    loading,
    createPlant
  };
};