<template>
  <div style="padding: 0; min-height: 100vh; background: var(--logo-gray);">
    <!-- Navbar -->
    <nav class="navbar">
      <div class="navbar-left">
        <img :src="logo" alt="Logo" class="dashboard-logo" />
        <span class="navbar-title">Dashboard Analisis</span>
      </div>
      <div class="navbar-right">
        <button @click="toggleTheme" class="theme-toggle" :title="isDark ? 'Mode Terang' : 'Mode Gelap'">
          <svg v-if="isDark" width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="5" stroke="#e85c3a" stroke-width="2"/><path stroke="#e85c3a" stroke-width="2" stroke-linecap="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
          <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 1 0 9.79 9.79Z" stroke="#e85c3a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <button @click="logout" class="logout-icon" title="Logout"><svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M16 17L21 12L16 7" stroke="#e85c3a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 12H9" stroke="#e85c3a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 19C7.58172 19 4 15.4183 4 11C4 6.58172 7.58172 3 12 3" stroke="#3a4a62" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
      </div>
    </nav>

    <!-- Main Content -->
    <div>
      <div style="padding: 40px">
        <MobilityMap />
        <Analytics />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import '../styles/dashboard.css'
import logo from '../assets/images/logo.png'
import { useRouter } from 'vue-router'
import MobilityMap from '../components/MobilityMap.vue'
import Analytics from '../components/Analytics.vue'
const router = useRouter()
const isDark = ref(false)
function toggleTheme() {
  isDark.value = !isDark.value
  document.body.classList.toggle('dark', isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}
onMounted(() => {
  const saved = localStorage.getItem('theme')
  if (saved === 'dark') {
    isDark.value = true
    document.body.classList.add('dark')
  }
})
const logout = () => {
  localStorage.removeItem('token')
  router.push('/login')
}
</script>
  