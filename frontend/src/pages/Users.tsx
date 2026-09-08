import React, { useEffect, useState } from 'react';
import { apiBase } from '../api';

export default function Users({ token }: { token: string }) {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const res = await fetch(`${apiBase}/api/users`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    })();
  }, [token]);

  return (
    <div>
      <h2 className="text-lg font-medium mb-4">Личный состав</h2>
      <div className="overflow-x-auto bg-white rounded-md shadow-sm">
        <table className="min-w-full divide-y">
          <thead className="bg-slate-50 text-left text-sm text-slate-600">
            <tr>
              <th className="px-4 py-2">ФИО</th>
              <th className="px-4 py-2">Телефон</th>
              <th className="px-4 py-2">Роль</th>
              <th className="px-4 py-2">Отделение</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {users.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="px-4 py-2">{u.fullName}</td>
                <td className="px-4 py-2">{u.phone}</td>
                <td className="px-4 py-2">{u.role}</td>
                <td className="px-4 py-2">{u.squadId || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
