'use client';

import { useState } from 'react';
import { LMAIInsight } from '@/lib/livestock-management/lm.types';

interface Props {
  insights: LMAIInsight[];
}

const SEVERITY_STYLES = {
  critical: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100 text-red-700 border-red-200', icon: '🚨', label: 'Critical' },
  warning: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700 border-amber-200', icon: '⚠️', label: 'Warning' },
  info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700 border-blue-200', icon: 'ℹ️', label: 'Info' },
  success: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: '✅', label: 'Good' },
};

export default function LMAiInsights({ insights }: Props) {
  const [expanded, setExpanded] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  const filtered = filter === 'all' ? insights : insights.filter(i => i.severity === filter);
  const criticalCount = insights.filter(i => i.severity === 'critical').length;
  const warningCount = insights.filter(i => i.severity === 'warning').length;

  if (insights.length === 0) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <div className="text-5xl mb-3">🎉</div>
        <h3 className="font-bold text-emerald-700 text-lg mb-1">All Systems Healthy!</h3>
        <p className="text-gray-600 text-sm">No issues detected across your cattle farm.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center"><span className="text-xl">🤖</span></div>
          <div>
            <h2 className="font-bold text-gray-900 text-base">AI Farm Insights</h2>
            <p className="text-gray-500 text-xs">
              {criticalCount > 0 && <span className="text-red-600 font-semibold">{criticalCount} critical</span>}
              {criticalCount > 0 && warningCount > 0 && ' · '}
              {warningCount > 0 && <span className="text-amber-600 font-semibold">{warningCount} warnings</span>}
              {criticalCount === 0 && warningCount === 0 && `${insights.length} insights`}
            </p>
          </div>
        </div>
        <button onClick={() => setExpanded(!expanded)} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-50 rounded-lg">{expanded ? '▲' : '▼'}</button>
      </div>

      {expanded && (
        <>
          <div className="flex gap-2 p-4 border-b border-gray-50 overflow-x-auto">
            {['all', 'critical', 'warning', 'info', 'success'].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all capitalize ${filter === f ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                {f === 'all' ? `All (${insights.length})` : f}
              </button>
            ))}
          </div>
          <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-4">No {filter} insights</p>
            ) : (
              filtered.map(insight => {
                const style = SEVERITY_STYLES[insight.severity];
                return (
                  <div key={insight.id} className={`rounded-xl border p-4 ${style.bg} ${style.border} hover:brightness-95 transition-all`}>
                    <div className="flex items-start gap-3">
                      <span className="text-xl flex-shrink-0 mt-0.5">{style.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`font-bold text-sm ${style.text}`}>{insight.title}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${style.badge}`}>{style.label}</span>
                        </div>
                        <p className="text-gray-600 text-xs leading-relaxed mb-2">{insight.description}</p>
                        {insight.action && (
                          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                            <span>→</span>
                            <span>{insight.action}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}