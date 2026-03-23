// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBdegVyEpSmpSpRffC9xwrzWp6wifI-w74",
  authDomain: "resume-analyzer-52bff.firebaseapp.com",
  projectId: "resume-analyzer-52bff",
  storageBucket: "resume-analyzer-52bff.firebasestorage.app",
  messagingSenderId: "902158575395",
  appId: "1:902158575395:web:5e6700b9514b8f88b70e96",
  measurementId: "G-TK887PSEDR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
const auth = getAuth(app);
const db = getFirestore(app);

export { app, analytics, auth, db };
