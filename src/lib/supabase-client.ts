import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

let client: SupabaseClient | null = null

if (supabaseUrl.startsWith('http') && supabaseAnonKey.length > 0) {
  client = createClient(supabaseUrl, supabaseAnonKey)
}

export const supabase = client

export function isCmsConfigured() {
  return client !== null
}
