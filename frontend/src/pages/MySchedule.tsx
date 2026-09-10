import React, { useEffect, useState } from 'react';
import { getMyShifts, getVapidPublicKey, subscribePush } from '../api';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function MySchedule({ token, onLogout }: { token: string; onLogout: () => void }) {
  const [shifts, setShifts] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const data = await getMyShifts(token);
      // Defensive: ensure we always set an array to avoid crashing on .map
      setShifts(Array.isArray(data) ? data : []);
    })();
  }, [token]);

  const registerPush = async () => {
    try {
      const vapid = await getVapidPublicKey();
      if (!('serviceWorker' in navigator)) return alert('Service Worker not supported');
      const reg = await navigator.serviceWorker.register('/sw.js');
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapid.publicKey),
      });
      await subscribePush(token, sub);
      alert('Subscribed to push');
    } catch (e) {
      console.error(e);
      alert('Push subscription failed');
    }
  };

  return (
    <div className="page">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Моё расписание</h1>
        <div>
          <button className="mr-2 px-3 py-2 bg-slate-200 rounded-md" onClick={onLogout}>Выйти</button>
          <button className="px-3 py-2 bg-teal-600 text-white rounded-md" onClick={registerPush}>Подписаться на push</button>
        </div>
      </div>

      <div className="space-y-3">
        {shifts.length === 0 && <div className="text-slate-500">Нет назначенных смен.</div>}
        {shifts.map((a) => (
          <div key={a.id} className="bg-white p-4 rounded-md shadow-sm">
            <div className="font-medium">{a.shift?.title}</div>
            <div className="text-sm text-slate-500">{new Date(a.shift?.startAt).toLocaleString()} — {new Date(a.shift?.endAt).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
