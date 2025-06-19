import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { User, Session } from '@supabase/supabase-js'; // Import User and Session types

// Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Retrieves the Supabase user and session object in server-side contexts
 * (Route Handlers, Server Actions, Server Components).
 * Uses '@supabase/ssr' for cookie-based session management.
 *
 * @returns {Promise<{ user: User | null; session: Session | null; error: any | null }>}
 */
export async function getSupabaseUserAndSessionOnServer(): Promise<{ user: User | null; session: Session | null; error: any | null }> {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase URL or Anon Key is not set for server-side auth.');
    return { user: null, session: null, error: new Error('Missing Supabase environment variables') };
  }

  const cookieStore = cookies();
  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        // The set and remove methods are only needed if you're updating auth state
        // server-side (e.g. sign-in, sign-out, refresh session).
        // For read-only operations like getting user/session, they might not be strictly necessary
        // but it's good practice to include them if this client instance might be used for writes later.
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Handle potential errors if cookieStore is read-only (e.g. in certain RSC contexts)
            console.warn(`Failed to set cookie ${name}:`, error);
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.delete({ name, ...options });
          } catch (error)
          {
            console.warn(`Failed to delete cookie ${name}:`, error);
          }
        },
      },
    }
  );

  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    console.error('Error getting Supabase session on server:', error.message);
    return { user: null, session: null, error };
  }

  if (!session) {
    return { user: null, session: null, error: null };
  }

  // The session object contains the user.
  return { user: session.user, session, error: null };
}

/**
 * Retrieves the current user's ID in server-side contexts.
 * Wrapper around getSupabaseUserAndSessionOnServer.
 *
 * @returns {Promise<string | null>} The user ID if a session exists, otherwise null.
 */
export async function getCurrentUserIdOnServer(): Promise<string | null> {
    const { user, error } = await getSupabaseUserAndSessionOnServer();
    // Do not log full error object here, just message if needed, or rely on previous log.
    if (error) {
        // console.error("Error in getCurrentUserIdOnServer:", error.message); // Already logged in getSupabaseUserAndSessionOnServer
        return null;
    }
    return user?.id || null;
}
