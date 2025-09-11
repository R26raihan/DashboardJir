export async function fetchCrowdHistory() {
  try {
    const response = await fetch('http://127.0.0.1:8000/crowd/history');
    if (!response.ok) throw new Error('Gagal mengambil data');
    const data = await response.json();
    return { data: data.history };
  } catch (error) {
    return { error: error.message };
  }
}

export async function fetchMobilityData() {
  try {
    const response = await fetch('http://127.0.0.1:8002/mobility?limit=100');
    if (!response.ok) throw new Error('Gagal mengambil data mobility');
    const json = await response.json();
    // Backend shape: { status: 'success', data: [...], count: N }
    return { data: json.data || [], count: json.count ?? (Array.isArray(json.data) ? json.data.length : 0) };
  } catch (error) {
    return { error: error.message };
  }
}

// Banjir: Pintu Air dari XML → JSON
export async function fetchPintuAirXml() {
  try {
    const response = await fetch('http://127.0.0.1:8001/pintu-air/xml');
    if (!response.ok) throw new Error('Gagal mengambil data pintu air');
    const json = await response.json();
    return { data: json.data || [], count: json.count ?? 0 };
  } catch (error) {
    return { error: error.message };
  }
}

// Banjir: RT terdampak (ambil dari DB jika ada, fallback ke scrape)
export async function fetchRtTerdampak() {
  try {
    let response = await fetch('http://127.0.0.1:8001/rt-terdampak/db');
    if (!response.ok) {
      // fallback ke scrape langsung
      response = await fetch('http://127.0.0.1:8001/rt-terdampak');
    }
    if (!response.ok) throw new Error('Gagal mengambil data RT terdampak');
    const json = await response.json();
    // shape db: { status:'success', data:[...] }
    return { data: json.data || [], count: json.count ?? (Array.isArray(json.data) ? json.data.length : 0) };
  } catch (error) {
    return { error: error.message };
  }
}
