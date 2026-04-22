export type LMAnimalType =
  | 'cow' | 'buffalo' | 'goat' | 'sheep'
  | 'pig' | 'poultry' | 'horse' | 'camel';

export type LMHealthStatus =
  | 'healthy' | 'sick' | 'recovering' | 'critical';

export type LMAnimalStatus =
  | 'active' | 'sick' | 'pregnant' | 'sold' | 'deceased';

export type LMTaskStatus =
  | 'pending' | 'in_progress' | 'completed' | 'cancelled';

export type LMTaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type LMTaskType =
  | 'feeding' | 'health' | 'breeding' | 'grooming'
  | 'vaccination' | 'milking' | 'cleaning' | 'general';

export type LMRecordType =
  | 'vaccination' | 'treatment' | 'checkup' | 'surgery' | 'deworming';

export type LMBreedingOutcome =
  | 'pending' | 'successful' | 'failed' | 'miscarriage';

// ── Core Entities ──────────────────────────

export interface LMLivestock {
  id: string;
  user_id: string;
  name: string;
  type: LMAnimalType;
  breed?: string;
  age?: number;
  weight?: number;
  health_status: LMHealthStatus;
  milk_capacity?: number;
  status: LMAnimalStatus;
  purchase_date?: string;
  purchase_price?: number;
  tag_number?: string;
  location?: string;
  notes?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface LMMilkRecord {
  id: string;
  livestock_id: string;
  user_id: string;
  record_date: string;
  morning_qty: number;
  evening_qty: number;
  total_qty: number;
  quality_grade: 'A' | 'B' | 'C';
  notes?: string;
  created_at: string;
}

export interface LMHealthRecord {
  id: string;
  livestock_id: string;
  user_id: string;
  record_type: LMRecordType;
  record_date: string;
  disease?: string;
  treatment?: string;
  medicine_used?: string;
  medicine_cost?: number;
  veterinarian?: string;
  next_due_date?: string;
  vaccination_type?: string;
  notes?: string;
  created_at: string;
}

export interface LMBreedingRecord {
  id: string;
  livestock_id: string;
  user_id: string;
  breeding_date: string;
  breeding_method: 'natural' | 'artificial' | 'ivf';
  sire_info?: string;
  expected_delivery?: string;
  actual_delivery?: string;
  offspring_count: number;
  outcome: LMBreedingOutcome;
  notes?: string;
  created_at: string;
}

export interface LMFeedExpense {
  id: string;
  livestock_id?: string;
  user_id: string;
  expense_date: string;
  feed_type: string;
  quantity_kg?: number;
  cost_per_unit?: number;
  total_cost: number;
  supplier?: string;
  notes?: string;
  created_at: string;
}

export interface LMTask {
  id: string;
  livestock_id?: string;
  user_id: string;
  task_title: string;
  task_type: LMTaskType;
  priority: LMTaskPriority;
  due_date: string;
  due_time?: string;
  status: LMTaskStatus;
  completed_at?: string;
  notes?: string;
  created_at: string;
  livestock?: Pick<LMLivestock, 'name' | 'type'>;
}

// ── Dashboard / Computed Types ─────────────

export interface LMKpiData {
  totalLivestock: number;
  avgMilkProduction: number;
  healthScore: number;
  pregnantCount: number;
  vaccinationDue: number;
  monthlyFeedCost: number;
  sickCount: number;
  tasksToday: number;
}

export interface LMMilkChartPoint {
  date: string;
  total: number;
  average: number;
}

export interface LMAIInsight {
  id: string;
  severity: 'critical' | 'warning' | 'info' | 'success';
  category: 'health' | 'milk' | 'breeding' | 'feed' | 'task';
  title: string;
  description: string;
  livestock_id?: string;
  livestock_name?: string;
  action?: string;
}

// ── Form Types ─────────────────────────────

export interface LMLivestockFormData {
  name: string;
  type: LMAnimalType;
  breed: string;
  age: string;
  weight: string;
  milk_capacity: string;
  health_status: LMHealthStatus;
  status: LMAnimalStatus;
  purchase_date: string;
  purchase_price: string;
  tag_number: string;
  location: string;
  notes: string;
}

export interface LMHealthFormData {
  livestock_id: string;
  record_type: LMRecordType;
  record_date: string;
  disease: string;
  treatment: string;
  medicine_used: string;
  medicine_cost: string;
  veterinarian: string;
  next_due_date: string;
  vaccination_type: string;
  notes: string;
}

export interface LMMilkFormData {
  livestock_id: string;
  record_date: string;
  morning_qty: string;
  evening_qty: string;
  quality_grade: 'A' | 'B' | 'C';
  notes: string;
}

export interface LMTaskFormData {
  livestock_id: string;
  task_title: string;
  task_type: LMTaskType;
  priority: LMTaskPriority;
  due_date: string;
  due_time: string;
  notes: string;
}

export interface LMFeedFormData {
  livestock_id: string;
  expense_date: string;
  feed_type: string;
  quantity_kg: string;
  cost_per_unit: string;
  total_cost: string;
  supplier: string;
  notes: string;
}
