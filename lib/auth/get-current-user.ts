import { supabase } from '@/lib/supabase/client'; // Assuming this is the client-side accessible Supabase client
// For server-side contexts (e.g., Next.js Route Handlers or Server Actions),
// you would typically use Supabase's server-side client libraries like '@supabase/ssr'
// to correctly handle user sessions from cookies.
// This initial version might be more suited for client-side calls or basic server use
// where the Supabase client can infer the user from a session.

/**
 * Retrieves the current user's ID from Supabase.
 * This function is intended to be adaptable for both client and server contexts.
 * In a Next.js server environment (Route Handlers, Server Actions),
 * proper session handling (e.g., via @supabase/ssr) is crucial.
 *
 * For operations requiring strict server-side authentication, ensure this is called
 * in a context where the Supabase client has access to the user's session
 * (e.g., by passing cookies or using a server-side Supabase client instance).
 *
 * @returns {Promise<string | null>} The user ID if a session exists, otherwise null.
 */
export async function getCurrentUserId(): Promise<string | null> {
  // Attempt to get the current session and user
  // This works on the client-side directly.
  // On the server-side (Node.js), this specific client instance might not have session context
  // unless it's a special server-side client or session info is passed.
  // PR #533 implies server-side usage, so @supabase/ssr would be the robust way for Next.js.
  // For now, this provides the function signature and basic Supabase interaction.
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    console.error('Error getting Supabase session:', error.message);
    return null;
  }

  if (session && session.user) {
    return session.user.id;
  }

  return null;
}

/**
 * Retrieves the full current user object from Supabase.
 * Similar caveats about client-side vs server-side session handling apply.
 *
 * @returns {Promise<User | null>} The Supabase user object if a session exists, otherwise null.
 */
// import { User } from '@supabase/supabase-js'; // Import User type
// export async function getCurrentUser(): Promise<User | null> {
//   const { data: { session }, error } = await supabase.auth.getSession();
//
//   if (error) {
//     console.error('Error getting Supabase session:', error.message);
//     return null;
//   }
//
//   if (session && session.user) {
//     return session.user;
//   }
//
//   return null;
// }
