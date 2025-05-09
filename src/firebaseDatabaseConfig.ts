import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import {
  getAuth,
  EmailAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA2Rs1RBJSAnrYLJSDM70-eK7zOx5KUEuY",
  authDomain: "birbsquiz.firebaseapp.com",
  databaseURL: "https://birbsquiz-default-rtdb.firebaseio.com",
  projectId: "birbsquiz",
  storageBucket: "birbsquiz.firebasestorage.app",
  messagingSenderId: "514275458192",
  appId: "1:514275458192:web:f83bdf9785ce2509f52c15",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();

const signInWithGoogle = () => {
  signInWithPopup(auth, googleProvider)
    .then((result) => {
      // This gives you a Google Access Token.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      // The signed-in user info.
      const user = result.user;
      // Add any additional user handling here.
    })
    .catch((error) => {
      // Handle Errors here.
      console.error("Error during sign in with Google:", error);
    });
};

export { database, auth, EmailAuthProvider, googleProvider, signInWithGoogle };
