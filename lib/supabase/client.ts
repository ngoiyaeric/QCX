import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL environment variable is not set.');
}
if (!supabaseAnonKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable is not set.');
}

// Supabase client for client-side usage (e.g., in React components)
// This client uses the public anon key.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// It's generally recommended to handle server-side Supabase operations
// (like those requiring service_role or auth admin tasks) in dedicated server-side modules or API routes.
// If you need a server-side client for specific auth-related tasks using the service role key,
// it should be initialized carefully and only used in secure server environments.
// For example, a function to get a service role client:
// import { SupabaseClient } from '@supabase/supabase-js';
// let _serviceRoleClient: SupabaseClient | null = null;
// export const getSupabaseServiceRoleClient = (): SupabaseClient => {
//   if (_serviceRoleClient) return _serviceRoleClient;
//   const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
//   if (!serviceKey) {
//     throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is not set.');
//   }
//   _serviceRoleClient = createClient(supabaseUrl, serviceKey, {
//     auth: {
//       autoRefreshToken: false,
//       persistSession: false,
//     },
//   });
//   return _serviceRoleClient;
// };
// However, for many server-side Next.js operations (like in Route Handlers or Server Actions),
// you might use the Supabase Server Client (@supabase/ssr) which is designed for Next.js and handles sessions.
// For now, the PR seems to focus on Drizzle for DB and basic Supabase client for auth interactions.
// We will stick to the basic client and can expand if @supabase/ssr is intended by PR #533.
