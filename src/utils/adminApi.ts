/**
 * Admin CRUD helpers for Supabase.
 *
 * Every function guards against a null client (env vars missing)
 * and returns { data, error } so the UI can surface errors to the user.
 */

import { supabase } from './supabase';

// ---------------------------------------------------------------------------
// Result types — every mutation returns data + error so the UI can react
// ---------------------------------------------------------------------------

export interface AdminResult<T> {
  data: T | null;
  error: string | null;
}

// ---------------------------------------------------------------------------
// Generic fetch
// ---------------------------------------------------------------------------

export async function adminFetch<T>(
  table: string,
  options?: {
    orderBy?: string;
    ascending?: boolean;
    filters?: Record<string, any>;
  },
): Promise<T[]> {
  if (!supabase) {
    console.warn('[adminApi] Supabase not configured — returning empty array.');
    return [];
  }

  let query = supabase.from(table).select('*');

  if (options?.filters) {
    for (const [key, value] of Object.entries(options.filters)) {
      query = query.eq(key, value);
    }
  }

  if (options?.orderBy) {
    query = query.order(options.orderBy, {
      ascending: options.ascending ?? true,
    });
  }

  const { data, error } = await query;

  if (error) {
    console.warn(`[adminApi] fetch ${table} failed:`, error.message);
    return [];
  }

  return data as T[];
}

// ---------------------------------------------------------------------------
// Insert
// ---------------------------------------------------------------------------

export async function adminInsert<T>(
  table: string,
  data: Partial<T>,
): Promise<AdminResult<T>> {
  if (!supabase) {
    return { data: null, error: 'Supabase no configurado' };
  }

  const { data: result, error } = await supabase
    .from(table)
    .insert(data as any)
    .select()
    .single();

  if (error) {
    console.warn(`[adminApi] insert into ${table} failed:`, error.message);
    return { data: null, error: error.message };
  }

  return { data: result as T, error: null };
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

export async function adminUpdate<T>(
  table: string,
  id: string,
  data: Partial<T>,
): Promise<AdminResult<T>> {
  if (!supabase) {
    return { data: null, error: 'Supabase no configurado' };
  }

  const { data: result, error } = await supabase
    .from(table)
    .update(data as any)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.warn(`[adminApi] update ${table} (id=${id}) failed:`, error.message);
    return { data: null, error: error.message };
  }

  return { data: result as T, error: null };
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

export async function adminDelete(
  table: string,
  id: string,
): Promise<{ ok: boolean; error: string | null }> {
  if (!supabase) {
    return { ok: false, error: 'Supabase no configurado' };
  }

  const { error } = await supabase.from(table).delete().eq('id', id);

  if (error) {
    console.warn(`[adminApi] delete from ${table} (id=${id}) failed:`, error.message);
    return { ok: false, error: error.message };
  }

  return { ok: true, error: null };
}

// ---------------------------------------------------------------------------
// Bulk delete by column (used for nav dropdowns)
// ---------------------------------------------------------------------------

export async function adminDeleteWhere(
  table: string,
  column: string,
  value: string,
): Promise<{ ok: boolean; error: string | null }> {
  if (!supabase) {
    return { ok: false, error: 'Supabase no configurado' };
  }

  const { error } = await supabase.from(table).delete().eq(column, value);

  if (error) {
    console.warn(`[adminApi] deleteWhere ${table}.${column}=${value} failed:`, error.message);
    return { ok: false, error: error.message };
  }

  return { ok: true, error: null };
}

// ---------------------------------------------------------------------------
// Bulk insert (used for nav dropdowns re-ordering)
// ---------------------------------------------------------------------------

export async function adminBulkInsert<T>(
  table: string,
  rows: Partial<T>[],
): Promise<{ data: T[]; error: string | null }> {
  if (!supabase) {
    return { data: [], error: 'Supabase no configurado' };
  }

  const { data, error } = await supabase
    .from(table)
    .insert(rows as any[])
    .select();

  if (error) {
    console.warn(`[adminApi] bulkInsert into ${table} failed:`, error.message);
    return { data: [], error: error.message };
  }

  return { data: data as T[], error: null };
}

// ---------------------------------------------------------------------------
// Upsert site_settings (key-value table)
// ---------------------------------------------------------------------------

export async function adminUpsertSettings(
  settings: Record<string, string>,
): Promise<boolean> {
  if (!supabase) {
    console.warn('[adminApi] Supabase not configured — upsertSettings skipped.');
    return false;
  }

  const rows = Object.entries(settings).map(([key, value]) => ({
    key,
    value,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from('site_settings')
    .upsert(rows, { onConflict: 'key' });

  if (error) {
    console.warn('[adminApi] upsertSettings failed:', error.message);
    return false;
  }

  return true;
}
