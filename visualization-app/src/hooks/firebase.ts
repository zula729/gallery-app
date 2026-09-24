import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

// firebase config
const firebaseConfig = {
    apiKey: 'AIzaSyB5tf1Bf8cXHOc9fa0gDLNlxfl2NfUZajY',
    authDomain: 'visualization-88a6b.firebaseapp.com',
    databaseURL: 'https://visualization-88a6b-default-rtdb.europe-west1.firebasedatabase.app',
    projectId: 'visualization-88a6b',
    storageBucket: 'visualization-88a6b.firebasestorage.app',
    messagingSenderId: '115907667124',
    appId: '1:115907667124:web:ec75cfbed70a5b406c23e1'
};

// app initialization
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

// log in to database

export const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export const loginAsAdmin = () => {
    signInWithPopup(auth, provider)
        .then((result) => {
            console.log('Login as:', result.user.email);
        })
        .catch((error) => {
            console.error('Login error:', error);
        });
};
