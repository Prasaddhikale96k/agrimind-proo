'use client';

import { useState, useMemo } from 'react';
import { LMLivestock } from '@/lib/livestock-management/lm.types';
import { LM_ANIMAL_TYPES } from '@/lib/livestock-management/lm.constants';

interface Props {
  livestock: LMLivestock[];
  activePartition: string;
  onPartitionChange: (partition: string) => void;
}

export default function LMPartitionTabs({ livestock, activePartition, onPartitionChange }: Props) {
  const counts = useMemo(() => {
    const map: Record<string, number> = { all: livestock.length };
    LM_ANIMAL_TYPES.forEach(t => { map[t.value] = livestock.filter(l => l.type === t.value).length; });
    return map;
  }, [livestock]);

  const alerts = useMemo(() => {
    const map: Record<string, number> = {};
    LM_ANIMAL_TYPES.forEach(t => { map[t.value] = livestock.filter(l => l.type === t.value && (l.health_status === 'sick' || l.health_status === 'critical')).length; });
    return map;
  }, [livestock]);

  const allTypes = [{ value: 'all', label: 'All Animals', emoji: '🐾' }, ...LM_ANIMAL_TYPES];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
      {allTypes.map(type => {
        const count = counts[type.value] || 0;
        const alert = alerts[type.value] || 0;
        const isActive = activePartition === type.value;
        if (type.value !== 'all' && count === 0) return null;

        return (
          <button key={type.value} onClick={() => onPartitionChange(type.value)} className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl border font-semibold text-sm transition-all ${isActive ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300'}`}>
            <span className="text-lg">{type.emoji}</span>
            <span>{type.label}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>{count}</span>
            {alert > 0 && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
          </button>
        );
      })}
    </div>
  );
}