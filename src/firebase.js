import { initializeApp } from "firebase/app";
import {
  getAuth,
  multiFactor,
  PhoneAuthProvider,
  RecaptchaVerifier
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC2BBdSoL_dMtLelXm1kA23sAN3o88cX1M",
  authDomain: "aerho-81c4a.firebaseapp.com",
  projectId: "aerho-81c4a",
  storageBucket: "aerho-81c4a.firebasestorage.app",
  messagingSenderId: "249712727604",
  appId: "1:249712727604:web:0c88cb2668ff2b9e18dc61",
  measurementId: "G-D2WH3WJVME"
};

const app = initializeApp(firebaseConfig);
// Enable Firebase Authentication
const auth = getAuth(app);

// Optional: configure reCAPTCHA here or in your verify component
// auth.languageCode = 'en';


// Ensure RecaptchaVerifier is only initialized once
let recaptchaVerifierInstance;
function getRecaptchaVerifier(containerId = 'recaptcha-container') {
  if (!recaptchaVerifierInstance) {
    auth.appVerificationDisabledForTesting = false;
    recaptchaVerifierInstance = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: (response) => {
        console.log("reCAPTCHA solved:", response);
      },
      'expired-callback': () => {
        console.warn("reCAPTCHA expired. User must retry.");
      }
    });
    recaptchaVerifierInstance.render().then((widgetId) => {
      console.log("reCAPTCHA widget ID:", widgetId);
    });
  }
  return recaptchaVerifierInstance;
}

function clearRecaptchaVerifier() {
  if (recaptchaVerifierInstance) {
    recaptchaVerifierInstance.clear();
    recaptchaVerifierInstance = null;
  }
}

export { app, auth, multiFactor, PhoneAuthProvider, getRecaptchaVerifier, clearRecaptchaVerifier };
export const db = getFirestore(app);

// Expose auth to browser console for debugging
if (typeof window !== "undefined") {
  window.auth = auth;
}