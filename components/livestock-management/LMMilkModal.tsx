'use client';

import { useState } from 'react';
import { LMLivestock, LMMilkRecord, LMMilkFormData } from '@/lib/livestock-management/lm.types';
import { addMilkRecord } from '@/lib/livestock-management/lm.service';

interface Props {
  userId: string;
  animal: LMLivestock;
  livestock: LMLivestock[];
  onClose: () => void;
  onSaved: (record: LMMilkRecord) => void;
}

export default function LMMilkModal({ userId, animal, onClose, onSaved }: Props) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState<LMMilkFormData>({
    livestock_id: animal.id,
    record_date: today,
    morning_qty: '',
    evening_qty: '',
    quality_grade: 'A',
    notes: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (k: keyof LMMilkFormData, v: string) => setForm(p => ({ ...p, [k]: v }));
  const total = (parseFloat(form.morning_qty) || 0) + (parseFloat(form.evening_qty) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (total <= 0) { setError('Enter at least one quantity'); return; }
    setIsLoading(true);
    setError(null);
    try { const record = await addMilkRecord(userId, form); onSaved(record); }
    catch (err) { setError(err instanceof Error ? err.message : 'Error saving'); }
    finally { setIsLoading(false); }
  };

  const INPUT = `w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all`;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <div>
            <h3 className="font-bold text-gray-900">🥛 Add Milk Entry</h3>
            <p className="text-gray-500 text-xs mt-0.5">{animal.name} — {animal.type}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-all text-xl flex items-center justify-center">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">⚠️ {error}</div>}

          <div><label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Date</label>
            <input type="date" value={form.record_date} max={today} onChange={e => update('record_date', e.target.value)} className={INPUT} /></div>

          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Morning (L)</label>
              <input type="number" value={form.morning_qty} step="0.1" min="0" onChange={e => update('morning_qty', e.target.value)} placeholder="0.0" className={INPUT} /></div>
            <div><label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Evening (L)</label>
              <input type="number" value={form.evening_qty} step="0.1" min="0" onChange={e => update('evening_qty', e.target.value)} placeholder="0.0" className={INPUT} /></div>
          </div>

          {total > 0 && (
            <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-cyan-700">{total.toFixed(1)}L</div>
              <div className="text-gray-500 text-xs mt-0.5">Total Today</div>
            </div>
          )}

          <div><label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Quality Grade</label>
            <select value={form.quality_grade} onChange={e => update('quality_grade', e.target.value as any)} className={INPUT}>
              <option value="A">Grade A (Premium)</option>
              <option value="B">Grade B (Standard)</option>
              <option value="C">Grade C (Low)</option>
            </select></div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-semibold text-sm transition-all">Cancel</button>
            <button type="submit" disabled={isLoading} className="flex-1 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {isLoading ? (<><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</>) : '✅ Save Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}