import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';
import toast from 'react-hot-toast';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export async function handleSupabaseError(error: any): Promise<never> {
  console.error('Supabase error:', error);
  const message = 'Terjadi kesalahan pada sistem';
  toast.error(message);
  throw new Error(message);
}

export async function getUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    return handleSupabaseError(error);
  }

  return data;
}

export async function getAttendance() {
  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .order('timestamp', { ascending: false });

  if (error) {
    return handleSupabaseError(error);
  }

  return data;
}

export async function updateUserLocation(userId: string, location: { latitude: number; longitude: number }) {
  const { error } = await supabase
    .from('users')
    .update({
      last_location: {
        ...location,
        timestamp: new Date().toISOString()
      }
    })
    .eq('id', userId);

  if (error) {
    return handleSupabaseError(error);
  }
}

export async function updateProfilePicture(userId: string, imageUrl: string) {
  const { error } = await supabase
    .from('users')
    .update({ profile_url: imageUrl })
    .eq('id', userId);

  if (error) {
    return handleSupabaseError(error);
  }
}

export async function recordAttendance(
  userId: string,
  type: 'check_in' | 'check_out',
  location: { latitude: number; longitude: number }
) {
  const { error } = await supabase
    .from('attendance')
    .insert({
      user_id: userId,
      type,
      latitude: location.latitude,
      longitude: location.longitude
    });

  if (error) {
    return handleSupabaseError(error);
  }
}