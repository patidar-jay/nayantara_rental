// ============================================================================
// Supabase Client
// Single shared browser client for the Nayantara Rental Platform.
//
// Designed to be the ONLY module that knows about Supabase specifically — the
// rest of the app talks to repositories/services, so the backend can later be
// swapped (PostgreSQL, custom API, etc.) by replacing the infrastructure layer.
// ============================================================================

import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// ---------------------------------------------------------------------------
// Graceful degradation: warn in dev if env vars are missing instead of
// crashing the entire app. Hooks will fail at query time with clear errors.
// ---------------------------------------------------------------------------

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase] ⚠️  Missing environment variables. Define VITE_SUPABASE_URL ' +
    'and VITE_SUPABASE_ANON_KEY in a .env file at the project root.\n' +
    'The app will render but API calls will fail.',
  );
}

// Use a placeholder URL when env vars are missing so the client can
// still be instantiated (queries will fail with network errors).
export const supabase: SupabaseClient = createClient(
  supabaseUrl  || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  },
);
