export async function fetchCrowdHistory() {
  try {
    const response = await fetch('http://127.0.0.1:8001/crowd/history');
    if (!response.ok) throw new Error('Gagal mengambil data');
    const data = await response.json();
    return { data: data.history };
  } catch (error) {
    return { error: error.message };
  }
}

export async function fetchPintuAirXml() {
  try {
    const response = await fetch('http://127.0.0.1:8002/pintu-air/xml');
    if (!response.ok) throw new Error('Gagal mengambil data pintu air');
    const json = await response.json();
    return { data: json.data || [], count: json.count ?? 0 };
  } catch (error) {
    return { error: error.message };
  }
}

export async function fetchRtTerdampak() {
  try {
    let response = await fetch('http://127.0.0.1:8002/rt-terdampak/db');
    if (!response.ok) {
      response = await fetch('http://127.0.0.1:8002/rt-terdampak');
    }
    if (!response.ok) throw new Error('Gagal mengambil data RT terdampak');
    const json = await response.json();
    return { data: json.data || [], count: json.count ?? (Array.isArray(json.data) ? json.data.length : 0) };
  } catch (error) {
    return { error: error.message };
  }
}

// OCR CRUD (report service on 8003)
export async function fetchOcrResults(limit = null, lokasi = '') {
  try {
    const url = new URL('http://127.0.0.1:8003/ocr/results');
    if (limit) url.searchParams.set('limit', String(limit));
    if (lokasi) url.searchParams.set('lokasi', lokasi);
    const response = await fetch(url.toString());
    if (!response.ok) throw new Error('Gagal mengambil data OCR');
    const json = await response.json();
    // API returns { status, count, data }
    return { data: json.data || [], count: json.count ?? (Array.isArray(json.data) ? json.data.length : 0) };
  } catch (error) {
    return { error: error.message };
  }
}

export async function uploadOcrFile(file) {
  try {
    const form = new FormData();
    form.append('file', file);
    const response = await fetch('http://127.0.0.1:8003/ocr', {
      method: 'POST',
      body: form,
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || 'Gagal upload OCR');
    }
    const json = await response.json();
    return { data: json };
  } catch (error) {
    return { error: error.message };
  }
}

export async function deleteOcrResult(id) {
  try {
    const response = await fetch(`http://127.0.0.1:8003/ocr/results/${id}`, { method: 'DELETE' });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || 'Gagal menghapus OCR');
    }
    const json = await response.json();
    return { data: json };
  } catch (error) {
    return { error: error.message };
  }
}

// User Mobility CRUD (mobility service on 8004)
export async function fetchMobilityData(limit = null) {
  try {
    const url = limit ? `http://127.0.0.1:8004/mobility?limit=${limit}` : 'http://127.0.0.1:8004/mobility';
    const response = await fetch(url);
    if (!response.ok) throw new Error('Gagal mengambil data mobilitas');
    const json = await response.json();
    return { data: json.data || [], count: json.count ?? (Array.isArray(json.data) ? json.data.length : 0) };
  } catch (error) {
    return { error: error.message };
  }
}

export async function fetchUsers() {
  try {
    const response = await fetch('http://127.0.0.1:8004/users');
    if (!response.ok) throw new Error('Gagal mengambil data users');
    const json = await response.json();
    return { data: json.data || [], count: json.count ?? (Array.isArray(json.data) ? json.data.length : 0) };
  } catch (error) {
    return { error: error.message };
  }
}

export async function fetchMobilityByUser(userId) {
  try {
    const response = await fetch(`http://127.0.0.1:8004/mobility/${userId}`);
    if (!response.ok) throw new Error('Gagal mengambil data mobilitas user');
    const json = await response.json();
    return { data: json.data || [], count: json.count ?? (Array.isArray(json.data) ? json.data.length : 0) };
  } catch (error) {
    return { error: error.message };
  }
}

// Report Functions (report service on 8003)
export async function fetchReports(limit = null, reportType = '', status = '', urgency = '') {
  try {
    const url = new URL('http://127.0.0.1:8003/reports');
    if (limit) url.searchParams.set('limit', String(limit));
    if (reportType) url.searchParams.set('report_type', reportType);
    if (status) url.searchParams.set('status', status);
    if (urgency) url.searchParams.set('urgency', urgency);
    
    const response = await fetch(url.toString());
    if (!response.ok) throw new Error('Gagal mengambil data laporan');
    const json = await response.json();
    return { data: json.data || [], count: json.count ?? (Array.isArray(json.data) ? json.data.length : 0) };
  } catch (error) {
    return { error: error.message };
  }
}

export async function submitReport(formData) {
  try {
    const response = await fetch('http://127.0.0.1:8003/reports', {
      method: 'POST',
      body: formData
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || 'Gagal mengirim laporan');
    }
    const json = await response.json();
    return { data: json };
  } catch (error) {
    return { error: error.message };
  }
}

export async function getReport(reportId) {
  try {
    const response = await fetch(`http://127.0.0.1:8003/reports/${reportId}`);
    if (!response.ok) throw new Error('Gagal mengambil detail laporan');
    const json = await response.json();
    return { data: json };
  } catch (error) {
    return { error: error.message };
  }
}

export async function updateReportStatus(reportId, status) {
  try {
    const formData = new FormData();
    formData.append('status', status);
    
    const response = await fetch(`http://127.0.0.1:8003/reports/${reportId}/status`, {
      method: 'PATCH',
      body: formData
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || 'Gagal mengupdate status laporan');
    }
    const json = await response.json();
    return { data: json };
  } catch (error) {
    return { error: error.message };
  }
}

export async function deleteReport(reportId) {
  try {
    const response = await fetch(`http://127.0.0.1:8003/reports/${reportId}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || 'Gagal menghapus laporan');
    }
    const json = await response.json();
    return { data: json };
  } catch (error) {
    return { error: error.message };
  }
}