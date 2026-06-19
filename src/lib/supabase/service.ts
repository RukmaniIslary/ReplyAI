import { createClient } from '@supabase/supabase-js'

/**
 * Service role client — bypasses RLS.
 * Requires SUPABASE_SERVICE_ROLE_KEY to be the JWT service role key
 * from Supabase Dashboard → Settings → API → service_role
 * (starts with eyJ..., NOT a Postgres connection string)
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }

  // Guard against accidentally using the Postgres DSN
  if (key.startsWith('postgresql://') || key.startsWith('postgres://')) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is a Postgres connection string. ' +
      'Go to Supabase Dashboard → Settings → API → service_role and copy the JWT key (starts with eyJ...).'
    )
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
