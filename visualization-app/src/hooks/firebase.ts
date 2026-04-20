import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

// firebase config
const firebaseConfig = {
    apiKey: 'AIzaSy...',
    authDomain: 'visualization-88a6b.firebaseapp.com',
    databaseURL: 'https://visualization-88a6b-default-rtdb.europe-west1.firebasedatabase.app',
    projectId: 'visualization-88a6b',
    storageBucket: '...',
    messagingSenderId: '...',
    appId: '...'
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
            console.log('Вы вошли как:', result.user.email);
        })
        .catch((error) => {
            console.error('Ошибка входа:', error);
        });
};
