import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyADXyTXrVCp-bOrSyw_GBjnnxU8DnLKSgM",
    authDomain: "portal-anime-v2.firebaseapp.com",
    projectId: "portal-anime-v2",
    storageBucket: "portal-anime-v2.firebasestorage.app",
    messagingSenderId: "140656859074",
    appId: "1:140656859074:web:8a1dd0431f4b4647c3285b",
    measurementId: "G-M1VZV0GBF2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

export default app;
