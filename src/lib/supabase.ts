import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fvlstvvvwrtmuujxwxml.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2bHN0dnZ2d3J0bXV1anh3eG1sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNjg5ODMsImV4cCI6MjA3NDc0NDk4M30.JzI45Ay51RtsEJMMJjh9SrftWQQVeOCMVF9z9jqowdw'

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