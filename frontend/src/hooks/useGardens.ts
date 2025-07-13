import { useState, useEffect } from 'react';
import { ref, push, set, get, onValue, off } from 'firebase/database';
import { database } from '../utils/firebase';
import { Garden } from '../types';
import { useAuthContext } from '../components/Auth/AuthProvider';

export const useGardens = () => {
  const [gardens, setGardens] = useState<Garden[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthContext();

  useEffect(() => {
    if (!user) {
      console.log('useGardens: No user, setting loading to false');
      setGardens([]);
      setLoading(false);
      return;
    }

    console.log('useGardens: User found, setting up gardens listener for:', user.uid);
    const gardensRef = ref(database, 'gardens');
    console.log('useGardens: Database reference created:', gardensRef);
    
    // Set a timeout to ensure we don't hang forever
    const timeoutId = setTimeout(() => {
      console.log('useGardens: Timeout reached, setting loading to false');
      setLoading(false);
      setGardens([]);
    }, 5000);
    
    const unsubscribe = onValue(gardensRef, (snapshot) => {
      console.log('useGardens: Gardens data received');
      try {
        if (snapshot.exists()) {
          console.log('useGardens: Gardens exist, filtering for user');
          const data = snapshot.val();
          const userGardens = Object.entries(data)
            .filter(([_, garden]: [string, any]) => 
              garden.users && garden.users[user.uid]
            )
            .map(([id, garden]: [string, any]) => ({
              id,
              ...garden
            })) as Garden[];
          
          console.log('useGardens: User gardens found:', userGardens.length);
          setGardens(userGardens);
        } else {
          console.log('useGardens: No gardens exist, setting empty array');
          setGardens([]);
        }
      } catch (error) {
        console.error('useGardens: Error processing gardens data:', error);
        setGardens([]);
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
        console.log('useGardens: Loading set to false');
      }
    }, (error) => {
      console.error('useGardens: Database listener error:', error);
      clearTimeout(timeoutId);
      setLoading(false);
      setGardens([]);
    });

    return () => {
      clearTimeout(timeoutId);
      off(gardensRef, 'value', unsubscribe);
    };
  }, [user]);

  const createGarden = async (name: string = 'New Garden') => {
    console.log('createGarden: Starting garden creation');
    if (!user) {
      console.error('createGarden: No user authenticated');
      throw new Error('User not authenticated');
    }

    console.log('createGarden: Creating garden for user:', user.uid);
    try {
      const gardenRef = push(ref(database, 'gardens'));
      const gardenId = gardenRef.key!;
      console.log('createGarden: Generated garden ID:', gardenId);
      
      const gardenData = {
        name,
        users: {
          [user.uid]: {
            role: 'owner'
          }
        },
        plants: {},
        createdAt: new Date().toISOString()
      };

      console.log('createGarden: Setting garden data in database');
      await set(gardenRef, gardenData);
      console.log('createGarden: Garden data saved successfully');

      // Update user's gardens list
      console.log('createGarden: Updating user gardens list');
      const userRef = ref(database, `users/${user.uid}/gardens`);
      const userGardensSnapshot = await get(userRef);
      const currentGardens = userGardensSnapshot.exists() ? userGardensSnapshot.val() : [];
      console.log('createGarden: Current user gardens:', currentGardens);
      await set(userRef, [...currentGardens, gardenId]);
      console.log('createGarden: User gardens list updated');

      return gardenId;
    } catch (error) {
      console.error('createGarden: Error creating garden:', error);
      throw error;
    }
  };

  return {
    gardens,
    loading,
    createGarden
  };
};