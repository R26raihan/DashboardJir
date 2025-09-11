<template>
  <div style="padding: 0; min-height: 100vh; background: var(--logo-gray);">
    <!-- Navbar -->
    <nav class="navbar">
      <div class="navbar-left">
        <img :src="logo" alt="Logo" class="dashboard-logo" />
        <span class="navbar-title">Dashboard Analisis</span>
      </div>
      <div class="navbar-right">
        <!-- User Info -->
        <div class="user-info" v-if="user">
          <img 
            v-if="getUserPhotoURL()" 
            :src="getUserPhotoURL()" 
            :alt="getUserDisplayName()"
            class="user-avatar"
          />
          <div v-else class="user-avatar-placeholder">
            {{ getUserDisplayName().charAt(0).toUpperCase() }}
          </div>
          <span class="user-name">{{ getUserDisplayName() }}</span>
        </div>
        
        <button @click="toggleTheme" class="theme-toggle" :title="isDark ? 'Mode Terang' : 'Mode Gelap'">
          <svg v-if="isDark" width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="5" stroke="#e85c3a" stroke-width="2"/><path stroke="#e85c3a" stroke-width="2" stroke-linecap="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
          <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 1 0 9.79 9.79Z" stroke="#e85c3a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        
        <button @click="logout" class="logout-icon" title="Logout" :disabled="loading">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M16 17L21 12L16 7" stroke="#e85c3a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 12H9" stroke="#e85c3a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 19C7.58172 19 4 15.4183 4 11C4 6.58172 7.58172 3 12 3" stroke="#3a4a62" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>
    </nav>

    <!-- Main Content -->
    <div>
      <div style="padding: 40px">
        <MobilityMap />
        <div class="banjir-section gradient-bg">
          <div class="section-head">
            <div>
              <h2>Data Pintu Air</h2>
              <div class="section-sub">XML dikonversi ke JSON • Total {{ pintuAir.length }} lokasi</div>
            </div>
            <div class="head-actions">
              <button class="btn-outline" @click="refreshPintuAir" :disabled="banjirLoading">Refresh</button>
            </div>
          </div>

          <div v-if="banjirLoading" class="cards-grid">
            <div v-for="i in 6" :key="'skl-'+i" class="card skeleton"></div>
          </div>
          <div v-else-if="banjirError" class="mobility-error">{{ banjirError }}</div>
          <div v-else class="cards-grid">
            <div v-for="(p, idx) in pintuAirDisplay" :key="idx" class="card">
              <div class="card-head">
                <div class="title">{{ p.nama_pintu_air }}</div>
                <span class="badge" :class="statusClass(p.status_siaga)">{{ cleanStatus(p.status_siaga) }}</span>
              </div>
              <div class="card-meta">{{ p.lokasi }} • {{ formatDateTime(p.tanggal) }}</div>
              <div class="kv">
                <div class="row"><span>Latitude</span><b>{{ p.latitude }}</b></div>
                <div class="row"><span>Longitude</span><b>{{ p.longitude }}</b></div>
                <div class="row"><span>Tinggi Air</span><b>{{ p.tinggi_air }}</b></div>
              </div>
            </div>
          </div>
        </div>

        <div class="banjir-section">
          <div class="section-head">
            <div>
              <h2>RT Terdampak</h2>
              <div class="section-sub">Data ringkas • Total {{ rtTerdampak.length }} RT</div>
            </div>
            <div class="head-actions">
              <button class="btn-outline" @click="refreshRt" :disabled="rtLoading">Refresh</button>
            </div>
          </div>

          <div v-if="rtLoading" class="cards-grid">
            <div v-for="i in 6" :key="'skl2-'+i" class="card skeleton"></div>
          </div>
          <div v-else-if="rtError" class="mobility-error">{{ rtError }}</div>
          <div v-else class="cards-grid sm">
            <div v-for="(r, idx) in rtDisplay" :key="idx" class="card compact">
              <div class="card-head">
                <div class="title">RT {{ r.rt }} / RW {{ r.rw }}</div>
                <span class="badge" :class="rtStatusClass(r.status_banjir)">{{ r.status_banjir }}</span>
              </div>
              <div class="card-meta">{{ r.kelurahan }} • {{ formatDateTime(r.timestamp) }}</div>
              <div class="kv">
                <div class="row"><span>Genangan</span><b>{{ r.tinggi_genangan }} cm</b></div>
              </div>
            </div>
          </div>
        </div>

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
import { fetchPintuAirXml, fetchRtTerdampak } from '../controller/dashboardcontroller.js'
import { useAuth } from '../composables/useAuth.js'

