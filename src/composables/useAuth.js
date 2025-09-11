import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import authService from '../services/authService.js'

export function useAuth() {
  const user = ref(null)
  const loading = ref(true)
  const router = useRouter()

  // Auth state listener
  const authListener = (currentUser) => {
    user.value = currentUser
    loading.value = false
  }

  onMounted(() => {
    authService.addAuthListener(authListener)
  })

  onUnmounted(() => {
    authService.removeAuthListener(authListener)
  })

  // Sign in with email
  const signInWithEmail = async (email, password) => {
    loading.value = true
    const result = await authService.signInWithEmail(email, password)
    loading.value = false
    return result
  }

  // Sign up with email
  const signUpWithEmail = async (email, password) => {
    loading.value = true
    const result = await authService.signUpWithEmail(email, password)
    loading.value = false
    return result
  }

  // Sign in with Google
  const signInWithGoogle = async () => {
    loading.value = true
    const result = await authService.signInWithGoogle()
    loading.value = false
    return result
  }

  // Sign out
  const signOut = async () => {
    loading.value = true
    const result = await authService.signOut()
    if (result.success) {
      router.push('/login')
    }
    loading.value = false
    return result
  }

  // Check if authenticated
  const isAuthenticated = () => {
    return authService.isAuthenticated()
  }

  // Get user display name
  const getUserDisplayName = () => {
    if (!user.value) return 'Guest'
    return user.value.displayName || user.value.email || 'User'
  }

  // Get user email
  const getUserEmail = () => {
    return user.value?.email || ''
  }

  // Get user photo URL
  const getUserPhotoURL = () => {
    return user.value?.photoURL || null
  }

  return {
    user,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut,
    isAuthenticated,
    getUserDisplayName,
    getUserEmail,
    getUserPhotoURL
  }
}
