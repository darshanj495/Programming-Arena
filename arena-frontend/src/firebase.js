import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth"; // Added Auth imports

const firebaseConfig = {
  apiKey: "AIzaSyB5usl-MwvD0VUF2KVIEOnXfStO3hJjX0E",
  authDomain: "arena-programming-f9a38.firebaseapp.com",
  projectId: "arena-programming-f9a38",
  storageBucket: "arena-programming-f9a38.firebasestorage.app",
  messagingSenderId: "903840979926",
  appId: "1:903840979926:web:1d5e9a0981dc60be352277",
  measurementId: "G-BFCBLDHJQG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);

// Export Auth tools so your UI components can use them!
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();