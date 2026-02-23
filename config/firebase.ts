import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyArWtI1B1rxd_wAFOIJbQ6D43CDSGukrJM",
  authDomain: "rcoltecheck.firebaseapp.com",
  projectId: "rcoltecheck",
  storageBucket: "rcoltecheck.firebasestorage.app",
  messagingSenderId: "726196543822",
  appId: "1:726196543822:web:166c68aedb3952c5b1fe1f",
  measurementId: "G-1EBX7EBRDY"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

function getFirebaseAuth(): Auth {
  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    return getAuth(app);
  }
}

const auth = getFirebaseAuth();
const db = getFirestore(app);

export { auth, db };
