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
    const response = await fetch('http://127.0.0.1:8001/mobility');
    if (!response.ok) throw new Error('Gagal mengambil data mobility');
    const data = await response.json();
    return { data };
  } catch (error) {
    return { error: error.message };
  }
}
