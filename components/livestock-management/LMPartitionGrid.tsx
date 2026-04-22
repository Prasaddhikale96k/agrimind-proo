'use client';

import { useState, useMemo } from 'react';
import { LMLivestock } from '@/lib/livestock-management/lm.types';
import LMStatusBadge from './LMStatusBadge';
import { getAnimalEmoji, formatLMDate, formatLMCurrency } from '@/lib/livestock-management/lm.helpers';
import { LM_HEALTH_STATUS_CONFIG } from '@/lib/livestock-management/lm.constants';

interface Props {
  livestock: LMLivestock[];
  activePartition: string;
  isLoading: boolean;
  onEdit: (animal: LMLivestock) => void;
  onDelete: (id: string) => void;
  onAddHealth: (animal: LMLivestock) => void;
  onAddMilk: (animal: LMLivestock) => void;
  viewMode: 'grid' | 'list';
}

function AnimalCard({ animal, onEdit, onDelete, onAddHealth, onAddMilk }: { animal: LMLivestock; onEdit: (a: LMLivestock) => void; onDelete: (id: string) => void; onAddHealth: (a: LMLivestock) => void; onAddMilk: (a: LMLivestock) => void; }) {
  const healthConfig = LM_HEALTH_STATUS_CONFIG[animal.health_status];
  const isCritical = animal.health_status === 'sick' || animal.health_status === 'critical';
  const isMilkProducer = animal.type === 'cow' || animal.type === 'buffalo' || animal.type === 'goat' || animal.type === 'camel';

  return (
    <div className={`relative bg-white rounded-2xl border overflow-hidden hover:shadow-lg hover:scale-[1.01] transition-all duration-300 group cursor-default shadow-sm ${isCritical ? 'border-red-300 shadow-red-100' : 'border-gray-200 hover:border-gray-300'}`}>
      {isCritical && (<div className="bg-red-50 border-b border-red-200 px-4 py-1.5 flex items-center gap-2"><span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" /><span className="text-red-700 text-xs font-semibold">Needs Immediate Attention</span></div>)}
      {animal.status === 'pregnant' && !isCritical && (<div className="bg-pink-50 border-b border-pink-200 px-4 py-1.5 flex items-center gap-2"><span className="text-pink-700 text-xs font-semibold">🐣 Pregnant</span></div>)}
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl border flex-shrink-0 transition-transform group-hover:scale-110 ${healthConfig.bg} ${healthConfig.border}`}>{getAnimalEmoji(animal.type)}</div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg leading-tight">{animal.name}</h3>
              <p className="text-gray-500 text-xs mt-0.5">{animal.breed || 'Unknown breed'}{animal.tag_number && ` · #${animal.tag_number}`}</p>
            </div>
          </div>
          <LMStatusBadge variant="health" status={animal.health_status} size="sm" />
        </div>
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-gray-50 rounded-xl p-3 text-center"><div className="text-gray-900 font-bold text-base">{animal.age ? `${animal.age}yr` : '—'}</div><div className="text-gray-500 text-xs mt-0.5">Age</div></div>
          <div className="bg-gray-50 rounded-xl p-3 text-center"><div className="text-gray-900 font-bold text-base">{animal.weight ? `${animal.weight}kg` : '—'}</div><div className="text-gray-500 text-xs mt-0.5">Weight</div></div>
          {animal.milk_capacity ? (<div className="bg-cyan-50 border border-cyan-200 rounded-xl p-3 text-center"><div className="text-cyan-700 font-bold text-base">{animal.milk_capacity}L</div><div className="text-gray-500 text-xs mt-0.5">Milk/Day</div></div>) : (<div className="bg-gray-50 rounded-xl p-3 text-center"><div className="text-gray-500 font-bold text-base">—</div><div className="text-gray-400 text-xs mt-0.5">Milk/Day</div></div>)}
          <div className="bg-gray-50 rounded-xl p-3 text-center flex items-center justify-center"><LMStatusBadge variant="status" status={animal.status} size="sm" /></div>
        </div>
        {animal.location && (<div className="flex items-center gap-2 mb-4 text-gray-500 text-xs"><span>📍</span><span className="truncate">{animal.location}</span></div>)}
        {animal.purchase_price && (<div className="flex items-center gap-2 mb-4 text-gray-500 text-xs"><span>💰</span><span>{formatLMCurrency(animal.purchase_price)}</span>{animal.purchase_date && <span>· {formatLMDate(animal.purchase_date)}</span>}</div>)}
        {animal.notes && (<p className="text-gray-500 text-xs mb-4 line-clamp-2 italic">"{animal.notes}"</p>)}
        <div className="grid grid-cols-2 gap-2">
          {isMilkProducer && (<button onClick={() => onAddMilk(animal)} className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 text-cyan-700 transition-all text-xs font-semibold hover:scale-105 active:scale-95">🥛 Milk Entry</button>)}
          <button onClick={() => onAddHealth(animal)} className={`flex items-center justify-center gap-1.5 py-2 rounded-xl border transition-all text-xs font-semibold hover:scale-105 active:scale-95 ${isMilkProducer ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700' : 'col-span-2 bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700'}`}>🏥 Health</button>
          <button onClick={() => onEdit(animal)} className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 transition-all text-xs font-semibold hover:scale-105 active:scale-95">✏️ Edit</button>
          <button onClick={() => { if (confirm(`Delete ${animal.name}? This cannot be undone.`)) onDelete(animal.id); }} className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 transition-all text-xs font-semibold hover:scale-105 active:scale-95">🗑️ Delete</button>
        </div>
      </div>
    </div>
  );
}

function AnimalListRow({ animal, onEdit, onDelete, onAddHealth, onAddMilk }: { animal: LMLivestock; onEdit: (a: LMLivestock) => void; onDelete: (id: string) => void; onAddHealth: (a: LMLivestock) => void; onAddMilk: (a: LMLivestock) => void; }) {
  const isCritical = animal.health_status === 'sick' || animal.health_status === 'critical';
  const isMilkProducer = animal.type === 'cow' || animal.type === 'buffalo' || animal.type === 'goat' || animal.type === 'camel';

  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl border hover:bg-gray-50 transition-all group ${isCritical ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'}`}>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-xl flex-shrink-0">{getAnimalEmoji(animal.type)}</div>
        <div className="min-w-0">
          <div className="font-semibold text-gray-900 text-sm truncate">{animal.name}</div>
          <div className="text-gray-500 text-xs">{animal.breed || animal.type}{animal.tag_number && ` · #${animal.tag_number}`}</div>
        </div>
      </div>
      <div className="hidden sm:block"><LMStatusBadge variant="health" status={animal.health_status} size="sm" /></div>
      <div className="hidden md:block text-cyan-700 font-semibold text-sm w-16 text-center">{animal.milk_capacity ? `${animal.milk_capacity}L` : '—'}</div>
      <div className="hidden lg:block text-gray-600 text-sm w-16 text-center">{animal.weight ? `${animal.weight}kg` : '—'}</div>
      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {isMilkProducer && <button onClick={() => onAddMilk(animal)} className="p-2 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-700 transition-colors text-sm" title="Add milk entry">🥛</button>}
        <button onClick={() => onAddHealth(animal)} className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors text-sm" title="Add health record">🏥</button>
        <button onClick={() => onEdit(animal)} className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors text-sm" title="Edit animal">✏️</button>
        <button onClick={() => { if (confirm(`Delete ${animal.name}?`)) onDelete(animal.id); }} className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 transition-colors text-sm" title="Delete animal">🗑️</button>
      </div>
    </div>
  );
}

export default function LMPartitionGrid({ livestock, activePartition, isLoading, onEdit, onDelete, onAddHealth, onAddMilk, viewMode }: Props) {
  const [search, setSearch] = useState('');
  const [healthFilter, setHealthFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  const partitioned = useMemo(() => { if (activePartition === 'all') return livestock; return livestock.filter(l => l.type === activePartition); }, [livestock, activePartition]);

  const filtered = useMemo(() => {
    let result = [...partitioned];
    if (search.trim()) { const q = search.toLowerCase(); result = result.filter(a => a.name.toLowerCase().includes(q) || a.breed?.toLowerCase().includes(q) || a.tag_number?.toLowerCase().includes(q) || a.location?.toLowerCase().includes(q)); }
    if (healthFilter !== 'all') result = result.filter(a => a.health_status === healthFilter);
    result.sort((a, b) => { switch (sortBy) { case 'name': return a.name.localeCompare(b.name); case 'health': return (a.health_status === 'critical' ? 0 : a.health_status === 'sick' ? 1 : a.health_status === 'recovering' ? 2 : 3) - (b.health_status === 'critical' ? 0 : b.health_status === 'sick' ? 1 : b.health_status === 'recovering' ? 2 : 3); case 'milk': return (b.milk_capacity || 0) - (a.milk_capacity || 0); case 'age': return (a.age || 0) - (b.age || 0); case 'weight': return (b.weight || 0) - (a.weight || 0); default: return 0; } });
    return result;
  }, [partitioned, search, healthFilter, sortBy]);

  if (isLoading) { return (<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">{[...Array(6)].map((_, i) => (<div key={i} className="h-72 bg-gray-100 border border-gray-200 rounded-2xl animate-pulse" />))}</div>); }

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input type="text" placeholder="Search name, breed, tag..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors" />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">×</button>}
        </div>
        <select value={healthFilter} onChange={e => setHealthFilter(e.target.value)} className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 text-sm focus:outline-none focus:border-indigo-500">
          <option value="all">All Health</option>
          <option value="healthy">✅ Healthy</option>
          <option value="sick">🚨 Sick</option>
          <option value="recovering">🔄 Recovering</option>
          <option value="critical">⛔ Critical</option>
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 text-sm focus:outline-none focus:border-indigo-500">
          <option value="name">Sort: Name</option>
          <option value="health">Sort: Health</option>
          <option value="milk">Sort: Milk</option>
          <option value="age">Sort: Age</option>
          <option value="weight">Sort: Weight</option>
        </select>
        <div className="flex items-center px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 text-sm whitespace-nowrap">{filtered.length} of {partitioned.length} shown</div>
      </div>
      {filtered.length === 0 ? (<div className="text-center py-20 bg-gray-50 border border-gray-200 rounded-2xl border-dashed"><div className="text-6xl mb-4">🐾</div><h3 className="font-bold text-gray-600 text-lg mb-2">{partitioned.length === 0 ? 'No animals in this partition' : 'No animals match your search'}</h3><p className="text-gray-400 text-sm">{partitioned.length === 0 ? 'Add animals to this category' : 'Try adjusting your filters'}</p></div>) : viewMode === 'grid' ? (<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">{filtered.map(animal => (<AnimalCard key={animal.id} animal={animal} onEdit={onEdit} onDelete={onDelete} onAddHealth={onAddHealth} onAddMilk={onAddMilk} />))}</div>) : (<div className="space-y-2"><div className="flex items-center gap-4 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider"><div className="flex-1">Animal</div><div className="hidden sm:block w-32">Health</div><div className="hidden md:block w-16 text-center">Milk</div><div className="hidden lg:block w-16 text-center">Weight</div><div className="w-32 text-center">Actions</div></div>{filtered.map(animal => (<AnimalListRow key={animal.id} animal={animal} onEdit={onEdit} onDelete={onDelete} onAddHealth={onAddHealth} onAddMilk={onAddMilk} />))}</div>)}
    </div>
  );
}