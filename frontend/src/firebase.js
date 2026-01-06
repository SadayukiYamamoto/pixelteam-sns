// src/firebase.js
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  setDoc,       // ✅ ← 追加
  deleteDoc,     // ✅ ← 追加
  updateDoc, // ← ✅ ここを追加！
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAv2HflOcrCpoA_yS_9ZMCzAqHxEHMinGM",
  authDomain: "pixelshopsns.firebaseapp.com",
  projectId: "pixelshopsns",
  storageBucket: "pixelshopsns.firebasestorage.app",
  messagingSenderId: "237007524936",
  appId: "1:237007524936:web:8c283e3e2cab3678b9b47d",
  measurementId: "G-TR0H4M4V2V"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// まとめてエクスポート
export {
  db,
  auth,
  storage,
  onAuthStateChanged,
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  setDoc,       // ✅ ← 追加
  deleteDoc,     // ✅ ← 追加
  updateDoc, // ← ✅ ここも追加！
  app,
  GoogleAuthProvider,
  signInWithPopup
};
