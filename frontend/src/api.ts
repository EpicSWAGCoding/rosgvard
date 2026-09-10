// In production we want relative API paths so nginx proxy handles /api/*
export const apiBase = import.meta.env.VITE_API_BASE ?? '';

export async function login(phone: string, password: string) {
  const res = await fetch(`${apiBase}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, password }),
  });
  return res.json();
}

export async function getMyShifts(token: string) {
  const res = await fetch(`${apiBase}/api/shifts/my`, { headers: { Authorization: `Bearer ${token}` } });
  return res.json();
}

export async function getVapidPublicKey() {
  const res = await fetch(`${apiBase}/api/push/vapid-key`);
  return res.json();
}

export async function subscribePush(token: string, subscription: any) {
  return fetch(`${apiBase}/api/push/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ endpoint: subscription.endpoint, keys: subscription.keys }),
  });
}

export async function getShiftsAdmin(token: string, params = '') {
  const res = await fetch(`${apiBase}/api/shifts${params}`, { headers: { Authorization: `Bearer ${token}` } });
  return res.json();
}

export async function createShift(token: string, payload: any) {
  const res = await fetch(`${apiBase}/api/shifts`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
  return res.json();
}

export async function updateShift(token: string, id: string, payload: any) {
  const res = await fetch(`${apiBase}/api/shifts/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
  return res.json();
}

export async function deleteShift(token: string, id: string) {
  const res = await fetch(`${apiBase}/api/shifts/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
  return res.json();
}
