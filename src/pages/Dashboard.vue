<template>
  <div class="dashboard-layout">
    <!-- Sidebar -->
    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="sidebar-header">
        <img :src="logo" alt="Logo" class="sidebar-logo" />
        <span v-if="!sidebarCollapsed" class="sidebar-title">Dashboard</span>
        <button @click="toggleSidebar" class="sidebar-toggle">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
      
      <nav class="sidebar-nav">
        <!-- User/Admin Section -->
        <div class="nav-section user-section">
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
            <div v-if="!sidebarCollapsed" class="user-details">
              <div class="user-name">{{ getUserDisplayName() }}</div>
              <div class="user-role">Admin</div>
            </div>
          </div>
        </div>
        
        <div class="nav-section">
          <div v-if="!sidebarCollapsed" class="nav-section-title">Services</div>
          <div class="nav-items">
            <button 
              v-for="service in services" 
              :key="service.id"
              @click="toggleService(service.id)"
              class="nav-item"
              :class="{ active: activeServices.includes(service.id) }"
              :title="sidebarCollapsed ? service.name : ''"
            >
              <component :is="service.icon" class="nav-icon" />
              <span v-if="!sidebarCollapsed">{{ service.name }}</span>
              <span v-if="!sidebarCollapsed" class="nav-badge">{{ service.count }}</span>
        </button>
          </div>
        </div>
        
      </nav>
      
      <!-- Logout Button at Bottom -->
      <div class="sidebar-footer">
        <button @click="logout" class="logout-btn" :disabled="loading">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M16 17L21 12L16 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M21 12H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 19C7.58172 19 4 15.4183 4 11C4 6.58172 7.58172 3 12 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span v-if="!sidebarCollapsed">Logout</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <div class="content-body">
        <!-- Pintu Air Section -->
        <div v-if="activeServices.includes('pintu-air')" class="service-section">
          <div class="section-header">
            <div class="section-title">
              <h2>Data Pintu Air</h2>
              <div class="section-subtitle">XML dikonversi ke JSON • Total {{ pintuAir.length }} lokasi</div>
            </div>
            <div class="section-actions">
              <button class="btn-outline" @click="refreshPintuAir" :disabled="banjirLoading">Refresh</button>
              <button class="btn-primary" @click="refreshAll" :disabled="isLoading">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <polyline points="23 4 23 10 17 10" stroke="currentColor" stroke-width="2"/>
                  <polyline points="1 20 1 14 7 14" stroke="currentColor" stroke-width="2"/>
                  <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" stroke="currentColor" stroke-width="2"/>
                </svg>
                Refresh All
              </button>
            </div>
          </div>

          <!-- Pintu Air Map -->
          <div class="map-container">
            <div id="pintu-air-map" class="map"></div>
          </div>

          <div v-if="banjirLoading" class="cards-grid">
            <div v-for="i in 6" :key="'skl-'+i" class="card skeleton"></div>
          </div>
          <div v-else-if="banjirError" class="error-message">{{ banjirError }}</div>
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

        <!-- RT Terdampak Section -->
        <div v-if="activeServices.includes('rt-terdampak')" class="service-section">
          <div class="section-header">
            <div class="section-title">
              <h2>RT Terdampak</h2>
              <div class="section-subtitle">Data ringkas • Total {{ rtTerdampak.length }} RT</div>
            </div>
            <div class="section-actions">
              <button class="btn-outline" @click="refreshRt" :disabled="rtLoading">Refresh</button>
            </div>
          </div>

          <div v-if="rtLoading" class="cards-grid">
            <div v-for="i in 6" :key="'skl2-'+i" class="card skeleton"></div>
          </div>
          <div v-else-if="rtError" class="error-message">{{ rtError }}</div>
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

        <!-- User Mobility Section -->
        <div v-if="activeServices.includes('mobility')" class="service-section">
          <div class="section-header">
            <div class="section-title">
              <h2>User Mobility & Navigation</h2>
              <div class="section-subtitle">Peta pergerakan user dengan routing OSRM • Total {{ mobilityData.length }} data</div>
            </div>
            <div class="section-actions">
              <select v-model="selectedUser" @change="updateMap" class="input">
                <option value="">Semua User</option>
                <option v-for="u in users" :key="u.user_id" :value="u.user_id">{{ u.name }} ({{ u.user_id }})</option>
              </select>
              <button class="btn-outline" @click="refreshMobility" :disabled="mobilityLoading">Refresh</button>
            </div>
          </div>

          <div v-if="mobilityLoading" class="map-container">
            <div class="skeleton" style="height:400px; border-radius:12px"></div>
          </div>
          <div v-else-if="mobilityError" class="error-message">{{ mobilityError }}</div>
          <div v-else-if="mobilityData.length" class="map-container">
            <div id="mobility-map" style="height:400px; border-radius:12px; border:1px solid #e8edf5"></div>
            <div v-if="selectedUser && !mobilityData.filter(m => m.user_id === selectedUser).length" 
                 style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); background:rgba(255,255,255,0.9); padding:20px; border-radius:8px; text-align:center; z-index:1000;">
              <div style="color:#666; font-size:14px;">Tidak ada data mobilitas untuk user ini</div>
            </div>
          </div>
          <div v-else class="card" style="text-align:center; padding:28px">Belum ada data mobilitas.</div>
        </div>

        <!-- Reports Section -->
        <div v-if="activeServices.includes('reports')" class="service-section">
          <div class="section-header">
            <div class="section-title">
              <h2>Laporan Masyarakat</h2>
              <div class="section-subtitle">Form laporan dan upload bukti • Total {{ reports.length }} laporan</div>
            </div>
            <div class="section-actions">
              <button class="btn-primary" @click="showReportForm = true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                Buat Laporan
              </button>
              <select v-model="reportFilter" @change="refreshReports" class="input">
                <option value="">Semua Jenis</option>
                <option value="banjir">Banjir</option>
                <option value="kebakaran">Kebakaran</option>
                <option value="pohon_tumbang">Pohon Tumbang</option>
                <option value="kecelakaan">Kecelakaan</option>
                <option value="lainnya">Lainnya</option>
              </select>
              <button class="btn-outline" @click="refreshReports" :disabled="reportsLoading">Refresh</button>
            </div>
          </div>

          <div v-if="reportsError" class="error-message" style="margin-bottom:12px">{{ reportsError }}</div>

          <div v-if="reportsLoading" class="cards-grid">
            <div v-for="i in 6" :key="'skl-reports-'+i" class="card skeleton"></div>
          </div>

          <div v-else-if="!reportsLoading && reports && reports.length > 0">
            <div class="table-wrap">
              <table class="table">
                <thead>
                  <tr>
                    <th>Jenis</th>
                    <th>Judul</th>
                    <th>Lokasi</th>
                    <th>Pelapor</th>
                    <th>Urgensi</th>
                    <th>Status</th>
                    <th>Waktu</th>
                    <th style="width:160px">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(r, idx) in reports" :key="r.id ?? idx">
                    <td>
                      <span class="badge" :class="badgeForReportType(r.report_type)">{{ getReportTypeLabel(r.report_type) }}</span>
                    </td>
                    <td><b>{{ r.title || '-' }}</b></td>
                    <td>{{ r.location || '-' }}</td>
                    <td>{{ r.reporter_name || '-' }}</td>
                    <td>
                      <span class="badge" :class="badgeForUrgency(r.urgency)">{{ getUrgencyLabel(r.urgency) }}</span>
                    </td>
                    <td>
                      <span class="badge" :class="badgeForStatus(r.status)">{{ getStatusLabel(r.status) }}</span>
                    </td>
                    <td>{{ formatDateTime(r.created_at) }}</td>
                    <td style="display:flex; gap:6px">
                      <button class="btn-outline" @click="viewReport(r)" style="font-size:0.8rem">Lihat</button>
                      <button class="btn-outline" @click="updateReportStatusModal(r)" style="font-size:0.8rem">Status</button>
                      <button class="btn-outline" @click="deleteReportItem(r.id)" :disabled="!r.id || reportsDeletingIds.has(r.id)" style="font-size:0.8rem">Hapus</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div v-else-if="!reportsLoading && (!reports || reports.length === 0)" class="card" style="text-align:center; padding:28px">
            <div style="color: #6a7890; margin-bottom: 12px;">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style="margin-bottom: 12px;">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" stroke-width="2"/>
                <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2"/>
                <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" stroke-width="2"/>
                <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" stroke-width="2"/>
                <polyline points="10,9 9,9 8,9" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <h3 style="margin: 0 0 8px 0; color: #2f3b4e;">Belum ada laporan</h3>
            <p style="margin: 0 0 16px 0; color: #6a7890;">Klik "Buat Laporan" untuk memulai laporan pertama Anda.</p>
            <button class="btn-primary" @click="showReportForm = true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
              Buat Laporan Pertama
            </button>
          </div>
        </div>

        <!-- OCR Section -->
        <div v-if="activeServices.includes('ocr')" class="service-section">
          <div class="section-header">
            <div class="section-title">
              <h2>OCR Laporan</h2>
              <div class="section-subtitle">Upload dokumen, lihat hasil, hapus data • Total {{ ocrResults.length }} data</div>
            </div>
            <div class="section-actions">
              <label class="btn-outline" style="display:inline-flex; align-items:center; gap:8px; cursor:pointer">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="#3a4a62" stroke-width="2" stroke-linecap="round"/></svg>
                <span>Upload</span>
                <input type="file" accept="image/*,.pdf" @change="onOcrFileChange" style="display:none" />
              </label>
              <input placeholder="Filter lokasi" v-model="ocrSearch" @keyup.enter="refreshOcr" class="input" />
              <button class="btn-outline" @click="refreshOcr" :disabled="ocrLoading">Refresh</button>
            </div>
          </div>

          <div v-if="ocrError" class="error-message" style="margin-bottom:12px">{{ ocrError }}</div>

          <div v-if="ocrLoading" class="cards-grid">
            <div v-for="i in 6" :key="'skl-ocr-'+i" class="card skeleton"></div>
          </div>

          <div v-else-if="ocrResults.length">
            <div class="table-wrap">
              <table class="table">
                <thead>
                  <tr>
                    <th>Lokasi</th>
                    <th>Pesan</th>
                    <th>Lat</th>
                    <th>Lon</th>
                    <th>Engine</th>
                    <th>File</th>
                    <th>Waktu</th>
                    <th style="width:140px">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(o, idx) in ocrResults" :key="o.id ?? idx">
                    <td><b>{{ o.lokasi || '-' }}</b></td>
                    <td class="col-msg" :title="o.message || '-'">{{ truncate(o.message || '-', 160) }}</td>
                    <td>{{ o.latitude ?? '-' }}</td>
                    <td>{{ o.longitude ?? '-' }}</td>
                    <td>
                      <span class="badge" :class="badgeForEngine(o.engine)">{{ (o.engine || 'unknown').toUpperCase() }}</span>
                    </td>
                    <td>{{ o.source_file || '-' }}</td>
                    <td>{{ formatDateTime(o.created_at) }}</td>
                    <td style="display:flex; gap:8px">
                      <button class="btn-outline" @click="onDeleteOcr(o.id)" :disabled="!o.id || ocrDeletingIds.has(o.id)">Hapus</button>
                      <button class="btn-outline" @click="openOcrMap(o)" :disabled="!o.latitude || !o.longitude">Peta</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div v-else class="card" style="text-align:center; padding:28px">Belum ada data. Upload dokumen untuk memulai.</div>
        </div>

        <!-- Analytics Section -->
        <div v-if="activeServices.includes('analytics')" class="service-section">
        <Analytics />
        </div>
      </div>
    </main>

    <!-- Mobility Map Modal -->
    <div v-if="showMap" class="modal" @click.self="closeMap">
      <div class="modal-content">
        <div class="modal-head">
          <b>Peta Aktivitas User</b>
          <button class="btn-outline" @click="closeMap">Tutup</button>
        </div>
        <iframe :src="mapUrl" style="border:1px solid #e8edf5; width:100%; height:420px; border-radius:10px"></iframe>
        <div style="margin-top:8px"><a :href="mapUrl.replace('export/embed.html?','?')" target="_blank" rel="noreferrer">Buka di tab baru</a></div>
      </div>
    </div>

    <!-- Report Form Modal -->
    <div v-if="showReportForm" class="modal" @click.self="closeReportForm">
      <div class="modal-content report-modal" style="max-width: 900px; max-height: 95vh; overflow-y: auto;">
        <div class="modal-head">
          <b>Buat Laporan Baru</b>
          <button class="btn-outline" @click="closeReportForm">Tutup</button>
        </div>
        <div class="report-form-container">
          <form @submit.prevent="submitReportForm" class="report-form">
            <!-- Section 1: Informasi Dasar -->
            <div class="form-section">
              <h3 class="section-title">📋 Informasi Dasar</h3>
              <div class="form-grid">
                <div class="form-group">
                  <label>Jenis Laporan *</label>
                  <select v-model="reportForm.report_type" required class="input">
                    <option value="">Pilih jenis laporan</option>
                    <option value="banjir">🌊 Banjir</option>
                    <option value="kebakaran">🔥 Kebakaran</option>
                    <option value="pohon_tumbang">🌳 Pohon Tumbang</option>
                    <option value="kecelakaan">🚗 Kecelakaan</option>
                    <option value="lainnya">📝 Lainnya</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Urgensi *</label>
                  <select v-model="reportForm.urgency" required class="input">
                    <option value="">Pilih tingkat urgensi</option>
                    <option value="rendah">🟢 Rendah</option>
                    <option value="sedang">🟡 Sedang</option>
                    <option value="tinggi">🟠 Tinggi</option>
                    <option value="darurat">🔴 Darurat</option>
                  </select>
                </div>
              </div>
              
              <div class="form-group">
                <label>Judul Laporan *</label>
                <input v-model="reportForm.title" type="text" required class="input" placeholder="Masukkan judul laporan yang jelas dan singkat" />
              </div>
              
              <div class="form-group">
                <label>Deskripsi Kejadian</label>
                <textarea v-model="reportForm.description" class="input" rows="4" placeholder="Jelaskan kejadian secara detail: kapan, dimana, apa yang terjadi, dampaknya, dll."></textarea>
              </div>
            </div>

            <!-- Section 2: Lokasi -->
            <div class="form-section">
              <h3 class="section-title">📍 Lokasi Kejadian</h3>
              <div class="form-group">
                <label>Cari Lokasi</label>
                <div class="location-input-group">
                  <input 
                    v-model="locationSearch" 
                    type="text" 
                    class="input" 
                    placeholder="Ketik nama jalan, gedung, atau area..."
                    @input="searchLocation"
                    @keyup.enter="selectFirstLocation"
                  />
                  <button type="button" @click="getCurrentLocation" class="btn-location" title="Gunakan lokasi saat ini">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
                    </svg>
                  </button>
                </div>
                
                <!-- Location search results -->
                <div v-if="locationResults.length > 0" class="location-results">
                  <div 
                    v-for="(result, idx) in locationResults" 
                    :key="idx"
                    @click="selectLocation(result)"
                    class="location-result-item"
                  >
                    <div class="location-name">{{ result.display_name }}</div>
                    <div class="location-coords">{{ result.lat }}, {{ result.lon }}</div>
                  </div>
                </div>
                
                <!-- Selected location display -->
                <div v-if="reportForm.location" class="selected-location">
                  <div class="location-display">
                    <strong>📍 {{ reportForm.location }}</strong>
                    <button type="button" @click="clearLocation" class="btn-clear">×</button>
                  </div>
                  <div class="coords-display">
                    <strong>Koordinat:</strong> {{ reportForm.latitude || '-' }}, {{ reportForm.longitude || '-' }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Section 3: Informasi Pelapor -->
            <div class="form-section">
              <h3 class="section-title">👤 Informasi Pelapor</h3>
              <div class="form-grid">
                <div class="form-group">
                  <label>Nama Lengkap</label>
                  <input v-model="reportForm.reporter_name" type="text" class="input" placeholder="Nama lengkap pelapor" />
                </div>
                <div class="form-group">
                  <label>No. Telepon</label>
                  <input v-model="reportForm.reporter_phone" type="tel" class="input" placeholder="08xxxxxxxxxx" />
                </div>
              </div>
              
              <div class="form-group">
                <label>Email</label>
                <input v-model="reportForm.reporter_email" type="email" class="input" placeholder="email@example.com" />
              </div>
            </div>

            <!-- Section 4: Bukti/Dokumen -->
            <div class="form-section">
              <h3 class="section-title">📎 Bukti & Dokumen</h3>
              <div class="form-group">
                <label>Upload Bukti (Opsional)</label>
                <div class="file-upload-area">
                  <input type="file" @change="onEvidenceFilesChange" multiple accept="image/*,.pdf" class="file-input" id="evidence-files" />
                  <label for="evidence-files" class="file-upload-label">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" stroke-width="2"/>
                      <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2"/>
                      <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" stroke-width="2"/>
                      <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" stroke-width="2"/>
                      <polyline points="10,9 9,9 8,9" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    <span>Pilih file atau drag & drop</span>
                    <small>Format: JPG, PNG, PDF (Max 10MB per file)</small>
                  </label>
                </div>
                <div v-if="evidenceFiles.length" class="file-list">
                  <div v-for="(file, idx) in evidenceFiles" :key="idx" class="file-item">
                    <div class="file-info">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" stroke-width="2"/>
                        <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2"/>
                      </svg>
                      <span>{{ file.name }}</span>
                      <small>{{ (file.size / 1024 / 1024).toFixed(2) }} MB</small>
                    </div>
                    <button type="button" @click="removeEvidenceFile(idx)" class="btn-remove">×</button>
                  </div>
                </div>
              </div>
            </div>
          
          <div class="form-actions">
            <button type="button" @click="closeReportForm" class="btn-outline">Batal</button>
            <button type="submit" :disabled="submittingReport" class="btn-primary">
              {{ submittingReport ? 'Mengirim...' : 'Kirim Laporan' }}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>

    <!-- OCR Map Modal -->
    <div v-if="showOcrMap" class="modal" @click.self="closeOcrMap">
      <div class="modal-content">
        <div class="modal-head">
          <b>Peta Lokasi OCR</b>
          <button class="btn-outline" @click="closeOcrMap">Tutup</button>
        </div>
        <iframe :src="ocrMapUrl" style="border:1px solid #e8edf5; width:100%; height:420px; border-radius:10px"></iframe>
        <div style="margin-top:8px"><a :href="ocrMapUrl.replace('export/embed.html?','?')" target="_blank" rel="noreferrer">Buka di tab baru</a></div>
      </div>
    </div>

    <!-- Report Detail Modal -->
    <div v-if="showReportDetail" class="modal" @click.self="closeReportDetail">
      <div class="modal-content" style="max-width: 700px;">
        <div class="modal-head">
          <b>Detail Laporan</b>
          <button class="btn-outline" @click="closeReportDetail">Tutup</button>
        </div>
        <div v-if="selectedReport" class="report-detail">
          <div class="detail-header">
            <div class="detail-title">
              <h3>{{ selectedReport.title }}</h3>
              <div class="detail-badges">
                <span class="badge" :class="badgeForReportType(selectedReport.report_type)">
                  {{ getReportTypeLabel(selectedReport.report_type) }}
                </span>
                <span class="badge" :class="badgeForUrgency(selectedReport.urgency)">
                  {{ getUrgencyLabel(selectedReport.urgency) }}
                </span>
                <span class="badge" :class="badgeForStatus(selectedReport.status)">
                  {{ getStatusLabel(selectedReport.status) }}
                </span>
              </div>
            </div>
            <div class="detail-meta">
              <div><strong>ID:</strong> #{{ selectedReport.id }}</div>
              <div><strong>Dilaporkan:</strong> {{ formatDateTime(selectedReport.created_at) }}</div>
              <div v-if="selectedReport.updated_at !== selectedReport.created_at">
                <strong>Diperbarui:</strong> {{ formatDateTime(selectedReport.updated_at) }}
              </div>
            </div>
          </div>

          <div class="detail-content">
            <div class="detail-section">
              <h4>Deskripsi</h4>
              <p>{{ selectedReport.description || 'Tidak ada deskripsi' }}</p>
            </div>

            <div class="detail-section" v-if="selectedReport.location">
              <h4>Lokasi</h4>
              <p>{{ selectedReport.location }}</p>
              <div v-if="selectedReport.latitude && selectedReport.longitude" class="location-coords">
                <strong>Koordinat:</strong> {{ selectedReport.latitude }}, {{ selectedReport.longitude }}
                <button @click="openReportMap(selectedReport)" class="btn-outline" style="margin-left: 8px; font-size: 0.8rem">
                  Lihat di Peta
                </button>
              </div>
            </div>

            <div class="detail-section" v-if="selectedReport.reporter_name || selectedReport.reporter_phone || selectedReport.reporter_email">
              <h4>Informasi Pelapor</h4>
              <div class="reporter-info">
                <div v-if="selectedReport.reporter_name"><strong>Nama:</strong> {{ selectedReport.reporter_name }}</div>
                <div v-if="selectedReport.reporter_phone"><strong>Telepon:</strong> {{ selectedReport.reporter_phone }}</div>
                <div v-if="selectedReport.reporter_email"><strong>Email:</strong> {{ selectedReport.reporter_email }}</div>
              </div>
            </div>

            <div class="detail-section" v-if="selectedReport.evidence_files && selectedReport.evidence_files.length > 0">
              <h4>Bukti/Dokumen</h4>
              <div class="evidence-files">
                <div v-for="(file, idx) in selectedReport.evidence_files" :key="idx" class="evidence-file">
                  <span>{{ file }}</span>
                  <button @click="downloadEvidence(file)" class="btn-outline" style="font-size: 0.8rem">Download</button>
                </div>
              </div>
            </div>
          </div>

          <div class="detail-actions">
            <button @click="openStatusModal(selectedReport)" class="btn-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>
              </svg>
              Ubah Status
            </button>
            <button @click="deleteReportItem(selectedReport.id)" class="btn-outline" style="color: #dc3545; border-color: #dc3545;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6" stroke="currentColor" stroke-width="2"/>
              </svg>
              Hapus Laporan
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Status Update Modal -->
    <div v-if="showStatusModal" class="modal" @click.self="closeStatusModal">
      <div class="modal-content" style="max-width: 500px;">
        <div class="modal-head">
          <b>Ubah Status Laporan</b>
          <button class="btn-outline" @click="closeStatusModal">Tutup</button>
        </div>
        <div v-if="selectedReport" class="status-update">
          <div class="current-status">
            <h4>Status Saat Ini</h4>
            <span class="badge" :class="badgeForStatus(selectedReport.status)">
              {{ getStatusLabel(selectedReport.status) }}
            </span>
          </div>
          
          <div class="status-options">
            <h4>Pilih Status Baru</h4>
            <div class="status-grid">
              <button 
                v-for="status in statusOptions" 
                :key="status.value"
                @click="updateReportStatus(selectedReport.id, status.value)"
                :class="['status-option', { active: selectedReport.status === status.value }]"
                :disabled="selectedReport.status === status.value"
              >
                <div class="status-icon">{{ status.icon }}</div>
                <div class="status-label">{{ status.label }}</div>
                <div class="status-desc">{{ status.description }}</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import '../styles/dashboard.css'
import logo from '../assets/images/logo.png'
import { useRouter } from 'vue-router'
// import MobilityMap from '../components/MobilityMap.vue'
import Analytics from '../components/Analytics.vue'
import { fetchPintuAirXml, fetchRtTerdampak, fetchMobilityData, fetchUsers, fetchOcrResults, uploadOcrFile, deleteOcrResult, fetchReports, submitReport, deleteReport, updateReportStatus as updateReportStatusAPI } from '../controller/dashboardcontroller.js'
import { useAuth } from '../composables/useAuth.js'

// Import Leaflet
const L = window.L

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

const mobilityLoading = ref(true)
const mobilityError = ref('')
const mobilityData = ref([])
const users = ref([])
const selectedUser = ref('')
let map = null
let markers = []
let routes = []
let pintuAirMap = null
let pintuAirMarkers = []

// OCR variables
const ocrLoading = ref(true)
const ocrError = ref('')
const ocrResults = ref([])
const ocrSearch = ref('')
const ocrDeletingIds = ref(new Set())
const showOcrMap = ref(false)
const ocrMapUrl = ref('')

// Report variables
const reportsLoading = ref(true)
const reportsError = ref('')
const reports = ref([])
const reportFilter = ref('')
const reportsDeletingIds = ref(new Set())
const reportsInitialized = ref(false)
const showReportForm = ref(false)
const submittingReport = ref(false)
const evidenceFiles = ref([])
const locationSearch = ref('')
const locationResults = ref([])
const searchTimeout = ref(null)
const showReportDetail = ref(false)
const showStatusModal = ref(false)
const selectedReport = ref(null)
const statusOptions = ref([
  {
    value: 'dilaporkan',
    label: 'Dilaporkan',
    icon: '📝',
    description: 'Laporan baru diterima'
  },
  {
    value: 'diproses',
    label: 'Diproses',
    icon: '⚙️',
    description: 'Sedang ditangani tim'
  },
  {
    value: 'selesai',
    label: 'Selesai',
    icon: '✅',
    description: 'Laporan telah selesai ditangani'
  },
  {
    value: 'ditolak',
    label: 'Ditolak',
    icon: '❌',
    description: 'Laporan ditolak/tidak valid'
  }
])
const reportForm = ref({
  report_type: '',
  title: '',
  description: '',
  location: '',
  latitude: null,
  longitude: null,
  reporter_name: '',
  reporter_phone: '',
  reporter_email: '',
  urgency: 'sedang'
})

// Sidebar and service management
const sidebarCollapsed = ref(false)
const activeServices = ref(['pintu-air', 'rt-terdampak', 'mobility', 'reports', 'ocr', 'analytics'])
const services = ref([
  {
    id: 'pintu-air',
    name: 'Pintu Air',
    icon: 'svg',
    count: 0
  },
  {
    id: 'rt-terdampak', 
    name: 'RT Terdampak',
    icon: 'svg',
    count: 0
  },
  {
    id: 'mobility',
    name: 'User Mobility',
    icon: 'svg', 
    count: 0
  },
  {
    id: 'reports',
    name: 'Laporan',
    icon: 'svg',
    count: 0
  },
  {
    id: 'ocr',
    name: 'OCR Laporan',
    icon: 'svg',
    count: 0
  },
  {
    id: 'analytics',
    name: 'Analytics',
    icon: 'svg',
    count: 0
  }
])


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
        // Initialize pintu air map after data is loaded
        setTimeout(() => {
          createPintuAirMap()
        }, 100)
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

    // load mobility data
    try {
      const mob = await fetchMobilityData()
      if (mob.error) mobilityError.value = mob.error
      else {
        mobilityData.value = mob.data
        // Initialize map after data is loaded
        setTimeout(() => {
          initMap()
          updateMap()
        }, 100)
      }
    } catch (e) {
      mobilityError.value = String(e)
    } finally {
      mobilityLoading.value = false
    }

    // load users
    try {
      const usr = await fetchUsers()
      if (!usr.error) users.value = usr.data
    } catch (e) {
      console.error('Failed to load users:', e)
    }

    // load OCR data
    try {
      const ocr = await fetchOcrResults()
      if (ocr.error) ocrError.value = ocr.error
      else ocrResults.value = ocr.data
    } catch (e) {
      ocrError.value = String(e)
    } finally {
      ocrLoading.value = false
    }

    // load reports data
    try {
      console.log('Loading reports data...')
      const reports = await fetchReports()
      console.log('Reports response:', reports)
      if (reports.error) {
        reportsError.value = reports.error
        console.error('Reports error:', reports.error)
      } else {
        reports.value = reports.data || []
        reportsInitialized.value = true
        console.log('Reports loaded:', reports.value.length, 'items')
      }
    } catch (e) {
      reportsError.value = String(e)
      console.error('Reports fetch error:', e)
    } finally {
      reportsLoading.value = false
    }
    
    // Update service counts after loading data
    updateServiceCounts()
  })()
})

