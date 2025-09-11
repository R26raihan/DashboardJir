import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth'
import { auth } from '../config/firebase.js'

// Google Auth Provider
const googleProvider = new GoogleAuthProvider()

class AuthService {
  constructor() {
    this.user = null
    this.listeners = []
    this.initialized = false
    this._readyResolvers = []
    
    // Listen to auth state changes
    onAuthStateChanged(auth, (user) => {
      this.user = user
      this.initialized = true
      if (this._readyResolvers.length) {
        this._readyResolvers.forEach(r => r())
        this._readyResolvers = []
      }
      this.notifyListeners()
    })
  }

  // Add listener for auth state changes
  addAuthListener(callback) {
    this.listeners.push(callback)
    // Call immediately with current state
    callback(this.user)
  }

  // Remove listener
  removeAuthListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback)
  }

  // Notify all listeners
  notifyListeners() {
    this.listeners.forEach(callback => callback(this.user))
  }

  // Wait until first auth state resolved
  ready() {
    if (this.initialized) return Promise.resolve()
    return new Promise(resolve => {
      this._readyResolvers.push(resolve)
    })
  }

  // Sign in with email and password
  async signInWithEmail(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      return {
        success: true,
        user: userCredential.user
      }
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      }
    }
  }

  // Sign up with email and password
  async signUpWithEmail(email, password) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      return {
        success: true,
        user: userCredential.user
      }
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      }
    }
  }

  // Sign in with Google
  async signInWithGoogle() {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      return {
        success: true,
        user: result.user
      }
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      }
    }
  }

  // Sign out
  async signOut() {
    try {
      await signOut(auth)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      }
    }
  }

  // Get current user
  getCurrentUser() {
    return this.user
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.user
  }

  // Get user-friendly error messages
  getErrorMessage(errorCode) {
    const errorMessages = {
      'auth/user-not-found': 'Email tidak ditemukan',
      'auth/wrong-password': 'Password salah',
      'auth/email-already-in-use': 'Email sudah terdaftar',
      'auth/weak-password': 'Password terlalu lemah',
      'auth/invalid-email': 'Format email tidak valid',
      'auth/user-disabled': 'Akun dinonaktifkan',
      'auth/too-many-requests': 'Terlalu banyak percobaan, coba lagi nanti',
      'auth/network-request-failed': 'Koneksi internet bermasalah',
      'auth/popup-closed-by-user': 'Login dibatalkan',
      'auth/cancelled-popup-request': 'Login dibatalkan'
    }
    
    return errorMessages[errorCode] || 'Terjadi kesalahan, coba lagi'
  }
}

// Create singleton instance
const authService = new AuthService()

export default authService
