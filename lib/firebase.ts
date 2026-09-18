import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "causal-thought-nghtt",
  appId: "1:354985343108:web:bd4a78a24d9eb9b6202ad1",
  apiKey: "AIzaSyCzfOWJSs7cp122XwPApD3enOtm2Bq61B8",
  authDomain: "causal-thought-nghtt.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-sipenduksistemin-c0045334-3381-44e4-8f36-f5f977bfb4e4",
  storageBucket: "causal-thought-nghtt.firebasestorage.app",
  messagingSenderId: "354985343108"
};

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore with specific database ID
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