// Watch for mobility service visibility changes
watch(activeServices, (newServices) => {
  if (newServices.includes('mobility')) {
    // Mobility service is active, ensure map is initialized
    nextTick(() => {
      setTimeout(() => {
        const mapContainer = document.getElementById('mobility-map')
        if (mapContainer && !map) {
          console.log('Mobility service visible, initializing map...')
          initMap()
        } else if (mapContainer && map) {
          console.log('Map exists, invalidating size...')
          map.invalidateSize()
        }
      }, 100)
    })
  }
  
  if (newServices.includes('pintu-air')) {
    // Pintu air service is active, ensure map is initialized
    nextTick(() => {
      setTimeout(() => {
        const mapContainer = document.getElementById('pintu-air-map')
        if (mapContainer && !pintuAirMap) {
          console.log('Pintu air service visible, initializing map...')
          createPintuAirMap()
        } else if (mapContainer && pintuAirMap) {
          console.log('Pintu air map exists, invalidating size...')
          pintuAirMap.invalidateSize()
        }
      }, 100)
    })
  }
  
  if (newServices.includes('reports')) {
    // Reports service is active, ensure data is loaded
    nextTick(() => {
      if (!reportsInitialized.value) {
        console.log('Reports service visible, initializing data...')
        refreshReports()
      } else if (reports.value && reports.value.length === 0) {
        console.log('Reports service visible, data empty, refreshing...')
        refreshReports()
      }
    })
  }
}, { deep: true })

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

