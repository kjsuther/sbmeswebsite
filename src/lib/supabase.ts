import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types for TypeScript
export interface FeedbackOutbox {
  id?: string
  created_at?: string
  status?: string
  attempts?: number
  payload: {
    name: string
    email: string
    category: string
    message: string
  }
  processed_at?: string
  error_message?: string
}