'use client';

import { useState, useEffect } from 'react';
import { LMLivestock, LMLivestockFormData } from '@/lib/livestock-management/lm.types';
import { addLivestock, updateLivestock } from '@/lib/livestock-management/lm.service';
import { LM_ANIMAL_TYPES } from '@/lib/livestock-management/lm.constants';

interface Props {
  userId: string;
  animal?: LMLivestock | null;
  onClose: () => void;
  onSaved: (animal: LMLivestock) => void;
}

const DEFAULT_FORM: LMLivestockFormData = {
  name: '', type: 'cow', breed: '', age: '', weight: '',
  milk_capacity: '', health_status: 'healthy', status: 'active',
  purchase_date: '', purchase_price: '', tag_number: '',
  location: '', notes: '',
};

const INPUT_CLASS = `w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all`;
const LABEL_CLASS = 'block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider';

export default function LMAddEditModal({ userId, animal, onClose, onSaved }: Props) {
  const [form, setForm] = useState<LMLivestockFormData>(DEFAULT_FORM);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (animal) {
      setForm({
        name: animal.name,
        type: animal.type,
        breed: animal.breed || '',
        age: animal.age?.toString() || '',
        weight: animal.weight?.toString() || '',
        milk_capacity: animal.milk_capacity?.toString() || '',
        health_status: animal.health_status,
        status: animal.status,
        purchase_date: animal.purchase_date || '',
        purchase_price: animal.purchase_price?.toString() || '',
        tag_number: animal.tag_number || '',
        location: animal.location || '',
        notes: animal.notes || '',
      });
    }
  }, [animal]);

  const update = (key: keyof LMLivestockFormData, val: string) => setForm(p => ({ ...p, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Name is required'); return; }
    setIsLoading(true);
    setError(null);
    try {
      let result: LMLivestock;
      if (animal) { result = await updateLivestock(animal.id, form); }
      else { result = await addLivestock(userId, form); }
      onSaved(result);
    } catch (err) { setError(err instanceof Error ? err.message : 'Error saving'); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div>
            <h2 className="font-bold text-gray-900 text-xl">{animal ? '✏️ Edit Animal' : '➕ Add New Animal'}</h2>
            <p className="text-gray-500 text-sm mt-0.5">{animal ? `Updating record for ${animal.name}` : 'Register a new animal in your herd'}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-all flex items-center justify-center text-xl">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">⚠️ {error}</div>}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL_CLASS}>Name <span className="text-red-500">*</span></label>
              <input type="text" value={form.name} onChange={e => update('name', e.target.value)} placeholder="e.g. Lakshmi" className={INPUT_CLASS} required />
            </div>
            <div>
              <label className={LABEL_CLASS}>Tag Number</label>
              <input type="text" value={form.tag_number} onChange={e => update('tag_number', e.target.value)} placeholder="e.g. TAG-001" className={INPUT_CLASS} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL_CLASS}>Animal Type</label>
              <select value={form.type} onChange={e => update('type', e.target.value)} className={INPUT_CLASS}>
                {LM_ANIMAL_TYPES.map(t => (<option key={t.value} value={t.value}>{t.emoji} {t.label}</option>))}
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS}>Breed</label>
              <input type="text" value={form.breed} onChange={e => update('breed', e.target.value)} placeholder="e.g. Holstein, Murrah" className={INPUT_CLASS} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={LABEL_CLASS}>Age (years)</label>
              <input type="number" value={form.age} step="0.1" min="0" onChange={e => update('age', e.target.value)} placeholder="3.5" className={INPUT_CLASS} />
            </div>
            <div>
              <label className={LABEL_CLASS}>Weight (kg)</label>
              <input type="number" value={form.weight} min="0" onChange={e => update('weight', e.target.value)} placeholder="400" className={INPUT_CLASS} />
            </div>
            <div>
              <label className={LABEL_CLASS}>Milk Cap. (L/day)</label>
              <input type="number" value={form.milk_capacity} step="0.1" min="0" onChange={e => update('milk_capacity', e.target.value)} placeholder="15" className={INPUT_CLASS} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL_CLASS}>Health Status</label>
              <select value={form.health_status} onChange={e => update('health_status', e.target.value as any)} className={INPUT_CLASS}>
                <option value="healthy">✅ Healthy</option>
                <option value="sick">🚨 Sick</option>
                <option value="recovering">🔄 Recovering</option>
                <option value="critical">⛔ Critical</option>
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS}>Animal Status</label>
              <select value={form.status} onChange={e => update('status', e.target.value as any)} className={INPUT_CLASS}>
                <option value="active">🟢 Active</option>
                <option value="sick">🔴 Sick</option>
                <option value="pregnant">🐣 Pregnant</option>
                <option value="sold">💰 Sold</option>
                <option value="deceased">⚫ Deceased</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL_CLASS}>Purchase Date</label>
              <input type="date" value={form.purchase_date} onChange={e => update('purchase_date', e.target.value)} className={INPUT_CLASS} />
            </div>
            <div>
              <label className={LABEL_CLASS}>Purchase Price (₹)</label>
              <input type="number" value={form.purchase_price} min="0" onChange={e => update('purchase_price', e.target.value)} placeholder="25000" className={INPUT_CLASS} />
            </div>
          </div>

          <div>
            <label className={LABEL_CLASS}>Location / Pen</label>
            <input type="text" value={form.location} onChange={e => update('location', e.target.value)} placeholder="e.g. Barn A, Pen 3" className={INPUT_CLASS} />
          </div>

          <div>
            <label className={LABEL_CLASS}>Notes</label>
            <textarea value={form.notes} rows={3} onChange={e => update('notes', e.target.value)} placeholder="Additional information..." className={`${INPUT_CLASS} resize-none`} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-semibold transition-all text-sm">Cancel</button>
            <button type="submit" disabled={isLoading} className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all text-sm disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm">
              {isLoading ? (<><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</>) : (animal ? '✅ Update Animal' : '➕ Add Animal')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}