async function refreshMobility() {
  mobilityLoading.value = true
  mobilityError.value = ''
  try {
    const mob = await fetchMobilityData()
    if (mob.error) mobilityError.value = mob.error
    else {
      mobilityData.value = mob.data
      updateMap()
    }
  } catch (e) {
    mobilityError.value = String(e)
  } finally {
    mobilityLoading.value = false
  }
}

function initMap() {
  console.log('Initializing map...')
  console.log('L available:', typeof L !== 'undefined')
  
  const mapContainer = document.getElementById('mobility-map')
  console.log('Map container exists:', !!mapContainer)
  console.log('Map container dimensions:', mapContainer ? {
    width: mapContainer.offsetWidth,
    height: mapContainer.offsetHeight
  } : 'N/A')
  
  if (!mapContainer) {
    console.error('Map container not found! Retrying in 100ms...')
    setTimeout(initMap, 100)
    return
  }
  
  if (typeof L === 'undefined') {
    console.log('Leaflet not loaded, loading dynamically...')
    // Load Leaflet CSS and JS if not already loaded
    const css = document.createElement('link')
    css.rel = 'stylesheet'
    css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(css)
    
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => {
      console.log('Leaflet loaded, creating map...')
      setTimeout(createMap, 100) // Small delay to ensure DOM is ready
    }
    document.head.appendChild(script)
  } else {
    console.log('Leaflet already available, creating map...')
    setTimeout(createMap, 100) // Small delay to ensure DOM is ready
  }
}

