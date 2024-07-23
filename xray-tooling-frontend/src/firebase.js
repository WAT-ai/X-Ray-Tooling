// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDZk1Bq00SJYYnDn2U4-0cs5CGAkV6aVms",
  authDomain: "x-care-b6602.firebaseapp.com",
  databaseURL: "https://x-care-b6602-default-rtdb.firebaseio.com",
  projectId: "x-care-b6602",
  storageBucket: "x-care-b6602.appspot.com",
  messagingSenderId: "482223657503",
  appId: "1:482223657503:web:3a66b062e4f07c1fe27b2a",
  measurementId: "G-SF6BNTWELP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Create a ReCaptchaEnterpriseProvider instance using your reCAPTCHA Enterprise
// site key and pass it to initializeAppCheck().
const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaEnterpriseProvider('6LeLVBMqAAAAAPsQpU3hgkl0jLf67Ifx9d0gTNn3'),
  isTokenAutoRefreshEnabled: true // Set to true to allow auto-refresh.
});

const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const database = getDatabase(app);