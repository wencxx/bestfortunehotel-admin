import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

// First Firebase configuration
const firebaseConfig1 = {
  apiKey: "AIzaSyBH7rMz_5TCit-tNlaQxv3hZ5kFdPEuvQg",
  authDomain: "bestfortunehotel-35008.firebaseapp.com",
  projectId: "bestfortunehotel-35008",
  storageBucket: "bestfortunehotel-35008.firebasestorage.app",
  messagingSenderId: "36197691105",
  appId: "1:36197691105:web:4b167e39341f9e19b151a0",
  measurementId: "G-8ML826VHFM"
};

// Second Firebase configuration
const firebaseConfig2 = {
  apiKey: "AIzaSyCq_dxQcntCFbbL61So_q5hKIJm9uaDDIc",
  authDomain: "dsbmapping-eb417.firebaseapp.com",
  projectId: "dsbmapping-eb417",
  storageBucket: "dsbmapping-eb417.appspot.com",
  messagingSenderId: "859114295994",
  appId: "1:859114295994:web:8b74f7bb6bf7eae369e883",
  measurementId: "G-77YP7MHEBP"
};

// Initialize Firebase apps with unique names
const app1 = initializeApp(firebaseConfig1, 'app1');
const app2 = initializeApp(firebaseConfig2, 'app2');

// Get Firestore, Auth, and Storage for the respective apps
const db = getFirestore(app1);
const auth = getAuth(app1);
const storage = getStorage(app2);

export {
  app1,
  app2,
  db,
  auth,
  storage
};