function createMap() {
  console.log('Creating map...')
  
  const mapContainer = document.getElementById('mobility-map')
  if (!mapContainer) {
    console.error('Map container not found in createMap!')
    return
  }
  
  // Clear any existing map
  if (map) {
    console.log('Removing existing map...')
    map.remove()
    map = null
  }
  
  // Ensure container has proper dimensions
  if (mapContainer.offsetWidth === 0 || mapContainer.offsetHeight === 0) {
    console.log('Map container has no dimensions, setting default...')
    mapContainer.style.width = '100%'
    mapContainer.style.height = '400px'
  }
  
  try {
    // Initialize map centered on Indonesia
    map = L.map('mobility-map', {
      preferCanvas: true, // Better performance for many markers
      zoomControl: true,
      attributionControl: true
    }).setView([-0.7893, 113.9213], 5)
    
    console.log('Map created successfully:', map)
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map)
    
    // Force map to invalidate size and redraw
    setTimeout(() => {
      if (map) {
        map.invalidateSize()
        console.log('Map invalidated and redrawn')
        updateMap()
      }
    }, 200)
    
  } catch (error) {
    console.error('Error creating map:', error)
  }
}

// Pintu Air Map Functions
function createPintuAirMap() {
  console.log('Creating pintu air map...')
  
  const mapContainer = document.getElementById('pintu-air-map')
  if (!mapContainer) {
    console.error('Pintu air map container not found!')
    return
  }
  
  // Clear any existing map
  if (pintuAirMap) {
    console.log('Removing existing pintu air map...')
    pintuAirMap.remove()
    pintuAirMap = null
  }
  
  // Ensure container has proper dimensions
  if (mapContainer.offsetWidth === 0 || mapContainer.offsetHeight === 0) {
    console.log('Pintu air map container has no dimensions, setting default...')
    mapContainer.style.width = '100%'
    mapContainer.style.height = '400px'
  }
  
  try {
    // Initialize map centered on Jakarta
    pintuAirMap = L.map('pintu-air-map', {
      preferCanvas: true,
      zoomControl: true,
      attributionControl: true
    }).setView([-6.2088, 106.8456], 10)
    
    console.log('Pintu air map created successfully:', pintuAirMap)
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(pintuAirMap)
    
    // Force map to invalidate size and redraw
    setTimeout(() => {
      if (pintuAirMap) {
        pintuAirMap.invalidateSize()
        console.log('Pintu air map invalidated and redrawn')
        updatePintuAirMap()
      }
    }, 200)
    
  } catch (error) {
    console.error('Error creating pintu air map:', error)
  }
}

