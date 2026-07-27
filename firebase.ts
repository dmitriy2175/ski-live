// src/firebase.ts
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue } from 'firebase/database';

const firebaseConfig = {
    databaseURL: "https://ski-live-results-default-rtdb.europe-west1.firebasedatabase.app/"
};

// Инициализируем приложение Firebase
const app = initializeApp(firebaseConfig);

// Получаем ссылку на Realtime Database
export const db = getDatabase(app);
export { ref, onValue };