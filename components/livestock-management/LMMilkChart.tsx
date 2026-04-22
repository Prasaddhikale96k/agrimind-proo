'use client';

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, Legend } from 'recharts';
import { LMMilkChartPoint } from '@/lib/livestock-management/lm.types';
import { LM_CHART_COLORS } from '@/lib/livestock-management/lm.constants';

interface Props {
  data: LMMilkChartPoint[];
  isLoading?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (<div className="bg-white border border-gray-200 rounded-xl p-3 shadow-lg"><p className="text-gray-500 text-xs mb-2">{label}</p>{payload.map((entry: any) => (<p key={entry.name} className="text-sm font-semibold" style={{ color: entry.color }}>{entry.name}: {entry.value.toFixed(1)}L</p>))}</div>);
};

export default function LMMilkChart({ data, isLoading }: Props) {
  const [period, setPeriod] = useState<7 | 14 | 30>(7);
  const displayData = data.slice(-period).map(d => ({ ...d, date: new Date(d.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) }));

  if (isLoading) { return (<div className="rounded-2xl border border-gray-200 bg-white p-6"><div className="h-6 bg-gray-100 rounded w-48 mb-6 animate-pulse" /><div className="h-56 bg-gray-50 rounded-xl animate-pulse" /></div>); }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div><h3 className="font-bold text-gray-900 text-base">🥛 Milk Production Trend</h3><p className="text-gray-500 text-xs mt-0.5">Daily farm-wide milk output</p></div>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 border border-gray-200">
          {([7, 14, 30] as const).map(p => (<button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${period === p ? 'bg-emerald-600 text-white shadow' : 'text-gray-600 hover:text-gray-900'}`}>{p}D</button>))}
        </div>
      </div>
      {displayData.length === 0 ? (<div className="h-56 flex items-center justify-center text-gray-400 text-sm">No milk records for this period.</div>) : (<ResponsiveContainer width="100%" height={220}><AreaChart data={displayData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}><defs><linearGradient id="lmMilkGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={LM_CHART_COLORS.primary} stopOpacity={0.3} /><stop offset="95%" stopColor={LM_CHART_COLORS.primary} stopOpacity={0} /></linearGradient><linearGradient id="lmAvgGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={LM_CHART_COLORS.secondary} stopOpacity={0.3} /><stop offset="95%" stopColor={LM_CHART_COLORS.secondary} stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} /><XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip content={<CustomTooltip />} /><Legend wrapperStyle={{ color: '#6b7280', fontSize: '12px' }} /><Area type="monotone" dataKey="total" name="Total (L)" stroke={LM_CHART_COLORS.primary} strokeWidth={2.5} fill="url(#lmMilkGradient)" dot={false} activeDot={{ r: 5, fill: LM_CHART_COLORS.primary }} /><Area type="monotone" dataKey="average" name="Avg/Animal (L)" stroke={LM_CHART_COLORS.secondary} strokeWidth={2} strokeDasharray="5 5" fill="url(#lmAvgGradient)" dot={false} activeDot={{ r: 4, fill: LM_CHART_COLORS.secondary }} /></AreaChart></ResponsiveContainer>)}
    </div>
  );
}