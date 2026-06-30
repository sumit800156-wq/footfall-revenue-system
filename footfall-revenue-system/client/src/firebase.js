import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBp2MRJP6FcqddqVPGeJq1wg8g0g7o1WMw",
  authDomain: "daily-footfall-revenue-system.firebaseapp.com",
  projectId: "daily-footfall-revenue-system",
  storageBucket: "daily-footfall-revenue-system.firebasestorage.app",
  messagingSenderId: "45380275720",
  appId: "1:45380275720:web:1712d4625e385878cc0bbd"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export default app;