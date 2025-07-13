import { useState, useEffect } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { ref, set, get } from 'firebase/database';
import { auth, database } from '../utils/firebase';
import { User } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      try {
        if (firebaseUser) {
          console.log('Firebase user authenticated:', firebaseUser.uid);
          
          // Get or create user data in database
          const userRef = ref(database, `users/${firebaseUser.uid}`);
          console.log('Fetching user data from database...');
          
          const snapshot = await get(userRef);
          
          let userData: User;
          if (snapshot.exists()) {
            console.log('User data found in database');
            userData = snapshot.val();
          } else {
            console.log('Creating new user record in database');
            // Create new user record
            userData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              gardens: [],
              createdAt: new Date().toISOString()
            };
            await set(userRef, userData);
            console.log('User record created successfully');
          }
          
          setUser(userData);
          console.log('User state updated:', userData);
        } else {
          console.log('No authenticated user');
          setUser(null);
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        setUser(null);
      } finally {
        setLoading(false);
        console.log('Loading state set to false');
      }
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  const logout = async () => {
    return signOut(auth);
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout
  };
};