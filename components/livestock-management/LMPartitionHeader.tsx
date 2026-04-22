'use client';

import { useMemo } from 'react';
import { LMLivestock } from '@/lib/livestock-management/lm.types';
import { LM_ANIMAL_TYPES } from '@/lib/livestock-management/lm.constants';

interface Props {
  activePartition: string;
  livestock: LMLivestock[];
}

export default function LMPartitionHeader({ activePartition, livestock }: Props) {
  const typeInfo = activePartition === 'all' ? { label: 'All Animals', emoji: '🐾' } : LM_ANIMAL_TYPES.find(t => t.value === activePartition);

  const filtered = useMemo(() => {
    if (activePartition === 'all') return livestock;
    return livestock.filter(l => l.type === activePartition);
  }, [livestock, activePartition]);

  const stats = useMemo(() => ({
    total: filtered.length,
    healthy: filtered.filter(l => l.health_status === 'healthy').length,
    sick: filtered.filter(l => l.health_status === 'sick' || l.health_status === 'critical').length,
    pregnant: filtered.filter(l => l.status === 'pregnant').length,
    totalMilk: filtered.reduce((s, l) => s + (l.milk_capacity || 0), 0),
    avgWeight: filtered.length ? filtered.reduce((s, l) => s + (l.weight || 0), 0) / filtered.length : 0,
  }), [filtered]);

  if (!typeInfo) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-3xl">{typeInfo.emoji}</div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{typeInfo.label} Partition</h2>
            <p className="text-gray-500 text-sm">{stats.total} animal{stats.total !== 1 ? 's' : ''} in this section</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 text-center">
            <div className="text-emerald-700 font-bold text-lg">{stats.healthy}</div>
            <div className="text-gray-500 text-xs">Healthy</div>
          </div>
          {stats.sick > 0 && (<div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2 text-center"><div className="text-red-700 font-bold text-lg animate-pulse">{stats.sick}</div><div className="text-gray-500 text-xs">At Risk</div></div>)}
          {stats.pregnant > 0 && (<div className="bg-pink-50 border border-pink-200 rounded-xl px-4 py-2 text-center"><div className="text-pink-700 font-bold text-lg">{stats.pregnant}</div><div className="text-gray-500 text-xs">Pregnant</div></div>)}
          {stats.totalMilk > 0 && (<div className="bg-cyan-50 border border-cyan-200 rounded-xl px-4 py-2 text-center"><div className="text-cyan-700 font-bold text-lg">{stats.totalMilk.toFixed(0)}L</div><div className="text-gray-500 text-xs">Milk Cap/Day</div></div>)}
          {stats.avgWeight > 0 && (<div className="bg-purple-50 border border-purple-200 rounded-xl px-4 py-2 text-center"><div className="text-purple-700 font-bold text-lg">{stats.avgWeight.toFixed(0)}kg</div><div className="text-gray-500 text-xs">Avg Weight</div></div>)}
        </div>
      </div>
    </div>
  );
}