'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

import { LMLivestock, LMHealthRecord, LMMilkRecord, LMTask, LMFeedExpense, LMMilkChartPoint } from '@/lib/livestock-management/lm.types';
import { getAllLivestock, deleteLivestock, getHealthAlerts, getMilkStats, getLMTasks, getFeedExpenses } from '@/lib/livestock-management/lm.service';
import { calcLMKpiData, groupMilkByDate } from '@/lib/livestock-management/lm.helpers';
import { generateLMInsights } from '@/lib/livestock-management/lm.insights';

import LMKpiCards from '@/components/livestock-management/LMKpiCards';
import LMAddEditModal from '@/components/livestock-management/LMAddEditModal';
import LMAiInsights from '@/components/livestock-management/LMAiInsights';
import LMMilkChart from '@/components/livestock-management/LMMilkChart';
import LMTaskBoard from '@/components/livestock-management/LMTaskBoard';
import LMMilkModal from '@/components/livestock-management/LMMilkModal';
import LMHealthModal from '@/components/livestock-management/LMHealthModal';
import LMTaskModal from '@/components/livestock-management/LMTaskModal';
import LMPartitionTabs from '@/components/livestock-management/LMPartitionTabs';
import LMPartitionHeader from '@/components/livestock-management/LMPartitionHeader';
import LMPartitionGrid from '@/components/livestock-management/LMPartitionGrid';

