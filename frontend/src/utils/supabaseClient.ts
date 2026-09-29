import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let supabaseInstance: SupabaseClient | null = null

export function getSupabaseUrl(): string {
  const url = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) || ''
  return typeof url === 'string' ? url.trim() : ''
}

export function getSupabaseAnonKey(): string {
  const key = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) || ''
  return typeof key === 'string' ? key.trim() : ''
}


export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey())
}

/**
 * Returns singleton Supabase client using frontend-safe configuration.
 * Throws explicit LOCAL_ENV_SETUP_REQUIRED error if environment variables are missing.
 */
export function getSupabaseClient(): SupabaseClient {
  if (supabaseInstance) {
    return supabaseInstance
  }

  const url = getSupabaseUrl()
  const key = getSupabaseAnonKey()

  if (!url || !key) {
    throw new Error('LOCAL_ENV_SETUP_REQUIRED: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be configured in environment.')
  }

  supabaseInstance = createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  })

  return supabaseInstance
}

/**
 * Resets supabase client instance (useful for testing/mocking).
 */
export function resetSupabaseClientInstance(): void {
  supabaseInstance = null
}

/**
 * Ensures a valid Supabase session exists (authenticating anonymously if needed).
 * Production canonical endpoints use Supabase Anonymous Auth.
 *
 * Sequence:
 * 1. Inspect current Supabase session.
 * 2. If a valid session exists, reuse it.
 * 3. If no session exists, initialize Supabase Anonymous Auth.
 * 4. Obtain valid session JWT.
 */
export async function ensureAuthSession(): Promise<{ token: string; userId: string }> {
  const client = getSupabaseClient()

  // 1. Inspect current Supabase session
  const { data: sessionData, error: sessionErr } = await client.auth.getSession()

  if (!sessionErr && sessionData?.session?.access_token && sessionData?.session?.user?.id) {
    return {
      token: sessionData.session.access_token,
      userId: sessionData.session.user.id,
    }
  }

  // 2. Initialize Supabase Anonymous Auth if no valid session exists
  const { data: anonData, error: anonErr } = await client.auth.signInAnonymously()

  if (anonErr || !anonData?.session?.access_token || !anonData?.session?.user?.id) {
    const error = new Error('AUTH_SESSION_FAILED')
    ;(error as any).code = 'AUTH_SESSION_FAILED'
    ;(error as any).cause = anonErr
    throw error
  }

  return {
    token: anonData.session.access_token,
    userId: anonData.session.user.id,
  }
}
