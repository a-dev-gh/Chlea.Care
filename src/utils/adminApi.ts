/**
 * Admin CRUD helpers for Supabase.
 *
 * Every function guards against a null client (env vars missing)
 * and logs warnings instead of throwing so the admin panel degrades
 * gracefully when Supabase is not yet configured.
 */

import { supabase } from './supabase';

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
): Promise<T | null> {
  if (!supabase) {
    console.warn('[adminApi] Supabase not configured — insert skipped.');
    return null;
  }

  const { data: result, error } = await supabase
    .from(table)
    .insert(data as any)
    .select()
    .single();

  if (error) {
    console.warn(`[adminApi] insert into ${table} failed:`, error.message);
    return null;
  }

  return result as T;
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

export async function adminUpdate<T>(
  table: string,
  id: string,
  data: Partial<T>,
): Promise<T | null> {
  if (!supabase) {
    console.warn('[adminApi] Supabase not configured — update skipped.');
    return null;
  }

  const { data: result, error } = await supabase
    .from(table)
    .update(data as any)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.warn(`[adminApi] update ${table} (id=${id}) failed:`, error.message);
    return null;
  }

  return result as T;
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

export async function adminDelete(
  table: string,
  id: string,
): Promise<boolean> {
  if (!supabase) {
    console.warn('[adminApi] Supabase not configured — delete skipped.');
    return false;
  }

  const { error } = await supabase.from(table).delete().eq('id', id);

  if (error) {
    console.warn(`[adminApi] delete from ${table} (id=${id}) failed:`, error.message);
    return false;
  }

  return true;
}

// ---------------------------------------------------------------------------
// Bulk delete by column (used for nav dropdowns)
// ---------------------------------------------------------------------------

export async function adminDeleteWhere(
  table: string,
  column: string,
  value: string,
): Promise<boolean> {
  if (!supabase) {
    console.warn('[adminApi] Supabase not configured — deleteWhere skipped.');
    return false;
  }

  const { error } = await supabase.from(table).delete().eq(column, value);

  if (error) {
    console.warn(`[adminApi] deleteWhere ${table}.${column}=${value} failed:`, error.message);
    return false;
  }

  return true;
}

// ---------------------------------------------------------------------------
// Bulk insert (used for nav dropdowns re-ordering)
// ---------------------------------------------------------------------------

export async function adminBulkInsert<T>(
  table: string,
  rows: Partial<T>[],
): Promise<T[]> {
  if (!supabase) {
    console.warn('[adminApi] Supabase not configured — bulkInsert skipped.');
    return [];
  }

  const { data, error } = await supabase
    .from(table)
    .insert(rows as any[])
    .select();

  if (error) {
    console.warn(`[adminApi] bulkInsert into ${table} failed:`, error.message);
    return [];
  }

  return data as T[];
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