export default function CattleManagementPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [livestock, setLivestock] = useState<LMLivestock[]>([]);
  const [healthRecords, setHealthRecords] = useState<LMHealthRecord[]>([]);
  const [milkRecords, setMilkRecords] = useState<LMMilkRecord[]>([]);
  const [tasks, setTasks] = useState<LMTask[]>([]);
  const [feedExpenses, setFeedExpenses] = useState<LMFeedExpense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activePartition, setActivePartition] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAddEdit, setShowAddEdit] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState<LMLivestock | null>(null);
  const [milkAnimal, setMilkAnimal] = useState<LMLivestock | null>(null);
  const [healthAnimal, setHealthAnimal] = useState<LMLivestock | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) { router.push('/login'); return; }
        const uid = session.user.id;
        setUserId(uid);
        const [lv, hr, mr, tk, fe] = await Promise.all([getAllLivestock(uid), getHealthAlerts(uid), getMilkStats(uid, 30), getLMTasks(uid), getFeedExpenses(uid, 30)]);
        setLivestock(lv); setHealthRecords(hr); setMilkRecords(mr); setTasks(tk); setFeedExpenses(fe);
      } catch (err) { console.error('Load error:', err); setError('Failed to load data.'); }
      finally { setIsLoading(false); }
    };
    load();
  }, [router]);

  const monthlyFeedCost = useMemo(() => feedExpenses.reduce((s, e) => s + e.total_cost, 0), [feedExpenses]);
  const avgMilkProduction = useMemo(() => { if (!milkRecords.length) return 0; const grouped = groupMilkByDate(milkRecords); const milkProducers = livestock.filter(l => l.milk_capacity && l.milk_capacity > 0).length; if (!grouped.length || !milkProducers) return 0; return (grouped.reduce((s, d) => s + d.total, 0) / grouped.length) / Math.max(milkProducers, 1); }, [milkRecords, livestock]);
  const kpiData = useMemo(() => calcLMKpiData(livestock, healthRecords, tasks, monthlyFeedCost, avgMilkProduction), [livestock, healthRecords, tasks, monthlyFeedCost, avgMilkProduction]);
  const insights = useMemo(() => generateLMInsights(livestock, healthRecords, milkRecords, tasks), [livestock, healthRecords, milkRecords, tasks]);
  const milkChartData: LMMilkChartPoint[] = useMemo(() => { const grouped = groupMilkByDate(milkRecords); const milkProducers = Math.max(livestock.filter(l => l.milk_capacity && l.milk_capacity > 0).length, 1); return grouped.map(d => ({ date: d.date, total: d.total, average: d.total / milkProducers })); }, [milkRecords, livestock]);

  const handleDelete = useCallback(async (id: string) => { if (!confirm('Delete this animal?')) return; try { await deleteLivestock(id); setLivestock(prev => prev.filter(l => l.id !== id)); } catch { alert('Failed to delete.'); } }, []);
  const handleAnimalSaved = useCallback((saved: LMLivestock) => { setLivestock(prev => { const idx = prev.findIndex(l => l.id === saved.id); if (idx >= 0) { const next = [...prev]; next[idx] = saved; return next; } return [saved, ...prev]; }); setShowAddEdit(false); setEditingAnimal(null); }, []);
  const handleTaskUpdated = useCallback((id: string, status: string) => { setTasks(prev => prev.map(t => t.id === id ? { ...t, status: status as LMTask['status'] } : t)); }, []);
  const handleTaskSaved = useCallback((task: LMTask) => { setTasks(prev => [...prev, task]); setShowTaskModal(false); }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-2xl">🐄</div>
              <h1 className="text-3xl font-bold text-gray-900">Cattle Management</h1>
            </div>
            <p className="text-gray-500 text-sm">Farm analytics · Herd tracking · Health & Milk production</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
              <button onClick={() => setViewMode('grid')} className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${viewMode === 'grid' ? 'bg-emerald-600 text-white shadow' : 'text-gray-600 hover:text-gray-900'}`}>⊞ Grid</button>
              <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${viewMode === 'list' ? 'bg-emerald-600 text-white shadow' : 'text-gray-600 hover:text-gray-900'}`}>☰ List</button>
            </div>
            <button onClick={() => { setEditingAnimal(null); setShowAddEdit(true); }} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/30 hover:scale-105">➕ Add Animal</button>
          </div>
        </div>

        {error && (<div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-red-600 flex items-center gap-3"><span>⚠️ {error}</span><button onClick={() => window.location.reload()} className="ml-auto text-sm underline">Retry</button></div>)}

        <LMKpiCards data={kpiData} isLoading={isLoading} />
        <LMAiInsights insights={insights} />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <LMMilkChart data={milkChartData} isLoading={isLoading} />
          <LMTaskBoard tasks={tasks} onTaskUpdated={handleTaskUpdated} onAddTask={() => setShowTaskModal(true)} />
        </div>

        <div>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-1 h-8 bg-emerald-500 rounded-full" />
            <h2 className="text-xl font-bold text-gray-900">Herd Partitions</h2>
            <span className="text-gray-500 text-sm">— Browse animals by category</span>
          </div>

          <div className="lg:hidden mb-4">
            <LMPartitionTabs livestock={livestock} activePartition={activePartition} onPartitionChange={setActivePartition} />
          </div>

          <div className="flex gap-6">
            <div className="hidden lg:block w-56 flex-shrink-0">
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm sticky top-6">
                <div className="p-4 border-b border-gray-100"><h3 className="font-bold text-gray-900 text-sm">🗂️ Animal Partitions</h3><p className="text-gray-500 text-xs mt-0.5">Select category to filter</p></div>
                <div className="p-2 space-y-1">
                  {[{ value: 'all', label: 'All Animals', emoji: '🐾' }, { value: 'cow', label: 'Cows', emoji: '🐄' }, { value: 'buffalo', label: 'Buffalos', emoji: '🦬' }, { value: 'goat', label: 'Goats', emoji: '🐐' }, { value: 'sheep', label: 'Sheep', emoji: '🐑' }, { value: 'pig', label: 'Pigs', emoji: '🐖' }, { value: 'poultry', label: 'Poultry', emoji: '🐔' }, { value: 'horse', label: 'Horses', emoji: '🐴' }, { value: 'camel', label: 'Camels', emoji: '🐪' }].map(item => {
                    const count = item.value === 'all' ? livestock.length : livestock.filter(l => l.type === item.value).length;
                    const alerts = item.value === 'all' ? livestock.filter(l => l.health_status === 'sick' || l.health_status === 'critical').length : livestock.filter(l => l.type === item.value && (l.health_status === 'sick' || l.health_status === 'critical')).length;
                    const isActive = activePartition === item.value;
                    if (item.value !== 'all' && count === 0) return null;
                    return (<button key={item.value} onClick={() => setActivePartition(item.value)} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all group relative ${isActive ? 'bg-emerald-50 border border-emerald-200' : 'hover:bg-gray-50 border border-transparent'}`}><span className={`text-2xl transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>{item.emoji}</span><div className="flex-1 min-w-0"><div className={`font-semibold text-sm ${isActive ? 'text-emerald-700' : 'text-gray-700'}`}>{item.label}</div><div className="text-xs text-gray-400">{count} animal{count !== 1 ? 's' : ''}</div></div>{alerts > 0 ? (<span className="w-5 h-5 bg-red-100 border border-red-200 rounded-full text-xs font-bold text-red-600 flex items-center justify-center animate-pulse flex-shrink-0">{alerts}</span>) : (<span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0 ${isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>{count}</span>)}</button>);
                  })}
                </div>
                <div className="p-4 border-t border-gray-100 space-y-2.5">
                  {[{ label: 'Total', value: livestock.length, color: 'text-gray-900' }, { label: 'Healthy', value: livestock.filter(l => l.health_status === 'healthy').length, color: 'text-emerald-600' }, { label: 'At Risk', value: livestock.filter(l => l.health_status === 'sick' || l.health_status === 'critical').length, color: 'text-red-600' }, { label: 'Pregnant', value: livestock.filter(l => l.status === 'pregnant').length, color: 'text-pink-600' }].map(stat => (<div key={stat.label} className="flex justify-between text-xs"><span className="text-gray-500">{stat.label}</span><span className={`font-bold ${stat.color}`}>{stat.value}</span></div>))}
                </div>
              </div>
            </div>

            <div className="flex-1 min-w-0 space-y-4">
              <LMPartitionHeader activePartition={activePartition} livestock={livestock} />
              <LMPartitionGrid livestock={livestock} activePartition={activePartition} isLoading={isLoading} onEdit={(animal) => { setEditingAnimal(animal); setShowAddEdit(true); }} onDelete={handleDelete} onAddHealth={(animal) => setHealthAnimal(animal)} onAddMilk={(animal) => setMilkAnimal(animal)} viewMode={viewMode} />
            </div>
          </div>
        </div>

        <div className="text-center text-gray-400 text-xs pb-4">Cattle Management · Partitioned View · v2.0</div>
      </div>

      {showAddEdit && userId && (<LMAddEditModal userId={userId} animal={editingAnimal} onClose={() => { setShowAddEdit(false); setEditingAnimal(null); }} onSaved={handleAnimalSaved} />)}
      {milkAnimal && userId && (<LMMilkModal userId={userId} animal={milkAnimal} livestock={livestock} onClose={() => setMilkAnimal(null)} onSaved={(record) => { setMilkRecords(prev => [...prev, record]); setMilkAnimal(null); }} />)}
      {healthAnimal && userId && (<LMHealthModal userId={userId} animal={healthAnimal} livestock={livestock} onClose={() => setHealthAnimal(null)} onSaved={(record) => { setHealthRecords(prev => [...prev, record]); setHealthAnimal(null); }} />)}
      {showTaskModal && userId && (<LMTaskModal userId={userId} livestock={livestock} onClose={() => setShowTaskModal(false)} onSaved={handleTaskSaved} />)}
    </div>
  );
}