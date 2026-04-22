import { LMLivestock, LMKpiData, LMHealthRecord, 
  LMTask } from './lm.types';

export function calcLMKpiData(
  livestock: LMLivestock[],
  healthRecords: LMHealthRecord[],
  tasks: LMTask[],
  monthlyFeedCost: number,
  avgMilk: number
): LMKpiData {
  const today = new Date().toISOString().split('T')[0];
  const in7Days = new Date(Date.now() + 7 * 86400000)
    .toISOString().split('T')[0];

  const healthyCount = livestock.filter(
    l => l.health_status === 'healthy'
  ).length;

  const vaccinationDue = healthRecords.filter(
    r => r.next_due_date && r.next_due_date <= in7Days
  ).length;

  const tasksToday = tasks.filter(
    t => t.due_date === today && t.status !== 'completed'
  ).length;

  return {
    totalLivestock: livestock.length,
    avgMilkProduction: avgMilk,
    healthScore: livestock.length > 0
      ? Math.round((healthyCount / livestock.length) * 100)
      : 100,
    pregnantCount: livestock.filter(l => l.status === 'pregnant').length,
    vaccinationDue,
    monthlyFeedCost,
    sickCount: livestock.filter(
      l => l.health_status === 'sick' || l.health_status === 'critical'
    ).length,
    tasksToday,
  };
}

export function getAnimalEmoji(type: string): string {
  const map: Record<string, string> = {
    cow: '🐄', buffalo: '🦬', goat: '🐐', sheep: '🐑',
    pig: '🐖', poultry: '🐔', horse: '🐴', camel: '🐪',
  };
  return map[type] || '🐾';
}

export function formatLMDate(dateStr?: string): string {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export function getLMDaysUntil(dateStr?: string): number | null {
  if (!dateStr) return null;
  const target = new Date(dateStr);
  const now = new Date();
  return Math.ceil((target.getTime() - now.getTime()) / 86400000);
}

export function formatLMCurrency(amount?: number): string {
  if (amount === undefined || amount === null) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(amount);
}

export function groupMilkByDate(
  records: { record_date: string; total_qty: number }[]
): { date: string; total: number }[] {
  const grouped: Record<string, number> = {};
  records.forEach(r => {
    grouped[r.record_date] = (grouped[r.record_date] || 0) + r.total_qty;
  });
  return Object.entries(grouped)
    .map(([date, total]) => ({ date, total }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function isOverdue(dateStr?: string): boolean {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

export function getLMHealthScore(livestock: LMLivestock[]): number {
  if (!livestock.length) return 100;
  const weights = { healthy: 100, recovering: 60, sick: 20, critical: 0 };
  const total = livestock.reduce(
    (sum, l) => sum + (weights[l.health_status] || 0), 0
  );
  return Math.round(total / livestock.length);
}
