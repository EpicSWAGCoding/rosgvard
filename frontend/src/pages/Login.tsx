import React, { useState } from 'react';
import { login } from '../api';

export default function Login({ onLogin }: { onLogin: (token: string) => void }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await login(phone, password);
    if (res.accessToken) onLogin(res.accessToken);
    else setError(res.error || 'Login failed');
  };

  return (
    <div className="page">
      <div className="max-w-md mx-auto bg-white shadow-md rounded-md p-6">
        <h1 className="text-2xl font-semibold mb-4">Вход</h1>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Телефон</label>
            <input className="mt-1 block w-full rounded-md border-slate-300 shadow-sm" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Пароль</label>
            <input type="password" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="flex items-center justify-between">
            <button type="submit" className="px-4 py-2 bg-teal-600 text-white rounded-md">Войти</button>
          </div>
          {error && <div className="text-red-600">{error}</div>}
        </form>
      </div>
    </div>
  );
}
