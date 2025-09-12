// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAyERiX36NxDmLejRVdkpqmsnA_sYhzLDg",
  authDomain: "primehub-1c5f6.firebaseapp.com",
  projectId: "primehub-1c5f6",
  storageBucket: "primehub-1c5f6.firebasestorage.app",
  messagingSenderId: "905509257688",
  appId: "1:905509257688:web:453e184bd85d885645b2ad",
  measurementId: "G-L2BG9EJNPL"
};

// Firebase app’i başlat
const app = initializeApp(firebaseConfig);

// Auth, Firestore ve Storage export et
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
