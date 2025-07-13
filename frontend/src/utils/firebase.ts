import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getDatabase, connectDatabaseEmulator } from 'firebase/database';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Check if we should use emulators
const useEmulator = process.env.NODE_ENV === 'development' && process.env.REACT_APP_USE_EMULATOR === 'true';

const firebaseConfig = useEmulator ? {
  apiKey: "demo-api-key",
  authDomain: "demo-project.firebaseapp.com",
  databaseURL: "http://127.0.0.1:9300?ns=demo-project",
  projectId: "demo-project",
  storageBucket: "demo-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "demo-app-id"
} : {
  apiKey: "AIzaSyAB-V5kAe1c01ZjnvnGaH7clv_eOJ2_UoE",
  authDomain: "gardenstate-test.firebaseapp.com",
  projectId: "gardenstate-test",
  storageBucket: "gardenstate-test.firebasestorage.app",
  messagingSenderId: "1002230727803",
  appId: "1:1002230727803:web:969a16b96190c26f63cede",
  measurementId: "G-F7YSDFWLHE"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const database = getDatabase(app);
export const storage = getStorage(app);

// Connect to emulators if in development mode
if (useEmulator) {
  try {
    connectAuthEmulator(auth, 'http://127.0.0.1:9299', { disableWarnings: true });
    connectDatabaseEmulator(database, '127.0.0.1', 9300);
    connectStorageEmulator(storage, '127.0.0.1', 9400);
  } catch (error) {
    console.log('Emulators already connected or connection failed:', error);
  }
}

export default app;