'use client';

import { useState } from 'react';
import { LMLivestock, LMTaskFormData } from '@/lib/livestock-management/lm.types';
import { addLMTask } from '@/lib/livestock-management/lm.service';
import { LM_TASK_TYPE_CONFIG, LM_PRIORITY_CONFIG } from '@/lib/livestock-management/lm.constants';

interface Props {
  userId: string;
  livestock: LMLivestock[];
  onClose: () => void;
  onSaved: (task: any) => void;
}

const INPUT = `w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all`;
const LABEL = `block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider`;

const DEFAULT_FORM: LMTaskFormData = {
  livestock_id: '',
  task_title: '',
  task_type: 'general',
  priority: 'medium',
  due_date: new Date().toISOString().split('T')[0],
  due_time: '',
  notes: '',
};

export default function LMTaskModal({ userId, livestock, onClose, onSaved }: Props) {
  const [form, setForm] = useState<LMTaskFormData>(DEFAULT_FORM);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (k: keyof LMTaskFormData, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.task_title.trim()) { setError('Task title is required'); return; }
    if (!form.due_date) { setError('Due date is required'); return; }
    setIsLoading(true);
    setError(null);
    try { const task = await addLMTask(userId, form); onSaved(task); }
    catch (err) { setError(err instanceof Error ? err.message : 'Error saving task'); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">📋 Add New Task</h3>
            <p className="text-gray-500 text-xs mt-0.5">Create a farm task or reminder</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-all flex items-center justify-center text-xl">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">⚠️ {error}</div>}
 
          <div>
            <label className={LABEL}>Task Title <span className="text-red-500">*</span></label>
            <input type="text" value={form.task_title} onChange={e => update('task_title', e.target.value)} placeholder="e.g. Morning milking, Vaccination, Feed cattle" className={INPUT} required autoFocus />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Task Type</label>
              <select value={form.task_type} onChange={e => update('task_type', e.target.value)} className={INPUT}>
                {Object.entries(LM_TASK_TYPE_CONFIG).map(([key, val]) => (<option key={key} value={key}>{val.emoji} {val.label}</option>))}
              </select>
            </div>
            <div>
              <label className={LABEL}>Priority</label>
              <select value={form.priority} onChange={e => update('priority', e.target.value)} className={INPUT}>
                <option value="urgent">🔴 Urgent</option>
                <option value="high">🟠 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Due Date <span className="text-red-500">*</span></label>
              <input type="date" value={form.due_date} onChange={e => update('due_date', e.target.value)} className={INPUT} required />
            </div>
            <div>
              <label className={LABEL}>Due Time</label>
              <input type="time" value={form.due_time} onChange={e => update('due_time', e.target.value)} className={INPUT} />
            </div>
          </div>

          <div>
            <label className={LABEL}>Link to Animal (optional)</label>
            <select value={form.livestock_id} onChange={e => update('livestock_id', e.target.value)} className={INPUT}>
              <option value="">🐾 No specific animal</option>
              {livestock.map(animal => (<option key={animal.id} value={animal.id}>{animal.name} ({animal.type})</option>))}
            </select>
          </div>

          <div>
            <label className={LABEL}>Notes (optional)</label>
            <textarea value={form.notes} onChange={e => update('notes', e.target.value)} placeholder="Additional details..." rows={3} className={`${INPUT} resize-none`} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-semibold text-sm transition-all">Cancel</button>
            <button type="submit" disabled={isLoading} className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {isLoading ? (<><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</>) : '✅ Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}