function updatePintuAirMap() {
  if (!pintuAirMap || !pintuAir.value.length) return
  
  console.log('Updating pintu air map with', pintuAir.value.length, 'locations')
  
  // Clear existing markers
  pintuAirMarkers.forEach(marker => {
    if (pintuAirMap.hasLayer(marker)) {
      pintuAirMap.removeLayer(marker)
    }
  })
  pintuAirMarkers = []
  
  // Create custom water icon
  const waterIcon = L.divIcon({
    className: 'custom-water-icon',
    html: `
      <div style="
        background: #1976d2;
        border: 2px solid #fff;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        font-size: 16px;
      ">
        💧
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  })
  
  // Add markers for each pintu air location
  pintuAir.value.forEach((p, index) => {
    if (p.latitude && p.longitude) {
      const lat = parseFloat(p.latitude)
      const lon = parseFloat(p.longitude)
      
      if (!isNaN(lat) && !isNaN(lon)) {
        const marker = L.marker([lat, lon], { icon: waterIcon })
          .bindPopup(`
            <div style="min-width: 200px;">
              <h4 style="margin: 0 0 8px 0; color: #2f3b4e;">${p.nama_pintu_air || 'Pintu Air'}</h4>
              <p style="margin: 0 0 4px 0; color: #6a7890; font-size: 0.9rem;">${p.lokasi || 'Lokasi tidak tersedia'}</p>
              <div style="margin: 8px 0;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                  <span style="color: #6a7890;">Status:</span>
                  <span style="color: #2f3b4e; font-weight: 600;">${p.status_siaga || 'Tidak diketahui'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                  <span style="color: #6a7890;">Tinggi Air:</span>
                  <span style="color: #2f3b4e; font-weight: 600;">${p.tinggi_air || 'N/A'} cm</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                  <span style="color: #6a7890;">Koordinat:</span>
                  <span style="color: #2f3b4e; font-weight: 600; font-size: 0.8rem;">${lat.toFixed(6)}, ${lon.toFixed(6)}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6a7890;">Update:</span>
                  <span style="color: #2f3b4e; font-weight: 600; font-size: 0.8rem;">${formatDateTime(p.tanggal)}</span>
                </div>
              </div>
            </div>
          `)
          .addTo(pintuAirMap)
        
        pintuAirMarkers.push(marker)
      }
    }
  })
  
  // Fit map to show all markers
  if (pintuAirMarkers.length > 0) {
    const group = new L.featureGroup(pintuAirMarkers)
    pintuAirMap.fitBounds(group.getBounds().pad(0.1))
  }
  
  console.log('Pintu air map updated with', pintuAirMarkers.length, 'markers')
}

function updateMap() {
  console.log('Updating map...')
  console.log('Map exists:', !!map)
  console.log('Mobility data length:', mobilityData.value.length)
  
  if (!map) {
    console.log('Map not available, skipping update')
    return
  }
  
  if (!mobilityData.value.length) {
    console.log('No mobility data available')
    return
  }
  
  // Clear existing markers and routes
  console.log('Clearing existing markers and routes...')
  markers.forEach(marker => {
    if (map.hasLayer(marker)) {
      map.removeLayer(marker)
    }
  })
  routes.forEach(route => {
    if (map.hasLayer(route)) {
      map.removeLayer(route)
    }
  })
  markers = []
  routes = []
  
  const data = selectedUser.value 
    ? mobilityData.value.filter(m => m.user_id === selectedUser.value)
    : mobilityData.value.slice(0, 20) // limit to 20 for performance
  
  console.log('Filtered data length:', data.length)
  
  if (!data.length) {
    // If no data for selected user, show message but keep map
    console.log('No data found for selected user:', selectedUser.value)
    return
  }
  
  // Add markers and routes for each mobility record
  data.forEach((mobility, index) => {
    const startLat = mobility.latitude
    const startLon = mobility.longitude
    const endLat = mobility.dest_latitude
    const endLon = mobility.dest_longitude
    
    console.log(`Processing mobility ${index}:`, {
      user_id: mobility.user_id,
      start: [startLat, startLon],
      end: [endLat, endLon]
    })
    
    // Validate coordinates
    if (!startLat || !startLon || !endLat || !endLon) {
      console.warn(`Invalid coordinates for mobility ${index}:`, mobility)
      return
    }
    
    // Add start marker
    const startMarker = L.marker([startLat, startLon], {
      icon: L.divIcon({
        className: 'custom-marker start-marker',
        html: `<div style="background:#4CAF50; color:white; border-radius:50%; width:20px; height:20px; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:bold;">S</div>`,
        iconSize: [20, 20]
      })
    }).addTo(map)
    
    // Add end marker
    const endMarker = L.marker([endLat, endLon], {
      icon: L.divIcon({
        className: 'custom-marker end-marker',
        html: `<div style="background:#F44336; color:white; border-radius:50%; width:20px; height:20px; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:bold;">E</div>`,
        iconSize: [20, 20]
      })
    }).addTo(map)
    
    markers.push(startMarker, endMarker)
    
    // Add popup with user info
    const popupContent = `
      <div style="min-width:200px">
        <b>User: ${mobility.user_id}</b><br>
        <small>${formatDateTime(mobility.timestamp)}</small><br>
        <div style="margin-top:8px">
          <div><b>Dari:</b> ${startLat.toFixed(6)}, ${startLon.toFixed(6)}</div>
          <div><b>Ke:</b> ${endLat.toFixed(6)}, ${endLon.toFixed(6)}</div>
        </div>
      </div>
    `
    startMarker.bindPopup(popupContent)
    endMarker.bindPopup(popupContent)
    
    // Get OSRM route
    console.log(`Calling OSRM for route ${index}`)
    getOSRMRoute(startLon, startLat, endLon, endLat, index)
  })
  
  // Fit map to show all markers
  if (markers.length > 0) {
    const group = new L.featureGroup(markers)
    map.fitBounds(group.getBounds().pad(0.1))
  }
}

async function getOSRMRoute(startLon, startLat, endLon, endLat, index) {
  // Try multiple OSRM endpoints
  const endpoints = [
    `https://router.project-osrm.org/route/v1/driving/${startLon},${startLat};${endLon},${endLat}?overview=full&geometries=geojson`,
    `https://routing.openstreetmap.de/routed-car/route/v1/driving/${startLon},${startLat};${endLon},${endLat}?overview=full&geometries=geojson`
  ]
  
  for (let i = 0; i < endpoints.length; i++) {
    try {
      const url = endpoints[i]
      console.log(`Trying OSRM endpoint ${i + 1}:`, url)
      
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
        }
      })
      
      console.log(`OSRM Response status (endpoint ${i + 1}):`, response.status)
      
      if (!response.ok) {
        console.log(`Endpoint ${i + 1} failed with status:`, response.status)
        continue
      }
      
      const data = await response.json()
      console.log(`OSRM Response data (endpoint ${i + 1}):`, data)
      
      if (data.routes && data.routes[0]) {
        const route = data.routes[0]
        console.log('OSRM Route found:', route)
        
        const routeLine = L.geoJSON(route.geometry, {
          style: {
            color: getRouteColor(index),
            weight: 4,
            opacity: 0.8
          }
        }).addTo(map)
        
        routes.push(routeLine)
        
        // Add route info popup
        const duration = Math.round(route.duration / 60) // minutes
        const distance = (route.distance / 1000).toFixed(1) // km
        
        routeLine.bindPopup(`
          <div style="min-width:150px">
            <b>Rute Perjalanan</b><br>
            <div style="margin-top:4px">
              <div>⏱️ ${duration} menit</div>
              <div>📏 ${distance} km</div>
            </div>
          </div>
        `)
        
        console.log('OSRM route added to map successfully')
        return // Success, exit function
      } else {
        console.log(`No routes found in OSRM response (endpoint ${i + 1})`)
        continue
      }
    } catch (error) {
      console.error(`OSRM routing error (endpoint ${i + 1}):`, error)
      continue
    }
  }
  
  // If all endpoints fail, draw a curved line as fallback
  console.log('All OSRM endpoints failed, drawing curved fallback line')
  const curvedLine = L.polyline([
    [startLat, startLon],
    [(startLat + endLat) / 2 + 0.01, (startLon + endLon) / 2 + 0.01], // Add curve
    [endLat, endLon]
  ], {
    color: getRouteColor(index),
    weight: 3,
    opacity: 0.7,
    dashArray: '10, 5'
  }).addTo(map)
  
  routes.push(curvedLine)
  
  // Add popup to fallback line
  curvedLine.bindPopup(`
    <div style="min-width:150px">
      <b>Rute Perkiraan</b><br>
      <div style="margin-top:4px">
        <div>📍 Route tidak tersedia</div>
        <div>📏 Garis lurus perkiraan</div>
      </div>
    </div>
  `)
  
  console.log('Fallback curved line drawn')
}

function getRouteColor(index) {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F']
  return colors[index % colors.length]
}

// Sidebar functions
function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

