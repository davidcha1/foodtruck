import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wavezrlgdhfyscyvtlcn.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhdmV6cmxnZGhmeXNjeXZ0bGNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODExMTgsImV4cCI6MjA2ODE1NzExOH0.WrOs24qxI3I5Ps8O27LQ2c0nb7qjTbbKoy4B204-5N0'

console.log('Supabase configuration:', {
  url: supabaseUrl ? 'Set' : 'Missing',
  key: supabaseAnonKey ? 'Set' : 'Missing',
  urlLength: supabaseUrl?.length || 0,
  keyLength: supabaseAnonKey?.length || 0
})

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Server-side client with service role key
export const createServerClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wavezrlgdhfyscyvtlcn.supabase.co'
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhdmV6cmxnZGhmeXNjeXZ0bGNuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU4MTExOCwiZXhwIjoyMDY4MTU3MTE4fQ.GX9kBHsK9YIjgFxIHg5gUPMCPG4QuZ2wnBLVFxVRMoE'
  
  return createClient<Database>(url, key)
} 