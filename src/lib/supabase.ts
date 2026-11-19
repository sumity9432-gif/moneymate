import { createClient } from '@supabase/supabase-js';
import { OWNER_EMAIL } from './utils';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project.supabase.co'
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Validates whether the signed-in user email is the authorized single owner
 */
export function isAuthorizedOwner(email?: string | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === OWNER_EMAIL.toLowerCase();
}