function toggleService(serviceId) {
  const index = activeServices.value.indexOf(serviceId)
  if (index > -1) {
    activeServices.value.splice(index, 1)
    // If mobility service is being disabled, clean up map
    if (serviceId === 'mobility' && map) {
      console.log('Mobility service disabled, cleaning up map...')
      map.remove()
      map = null
      markers = []
      routes = []
    }
  } else {
    activeServices.value.push(serviceId)
    // If mobility service is being enabled, initialize map
    if (serviceId === 'mobility') {
      console.log('Mobility service enabled, initializing map...')
      setTimeout(() => {
        initMap()
      }, 300) // Wait for DOM to update
    }
    // If reports service is being enabled, ensure data is loaded
    if (serviceId === 'reports') {
      console.log('Reports service enabled, ensuring data is loaded...')
      setTimeout(() => {
        if (!reportsInitialized.value) {
          console.log('Reports not initialized, loading data...')
          refreshReports()
        }
      }, 100)
    }
  }
}

async function refreshAll() {
  // Refresh all active services
  if (activeServices.value.includes('pintu-air')) {
    await refreshPintuAir()
  }
  if (activeServices.value.includes('rt-terdampak')) {
    await refreshRt()
  }
  if (activeServices.value.includes('mobility')) {
    await refreshMobility()
  }
  if (activeServices.value.includes('reports')) {
    await refreshReports()
  }
  if (activeServices.value.includes('ocr')) {
    await refreshOcr()
  }
}

// Update service counts
function updateServiceCounts() {
  services.value[0].count = pintuAir.value.length
  services.value[1].count = rtTerdampak.value.length
  services.value[2].count = mobilityData.value.length
  services.value[3].count = reports.value.length
  services.value[4].count = ocrResults.value.length
  services.value[5].count = 0 // Analytics doesn't have count
}

// Pintu Air Functions
async function refreshPintuAir() {
  banjirLoading.value = true
  banjirError.value = ''
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
}

// RT Terdampak Functions
async function refreshRt() {
  rtLoading.value = true
  rtError.value = ''
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
}

// OCR Functions
async function refreshOcr() {
  ocrLoading.value = true
  ocrError.value = ''
  try {
    const res = await fetchOcrResults(null, ocrSearch.value.trim())
    if (res.error) ocrError.value = res.error
    else ocrResults.value = res.data
  } catch (e) {
    ocrError.value = String(e)
  } finally {
    ocrLoading.value = false
  }
}

async function onOcrFileChange(ev) {
  const file = ev?.target?.files?.[0]
  if (!file) return
  ocrError.value = ''
  ocrLoading.value = true
  try {
    const res = await uploadOcrFile(file)
    if (res.error) ocrError.value = res.error
    await refreshOcr()
  } catch (e) {
    ocrError.value = String(e)
  } finally {
    ocrLoading.value = false
    ev.target.value = ''
  }
}

async function onDeleteOcr(id) {
  if (!id) return
  ocrDeletingIds.value.add(id)
  try {
    const res = await deleteOcrResult(id)
    if (res.error) ocrError.value = res.error
    await refreshOcr()
  } catch (e) {
    ocrError.value = String(e)
  } finally {
    ocrDeletingIds.value.delete(id)
  }
}

function badgeForEngine(e) {
  const t = String(e || '').toLowerCase()
  if (t.includes('paddle')) return 'badge normal'
  if (t.includes('tesseract')) return 'badge waspada'
  return 'badge siaga'
}

function truncate(text, max) {
  const s = String(text || '')
  return s.length > max ? s.slice(0, max - 1) + '…' : s
}

function openOcrMap(o) {
  const lat = Number(o?.latitude)
  const lon = Number(o?.longitude)
  if (Number.isFinite(lat) && Number.isFinite(lon)) {
    const delta = 0.01
    const bbox = [lon - delta, lat - delta, lon + delta, lat + delta].join('%2C')
    ocrMapUrl.value = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lon}`
    showOcrMap.value = true
  }
}

function closeOcrMap() { 
  showOcrMap.value = false 
}

// Report Functions
async function refreshReports() {
  console.log('Refreshing reports...')
  reportsLoading.value = true
  reportsError.value = ''
  try {
    const res = await fetchReports(null, reportFilter.value, '', '')
    console.log('Reports response:', res)
    if (res.error) {
      reportsError.value = res.error
      console.error('Reports error:', res.error)
    } else {
      reports.value = res.data || []
      reportsInitialized.value = true
      console.log('Reports loaded:', reports.value.length, 'items')
    }
  } catch (e) {
    reportsError.value = String(e)
    console.error('Reports fetch error:', e)
  } finally {
    reportsLoading.value = false
    updateServiceCounts()
  }
}

function closeReportForm() {
  showReportForm.value = false
  // Reset form
  reportForm.value = {
    report_type: '',
    title: '',
    description: '',
    location: '',
    latitude: null,
    longitude: null,
    reporter_name: '',
    reporter_phone: '',
    reporter_email: '',
    urgency: 'sedang'
  }
  evidenceFiles.value = []
  locationSearch.value = ''
  locationResults.value = []
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
    searchTimeout.value = null
  }
}

function onEvidenceFilesChange(event) {
  const files = Array.from(event.target.files)
  evidenceFiles.value = [...evidenceFiles.value, ...files]
}

function removeEvidenceFile(index) {
  evidenceFiles.value.splice(index, 1)
}

// Location search functions
async function searchLocation() {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
  
  if (!locationSearch.value.trim() || locationSearch.value.length < 3) {
    locationResults.value = []
    return
  }
  
  searchTimeout.value = setTimeout(async () => {
    try {
      const query = encodeURIComponent(locationSearch.value.trim())
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=5&countrycodes=id&addressdetails=1`
      )
      
      if (response.ok) {
        const results = await response.json()
        locationResults.value = results.map(result => ({
          display_name: result.display_name,
          lat: parseFloat(result.lat),
          lon: parseFloat(result.lon),
          address: result.address
        }))
      } else {
        locationResults.value = []
      }
    } catch (error) {
      console.error('Location search error:', error)
      locationResults.value = []
    }
  }, 500) // Debounce 500ms
}

function selectLocation(result) {
  reportForm.value.location = result.display_name
  reportForm.value.latitude = result.lat
  reportForm.value.longitude = result.lon
  locationSearch.value = ''
  locationResults.value = []
}

function selectFirstLocation() {
  if (locationResults.value.length > 0) {
    selectLocation(locationResults.value[0])
  }
}

function clearLocation() {
  reportForm.value.location = ''
  reportForm.value.latitude = null
  reportForm.value.longitude = null
  locationSearch.value = ''
  locationResults.value = []
}

async function getCurrentLocation() {
  if (!navigator.geolocation) {
    alert('Geolocation tidak didukung oleh browser ini')
    return
  }
  
  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      })
    })
    
    const lat = position.coords.latitude
    const lon = position.coords.longitude
    
    // Reverse geocoding to get address
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`
      )
      
      if (response.ok) {
        const result = await response.json()
        reportForm.value.location = result.display_name
        reportForm.value.latitude = lat
        reportForm.value.longitude = lon
        locationSearch.value = ''
        locationResults.value = []
      } else {
        // Fallback: just set coordinates
        reportForm.value.location = `Lokasi saat ini (${lat.toFixed(6)}, ${lon.toFixed(6)})`
        reportForm.value.latitude = lat
        reportForm.value.longitude = lon
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error)
      // Fallback: just set coordinates
      reportForm.value.location = `Lokasi saat ini (${lat.toFixed(6)}, ${lon.toFixed(6)})`
      reportForm.value.latitude = lat
      reportForm.value.longitude = lon
    }
  } catch (error) {
    console.error('Geolocation error:', error)
    if (error.code === 1) {
      alert('Akses lokasi ditolak. Silakan izinkan akses lokasi atau cari lokasi secara manual.')
    } else if (error.code === 2) {
      alert('Lokasi tidak dapat ditemukan. Silakan cari lokasi secara manual.')
    } else {
      alert('Terjadi kesalahan saat mengambil lokasi. Silakan cari lokasi secara manual.')
    }
  }
}

async function submitReportForm() {
  submittingReport.value = true
  try {
    const formData = new FormData()
    
    // Add form fields
    Object.keys(reportForm.value).forEach(key => {
      if (reportForm.value[key] !== null && reportForm.value[key] !== '') {
        formData.append(key, reportForm.value[key])
      }
    })
    
    // Add evidence files
    evidenceFiles.value.forEach(file => {
      formData.append('evidence_files', file)
    })
    
    const res = await submitReport(formData)
    if (res.error) {
      reportsError.value = res.error
    } else {
      closeReportForm()
      await refreshReports()
      updateServiceCounts()
    }
  } catch (e) {
    reportsError.value = String(e)
  } finally {
    submittingReport.value = false
  }
}

function viewReport(report) {
  selectedReport.value = report
  showReportDetail.value = true
}

function openStatusModal(report) {
  selectedReport.value = report
  showStatusModal.value = true
}

function closeReportDetail() {
  showReportDetail.value = false
  selectedReport.value = null
}

function closeStatusModal() {
  showStatusModal.value = false
  selectedReport.value = null
}

async function updateReportStatus(reportId, newStatus) {
  try {
    const res = await updateReportStatusAPI(reportId, newStatus)
    if (res.error) {
      reportsError.value = res.error
    } else {
      // Update local data
      const reportIndex = reports.value.findIndex(r => r.id === reportId)
      if (reportIndex !== -1) {
        reports.value[reportIndex].status = newStatus
        reports.value[reportIndex].updated_at = new Date().toISOString()
      }
      
      // Update selected report if it's the same
      if (selectedReport.value && selectedReport.value.id === reportId) {
        selectedReport.value.status = newStatus
        selectedReport.value.updated_at = new Date().toISOString()
      }
      
      closeStatusModal()
      updateServiceCounts()
    }
  } catch (e) {
    reportsError.value = String(e)
  }
}

function openReportMap(report) {
  if (report.latitude && report.longitude) {
    const lat = Number(report.latitude)
    const lon = Number(report.longitude)
    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      const delta = 0.01
      const bbox = [lon - delta, lat - delta, lon + delta, lat + delta].join('%2C')
      const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lon}`
      window.open(mapUrl.replace('export/embed.html?','?'), '_blank')
    }
  }
}

