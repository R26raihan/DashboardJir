import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getAnalytics } from 'firebase/analytics'

// Firebase configuration
// Ganti dengan kredensial Firebase Anda dari Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyBEPvjWL66PX2QwV6TTdufBDyRN9h7tr5w",
  authDomain: "jir-smart-city.firebaseapp.com",
  projectId: "jir-smart-city",
  storageBucket: "jir-smart-city.firebasestorage.app",
  messagingSenderId: "798096595312",
  appId: "1:798096595312:web:aed7baf30d5d5a4c1c97b5",
  measurementId: "G-JB760FN9MH"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app)

// Initialize Analytics (optional)
export const analytics = getAnalytics(app)

export default app
