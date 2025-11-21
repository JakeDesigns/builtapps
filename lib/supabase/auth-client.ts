/**
 * Auth-enabled Supabase Client
 * 
 * This is a separate client specifically for authentication purposes.
 * It enables session persistence and auto-refresh for auth functionality.
 * 
 * Use this client for:
 * - Sign up / Sign in / Sign out operations
 * - Auth state management
 * - Protected API calls that require user authentication
 * 
 * The existing lib/supabase/client.ts remains unchanged and is used
 * for non-auth database operations.
 */

import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create browser client with proper SSR support
export const supabaseAuth = createBrowserClient(supabaseUrl, supabaseAnonKey);
