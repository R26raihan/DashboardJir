// Mock Authentication Service for Demo Mode
class MockAuthService {
  constructor() {
    this.user = null
    this.listeners = []
    this.isDemoMode = true
    
    // Simulate user session
    this.simulateAuthState()
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

  // Simulate auth state
  simulateAuthState() {
    // Check if user is already logged in (from localStorage)
    const savedUser = localStorage.getItem('demo_user')
    if (savedUser) {
      this.user = JSON.parse(savedUser)
    }
  }

  // Sign in with email and password (mock)
  async signInWithEmail(email, password) {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock validation
      if (email === 'admin@demo.com' && password === 'demo123') {
        this.user = {
          uid: 'demo-user-123',
          email: email,
          displayName: 'Demo User',
          photoURL: null
        }
        
        // Save to localStorage
        localStorage.setItem('demo_user', JSON.stringify(this.user))
        this.notifyListeners()
        
        return {
          success: true,
          user: this.user
        }
      } else {
        return {
          success: false,
          error: 'Email atau password salah. Gunakan admin@demo.com / demo123'
        }
      }
    } catch (error) {
      return {
        success: false,
        error: 'Terjadi kesalahan, coba lagi'
      }
    }
  }

  // Sign up with email and password (mock)
  async signUpWithEmail(email, password) {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock validation
      if (email && password && password.length >= 6) {
        this.user = {
          uid: 'demo-user-' + Date.now(),
          email: email,
          displayName: email.split('@')[0],
          photoURL: null
        }
        
        // Save to localStorage
        localStorage.setItem('demo_user', JSON.stringify(this.user))
        this.notifyListeners()
        
        return {
          success: true,
          user: this.user
        }
      } else {
        return {
          success: false,
          error: 'Email dan password harus diisi. Password minimal 6 karakter'
        }
      }
    } catch (error) {
      return {
        success: false,
        error: 'Terjadi kesalahan, coba lagi'
      }
    }
  }

  // Sign in with Google (mock)
  async signInWithGoogle() {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      this.user = {
        uid: 'google-demo-user-123',
        email: 'demo@gmail.com',
        displayName: 'Google Demo User',
        photoURL: 'https://via.placeholder.com/150'
      }
      
      // Save to localStorage
      localStorage.setItem('demo_user', JSON.stringify(this.user))
      this.notifyListeners()
      
      return {
        success: true,
        user: this.user
      }
    } catch (error) {
      return {
        success: false,
        error: 'Terjadi kesalahan, coba lagi'
      }
    }
  }

  // Sign out
  async signOut() {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      this.user = null
      localStorage.removeItem('demo_user')
      this.notifyListeners()
      
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: 'Terjadi kesalahan, coba lagi'
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
const mockAuthService = new MockAuthService()

export default mockAuthService
