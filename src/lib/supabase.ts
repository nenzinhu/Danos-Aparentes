import { createBrowserSupabase, supabaseBrowserEnabled } from './supabase/browser'

export const supabaseEnabled = supabaseBrowserEnabled

/** Cliente browser (cookies via @supabase/ssr). Null se env ausente. */
export const supabase = createBrowserSupabase()
