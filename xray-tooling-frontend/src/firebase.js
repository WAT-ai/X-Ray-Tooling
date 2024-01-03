// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage"
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAzhMB6FedaG2lyE2NswfqJEW_1QIbolRU",
  authDomain: "xray-tooling.firebaseapp.com",
  projectId: "xray-tooling",
  storageBucket: "xray-tooling.appspot.com",
  messagingSenderId: "1011759391447",
  appId: "1:1011759391447:web:82c4f3ca89f92a2f3a4692",
  measurementId: "G-02K2S331YM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const storage = getStorage(app);