import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getMessaging } from "firebase/messaging";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAVCYa-pRrnYVI8-7BH878gp9AKRXa03cI",
  authDomain: "acadence-6e24d.firebaseapp.com",
  projectId: "acadence-6e24d",
  storageBucket: "acadence-6e24d.firebasestorage.app",
  messagingSenderId: "121798846020",
  appId: "1:121798846020:web:ee5b34dab2c132cec3fe11"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const messaging = getMessaging(app);
export const storage = getStorage(app);