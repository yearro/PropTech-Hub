'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Locale } from '@/lib/i18n/config'

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServer = createClient(supabaseUrl, supabaseKey)

export async function getCurrentUser() {
  const { data: { session } } = await supabaseServer.auth.getSession();
  return session?.user || null;
}

export async function setLocale(locale: Locale, redirectTo?: string) {
  const cookieStore = await cookies()
  cookieStore.set('NEXT_LOCALE', locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 year
  })

  if (redirectTo) {
    redirect(redirectTo)
  }
}

export async function createUserProfile(userData: {
  full_name: string;
  email: string;
  role: string;
  avatar_url: string;
  phone?: string | null;
}) {
  console.log('[Server Action] Attempting to create profile for:', userData.email);
  console.log('[Server Action] Using service role key:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data, error } = await supabaseServer
    .from('profiles')
    .insert([
      {
        ...userData,
        created_at: new Date().toISOString()
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('[Server Action] Error in createUserProfile:', error);
    return { success: false, error: error.message };
  }

  console.log('[Server Action] Successfully created profile:', data.id);
  return { success: true, data };
}

export async function updateUserRole(userId: string, newRole: string) {
  console.log('[Server Action] Attempting to update role for:', userId, 'to', newRole);
  
  const { data, error } = await supabaseServer
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('[Server Action] Error in updateUserRole:', error);
    return { success: false, error: error.message };
  }

  console.log('[Server Action] Successfully updated role for:', userId);
  return { success: true, data };
}

export async function updateUserProfile(userId: string, userData: {
  full_name?: string;
  email?: string;
  phone?: string | null;
  avatar_url?: string;
}) {
  console.log('[Server Action] Attempting to update profile for:', userId);

  const { data, error } = await supabaseServer
    .from('profiles')
    .update(userData)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('[Server Action] Error in updateUserProfile:', error);
    return { success: false, error: error.message };
  }

  console.log('[Server Action] Successfully updated profile for:', userId);
  return { success: true, data };
}
