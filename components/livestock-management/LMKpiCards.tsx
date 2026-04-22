'use client';

import { LMKpiData } from '@/lib/livestock-management/lm.types';
import { formatLMCurrency } from '@/lib/livestock-management/lm.helpers';

interface Props {
  data: LMKpiData;
  isLoading?: boolean;
}

const CARDS = [
  { key: 'totalLivestock' as const, label: 'Total Cattle', emoji: '🐄', gradient: 'from-blue-50 to-blue-100', border: 'border-blue-200', text: 'text-blue-600', format: (v: number) => v.toString() },
  { key: 'avgMilkProduction' as const, label: 'Avg Milk / Day', emoji: '🥛', gradient: 'from-cyan-50 to-cyan-100', border: 'border-cyan-200', text: 'text-cyan-600', format: (v: number) => `${v.toFixed(1)}L` },
  { key: 'healthScore' as const, label: 'Health Score', emoji: '❤️', gradient: 'from-emerald-50 to-emerald-100', border: 'border-emerald-200', text: 'text-emerald-600', format: (v: number) => `${v}%` },
  { key: 'pregnantCount' as const, label: 'Pregnant', emoji: '🐣', gradient: 'from-pink-50 to-pink-100', border: 'border-pink-200', text: 'text-pink-600', format: (v: number) => v.toString() },
  { key: 'vaccinationDue' as const, label: 'Vaccination Due', emoji: '💉', gradient: 'from-amber-50 to-amber-100', border: 'border-amber-200', text: 'text-amber-600', format: (v: number) => v.toString() },
  { key: 'monthlyFeedCost' as const, label: 'Monthly Feed Cost', emoji: '🌾', gradient: 'from-purple-50 to-purple-100', border: 'border-purple-200', text: 'text-purple-600', format: (v: number) => formatLMCurrency(v) },
];

function SkeletonCard() {
  return <div className="h-32 rounded-2xl bg-gray-100 border border-gray-200 animate-pulse" />;
}

export default function LMKpiCards({ data, isLoading }: Props) {
  if (isLoading) { return (<div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">{[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}</div>); }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {CARDS.map(card => (
        <div key={card.key} className={`relative overflow-hidden rounded-2xl border p-5 bg-gradient-to-br ${card.gradient} ${card.border} hover:scale-105 hover:shadow-lg transition-all duration-300 cursor-default group`}>
          <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-white/50 blur-xl group-hover:bg-white/70 transition-all" />
          <div className="relative">
            <span className="text-2xl block mb-3">{card.emoji}</span>
            <div className={`text-2xl font-bold mb-1 ${card.text}`}>{card.format(data[card.key])}</div>
            <div className="text-gray-500 text-xs font-medium leading-tight">{card.label}</div>
          </div>
          {(card.key === 'vaccinationDue' && data.vaccinationDue > 0) && <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse" />}
          {(card.key === 'healthScore' && data.healthScore < 70) && <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />}
        </div>
      ))}
    </div>
  );
}