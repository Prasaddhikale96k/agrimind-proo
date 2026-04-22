'use client';

import { useState } from 'react';
import { LMTask } from '@/lib/livestock-management/lm.types';
import { updateLMTaskStatus } from '@/lib/livestock-management/lm.service';
import { LM_PRIORITY_CONFIG, LM_TASK_TYPE_CONFIG } from '@/lib/livestock-management/lm.constants';
import { formatLMDate, isOverdue } from '@/lib/livestock-management/lm.helpers';

interface Props {
  tasks: LMTask[];
  onTaskUpdated: (id: string, status: string) => void;
  onAddTask: () => void;
}

export default function LMTaskBoard({ tasks, onTaskUpdated, onAddTask }: Props) {
  const [activeTab, setActiveTab] = useState<'pending' | 'in_progress' | 'completed'>('pending');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filtered = tasks.filter(t => t.status === activeTab);
  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const overdueCount = tasks.filter(t => t.status === 'pending' && isOverdue(t.due_date)).length;

  const handleStatusChange = async (task: LMTask, newStatus: string) => {
    setUpdatingId(task.id);
    try {
      await updateLMTaskStatus(task.id, newStatus);
      onTaskUpdated(task.id, newStatus);
    } catch (err) {
      alert('Failed to update task status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
      <div className="flex items-center justify-between p-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center">
            <span className="text-xl">📋</span>
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Farm Task Board</h3>
            <p className="text-xs text-gray-500">
              {pendingCount} pending
              {overdueCount > 0 && <span className="text-red-600 font-semibold ml-1">· {overdueCount} overdue</span>}
            </p>
          </div>
        </div>
        <button onClick={onAddTask} className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors flex items-center gap-1.5">
          + Add Task
        </button>
      </div>

      <div className="flex border-b border-gray-100">
        {(['pending', 'in_progress', 'completed'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-3 text-sm font-semibold transition-all capitalize ${activeTab === tab ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50' : 'text-gray-500 hover:text-gray-700'}`}>
            {tab.replace('_', ' ')}
            <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>
              {tasks.filter(t => t.status === tab).length}
            </span>
          </button>
        ))}
      </div>

      <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <div className="text-3xl mb-2">✅</div>
            <p className="text-sm">No {activeTab.replace('_', ' ')} tasks</p>
          </div>
        ) : (
          filtered.map(task => {
            const priority = LM_PRIORITY_CONFIG[task.priority];
            const taskType = LM_TASK_TYPE_CONFIG[task.task_type];
            const overdue = isOverdue(task.due_date) && task.status !== 'completed';

            return (
              <div key={task.id} className={`rounded-xl border p-4 transition-all ${overdue ? 'border-red-200 bg-red-50' : 'border-gray-100 bg-gray-50 hover:bg-gray-100'}`}>
                <div className="flex items-start gap-3">
                  {task.status !== 'completed' && (
                    <button disabled={!!updatingId} onClick={() => handleStatusChange(task, task.status === 'pending' ? 'in_progress' : 'completed')} className="w-5 h-5 mt-0.5 rounded border-2 border-gray-300 hover:border-indigo-500 flex-shrink-0 transition-colors hover:bg-indigo-50 flex items-center justify-center">
                      {updatingId === task.id && <span className="w-2.5 h-2.5 border border-gray-300 border-t-indigo-600 rounded-full animate-spin" />}
                    </button>
                  )}
                  {task.status === 'completed' && (
                    <div className="w-5 h-5 mt-0.5 rounded border-2 border-emerald-500 bg-emerald-500 flex-shrink-0 flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs">{taskType.emoji}</span>
                      <span className={`font-semibold text-sm ${task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-900'}`}>{task.task_title}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${priority.bg} ${priority.text}`}>{priority.label}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      {task.livestock && <span className="text-gray-500 text-xs">🐾 {task.livestock.name}</span>}
                      <span className={`text-xs ${overdue ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>📅 {overdue ? '⚠️ Overdue: ' : ''}{formatLMDate(task.due_date)}</span>
                    </div>
                    {task.notes && <p className="text-gray-500 text-xs mt-1 truncate">{task.notes}</p>}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}