function downloadEvidence(filename) {
  // Create download link for evidence file
  const downloadUrl = `http://localhost:8003/uploads/${filename}`
  const link = document.createElement('a')
  link.href = downloadUrl
  link.download = filename
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

async function deleteReportItem(reportId) {
  if (!reportId) return
  reportsDeletingIds.value.add(reportId)
  try {
    const res = await deleteReport(reportId)
    if (res.error) reportsError.value = res.error
    await refreshReports()
    updateServiceCounts()
  } catch (e) {
    reportsError.value = String(e)
  } finally {
    reportsDeletingIds.value.delete(reportId)
  }
}

// Helper functions for report display
function getReportTypeLabel(type) {
  const labels = {
    'banjir': 'Banjir',
    'kebakaran': 'Kebakaran',
    'pohon_tumbang': 'Pohon Tumbang',
    'kecelakaan': 'Kecelakaan',
    'lainnya': 'Lainnya'
  }
  return labels[type] || type
}

function getUrgencyLabel(urgency) {
  const labels = {
    'rendah': 'Rendah',
    'sedang': 'Sedang',
    'tinggi': 'Tinggi',
    'darurat': 'Darurat'
  }
  return labels[urgency] || urgency
}

function getStatusLabel(status) {
  const labels = {
    'dilaporkan': 'Dilaporkan',
    'diproses': 'Diproses',
    'selesai': 'Selesai',
    'ditolak': 'Ditolak'
  }
  return labels[status] || status
}

function badgeForReportType(type) {
  const classes = {
    'banjir': 'badge siaga',
    'kebakaran': 'badge siaga',
    'pohon_tumbang': 'badge waspada',
    'kecelakaan': 'badge siaga',
    'lainnya': 'badge normal'
  }
  return classes[type] || 'badge normal'
}

function badgeForUrgency(urgency) {
  const classes = {
    'rendah': 'badge normal',
    'sedang': 'badge waspada',
    'tinggi': 'badge siaga',
    'darurat': 'badge siaga'
  }
  return classes[urgency] || 'badge normal'
}

function badgeForStatus(status) {
  const classes = {
    'dilaporkan': 'badge normal',
    'diproses': 'badge waspada',
    'selesai': 'badge normal',
    'ditolak': 'badge siaga'
  }
  return classes[status] || 'badge normal'
}

</script>

<style scoped>
/* Dashboard Layout */
.dashboard-layout {
  display: flex;
  min-height: 100vh;
  background: var(--logo-gray);
}

/* Sidebar */
.sidebar {
  width: 60px;
  background: #fff;
  border-right: 1px solid #e8edf5;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  box-shadow: 2px 0 8px rgba(0,0,0,0.1);
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  z-index: 1000;
}

.sidebar.collapsed {
  width: 60px;
}

.sidebar:not(.collapsed) {
  width: 240px;
}

.sidebar-header {
  padding: 16px 12px;
  border-bottom: 1px solid #e8edf5;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.sidebar-logo {
  height: 28px;
  flex-shrink: 0;
}

.sidebar-title {
  font-weight: 800;
  font-size: 1.1rem;
  color: #2f3b4e;
  white-space: nowrap;
  margin-left: 8px;
}

.sidebar-toggle {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  color: #6a7890;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: background 0.2s;
}

.sidebar-toggle:hover {
  background: #f1f4f9;
}

/* Sidebar Navigation */
.sidebar-nav {
  flex: 1;
  padding: 12px 0;
  overflow-y: auto;
}

.nav-section {
  margin-bottom: 16px;
}

.nav-section-title {
  padding: 0 12px 6px;
  font-size: 0.7rem;
  font-weight: 700;
  color: #6a7890;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.nav-items {
  display: flex;
  flex-direction: column;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: none;
  border: none;
  color: #6a7890;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  justify-content: center;
}

.sidebar:not(.collapsed) .nav-item {
  justify-content: flex-start;
  gap: 12px;
}

.nav-item:hover {
  background: #f8fafc;
  color: #3a4a62;
}

.nav-item.active {
  background: #e3f2fd;
  color: #1976d2;
}

.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: #1976d2;
}

.nav-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.nav-badge {
  margin-left: auto;
  background: #e3f2fd;
  color: #1976d2;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 16px;
  text-align: center;
}

/* User Section */
.user-section {
  border-bottom: 1px solid #e8edf5;
  padding-bottom: 16px;
  margin-bottom: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
}

.sidebar:not(.collapsed) .user-info {
  justify-content: flex-start;
  gap: 12px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.user-avatar-placeholder {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e3f2fd;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1976d2;
  font-weight: 700;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-weight: 600;
  color: #2f3b4e;
  font-size: 0.85rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 0.7rem;
  color: #6a7890;
  margin-top: 2px;
}

/* Sidebar Footer */
.sidebar-footer {
  padding: 20px 12px;
  border-top: 1px solid #e8edf5;
  margin-top: auto;
  margin-bottom: 20px;
}

.logout-btn {
  width: 100%;
  background: #dc3545;
  color: white;
  border: none;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 600;
  font-size: 0.9rem;
}

.logout-btn:hover:not(:disabled) {
  background: #c82333;
  transform: translateY(-1px);
}

.logout-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Main Content */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin-left: 60px;
  transition: margin-left 0.3s ease;
}

.sidebar:not(.collapsed) + .main-content {
  margin-left: 240px;
}

