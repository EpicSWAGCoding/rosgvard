import React, { useState } from 'react';
import Login from './pages/Login';
import MySchedule from './pages/MySchedule';
import Layout from './components/Layout';
import AdminDashboard from './pages/AdminDashboard';
import AdminShifts from './pages/AdminShifts';
import Users from './pages/Users';
import { decodeJwt } from './utils/jwtDecode';

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('accessToken'));
  const [page, setPage] = useState<string>('schedule');

  if (!token) return <Login onLogin={(t) => { localStorage.setItem('accessToken', t); setToken(t); }} />;

  const payload = decodeJwt(token);
  const role = payload?.role || null;

  const handleLogout = () => { localStorage.removeItem('accessToken'); setToken(null); };

  return (
    <Layout title={payload?.fullName || ''} onLogout={handleLogout} role={role} setPage={setPage}>
      {page === 'schedule' && <MySchedule token={token} onLogout={handleLogout} />}
      {page === 'admin' && role === 'admin' && <AdminDashboard setPage={setPage} />}
      {page === 'admin-shifts' && role === 'admin' && <AdminShifts token={token} />}
      {page === 'users' && role === 'admin' && <Users token={token} />}
    </Layout>
  );
}
