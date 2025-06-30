import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDmBPngma7YbuHlHSdisWa4QGsspg1n_AA",
  authDomain: "yarn-buddy.firebaseapp.com",
  projectId: "yarn-buddy",
  storageBucket: "yarn-buddy.firebasestorage.app",
  messagingSenderId: "453422350644",
  appId: "1:453422350644:web:9961de2be49c2353386561",
  measurementId: "G-W899EZTKEP"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
