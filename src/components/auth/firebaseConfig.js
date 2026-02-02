import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAr9GKGgW-05LU1HOc2MBRvAchAh5Ed6TI",
  authDomain: "capstonefrontend-1c93f.firebaseapp.com",
  projectId: "capstonefrontend-1c93f",
  storageBucket: "capstonefrontend-1c93f.firebasestorage.app",
  messagingSenderId: "207399647109",
  appId: "1:207399647109:web:445cecfcabde29a36cb6ec"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
