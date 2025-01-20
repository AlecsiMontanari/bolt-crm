import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD2qEF1pQTNXUVeKiFbiRheAP3m3q2annM",
  authDomain: "simple-crm-10eba.firebaseapp.com",
  projectId: "simple-crm-10eba",
  storageBucket: "simple-crm-10eba.firebasestorage.app",
  messagingSenderId: "314278145200",
  appId: "1:314278145200:web:9a7ea09122a5c72a181f75"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);