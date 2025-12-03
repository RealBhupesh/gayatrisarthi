// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyCElbSE5iyyYzrNmQnXgv68_Txbcl-VQu8",
//   authDomain: "chhatra-1526c.firebaseapp.com",
//   projectId: "chhatra-1526c",
//   storageBucket: "chhatra-1526c.firebasestorage.app",
//   messagingSenderId: "463076992235",
//   appId: "1:463076992235:web:e4abe6de8c3680cd3e8aae",
//   measurementId: "G-CGHYMC78MQ",
// };

const firebaseConfig = {
  apiKey: "AIzaSyAcApGjSH9jP1zab8WUWg87-S93yXoFtiY",
  authDomain: "vidhyasarthi-3b22a.firebaseapp.com",
  projectId: "vidhyasarthi-3b22a",
  storageBucket: "vidhyasarthi-3b22a.firebasestorage.app",
  messagingSenderId: "33008260296",
  appId: "1:33008260296:web:498da22883be5f3c1a01fd",
  measurementId: "G-KF8HHQ8V82",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
