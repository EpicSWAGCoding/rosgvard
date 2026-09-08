import React from 'react';

export default function Layout({ title, children, onLogout, role, setPage }: { title?: string; children: React.ReactNode; onLogout: () => void; role?: string | null; setPage: (p: string) => void }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-teal-600 font-bold">Rosgvard</div>
            <nav className="space-x-2 text-sm text-slate-600">
              <button onClick={() => setPage('schedule')} className="hover:underline">Моё расписание</button>
              {role === 'squad_lead' && <button onClick={() => setPage('my-squad')} className="hover:underline">Моё отделение</button>}
              {role === 'admin' && <button onClick={() => setPage('admin')} className="hover:underline">Админ</button>}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">{title}</span>
            <button onClick={onLogout} className="text-sm text-slate-700 bg-slate-100 px-3 py-1 rounded-md">Выйти</button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4">{children}</main>
    </div>
  );
}
