<template>
  <div class="login-container">
    <div class="login-card">
      <img :src="logo" alt="Logo" class="vue-logo" />
      <h2 class="welcome-title">Welcome</h2>
      
      <!-- Error/Success Messages -->
      <div v-if="message" :class="['message', messageType]">
        {{ message }}
      </div>
      
      <form @submit.prevent="onSubmit" class="login-form">
        <div class="input-group" :class="{ 'has-error': errors.email }">
          <span class="input-icon">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path fill="#3a4a62" d="M2 6.5A2.5 2.5 0 0 1 4.5 4h15A2.5 2.5 0 0 1 22 6.5v11A2.5 2.5 0 0 1 19.5 20h-15A2.5 2.5 0 0 1 2 17.5v-11ZM4.5 6a.5.5 0 0 0-.5.5v.13l8 5.2 8-5.2V6.5a.5.5 0 0 0-.5-.5h-15Zm15 2.87-7.5 4.88a1 1 0 0 1-1.1 0L4.5 8.87V17.5a.5.5 0 0 0 .5.5h15a.5.5 0 0 0 .5-.5V8.87Z"/></svg>
          </span>
          <input 
            type="email" 
            placeholder="Email" 
            class="login-input" 
            v-model="email" 
            :disabled="loading"
          />
        </div>
        <div v-if="errors.email" class="error-message">{{ errors.email }}</div>
        
        <div class="input-group" :class="{ 'has-error': errors.password }">
          <span class="input-icon">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path fill="#3a4a62" d="M12 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm6-7V8a6 6 0 1 0-12 0v2a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2Zm-8-2a4 4 0 1 1 8 0v2H6V8Zm10 10H6v-6h12v6Z"/></svg>
          </span>
          <input 
            type="password" 
            placeholder="Password" 
            class="login-input" 
            v-model="password" 
            :disabled="loading"
          />
        </div>
        <div v-if="errors.password" class="error-message">{{ errors.password }}</div>
        
        <button 
          class="login-button" 
          type="submit" 
          :disabled="loading"
        >
          <span v-if="loading">Loading...</span>
          <span v-else>Login</span>
        </button>
      </form>
      
      <!-- Divider -->
      <div class="divider">
        <span>atau</span>
      </div>
      
      <!-- Google Sign In -->
      <button 
        class="google-button" 
        @click="handleGoogleSignIn"
        :disabled="loading"
      >
        <svg width="20" height="20" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        <span v-if="loading">Loading...</span>
        <span v-else>Login dengan Google</span>
      </button>
      
      <!-- Sign Up Link -->
      <div class="signup-link">
        <p>Belum punya akun? 
          <a href="#" @click.prevent="toggleMode">
            {{ isSignUp ? 'Login' : 'Daftar' }}
          </a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import '../styles/login.css'
import logo from '../assets/images/logo.png'
import { useAuth } from '../composables/useAuth.js'

const router = useRouter()
const { signInWithEmail, signUpWithEmail, signInWithGoogle, loading } = useAuth()

const email = ref('')
const password = ref('')
const errors = reactive({ email: '', password: '' })
const message = ref('')
const messageType = ref('')
const isSignUp = ref(false)

// Clear messages after 5 seconds
const clearMessage = () => {
  setTimeout(() => {
    message.value = ''
    messageType.value = ''
  }, 5000)
}

// Show message
const showMessage = (text, type = 'error') => {
  message.value = text
  messageType.value = type
  clearMessage()
}

// Validate form
const validateForm = () => {
  errors.email = ''
  errors.password = ''
  
  if (!email.value) {
    errors.email = 'Email harus diisi'
    return false
  }
  
  if (!email.value.includes('@')) {
    errors.email = 'Format email tidak valid'
    return false
  }
  
  if (!password.value) {
    errors.password = 'Password harus diisi'
    return false
  }
  
  if (password.value.length < 6) {
    errors.password = 'Password minimal 6 karakter'
    return false
  }
  
  return true
}

// Handle form submission
const onSubmit = async () => {
  if (!validateForm()) return
  
  try {
    let result
    if (isSignUp.value) {
      result = await signUpWithEmail(email.value, password.value)
      if (result.success) {
        showMessage('Akun berhasil dibuat! Silakan login.', 'success')
        isSignUp.value = false
      } else {
        showMessage(result.error, 'error')
      }
    } else {
      result = await signInWithEmail(email.value, password.value)
      if (result.success) {
        showMessage('Login berhasil!', 'success')
        router.push('/')
      } else {
        showMessage(result.error, 'error')
      }
    }
  } catch (error) {
    showMessage('Terjadi kesalahan, coba lagi', 'error')
  }
}

// Handle Google sign in
const handleGoogleSignIn = async () => {
  try {
    const result = await signInWithGoogle()
    if (result.success) {
      showMessage('Login berhasil!', 'success')
      router.push('/')
    } else {
      showMessage(result.error, 'error')
    }
  } catch (error) {
    showMessage('Terjadi kesalahan, coba lagi', 'error')
  }
}

// Toggle between login and signup
const toggleMode = () => {
  isSignUp.value = !isSignUp.value
  message.value = ''
  messageType.value = ''
  errors.email = ''
  errors.password = ''
}
</script>

<style scoped>
.error-message {
  color: #e85c3a;
  font-size: 0.97rem;
  margin: 2px 0 8px 4px;
  font-weight: 500;
  letter-spacing: 0.1px;
}

.input-group.has-error {
  border-color: #e85c3a !important;
  box-shadow: 0 0 0 1.5px #e85c3a33;
}

.message {
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 0.9rem;
  font-weight: 500;
}

.message.error {
  background-color: #fee;
  color: #e85c3a;
  border: 1px solid #fcc;
}

.message.success {
  background-color: #efe;
  color: #2d7d32;
  border: 1px solid #cfc;
}

.divider {
  display: flex;
  align-items: center;
  margin: 20px 0;
  color: #666;
  font-size: 0.9rem;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background-color: #ddd;
}

.divider span {
  padding: 0 16px;
  background-color: white;
}

.google-button {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #ddd;
  border-radius: 8px;
  background-color: white;
  color: #333;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  transition: all 0.2s ease;
  margin-bottom: 16px;
}

.google-button:hover:not(:disabled) {
  border-color: #4285f4;
  background-color: #f8f9ff;
}

.google-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.signup-link {
  text-align: center;
  margin-top: 16px;
}

.signup-link p {
  color: #666;
  font-size: 0.9rem;
  margin: 0;
}

.signup-link a {
  color: #4285f4;
  text-decoration: none;
  font-weight: 500;
}

.signup-link a:hover {
  text-decoration: underline;
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
  