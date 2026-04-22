import { LMAnimalType, LMHealthStatus, LMAnimalStatus, 
  LMTaskPriority, LMTaskType } from './lm.types';

export const LM_ANIMAL_TYPES: {
  value: LMAnimalType;
  label: string;
  emoji: string;
  isMilkProducer: boolean;
}[] = [
  { value: 'cow', label: 'Cow', emoji: '🐄', isMilkProducer: true },
  { value: 'buffalo', label: 'Buffalo', emoji: '🦬', isMilkProducer: true },
  { value: 'goat', label: 'Goat', emoji: '🐐', isMilkProducer: true },
  { value: 'sheep', label: 'Sheep', emoji: '🐑', isMilkProducer: false },
  { value: 'pig', label: 'Pig', emoji: '🐖', isMilkProducer: false },
  { value: 'poultry', label: 'Poultry', emoji: '🐔', isMilkProducer: false },
  { value: 'horse', label: 'Horse', emoji: '🐴', isMilkProducer: false },
  { value: 'camel', label: 'Camel', emoji: '🐪', isMilkProducer: true },
];

export const LM_HEALTH_STATUS_CONFIG: Record<LMHealthStatus, {
  label: string;
  color: string;
  bg: string;
  text: string;
  border: string;
  dot: string;
  glow: string;
}> = {
  healthy: {
    label: 'Healthy',
    color: 'green',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
    glow: 'shadow-emerald-500/20',
  },
  sick: {
    label: 'Sick',
    color: 'red',
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    dot: 'bg-red-500',
    glow: 'shadow-red-500/20',
  },
  recovering: {
    label: 'Recovering',
    color: 'yellow',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
    glow: 'shadow-amber-500/20',
  },
  critical: {
    label: 'Critical',
    color: 'red',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    dot: 'bg-rose-500',
    glow: 'shadow-rose-500/20',
  },
};

export const LM_STATUS_CONFIG: Record<LMAnimalStatus, {
  label: string;
  bg: string;
  text: string;
  border: string;
}> = {
  active: {
    label: 'Active',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  sick: {
    label: 'Sick',
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
  },
  pregnant: {
    label: 'Pregnant',
    bg: 'bg-pink-50',
    text: 'text-pink-700',
    border: 'border-pink-200',
  },
  sold: {
    label: 'Sold',
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    border: 'border-gray-200',
  },
  deceased: {
    label: 'Deceased',
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    border: 'border-gray-300',
  },
};

export const LM_PRIORITY_CONFIG: Record<LMTaskPriority, {
  label: string;
  bg: string;
  text: string;
  order: number;
}> = {
  urgent: { label: 'Urgent', bg: 'bg-red-100', 
    text: 'text-red-700', order: 0 },
  high: { label: 'High', bg: 'bg-orange-100', 
    text: 'text-orange-700', order: 1 },
  medium: { label: 'Medium', bg: 'bg-yellow-100', 
    text: 'text-yellow-700', order: 2 },
  low: { label: 'Low', bg: 'bg-blue-100', 
    text: 'text-blue-700', order: 3 },
};

export const LM_TASK_TYPE_CONFIG: Record<LMTaskType, {
  label: string;
  emoji: string;
}> = {
  feeding: { label: 'Feeding', emoji: '🌾' },
  health: { label: 'Health', emoji: '🏥' },
  breeding: { label: 'Breeding', emoji: '🐣' },
  grooming: { label: 'Grooming', emoji: '✂️' },
  vaccination: { label: 'Vaccination', emoji: '💉' },
  milking: { label: 'Milking', emoji: '🥛' },
  cleaning: { label: 'Cleaning', emoji: '🧹' },
  general: { label: 'General', emoji: '📋' },
};

export const LM_CHART_COLORS = {
  primary: '#6366f1',
  secondary: '#10b981',
  accent: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6',
  cyan: '#06b6d4',
};
