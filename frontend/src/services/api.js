const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export async function checkHealth() {
  const res = await fetch(`${API_BASE}/api/health`);

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export async function checkCloudinaryStatus() {
  const res = await fetch(`${API_BASE}/api/cloudinary/status`);

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText}`);
  }

  return res.json();
}
export async function analyzeImage(publicId) {
  const res = await fetch(`${API_BASE}/api/analysis/image`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ publicId }),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText}`);
  }

  return res.json();
}
