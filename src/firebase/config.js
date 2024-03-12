import { getFirestore } from 'firebase/firestore';
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyDBCVWMFWj6Z7m54wzneKP4_43TDDO4Yi0",
  authDomain: "expensetracker-66bf7.firebaseapp.com",
  projectId: "expensetracker-66bf7",
  storageBucket: "expensetracker-66bf7.appspot.com",
  messagingSenderId: "1067776456445",
  appId: "1:1067776456445:web:793975ddc551e3feb6b094"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore();
export default db;