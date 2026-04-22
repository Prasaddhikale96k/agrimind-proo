import { supabase } from '@/lib/supabase';

import {
  LMLivestock, LMLivestockFormData, LMMilkRecord,
  LMHealthRecord, LMTask, LMFeedExpense,
  LMMilkFormData, LMHealthFormData,
  LMTaskFormData, LMFeedFormData
} from './lm.types';

export async function getAllLivestock(userId: string): Promise<LMLivestock[]> {
  const { data, error } = await supabase
    .from('lm_livestock')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch livestock: ${error.message}`);
  return data || [];
}

export async function getLivestockById(id: string): Promise<LMLivestock> {
  const { data, error } = await supabase
    .from('lm_livestock')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(`Failed to fetch livestock: ${error.message}`);
  return data;
}

export async function addLivestock(
  userId: string,
  form: LMLivestockFormData
): Promise<LMLivestock> {
  const { data, error } = await supabase
    .from('lm_livestock')
    .insert({
      user_id: userId,
      name: form.name.trim(),
      type: form.type,
      breed: form.breed?.trim() || null,
      age: form.age ? parseFloat(form.age) : null,
      weight: form.weight ? parseFloat(form.weight) : null,
      milk_capacity: form.milk_capacity ? parseFloat(form.milk_capacity) : null,
      health_status: form.health_status,
      status: form.status,
      purchase_date: form.purchase_date || null,
      purchase_price: form.purchase_price ? parseFloat(form.purchase_price) : null,
      tag_number: form.tag_number?.trim() || null,
      location: form.location?.trim() || null,
      notes: form.notes?.trim() || null,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to add livestock: ${error.message}`);
  return data;
}

export async function updateLivestock(
  id: string,
  form: Partial<LMLivestockFormData>
): Promise<LMLivestock> {
  const payload: Record<string, unknown> = {};
  if (form.name) payload.name = form.name.trim();
  if (form.type) payload.type = form.type;
  if (form.breed !== undefined) payload.breed = form.breed || null;
  if (form.age !== undefined) payload.age = form.age ? parseFloat(form.age) : null;
  if (form.weight !== undefined) payload.weight = form.weight ? parseFloat(form.weight) : null;
  if (form.milk_capacity !== undefined)
    payload.milk_capacity = form.milk_capacity ? parseFloat(form.milk_capacity) : null;
  if (form.health_status) payload.health_status = form.health_status;
  if (form.status) payload.status = form.status;
  if (form.purchase_date !== undefined) payload.purchase_date = form.purchase_date || null;
  if (form.purchase_price !== undefined)
    payload.purchase_price = form.purchase_price ? parseFloat(form.purchase_price) : null;
  if (form.tag_number !== undefined) payload.tag_number = form.tag_number || null;
  if (form.location !== undefined) payload.location = form.location || null;
  if (form.notes !== undefined) payload.notes = form.notes || null;

  const { data, error } = await supabase
    .from('lm_livestock')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update: ${error.message}`);
  return data;
}

export async function deleteLivestock(id: string): Promise<void> {
  const { error } = await supabase
    .from('lm_livestock')
    .delete()
    .eq('id', id);

  if (error) throw new Error(`Failed to delete: ${error.message}`);
}

export async function getMilkStats(
  userId: string,
  days: number = 30
): Promise<LMMilkRecord[]> {
  const from = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('lm_milk_records')
    .select('*')
    .eq('user_id', userId)
    .gte('record_date', from)
    .order('record_date', { ascending: true });

  if (error) throw new Error(`Failed to fetch milk stats: ${error.message}`);
  return data || [];
}

export async function addMilkRecord(
  userId: string,
  form: LMMilkFormData
): Promise<LMMilkRecord> {
  const { data, error } = await supabase
    .from('lm_milk_records')
    .insert({
      livestock_id: form.livestock_id,
      user_id: userId,
      record_date: form.record_date,
      morning_qty: parseFloat(form.morning_qty) || 0,
      evening_qty: parseFloat(form.evening_qty) || 0,
      quality_grade: form.quality_grade,
      notes: form.notes?.trim() || null,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to add milk record: ${error.message}`);
  return data;
}

export async function getHealthAlerts(userId: string): Promise<LMHealthRecord[]> {
  const { data, error } = await supabase
    .from('lm_health_records')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch health records: ${error.message}`);
  return data || [];
}

export async function addHealthRecord(
  userId: string,
  form: LMHealthFormData
): Promise<LMHealthRecord> {
  const { data, error } = await supabase
    .from('lm_health_records')
    .insert({
      livestock_id: form.livestock_id,
      user_id: userId,
      record_type: form.record_type,
      record_date: form.record_date,
      disease: form.disease?.trim() || null,
      treatment: form.treatment?.trim() || null,
      medicine_used: form.medicine_used?.trim() || null,
      medicine_cost: form.medicine_cost ? parseFloat(form.medicine_cost) : 0,
      veterinarian: form.veterinarian?.trim() || null,
      next_due_date: form.next_due_date || null,
      vaccination_type: form.vaccination_type?.trim() || null,
      notes: form.notes?.trim() || null,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to add health record: ${error.message}`);
  return data;
}

export async function getLMTasks(userId: string): Promise<LMTask[]> {
  const { data, error } = await supabase
    .from('lm_tasks')
    .select(`*, livestock:lm_livestock(name, type)`)
    .eq('user_id', userId)
    .order('due_date', { ascending: true });

  if (error) throw new Error(`Failed to fetch tasks: ${error.message}`);
  return data || [];
}

export async function addLMTask(
  userId: string,
  form: LMTaskFormData
): Promise<LMTask> {
  const { data, error } = await supabase
    .from('lm_tasks')
    .insert({
      livestock_id: form.livestock_id || null,
      user_id: userId,
      task_title: form.task_title.trim(),
      task_type: form.task_type,
      priority: form.priority,
      due_date: form.due_date,
      due_time: form.due_time || null,
      notes: form.notes?.trim() || null,
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to add task: ${error.message}`);
  return data;
}

export async function updateLMTaskStatus(id: string, status: string): Promise<void> {
  const update: Record<string, unknown> = { status };
  if (status === 'completed') update.completed_at = new Date().toISOString();

  const { error } = await supabase.from('lm_tasks').update(update).eq('id', id);

  if (error) throw new Error(`Failed to update task: ${error.message}`);
}

export async function getFeedExpenses(
  userId: string,
  days: number = 30
): Promise<LMFeedExpense[]> {
  const from = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('lm_feed_expenses')
    .select('*')
    .eq('user_id', userId)
    .gte('expense_date', from)
    .order('expense_date', { ascending: false });

  if (error) throw new Error(`Failed to fetch feed expenses: ${error.message}`);
  return data || [];
}

export async function addFeedExpense(
  userId: string,
  form: LMFeedFormData
): Promise<LMFeedExpense> {
  const { data, error } = await supabase
    .from('lm_feed_expenses')
    .insert({
      livestock_id: form.livestock_id || null,
      user_id: userId,
      expense_date: form.expense_date,
      feed_type: form.feed_type.trim(),
      quantity_kg: form.quantity_kg ? parseFloat(form.quantity_kg) : null,
      cost_per_unit: form.cost_per_unit ? parseFloat(form.cost_per_unit) : null,
      total_cost: parseFloat(form.total_cost),
      supplier: form.supplier?.trim() || null,
      notes: form.notes?.trim() || null,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to add feed expense: ${error.message}`);
  return data;
}