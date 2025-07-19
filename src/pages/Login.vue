<template>
  <div class="login-container">
    <div class="login-card">
      <img :src="logo" alt="Logo" class="vue-logo" />
      <h2 class="welcome-title">Welcome</h2>
      <form @submit.prevent="onSubmit" class="login-form">
        <div class="input-group" :class="{ 'has-error': errors.email }">
          <span class="input-icon">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path fill="#3a4a62" d="M2 6.5A2.5 2.5 0 0 1 4.5 4h15A2.5 2.5 0 0 1 22 6.5v11A2.5 2.5 0 0 1 19.5 20h-15A2.5 2.5 0 0 1 2 17.5v-11ZM4.5 6a.5.5 0 0 0-.5.5v.13l8 5.2 8-5.2V6.5a.5.5 0 0 0-.5-.5h-15Zm15 2.87-7.5 4.88a1 1 0 0 1-1.1 0L4.5 8.87V17.5a.5.5 0 0 0 .5.5h15a.5.5 0 0 0 .5-.5V8.87Z"/></svg>
          </span>
          <input type="text" placeholder="Email" class="login-input" v-model="email" />
        </div>
        <div v-if="errors.email" class="error-message">{{ errors.email }}</div>
        <div class="input-group" :class="{ 'has-error': errors.password }">
          <span class="input-icon">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path fill="#3a4a62" d="M12 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm6-7V8a6 6 0 1 0-12 0v2a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2Zm-8-2a4 4 0 1 1 8 0v2H6V8Zm10 10H6v-6h12v6Z"/></svg>
          </span>
          <input type="password" placeholder="Password" class="login-input" v-model="password" />
        </div>
        <div v-if="errors.password" class="error-message">{{ errors.password }}</div>
        <button class="login-button" type="submit">Login</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import '../styles/login.css'
import logo from '../assets/images/logo.png'
import { validateLogin } from '../controller/logincontroller.js'

const router = useRouter()
const email = ref('')
const password = ref('')
const errors = reactive({ email: '', password: '' })

function onSubmit() {
  const result = validateLogin(email.value, password.value)
  errors.email = result.email || ''
  errors.password = result.password || ''
  if (!errors.email && !errors.password) {
    router.push('/')
  }
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
</style>
  