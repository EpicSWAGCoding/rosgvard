import React, { useEffect, useState } from 'react';
import { getShiftsAdmin, createShift, updateShift, deleteShift } from '../api';

export default function AdminShifts({ token }: { token: string }) {
  const [shifts, setShifts] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);

  const load = async () => {
    const data = await getShiftsAdmin(token);
    setShifts(Array.isArray(data) ? data : []);
  };

  useEffect(() => { load(); }, [token]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);
    const payload: any = {
      title: fd.get('title'),
      type: fd.get('type'),
      location: fd.get('location'),
      start_at: fd.get('start_at'),
      end_at: fd.get('end_at'),
    };
    if (editing) await updateShift(token, editing.id, payload);
    else await createShift(token, payload);
    setEditing(null);
    form.reset();
    await load();
  };

  const startEdit = (s: any) => {
    setEditing(s);
    // scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (id: string) => { if (!confirm('Удалить смену?')) return; await deleteShift(token, id); await load(); };

  return (
    <div>
      <div className="bg-white p-4 rounded-md shadow-sm mb-4">
        <h3 className="font-medium mb-2">{editing ? 'Редактировать смену' : 'Создать смену'}</h3>
        <form onSubmit={submit} className="grid grid-cols-2 gap-3">
          <input name="title" defaultValue={editing?.title || ''} placeholder="Название" className="col-span-2 rounded-md border px-2 py-2" />
          <select name="type" defaultValue={editing?.type || 'naryad'} className="rounded-md border px-2 py-2">
            <option value="naryad">Наряд</option>
            <option value="patrol">Патруль</option>
            <option value="duty">Дежурство</option>
            <option value="training">Тренировка</option>
            <option value="other">Другое</option>
          </select>
          <input name="location" defaultValue={editing?.location || ''} placeholder="Место" className="rounded-md border px-2 py-2" />
          <label className="col-span-1 text-sm">Начало
            <input name="start_at" defaultValue={editing ? new Date(editing.startAt).toISOString().slice(0,16) : ''} type="datetime-local" className="block rounded-md border w-full" />
          </label>
          <label className="col-span-1 text-sm">Конец
            <input name="end_at" defaultValue={editing ? new Date(editing.endAt).toISOString().slice(0,16) : ''} type="datetime-local" className="block rounded-md border w-full" />
          </label>
          <div className="col-span-2 flex gap-2">
            <button className="px-3 py-2 bg-teal-600 text-white rounded-md">{editing ? 'Сохранить' : 'Создать'}</button>
            {editing && <button type="button" onClick={() => setEditing(null)} className="px-3 py-2 bg-slate-200 rounded-md">Отменить</button>}
          </div>
        </form>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">Список смен</h3>
        <div className="space-y-2">
          {shifts.map((s) => (
            <div key={s.id} className="bg-white p-3 rounded-md shadow-sm flex justify-between items-center">
              <div>
                <div className="font-medium">{s.title}</div>
                <div className="text-sm text-slate-500">{new Date(s.startAt).toLocaleString()} — {new Date(s.endAt).toLocaleString()}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(s)} className="px-3 py-1 bg-slate-100 rounded-md">Ред.</button>
                <button onClick={() => remove(s.id)} className="px-3 py-1 bg-red-50 text-red-600 rounded-md">Удалить</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
