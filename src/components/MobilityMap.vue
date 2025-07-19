<template>
  <div class="mobility-section">
    <h2>Analisis Mobility User</h2>
    <div v-if="loading" class="mobility-loading">Loading data mobility...</div>
    <div v-else-if="error" class="mobility-error">{{ error }}</div>
    <div v-else>
      <div class="mobility-controls">
        <label for="userSelect">Pilih User:</label>
        <select id="userSelect" v-model="selectedUser">
          <option v-for="u in userIds" :key="u" :value="u">{{ u }}</option>
        </select>
      </div>
      <div class="mobility-map-container">
        <l-map :zoom="13" :center="mapCenter" style="height: 340px; width: 100%">
          <l-tile-layer :url="tileUrl" :attribution="tileAttr" />
          <l-marker v-if="origin" :lat-lng="origin">
            <l-popup>Asal<br/>{{ origin[0] }}, {{ origin[1] }}</l-popup>
          </l-marker>
          <l-marker v-if="destination" :lat-lng="destination" :icon="destIcon">
            <l-popup>Tujuan<br/>{{ destination[0] }}, {{ destination[1] }}</l-popup>
          </l-marker>
          <l-polyline v-if="routeCoords.length" :lat-lngs="routeCoords" :color="'#e85c3a'" :weight="5" />
        </l-map>
      </div>
      <div v-if="selectedMobility" class="mobility-info">
        <div><strong>User:</strong> {{ selectedMobility.user_id }}</div>
        <div><strong>Waktu:</strong> {{ formatDate(selectedMobility.timestamp) }}</div>
        <div><strong>Asal:</strong> {{ origin[0] }}, {{ origin[1] }}</div>
        <div><strong>Tujuan:</strong> {{ destination[0] }}, {{ destination[1] }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { fetchMobilityData } from '../controller/dashboardcontroller.js'
import { LMap, LTileLayer, LMarker, LPopup, LPolyline } from '@vue-leaflet/vue-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const loading = ref(true)
const error = ref('')
const mobility = ref([])
const selectedUser = ref('')
const selectedMobility = computed(() => mobility.value.find(m => m.user_id === selectedUser.value))
const origin = computed(() => selectedMobility.value ? [selectedMobility.value.latitude, selectedMobility.value.longitude] : null)
const destination = computed(() => selectedMobility.value ? [selectedMobility.value.dest_latitude, selectedMobility.value.dest_longitude] : null)
const mapCenter = computed(() => origin.value || [-6.18, 106.82])
const userIds = computed(() => [...new Set(mobility.value.map(m => m.user_id))])
const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const tileAttr = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

const routeCoords = ref([])
const destIcon = L.icon({
  iconUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/images/marker-shadow.png',
  shadowSize: [41, 41]
})

function formatDate(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  return d.toLocaleString('id-ID', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false
  }).replace('.', '')
}

onMounted(async () => {
  loading.value = true
  const res = await fetchMobilityData()
  if (res.error) {
    error.value = res.error
  } else {
    mobility.value = res.data
    if (userIds.value.length) selectedUser.value = userIds.value[0]
  }
  loading.value = false
})

watch([origin, destination], async ([o, d]) => {
  routeCoords.value = []
  if (o && d) {
    // OSRM API: http://router.project-osrm.org/route/v1/driving/{lon1},{lat1};{lon2},{lat2}?overview=full&geometries=geojson
    const url = `https://router.project-osrm.org/route/v1/driving/${o[1]},${o[0]};${d[1]},${d[0]}?overview=full&geometries=geojson`
    try {
      const res = await fetch(url)
      const json = await res.json()
      if (json.routes && json.routes[0]) {
        routeCoords.value = json.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng])
      }
    } catch {}
  }
}, { immediate: true })
</script>

<style scoped>
.mobility-section {
  margin-bottom: 40px;
  background: var(--logo-bg);
  border-radius: 22px;
  box-shadow: 0 4px 24px rgba(58,74,98,0.10);
  padding: 36px 28px 28px 28px;
  color: var(--logo-text);
}
.mobility-loading, .mobility-error {
  text-align: center;
  font-size: 1.1rem;
  color: #e85c3a;
  margin: 24px 0;
}
.mobility-controls {
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.mobility-map-container {
  width: 100%;
  margin-bottom: 18px;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 2px 16px rgba(58,74,98,0.13);
}
.mobility-map-container .leaflet-container {
  width: 100% !important;
  height: 420px !important;
  border-radius: 18px;
}
.mobility-info {
  margin-top: 10px;
  font-size: 1.08rem;
  color: var(--logo-text);
  background: var(--logo-gray);
  border-radius: 12px;
  padding: 14px 20px;
  box-shadow: 0 1px 8px rgba(58,74,98,0.09);
  max-width: 480px;
}
@media (max-width: 900px) {
  .mobility-section {
    padding: 18px 6vw 18px 6vw;
  }
  .mobility-map-container .leaflet-container {
    height: 300px !important;
  }
}
@media (max-width: 600px) {
  .mobility-section {
    padding: 10px 2vw 10px 2vw;
  }
  .mobility-map-container .leaflet-container {
    height: 220px !important;
  }
}
</style> 