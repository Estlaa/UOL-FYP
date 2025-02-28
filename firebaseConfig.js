// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, browserSessionPersistence,getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB5V1L40PGL8miuMZRdrjfc_lMCOaSNegM",
  authDomain: "taskmanager-3531b.firebaseapp.com",
  projectId: "taskmanager-3531b",
  storageBucket: "taskmanager-3531b.firebasestorage.app",
  messagingSenderId: "629276945499",
  appId: "1:629276945499:web:6b2a7c59037f0b5527637e"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const auth = initializeAuth(app, {
  persistence: browserSessionPersistence,
});

// Initialize Cloud Firestore and get a reference to the service





export {app,auth,db};