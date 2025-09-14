<template>
  <div class="analytics-container">
    <div class="section-header">
      <div class="section-title">
        <h2>Crowd Analytics</h2>
        <div class="section-subtitle">Analisis data crowd monitoring • Total {{ data.length }} records</div>
      </div>
      <div class="section-actions">
        <button class="btn-outline" @click="refreshData" :disabled="loading">Refresh</button>
        <button class="btn-primary" @click="exportCSV" :disabled="!data.length">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="2"/>
            <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2"/>
            <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" stroke-width="2"/>
            <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" stroke-width="2"/>
          </svg>
          Export CSV
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="skeleton" style="height:200px; border-radius:12px"></div>
    </div>
    <div v-else-if="error" class="error-message">{{ error }}</div>
    <div v-else>
      <!-- Summary Cards -->
      <div class="summary-cards">
        <div class="summary-card">
          <div class="card-value">{{ data.length }}</div>
          <div class="card-label">Total Records</div>
        </div>
        <div class="summary-card">
          <div class="card-value">{{ avgCrowd }}</div>
          <div class="card-label">Rata-rata Crowd</div>
        </div>
        <div class="summary-card">
          <div class="card-value">{{ maxCrowd }}</div>
          <div class="card-label">Max Crowd</div>
        </div>
        <div class="summary-card">
          <div class="card-value">{{ totalCrowd }}</div>
          <div class="card-label">Total Crowd</div>
        </div>
      </div>

      <!-- Additional Stats -->
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-label">Min Crowd:</span>
          <span class="stat-value">{{ minCrowd }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Standar Deviasi:</span>
          <span class="stat-value">{{ stdDevCrowd }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Jam Tersibuk:</span>
          <span class="stat-value">{{ peakTime }}</span>
        </div>
        <div class="stat-item" v-if="data.length">
          <span class="stat-label">Periode:</span>
          <span class="stat-value">{{ formatDate(data[0].timestamp) }} - {{ formatDate(data[data.length-1].timestamp) }}</span>
        </div>
      </div>
      <!-- Charts Section -->
      <div class="charts-section">
        <h3>Visualisasi Data</h3>
        <div class="charts-grid">
          <div class="chart-card">
            <h4>Tren Jumlah Crowd (Moving Average)</h4>
            <Line :data="movingAvgLineData" :options="chartOptions" />
          </div>
          <div class="chart-card">
            <h4>Distribusi Crowd (Bar)</h4>
            <Bar :data="barChartData" :options="chartOptions" />
          </div>
          <div class="chart-card">
            <h4>Persentase Crowd (Pie)</h4>
            <Pie :data="pieChartData" :options="pieOptions" />
          </div>
          <div class="chart-card">
            <h4>Tren Crowd per Lokasi</h4>
            <Line :data="perLocationLineData" :options="chartOptions" />
          </div>
          <div class="chart-card">
            <h4>Distribusi Status Crowd</h4>
            <Pie :data="statusPieData" :options="pieOptions" />
          </div>
          <div class="chart-card">
            <h4>Rata-rata Crowd per Jam</h4>
            <Bar :data="avgPerHourBarData" :options="chartOptions" />
          </div>
          <div class="chart-card">
            <h4>Distribusi Crowd per Hari</h4>
            <Bar :data="avgPerDayBarData" :options="chartOptions" />
          </div>
          <div class="chart-card">
            <h4>Heatmap Crowd per Jam/Hari</h4>
            <canvas ref="heatmapCanvas" width="320" height="220"></canvas>
          </div>
        </div>
      </div>
      <!-- Tables Section -->
      <div class="tables-section">
        <h3>Analisis Detail</h3>
        
        <div class="table-card">
          <h4>Ranking Lokasi Teramai</h4>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Ranking</th>
                  <th>Lokasi</th>
                  <th>Total Crowd</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(loc, i) in rankingLokasi" :key="loc.location">
                  <td><span class="rank-badge">{{ i+1 }}</span></td>
                  <td>{{ loc.location }}</td>
                  <td><strong>{{ loc.total }}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="table-card">
          <h4>Summary per Lokasi</h4>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Lokasi</th>
                  <th>Rata-rata</th>
                  <th>Min</th>
                  <th>Max</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="loc in locationStats" :key="loc.location">
                  <td>{{ loc.location }}</td>
                  <td>{{ loc.avg }}</td>
                  <td>{{ loc.min }}</td>
                  <td>{{ loc.max }}</td>
                  <td><strong>{{ loc.total }}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- <div class="table-card" v-if="spikes.length">
          <h4>Deteksi Lonjakan Crowd</h4>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Waktu</th>
                  <th>Lokasi</th>
                  <th>Jumlah</th>
                  <th>Lonjakan (%)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in spikes" :key="row.timestamp + row.location">
                  <td>{{ formatDate(row.timestamp) }}</td>
                  <td>{{ row.location }}</td>
                  <td>{{ row.count }}</td>
                  <td><span class="spike-badge">{{ row.spike }}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div> -->

        <div class="table-card">
          <h4>Data Mentah</h4>
          <div class="status-legend">
            <span class="legend-item"><span class="status-badge ringan"></span> <b>Ringan</b>: ≤ 100</span>
            <span class="legend-item"><span class="status-badge sedang"></span> <b>Sedang</b>: 101–200</span>
            <span class="legend-item"><span class="status-badge ramai"></span> <b>Ramai</b>: 201–400</span>
            <span class="legend-item"><span class="status-badge padat"></span> <b>Padat</b>: > 400</span>
          </div>
          <div class="table-container scrollable">
            <table class="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Lokasi</th>
                  <th>Jumlah</th>
                  <th>Status</th>
                  <th>Waktu</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in data" :key="row.id">
                  <td>{{ row.id }}</td>
                  <td>{{ row.location }}</td>
                  <td>{{ row.count }}</td>
                  <td>
                    <span class="status-badge" :class="statusBadgeClass(row.status)"></span>
                    <span class="status-text">{{ row.status }}</span>
                  </td>
                  <td>{{ formatDate(row.timestamp) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { fetchCrowdHistory } from '../controller/dashboardcontroller.js'
import { Line, Bar, Pie } from 'vue-chartjs'
import {
  Chart,
  Title,
  Tooltip,
  Legend,
  LineElement,
  BarElement,
  PointElement,
  CategoryScale,
  LinearScale,
  ArcElement
} from 'chart.js'

Chart.register(Title, Tooltip, Legend, LineElement, BarElement, PointElement, CategoryScale, LinearScale, ArcElement)

function formatDate(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  return d.toLocaleString('id-ID', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false
  }).replace('.', '')
}

const loading = ref(true)
const error = ref('')
const data = ref([])

async function refreshData() {
  loading.value = true
  const res = await fetchCrowdHistory()
  if (res.error) {
    error.value = res.error
  } else {
    data.value = res.data
  }
  loading.value = false
  await nextTick()
  drawHeatmap()
}

onMounted(async () => {
  await refreshData()
})
watch(data, () => nextTick(drawHeatmap))

const avgCrowd = computed(() => data.value.length ? Math.round(data.value.reduce((a, b) => a + b.count, 0) / data.value.length) : 0)
const minCrowd = computed(() => data.value.length ? Math.min(...data.value.map(d => d.count)) : 0)
const maxCrowd = computed(() => data.value.length ? Math.max(...data.value.map(d => d.count)) : 0)
const totalCrowd = computed(() => data.value.reduce((a, b) => a + b.count, 0))
const stdDevCrowd = computed(() => {
  if (!data.value.length) return 0
  const avg = avgCrowd.value
  const variance = data.value.reduce((a, b) => a + Math.pow(b.count - avg, 2), 0) / data.value.length
  return Math.round(Math.sqrt(variance) * 100) / 100
})
const peakTime = computed(() => {
  if (!data.value.length) return '-'
  const max = Math.max(...data.value.map(d => d.count))
  const found = data.value.find(d => d.count === max)
  return found ? formatDate(found.timestamp) : '-'
})

const lineChartData = computed(() => {
  if (!data.value.length) return {}
  return {
    labels: data.value.map(d => formatDate(d.timestamp)),
    datasets: [
      {
        label: 'Jumlah Crowd',
        data: data.value.map(d => d.count),
        borderColor: '#e85c3a',
        backgroundColor: 'rgba(232,92,58,0.15)',
        tension: 0.3,
        fill: true
      }
    ]
  }
})

const movingAvgLineData = computed(() => {
  if (!data.value.length) return {}
  const window = 5
  const arr = data.value.map(d => d.count)
  const ma = arr.map((v, i, a) => {
    const start = Math.max(0, i - window + 1)
    const sub = a.slice(start, i + 1)
    return Math.round(sub.reduce((x, y) => x + y, 0) / sub.length)
  })
  return {
    labels: data.value.map(d => formatDate(d.timestamp)),
    datasets: [
      {
        label: 'Moving Avg Crowd',
        data: ma,
        borderColor: '#41b883',
        backgroundColor: 'rgba(65,184,131,0.10)',
        tension: 0.3,
        fill: true
      }
    ]
  }
})

const barChartData = computed(() => {
  if (!data.value.length) return {}
  return {
    labels: data.value.map(d => formatDate(d.timestamp)),
    datasets: [
      {
        label: 'Jumlah Crowd',
        data: data.value.map(d => d.count),
        backgroundColor: '#3a4a62',
      }
    ]
  }
})

const pieChartData = computed(() => {
  if (!data.value.length) return {}
  const low = data.value.filter(d => d.count < 20).length
  const medium = data.value.filter(d => d.count >= 20 && d.count < 50).length
  const high = data.value.filter(d => d.count >= 50).length
  return {
    labels: ['Rendah (<20)', 'Sedang (20-49)', 'Tinggi (>=50)'],
    datasets: [
      {
        data: [low, medium, high],
        backgroundColor: ['#e85c3a', '#3a4a62', '#fbe7e0'],
      }
    ]
  }
})

// Analisis per lokasi
const locations = computed(() => [...new Set(data.value.map(d => d.location))])
const perLocationLineData = computed(() => {
  if (!data.value.length) return {}
  return {
    labels: data.value.map(d => formatDate(d.timestamp)),
    datasets: locations.value.map((loc, idx) => ({
      label: loc,
      data: data.value.map(d => d.location === loc ? d.count : null),
      borderColor: idx % 2 === 0 ? '#e85c3a' : '#3a4a62',
      backgroundColor: idx % 2 === 0 ? 'rgba(232,92,58,0.15)' : 'rgba(58,74,98,0.15)',
      tension: 0.3,
      fill: false
    }))
  }
})
const locationStats = computed(() => {
  return locations.value.map(loc => {
    const arr = data.value.filter(d => d.location === loc)
    return {
      location: loc,
      avg: arr.length ? Math.round(arr.reduce((a, b) => a + b.count, 0) / arr.length) : 0,
      min: arr.length ? Math.min(...arr.map(d => d.count)) : 0,
      max: arr.length ? Math.max(...arr.map(d => d.count)) : 0,
      total: arr.reduce((a, b) => a + b.count, 0)
    }
  })
})
const rankingLokasi = computed(() => {
  return locationStats.value.slice().sort((a, b) => b.total - a.total)
})

// Analisis status
const statusPieData = computed(() => {
  if (!data.value.length) return {}
  const statusMap = {}
  data.value.forEach(d => {
    statusMap[d.status] = (statusMap[d.status] || 0) + 1
  })
  return {
    labels: Object.keys(statusMap),
    datasets: [
      {
        data: Object.values(statusMap),
        backgroundColor: ['#e85c3a', '#3a4a62', '#fbe7e0', '#41b883', '#35495e']
      }
    ]
  }
})

// Rata-rata per jam
const avgPerHourBarData = computed(() => {
  if (!data.value.length) return {}
  const hourMap = {}
  data.value.forEach(d => {
    const h = new Date(d.timestamp).getHours()
    hourMap[h] = hourMap[h] || []
    hourMap[h].push(d.count)
  })
  const labels = Array.from({length: 24}, (_, i) => i.toString().padStart(2, '0')+':00')
  const avg = labels.map((l, i) => {
    const arr = hourMap[i] || []
    return arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0
  })
  return {
    labels,
    datasets: [
      {
        label: 'Rata-rata Crowd',
        data: avg,
        backgroundColor: '#e85c3a',
      }
    ]
  }
})
// Rata-rata per hari
const avgPerDayBarData = computed(() => {
  if (!data.value.length) return {}
  const dayMap = {}
  data.value.forEach(d => {
    const day = new Date(d.timestamp).getDay()
    dayMap[day] = dayMap[day] || []
    dayMap[day].push(d.count)
  })
  const dayLabels = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu']
  const avg = dayLabels.map((l, i) => {
    const arr = dayMap[i] || []
    return arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0
  })
  return {
    labels: dayLabels,
    datasets: [
      {
        label: 'Rata-rata Crowd',
        data: avg,
        backgroundColor: '#3a4a62',
      }
    ]
  }
})

// Heatmap per jam/hari
const heatmapCanvas = ref(null)
function drawHeatmap() {
  const canvas = heatmapCanvas.value
  if (!canvas || !data.value.length) return
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0,0,canvas.width,canvas.height)
  const dayLabels = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu']
  const cellW = 320/24, cellH = 220/7
  // Hitung rata-rata crowd per jam per hari
  const map = Array.from({length:7},()=>Array(24).fill(0))
  data.value.forEach(d => {
    const date = new Date(d.timestamp)
    const day = date.getDay(), hour = date.getHours()
    map[day][hour] = map[day][hour] ? (map[day][hour]+d.count)/2 : d.count
  })
  for(let y=0;y<7;y++){
    for(let x=0;x<24;x++){
      const val = map[y][x]
      const color = val ? `rgba(232,92,58,${Math.min(val/Math.max(...map.flat(),1),1)})` : '#f7f7f7'
      ctx.fillStyle = color
      ctx.fillRect(x*cellW, y*cellH, cellW, cellH)
    }
  }
  ctx.font = '10px sans-serif'
  ctx.fillStyle = '#333'
  for(let y=0;y<7;y++) ctx.fillText(dayLabels[y], 2, y*cellH+12)
  for(let x=0;x<24;x+=2) ctx.fillText(x.toString().padStart(2,'0'), x*cellW+2, 12)
}

// Deteksi lonjakan crowd
const spikes = computed(() => {
  if (!data.value.length) return []
  const arr = []
  for(let i=1;i<data.value.length;i++){
    const prev = data.value[i-1].count
    const curr = data.value[i].count
    if (prev && curr > prev*2) {
      arr.push({
        ...data.value[i],
        spike: Math.round((curr-prev)/prev*100)+'%'
      })
    }
  }
  return arr
})

// Export CSV
function exportCSV() {
  if (!data.value.length) return
  const header = 'id,location,count,status,timestamp\n'
  const rows = data.value.map(d => `${d.id},${d.location},${d.count},${d.status},${d.timestamp}`)
  const csv = header + rows.join('\n')
  const blob = new Blob([csv], {type:'text/csv'})
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'crowd_history.csv'
  a.click()
  URL.revokeObjectURL(url)
}

const chartOptions = {
  responsive: true,
  plugins: {
    legend: { labels: { color: 'var(--logo-text)' } },
    title: { display: false }
  },
  scales: {
    x: { ticks: { color: 'var(--logo-text)' }, grid: { color: 'rgba(0,0,0,0.05)' } },
    y: { ticks: { color: 'var(--logo-text)' }, grid: { color: 'rgba(0,0,0,0.05)' } }
  }
}
const pieOptions = {
  responsive: true,
  plugins: {
    legend: { labels: { color: 'var(--logo-text)' } },
    title: { display: false }
  }
}

function statusBadgeClass(s) {
  const t = (s || '').toLowerCase()
  if (t.includes('padat')) return 'padat'
  if (t.includes('ramai')) return 'ramai'
  if (t.includes('sedang')) return 'sedang'
  return 'ringan'
}
</script>

<style scoped>
.analytics-container {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 14px rgba(58,74,98,.06);
  padding: 24px;
  margin-bottom: 24px;
}

/* Section Header */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.section-title h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2f3b4e;
  margin: 0 0 4px 0;
}

.section-subtitle {
  color: #6a7890;
  font-size: 0.9rem;
}

.section-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* Buttons */
.btn-outline { 
  border: 1px solid #d5dbe7; 
  background: #fff; 
  color: #3a4a62; 
  padding: 8px 12px; 
  border-radius: 8px; 
  cursor: pointer; 
  font-size: 0.9rem; 
  transition: all 0.2s;
}

.btn-outline:disabled { 
  opacity: 0.6; 
  cursor: not-allowed; 
}

.btn-outline:hover:not(:disabled) { 
  background: #f8fafc; 
  border-color: #c1c9d2; 
}

.btn-primary {
  background: #1976d2;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background 0.2s;
  font-size: 0.9rem;
}

.btn-primary:hover:not(:disabled) {
  background: #1565c0;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Loading and Error States */
.loading-state {
  margin: 20px 0;
}

.skeleton { 
  background: linear-gradient(90deg, #f3f6fb 25%, #eef2f7 37%, #f3f6fb 63%); 
  background-size: 400% 100%; 
  animation: shimmer 1.4s ease infinite; 
}

@keyframes shimmer { 
  0% { background-position: 100% 0 } 
  100% { background-position: -100% 0 } 
}

.error-message { 
  color: #e85c3a; 
  background: #fff5f5; 
  padding: 12px; 
  border-radius: 8px; 
  border: 1px solid #fed7d7; 
  text-align: center;
}

/* Summary Cards */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.summary-card {
  background: #f8fafc;
  border: 1px solid #e8edf5;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
}

.card-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1976d2;
  margin-bottom: 4px;
}

.card-label {
  font-size: 0.9rem;
  color: #6a7890;
  font-weight: 500;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8fafc;
  border: 1px solid #e8edf5;
  border-radius: 8px;
}

.stat-label {
  color: #6a7890;
  font-size: 0.9rem;
}

.stat-value {
  font-weight: 600;
  color: #2f3b4e;
}

/* Charts Section */
.charts-section {
  margin-bottom: 32px;
}

.charts-section h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2f3b4e;
  margin-bottom: 20px;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
}

.chart-card {
  background: #f8fafc;
  border: 1px solid #e8edf5;
  border-radius: 12px;
  padding: 20px;
}

.chart-card h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #2f3b4e;
  margin-bottom: 16px;
}

