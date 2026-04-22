import {
  LMLivestock, LMHealthRecord, LMMilkRecord,
  LMTask, LMAIInsight
} from './lm.types';
import { getLMDaysUntil } from './lm.helpers';

export function generateLMInsights(
  livestock: LMLivestock[],
  healthRecords: LMHealthRecord[],
  milkRecords: LMMilkRecord[],
  tasks: LMTask[]
): LMAIInsight[] {
  const insights: LMAIInsight[] = [];

  livestock.forEach(animal => {
    if (animal.health_status === 'critical') {
      insights.push({
        id: `critical-${animal.id}`,
        severity: 'critical',
        category: 'health',
        title: `🚨 Critical Condition: ${animal.name}`,
        description: `${animal.name} (${animal.type}) is in critical condition.
          Immediate veterinary intervention is required.`,
        livestock_id: animal.id,
        livestock_name: animal.name,
        action: 'Schedule emergency vet visit now',
      });
    }

    if (animal.health_status === 'sick') {
      insights.push({
        id: `sick-${animal.id}`,
        severity: 'warning',
        category: 'health',
        title: `⚠️ Sick Animal: ${animal.name}`,
        description: `${animal.name} is sick and needs attention.
          Check treatment records and monitor closely.`,
        livestock_id: animal.id,
        livestock_name: animal.name,
        action: 'Review treatment plan',
      });
    }
  });

  healthRecords.forEach(record => {
    if (record.next_due_date) {
      const days = getLMDaysUntil(record.next_due_date);
      const animal = livestock.find(l => l.id === record.livestock_id);

      if (days !== null && days <= 7 && days >= 0) {
        insights.push({
          id: `vac-due-${record.id}`,
          severity: 'warning',
          category: 'health',
          title: `💉 Vaccination Due in ${days} days`,
          description: `${animal?.name || 'Animal'} needs 
            ${record.vaccination_type || 'vaccination'} 
            by ${record.next_due_date}.`,
          livestock_id: record.livestock_id,
          livestock_name: animal?.name,
          action: 'Schedule vaccination appointment',
        });
      }

      if (days !== null && days < 0) {
        insights.push({
          id: `vac-overdue-${record.id}`,
          severity: 'critical',
          category: 'health',
          title: `🚨 Vaccination OVERDUE`,
          description: `${animal?.name || 'Animal'} vaccination 
            was due ${Math.abs(days)} days ago. Immediate action required.`,
          livestock_id: record.livestock_id,
          livestock_name: animal?.name,
          action: 'Vaccinate immediately',
        });
      }
    }
  });

  const milkByAnimal: Record<string, number[]> = {};
  milkRecords.forEach(r => {
    if (!milkByAnimal[r.livestock_id]) milkByAnimal[r.livestock_id] = [];
    milkByAnimal[r.livestock_id].push(r.total_qty);
  });

  Object.entries(milkByAnimal).forEach(([id, quantities]) => {
    const animal = livestock.find(l => l.id === id);
    if (!animal || !animal.milk_capacity) return;

    const avgQty = quantities.reduce((s, q) => s + q, 0) / quantities.length;
    const capacityRatio = avgQty / animal.milk_capacity;

    if (capacityRatio < 0.6 && capacityRatio > 0) {
      insights.push({
        id: `low-milk-${id}`,
        severity: 'warning',
        category: 'milk',
        title: `🥛 Low Milk Yield: ${animal.name}`,
        description: `${animal.name} is producing ${avgQty.toFixed(1)}L/day 
          vs capacity of ${animal.milk_capacity}L. 
          Production is ${Math.round(capacityRatio * 100)}% of expected.`,
        livestock_id: id,
        livestock_name: animal.name,
        action: 'Check diet, health, and stress factors',
      });
    }

    if (capacityRatio >= 1.0) {
      insights.push({
        id: `high-milk-${id}`,
        severity: 'success',
        category: 'milk',
        title: `⭐ High Performer: ${animal.name}`,
        description: `${animal.name} is producing ${avgQty.toFixed(1)}L/day,
          exceeding capacity by ${Math.round((capacityRatio - 1) * 100)}%.`,
        livestock_id: id,
        livestock_name: animal.name,
        action: 'Document feeding and care routine',
      });
    }
  });

  livestock
    .filter(l => l.status === 'pregnant')
    .forEach(animal => {
      insights.push({
        id: `pregnant-${animal.id}`,
        severity: 'info',
        category: 'breeding',
        title: `🐣 Pregnant: ${animal.name}`,
        description: `${animal.name} is pregnant. 
          Ensure proper nutrition and pre-natal care.`,
        livestock_id: animal.id,
        livestock_name: animal.name,
        action: 'Schedule pre-natal checkup',
      });
    });

  const overdueTaskCount = tasks.filter(
    t => new Date(t.due_date) < new Date() && t.status === 'pending'
  ).length;

  if (overdueTaskCount > 0) {
    insights.push({
      id: 'overdue-tasks',
      severity: 'warning',
      category: 'task',
      title: `📋 ${overdueTaskCount} Overdue Task${overdueTaskCount > 1 ? 's' : ''}`,
      description: `You have ${overdueTaskCount} pending farm 
        task${overdueTaskCount > 1 ? 's' : ''} that are past due date.`,
      action: 'Review and complete overdue tasks',
    });
  }

  const order = { critical: 0, warning: 1, info: 2, success: 3 };
  return insights.sort((a, b) => order[a.severity] - order[b.severity]);
}
