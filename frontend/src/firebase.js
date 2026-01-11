import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAZ5gUvs8QIfK0d6pTZ-MNw8qTLaqdhvB0",
  authDomain: "cpms-auth.firebaseapp.com",
  projectId: "cpms-auth",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
