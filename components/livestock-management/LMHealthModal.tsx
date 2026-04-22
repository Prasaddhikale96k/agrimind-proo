'use client';

import { useState } from 'react';
import { LMLivestock, LMHealthRecord, LMHealthFormData } from '@/lib/livestock-management/lm.types';
import { addHealthRecord } from '@/lib/livestock-management/lm.service';

interface Props {
  userId: string;
  animal: LMLivestock;
  livestock: LMLivestock[];
  onClose: () => void;
  onSaved: (record: LMHealthRecord) => void;
}

export default function LMHealthModal({ userId, animal, onClose, onSaved }: Props) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState<LMHealthFormData>({
    livestock_id: animal.id,
    record_type: 'checkup',
    record_date: today,
    disease: '',
    treatment: '',
    medicine_used: '',
    medicine_cost: '',
    veterinarian: '',
    next_due_date: '',
    vaccination_type: '',
    notes: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (k: keyof LMHealthFormData, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try { const record = await addHealthRecord(userId, form); onSaved(record); }
    catch (err) { setError(err instanceof Error ? err.message : 'Error saving'); }
    finally { setIsLoading(false); }
  };

  const INPUT = `w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all`;
  const LABEL = 'block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 sticky top-0 bg-white">
          <div>
            <h3 className="font-bold text-gray-900">🏥 Health Record</h3>
            <p className="text-gray-500 text-xs mt-0.5">{animal.name} — {animal.type}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-all text-xl flex items-center justify-center">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">⚠️ {error}</div>}

          <div className="grid grid-cols-2 gap-4">
            <div><label className={LABEL}>Record Type</label>
              <select value={form.record_type} onChange={e => update('record_type', e.target.value as any)} className={INPUT}>
                <option value="checkup">🔍 Checkup</option>
                <option value="vaccination">💉 Vaccination</option>
                <option value="treatment">💊 Treatment</option>
                <option value="surgery">🏥 Surgery</option>
                <option value="deworming">🧪 Deworming</option>
              </select></div>
            <div><label className={LABEL}>Date</label>
              <input type="date" value={form.record_date} max={today} onChange={e => update('record_date', e.target.value)} className={INPUT} /></div>
          </div>

          {form.record_type === 'vaccination' && (
            <div><label className={LABEL}>Vaccination Type</label>
              <input type="text" value={form.vaccination_type} onChange={e => update('vaccination_type', e.target.value)} placeholder="e.g. FMD, Brucellosis" className={INPUT} /></div>
          )}

          {(form.record_type === 'treatment' || form.record_type === 'surgery') && (
            <div><label className={LABEL}>Disease / Condition</label>
              <input type="text" value={form.disease} onChange={e => update('disease', e.target.value)} placeholder="e.g. Mastitis, Bloat" className={INPUT} /></div>
          )}

          <div><label className={LABEL}>Treatment / Notes</label>
            <textarea value={form.treatment} rows={2} onChange={e => update('treatment', e.target.value)} placeholder="Describe the treatment or procedure..." className={`${INPUT} resize-none`} /></div>

          <div className="grid grid-cols-2 gap-4">
            <div><label className={LABEL}>Medicine Used</label>
              <input type="text" value={form.medicine_used} onChange={e => update('medicine_used', e.target.value)} placeholder="e.g. Penicillin" className={INPUT} /></div>
            <div><label className={LABEL}>Medicine Cost (₹)</label>
              <input type="number" value={form.medicine_cost} min="0" onChange={e => update('medicine_cost', e.target.value)} placeholder="500" className={INPUT} /></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div><label className={LABEL}>Veterinarian</label>
              <input type="text" value={form.veterinarian} onChange={e => update('veterinarian', e.target.value)} placeholder="Dr. Name" className={INPUT} /></div>
            <div><label className={LABEL}>Next Due Date</label>
              <input type="date" value={form.next_due_date} min={today} onChange={e => update('next_due_date', e.target.value)} className={INPUT} /></div>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-semibold text-sm transition-all">Cancel</button>
            <button type="submit" disabled={isLoading} className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {isLoading ? (<><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</>) : '✅ Save Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}