/* Tables Section */
.tables-section {
  margin-top: 32px;
}

.tables-section h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2f3b4e;
  margin-bottom: 20px;
}

.table-card {
  background: #f8fafc;
  border: 1px solid #e8edf5;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.table-card h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #2f3b4e;
  margin-bottom: 16px;
}

.table-container {
  overflow-x: auto;
}

.table-container.scrollable {
  max-height: 400px;
  overflow-y: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.data-table th, .data-table td {
  border: 1px solid #e8edf5;
  padding: 12px;
  text-align: left;
}

.data-table th {
  background: #f1f4f9;
  color: #2f3b4e;
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.data-table tbody tr:hover {
  background: #f8fafc;
}

/* Badges */
.rank-badge {
  background: #e3f2fd;
  color: #1976d2;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 700;
}

.spike-badge {
  background: #fff3e0;
  color: #f57c00;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 700;
}

.status-legend { 
  display: flex; 
  gap: 16px; 
  align-items: center; 
  margin: 0 0 16px 0; 
  flex-wrap: wrap; 
}

.legend-item { 
  display: flex; 
  align-items: center; 
  gap: 8px; 
  color: #6a7890; 
  font-size: 0.85rem;
}

.status-badge { 
  padding: 4px 8px; 
  border-radius: 12px; 
  font-weight: 700; 
  font-size: 0.75rem; 
}

.status-badge.ringan { 
  background: #e9f7ef; 
  color: #1d7a49; 
  border: 1px solid #c6ebd5; 
}

.status-badge.sedang { 
  background: #fff7e6; 
  color: #a15c00; 
  border: 1px solid #ffe0a3; 
}

.status-badge.ramai { 
  background: #eaf3ff; 
  color: #0b5ed7; 
  border: 1px solid #bcd8ff; 
}

.status-badge.padat { 
  background: #fff0f0; 
  color: #b12b2b; 
  border: 1px solid #ffd0d0; 
}

.status-text { 
  margin-left: 8px; 
  font-weight: 600; 
  color: #2f3b4e; 
  text-transform: capitalize; 
}

/* Responsive */
@media (max-width: 768px) {
  .summary-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .charts-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style> 