const router = useRouter()
const { user, loading, signOut, getUserDisplayName, getUserPhotoURL } = useAuth()
const isDark = ref(false)
const banjirLoading = ref(true)
const banjirError = ref('')
const pintuAir = ref([])
const pintuAirDisplay = ref([])

const rtLoading = ref(true)
const rtError = ref('')
const rtTerdampak = ref([])
const rtDisplay = ref([])

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
  // load banjir data
  ;(async () => {
    try {
      const pa = await fetchPintuAirXml()
      if (pa.error) banjirError.value = pa.error
      else {
        pintuAir.value = pa.data
        pintuAirDisplay.value = pintuAir.value.slice(0, 6)
      }
    } catch (e) {
      banjirError.value = String(e)
    } finally {
      banjirLoading.value = false
    }

    try {
      const rt = await fetchRtTerdampak()
      if (rt.error) rtError.value = rt.error
      else {
        rtTerdampak.value = rt.data
        rtDisplay.value = rtTerdampak.value.slice(0, 6)
      }
    } catch (e) {
      rtError.value = String(e)
    } finally {
      rtLoading.value = false
    }
  })()
})

const logout = async () => {
  try {
    await signOut()
  } catch (error) {
    console.error('Logout error:', error)
  }
}

function statusClass(s) {
  const t = (s || '').toLowerCase()
  if (t.includes('normal')) return 'badge normal'
  if (t.includes('siaga') || t.includes('awas') || t.includes('warning')) return 'badge siaga'
  return 'badge waspada'
}

function rtStatusClass(s) {
  const t = (s || '').toLowerCase()
  if (t.includes('berat')) return 'badge siaga'
  if (t.includes('sedang')) return 'badge waspada'
  return 'badge normal'
}

function cleanStatus(s) {
  return (s || '').replace('Status : ', '')
}

function formatDateTime(dt) {
  if (!dt) return '-'
  try {
    const d = new Date(dt)
    return d.toLocaleString('id-ID', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' }).replace('.', '')
  } catch { return dt }
}
</script>

<style scoped>
.gradient-bg { background: linear-gradient(180deg, #f9fbff 0%, var(--logo-bg) 100%); }
.section-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
.section-sub { color:#6a7890; font-size:0.95rem; margin-top:4px; }
.head-actions { display:flex; gap:8px; }
.btn-outline { border:1px solid #d5dbe7; background:#fff; color:#3a4a62; padding:8px 12px; border-radius:10px; cursor:pointer; }
.btn-outline:disabled { opacity:.6; cursor:not-allowed; }
.cards-grid { display:grid; grid-template-columns: repeat(3, 1fr); gap:14px; }
.cards-grid.sm { grid-template-columns: repeat(3, 1fr); }
.card { background:#fff; border:1px solid #e8edf5; border-radius:16px; padding:14px; box-shadow:0 2px 14px rgba(58,74,98,.06); }
.card.compact { padding:12px; }
.card-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:6px; }
.title { font-weight:700; color:#2f3b4e; }
.card-meta { color:#7b8aa3; font-size:.92rem; margin-bottom:10px; }
.kv .row { display:flex; align-items:center; justify-content:space-between; padding:6px 0; border-top:1px dashed #eef2f7; }
.kv .row:first-child { border-top:none; }
.badge { padding:4px 10px; border-radius:999px; font-size:.8rem; font-weight:700; }
.badge.normal { background:#e9f7ef; color:#1d7a49; border:1px solid #c6ebd5; }
.badge.waspada { background:#fff7e6; color:#a15c00; border:1px solid #ffe0a3; }
.badge.siaga { background:#fff0f0; color:#b12b2b; border:1px solid #ffd0d0; }
.skeleton { background:linear-gradient(90deg,#f3f6fb 25%,#eef2f7 37%,#f3f6fb 63%); background-size:400% 100%; animation:shimmer 1.4s ease infinite; height:110px; }
@keyframes shimmer { 0%{background-position:100% 0} 100%{background-position:-100% 0} }
.mobility-error { color:#e85c3a; }

.banjir-section {
  margin-top: 28px;
  background: var(--logo-bg);
  border-radius: 22px;
  box-shadow: 0 4px 24px rgba(58,74,98,0.10);
  padding: 24px;
}
.banjir-list { display: grid; gap: 12px; }
.banjir-item { background: var(--logo-gray); border-radius: 12px; padding: 12px 14px; }
.banjir-title { font-weight: 600; color: var(--logo-text); }
.banjir-meta { color: #667; font-size: 0.95rem; margin-top: 4px; }
</style>
  