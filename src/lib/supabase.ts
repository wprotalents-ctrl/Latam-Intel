/// <reference types="vite/client" />
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Gracefully handle missing env vars in dev
let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[Supabase] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not set.');
    return null;
  }
  if (!_client) {
    _client = createClient(supabaseUrl, supabaseAnonKey);
  }
  return _client;
}

export const supabase = getClient();

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SupabaseUser {
  id: string;
  email: string;
  display_name: string | null;
  photo_url: string | null;
  subscription_status: 'free' | 'premium';
  payment_method: 'card' | 'crypto' | null;
  stripe_customer_id: string | null;
  subscriber_type: 'reader' | 'candidate' | 'hiring_manager' | 'company' | null;
  created_at: string;
  updated_at: string;
}


export interface MemberResource {
  id: string;
  title: string;
  description: string | null;
  category: 'Salary Data' | 'AI Tools' | 'Playbooks' | 'Templates' | 'Reports';
  file_url: string | null;
  external_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

// ─── Helper: fetch user profile from Supabase ─────────────────────────────────

export async function getUserProfile(firebaseUid: string): Promise<SupabaseUser | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', firebaseUid)
    .single();

  if (error) {
    console.warn('[Supabase] getUserProfile error:', error.message);
    return null;
  }
  return data as SupabaseUser;
}
// ─── Helper: fetch member resources ──────────────────────────────────────────

export async function getMemberResources(): Promise<MemberResource[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('member_resources')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');

  if (error) {
    console.warn('[Supabase] getMemberResources error:', error.message);
    return [];
  }
  return (data as MemberResource[]) || [];
}
