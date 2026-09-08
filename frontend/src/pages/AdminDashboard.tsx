import React from 'react';

export default function AdminDashboard({ setPage }: { setPage: (p: string) => void }) {
  return (
    <div>
      <h2 className="text-lg font-medium mb-4">Админ — панель</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-md shadow-sm">
          <div className="font-medium mb-2">Управление сменами</div>
          <div className="text-sm text-slate-500 mb-3">Создание и редактирование расписания.</div>
          <button onClick={() => setPage('admin-shifts')} className="px-3 py-2 bg-teal-600 text-white rounded-md">Открыть</button>
        </div>
        <div className="bg-white p-4 rounded-md shadow-sm">Статусы ознакомления — список</div>
        <div className="bg-white p-4 rounded-md shadow-sm">Отчёты / Экспорт</div>
        <div className="bg-white p-4 rounded-md shadow-sm">Настройки уведомлений</div>
      </div>
    </div>
  );
}
