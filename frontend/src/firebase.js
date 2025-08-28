// Firebase config and connection
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD-YhoXS1pQ4pitiek2KGEJBp1Saidp3xw",
  authDomain: "vendor-app-59355.firebaseapp.com",
  projectId: "vendor-app-59355",
  storageBucket: "vendor-app-59355.firebasestorage.app",
  messagingSenderId: "130936778559",
  appId: "1:130936778559:web:c95a56225a291c327bed8a",
  measurementId: "G-ZNC5TV008H"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