.content-body {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
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

/* Service Sections */
.service-section {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 14px rgba(58,74,98,.06);
  padding: 24px;
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
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

/* Cards and Grid */
.cards-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.cards-grid.sm { grid-template-columns: repeat(3, 1fr); }
.card { background: #f8fafc; border: 1px solid #e8edf5; border-radius: 12px; padding: 16px; }
.card.compact { padding: 12px; }
.card-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.title { font-weight: 700; color: #2f3b4e; }
.card-meta { color: #7b8aa3; font-size: 0.85rem; margin-bottom: 12px; }
.kv .row { display: flex; align-items: center; justify-content: space-between; padding: 6px 0; border-top: 1px dashed #eef2f7; }
.kv .row:first-child { border-top: none; }

/* Badges */
.badge { padding: 4px 10px; border-radius: 999px; font-size: 0.75rem; font-weight: 700; }
.badge.normal { background: #e9f7ef; color: #1d7a49; border: 1px solid #c6ebd5; }
.badge.waspada { background: #fff7e6; color: #a15c00; border: 1px solid #ffe0a3; }
.badge.siaga { background: #fff0f0; color: #b12b2b; border: 1px solid #ffd0d0; }

/* Buttons */
.btn-outline { border: 1px solid #d5dbe7; background: #fff; color: #3a4a62; padding: 8px 12px; border-radius: 8px; cursor: pointer; font-size: 0.9rem; }
.btn-outline:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-outline:hover:not(:disabled) { background: #f8fafc; border-color: #c1c9d2; }

/* Input */
.input { border: 1px solid #d5dbe7; padding: 8px 12px; border-radius: 8px; font-size: 0.9rem; background: #fff; }
.input:focus { outline: none; border-color: #1976d2; box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1); }

/* Loading and Error States */
.skeleton { background: linear-gradient(90deg, #f3f6fb 25%, #eef2f7 37%, #f3f6fb 63%); background-size: 400% 100%; animation: shimmer 1.4s ease infinite; }
@keyframes shimmer { 0% { background-position: 100% 0 } 100% { background-position: -100% 0 } }
.error-message { color: #e85c3a; background: #fff5f5; padding: 12px; border-radius: 8px; border: 1px solid #fed7d7; }

/* Map Container */
.map-container { 
  background: #fff; 
  border-radius: 12px; 
  overflow: hidden; 
  box-shadow: 0 2px 14px rgba(58,74,98,.06); 
  position: relative; 
  margin-bottom: 20px;
}

.map-container .map {
  height: 400px;
  width: 100%;
  border-radius: 12px;
  border: 1px solid #e8edf5;
}

/* Custom Water Icon */
.custom-water-icon {
  background: transparent !important;
  border: none !important;
}

/* Table */
.table-wrap { background: #fff; border: 1px solid #e8edf5; border-radius: 14px; overflow: auto; }
.table { width: 100%; border-collapse: separate; border-spacing: 0; }
.table thead th { position: sticky; top: 0; background: #f9fbff; color: #3a4a62; text-align: left; padding: 12px; font-weight: 700; border-bottom: 1px solid #e8edf5; }
.table tbody td { padding: 12px; border-bottom: 1px solid #f1f4f9; vertical-align: top; color: #2f3b4e; }
.table tbody tr:hover { background: #fcfdff; }
.col-msg { max-width: 520px; }

/* Modal */
.modal { 
  position: fixed; 
  inset: 0; 
  background: rgba(0,0,0,.35); 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  z-index: 1000; 
  padding: 20px;
}
.modal-content { 
  background: #fff; 
  border-radius: 14px; 
  padding: 16px; 
  width: min(900px, 92%); 
  box-shadow: 0 10px 30px rgba(0,0,0,.15); 
  max-height: 95vh;
  overflow-y: auto;
}
.modal-head { 
  display: flex; 
  align-items: center; 
  justify-content: space-between; 
  margin-bottom: 10px; 
  position: sticky;
  top: 0;
  background: #fff;
  z-index: 1001;
  padding-bottom: 10px;
  border-bottom: 1px solid #e8edf5;
}

/* Report Form */
.report-modal {
  z-index: 1000;
}

.report-form-container {
  max-height: 85vh;
  overflow-y: auto;
  padding: 0 4px;
}

.report-form { 
  max-height: none; 
  overflow-y: visible; 
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Form Sections */
.form-section {
  background: #f8fafc;
  border: 1px solid #e8edf5;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s ease;
}

.form-section:hover {
  border-color: #d1d9e6;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.section-title {
  margin: 0 0 16px 0;
  color: #2f3b4e;
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e8edf5;
}

/* Form Grid */
.form-grid { 
  display: grid; 
  grid-template-columns: 1fr 1fr; 
  gap: 16px; 
  margin-bottom: 0;
}

/* Form Groups */
.form-group { 
  margin-bottom: 16px; 
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label { 
  display: block; 
  margin-bottom: 8px; 
  font-weight: 600; 
  color: #2f3b4e; 
  font-size: 0.9rem;
}

.form-group textarea { 
  resize: vertical; 
  min-height: 100px; 
  line-height: 1.5;
}

/* File Upload */
.file-upload-area {
  position: relative;
  margin-bottom: 12px;
}

.file-input {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.file-upload-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  border: 2px dashed #d1d9e6;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.file-upload-label:hover {
  border-color: #1976d2;
  background: #f8fafc;
}

.file-upload-label svg {
  color: #6a7890;
  margin-bottom: 8px;
}

.file-upload-label span {
  font-weight: 500;
  color: #2f3b4e;
  margin-bottom: 4px;
}

.file-upload-label small {
  color: #6a7890;
  font-size: 0.8rem;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: #fff;
  border: 1px solid #e8edf5;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.file-item:hover {
  border-color: #d1d9e6;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.file-info svg {
  color: #6a7890;
  flex-shrink: 0;
}

.file-info span {
  color: #2f3b4e;
  font-weight: 500;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-info small {
  color: #6a7890;
  font-size: 0.8rem;
  flex-shrink: 0;
}

.btn-remove {
  background: #ff4757;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.btn-remove:hover {
  background: #ff3742;
  transform: scale(1.1);
}

/* Form Actions */
.form-actions { 
  display: flex; 
  gap: 12px; 
  justify-content: flex-end; 
  margin-top: 24px; 
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e8edf5;
}

/* Location Search */
.location-input-group { 
  display: flex; 
  gap: 8px; 
  align-items: center; 
}
.location-input-group .input { 
  flex: 1; 
}
.btn-location { 
  background: #1976d2; 
  color: white; 
  border: none; 
  padding: 8px 12px; 
  border-radius: 8px; 
  cursor: pointer; 
  transition: background 0.2s; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
}
.btn-location:hover { 
  background: #1565c0; 
}

.location-results { 
  margin-top: 8px; 
  border: 1px solid #e8edf5; 
  border-radius: 8px; 
  background: white; 
  box-shadow: 0 2px 8px rgba(0,0,0,0.1); 
  max-height: 200px; 
  overflow-y: auto; 
}
.location-result-item { 
  padding: 12px; 
  cursor: pointer; 
  border-bottom: 1px solid #f1f4f9; 
  transition: background 0.2s; 
}
.location-result-item:last-child { 
  border-bottom: none; 
}
.location-result-item:hover { 
  background: #f8fafc; 
}
.location-name { 
  font-weight: 600; 
  color: #2f3b4e; 
  font-size: 0.9rem; 
  margin-bottom: 4px; 
}
.location-coords { 
  color: #6a7890; 
  font-size: 0.8rem; 
}

.selected-location { 
  margin-top: 12px; 
  padding: 12px; 
  background: #f8fafc; 
  border: 1px solid #e8edf5; 
  border-radius: 8px; 
}
.location-display { 
  display: flex; 
  align-items: center; 
  justify-content: space-between; 
  margin-bottom: 6px; 
}
.btn-clear { 
  background: #dc3545; 
  color: white; 
  border: none; 
  border-radius: 50%; 
  width: 24px; 
  height: 24px; 
  cursor: pointer; 
  font-size: 14px; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
}
.coords-display { 
  color: #6a7890; 
  font-size: 0.8rem; 
  font-family: monospace; 
}

/* Report Detail Modal */
.report-detail {
  max-height: 80vh;
  overflow-y: auto;
}

.detail-header {
  border-bottom: 1px solid #e8edf5;
  padding-bottom: 16px;
  margin-bottom: 20px;
}

.detail-title h3 {
  margin: 0 0 12px 0;
  color: #2f3b4e;
  font-size: 1.3rem;
}

.detail-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.detail-meta {
  color: #6a7890;
  font-size: 0.9rem;
}

.detail-meta div {
  margin-bottom: 4px;
}

.detail-content {
  margin-bottom: 24px;
}

.detail-section {
  margin-bottom: 20px;
}

.detail-section h4 {
  margin: 0 0 8px 0;
  color: #2f3b4e;
  font-size: 1rem;
  font-weight: 600;
}

.detail-section p {
  margin: 0;
  color: #3a4a62;
  line-height: 1.5;
}

.reporter-info div {
  margin-bottom: 6px;
  color: #3a4a62;
}

.evidence-files {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.evidence-file {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #f8fafc;
  border: 1px solid #e8edf5;
  border-radius: 8px;
}

.detail-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid #e8edf5;
}

/* Status Update Modal */
.status-update {
  max-height: 70vh;
  overflow-y: auto;
}

.current-status {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e8edf5;
}

.current-status h4 {
  margin: 0 0 8px 0;
  color: #2f3b4e;
  font-size: 1rem;
}

.status-options h4 {
  margin: 0 0 16px 0;
  color: #2f3b4e;
  font-size: 1rem;
}

.status-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.status-option {
  background: #fff;
  border: 2px solid #e8edf5;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.status-option:hover:not(:disabled) {
  border-color: #1976d2;
  background: #f8fafc;
}

.status-option.active {
  border-color: #1976d2;
  background: #e3f2fd;
}

.status-option:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.status-icon {
  font-size: 1.5rem;
  margin-bottom: 8px;
}

.status-label {
  font-weight: 600;
  color: #2f3b4e;
  margin-bottom: 4px;
}

.status-desc {
  font-size: 0.8rem;
  color: #6a7890;
  line-height: 1.3;
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
  }
  
  .sidebar:not(.collapsed) {
    transform: translateX(0);
  }
  
  .main-content {
    margin-left: 0 !important;
  }
  
  .content-body {
    padding: 16px;
  }
  
  .cards-grid {
    grid-template-columns: 1fr;
  }
}
</style>
  