// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyAfdVFYmgrSA6SAz7bzGeAZuldbKBe4qTI",
    authDomain: "abhiraj-website-2af57.firebaseapp.com",
    projectId: "abhiraj-website-2af57",
    storageBucket: "abhiraj-website-2af57.firebasestorage.app",
    messagingSenderId: "330214884410",
    appId: "1:330214884410:web:f6d6a5cb25b5bb7f316103"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };