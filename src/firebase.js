import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAZ9tT1ZtXpDbAWBsKc3rknS8RbzFLPKNM",
  authDomain: "aerho-67867.firebaseapp.com",
  projectId: "aerho-67867",
  storageBucket: "aerho-67867.firebasestorage.app",
  messagingSenderId: "460197104992",
  appId: "1:460197104992:web:0c3c14b11d626f84c1e205"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);