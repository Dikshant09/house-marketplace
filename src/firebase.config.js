import { getFirestore } from 'firebase/firestore';
import { initializeApp } from "firebase/app";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCTQO-D4Uw0WqLO9mkiixo6_pEYN4OCxF0",
  authDomain: "house-marketplace-app-e23f1.firebaseapp.com",
  projectId: "house-marketplace-app-e23f1",
  storageBucket: "house-marketplace-app-e23f1.appspot.com",
  messagingSenderId: "23530809346",
  appId: "1:23530809346:web:f4a4d93ae863c40f2f5f1b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore();