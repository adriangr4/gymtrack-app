import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyB3HDtWF1qBCfMbyp1-F9cOpUjLm8zlvV8",
    authDomain: "gym-track-73a1b.firebaseapp.com",
    projectId: "gym-track-73a1b",
    storageBucket: "gym-track-73a1b.firebasestorage.app",
    messagingSenderId: "1028934084059",
    appId: "1:1028934084059:web:21462fda8b605e7bcd33fe",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);
