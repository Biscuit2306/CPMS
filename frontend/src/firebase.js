// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";

// 🔹 Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAZ5gUvs8QIfK0d6pTZ-MNw8qTLaqdhvB0",
  authDomain: "cpms-auth.firebaseapp.com",
  projectId: "cpms-auth",
};

// 🔹 Initialize Firebase
const app = initializeApp(firebaseConfig);

// 🔹 Firebase Auth instance
export const auth = getAuth(app);

// 🔹 Google Auth Provider instance
export const googleProvider = new GoogleAuthProvider();

// 🔹 Export Firebase auth functions for login
export { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider};
