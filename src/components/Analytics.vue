<template>
  <div class="analytics-container">
    <div v-if="loading" class="analytics-loading">Loading data...</div>
    <div v-else-if="error" class="analytics-error">{{ error }}</div>
    <div v-else>
      <div class="analytics-summary">
        <div>
          <strong>Total Data:</strong> {{ data.length }} records
        </div>
        <div v-if="data.length">
          <strong>Periode:</strong> {{ formatDate(data[0].timestamp) }} - {{ formatDate(data[data.length-1].timestamp) }}
        </div>
      </div>
      <div class="analytics-stats">
        <div><strong>Rata-rata Crowd:</strong> {{ avgCrowd }}</div>
        <div><strong>Min Crowd:</strong> {{ minCrowd }}</div>
        <div><strong>Max Crowd:</strong> {{ maxCrowd }}</div>
        <div><strong>Total Crowd:</strong> {{ totalCrowd }}</div>
        <div><strong>Jam Tersibuk:</strong> {{ peakTime }}</div>
        <div><strong>Standar Deviasi:</strong> {{ stdDevCrowd }}</div>
      </div>
      <button class="export-btn" @click="exportCSV">Export CSV</button>
      <div class="analytics-charts">
        <div class="chart-card">
          <h3>Tren Jumlah Crowd (Moving Average)</h3>
          <Line :data="movingAvgLineData" :options="chartOptions" />
        </div>
        <div class="chart-card">
          <h3>Distribusi Crowd (Bar)</h3>
          <Bar :data="barChartData" :options="chartOptions" />
        </div>
        <div class="chart-card">
          <h3>Persentase Crowd (Pie)</h3>
          <Pie :data="pieChartData" :options="pieOptions" />
        </div>
      </div>
      <div class="analytics-charts">
        <div class="chart-card">
          <h3>Tren Crowd per Lokasi</h3>
          <Line :data="perLocationLineData" :options="chartOptions" />
        </div>
        <div class="chart-card">
          <h3>Distribusi Status Crowd</h3>
          <Pie :data="statusPieData" :options="pieOptions" />
        </div>
      </div>
      <div class="analytics-charts">
        <div class="chart-card">
          <h3>Rata-rata Crowd per Jam</h3>
          <Bar :data="avgPerHourBarData" :options="chartOptions" />
        </div>
        <div class="chart-card">
          <h3>Distribusi Crowd per Hari</h3>
          <Bar :data="avgPerDayBarData" :options="chartOptions" />
        </div>
        <div class="chart-card">
          <h3>Heatmap Crowd per Jam/Hari</h3>
          <canvas ref="heatmapCanvas" width="320" height="220"></canvas>
        </div>
      </div>
      <div class="analytics-table-section">
        <h3>Ranking Lokasi Teramai</h3>
        <table class="analytics-table">
          <thead>
            <tr>
              <th>Ranking</th>
              <th>Lokasi</th>
              <th>Total Crowd</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(loc, i) in rankingLokasi" :key="loc.location">
              <td>{{ i+1 }}</td>
              <td>{{ loc.location }}</td>
              <td>{{ loc.total }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="analytics-table-section">
        <h3>Summary per Lokasi</h3>
        <table class="analytics-table">
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
              <td>{{ loc.total }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="analytics-table-section">
        <h3>Deteksi Lonjakan Crowd</h3>
        <table class="analytics-table">
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
              <td>{{ row.spike }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="analytics-table-section">
        <h3>Data Mentah</h3>
        <div class="analytics-table-scroll">
          <table class="analytics-table">
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
                <td>{{ row.status }}</td>
                <td>{{ formatDate(row.timestamp) }}</td>
              </tr>
            </tbody>
          </table>
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

onMounted(async () => {
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
</script>

<style scoped>
.analytics-container {
  margin-top: 32px;
  background: var(--logo-bg);
  border-radius: 18px;
  box-shadow: 0 2px 16px rgba(58,74,98,0.08);
  padding: 32px 24px;
  color: var(--logo-text);
}
.analytics-loading, .analytics-error {
  text-align: center;
  font-size: 1.1rem;
  color: #e85c3a;
  margin: 32px 0;
}
.analytics-summary {
  display: flex;
  gap: 32px;
  margin-bottom: 24px;
  font-size: 1.08rem;
  color: var(--logo-text);
}
.analytics-stats {
  display: flex;
  gap: 32px;
  margin-bottom: 24px;
  font-size: 1.08rem;
  color: var(--logo-text);
  flex-wrap: wrap;
}
.export-btn {
  background: #e85c3a;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 8px 18px;
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 24px;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(58,74,98,0.08);
  transition: background 0.2s;
}
.export-btn:hover {
  background: #3a4a62;
}
.analytics-charts {
  display: flex;
  flex-wrap: wrap;
  gap: 32px;
  justify-content: space-between;
}
.chart-card {
  flex: 1 1 320px;
  min-width: 280px;
  max-width: 420px;
  background: var(--logo-gray);
  border-radius: 14px;
  box-shadow: 0 1px 8px rgba(58,74,98,0.07);
  padding: 18px 16px 12px 16px;
  margin-bottom: 18px;
  color: var(--logo-text);
}
.chart-card h3 {
  font-size: 1.08rem;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--logo-accent);
}
.analytics-table-section {
  margin-top: 32px;
}
.analytics-table-scroll {
  max-height: 320px;
  overflow: auto;
}
.analytics-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.98rem;
  margin-top: 8px;
}
.analytics-table th, .analytics-table td {
  border: 1px solid #ececec;
  padding: 6px 10px;
  text-align: left;
}
.analytics-table th {
  background: var(--logo-hover);
  color: var(--logo-text);
  font-weight: 600;
}
</style> 