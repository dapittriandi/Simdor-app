// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, getDoc, connectFirestoreEmulator  } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC2feWLoe_UBEESfYsL15aj1fetL4R4xUw",
  authDomain: "simdor-app.firebaseapp.com",
  projectId: "simdor-app",
  storageBucket: "simdor-app.firebasestorage.app",
  messagingSenderId: "271892250527",
  appId: "1:271892250527:web:670e4ad4996a83e52387aa",
  measurementId: "G-QM1NRWE26Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Mendapatkan instance auth dan firestore
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Gunakan Firestore Emulator
if (window.location.hostname === "localhost") {
  // eslint-disable-next-line no-undef
  // connectFirestoreEmulator(db, "127.0.0.1", 8080);
  // connectStorageEmulator(storage, "127.0.0.1", 9199);
}

export { auth, db, signInWithEmailAndPassword, doc, getDoc, storage  };
