import { createClient } from '@supabase/supabase-js';

// Ensure you have VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Missing environment variable: VITE_SUPABASE_URL");
}
if (!supabaseAnonKey) {
  throw new Error("Missing environment variable: VITE_SUPABASE_ANON_KEY");
}

// Create and export the Supabase client instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Optional: Define types based on your Supabase schema (using supabase gen types typescript)
// This can improve type safety when interacting with your database.
// Example: export type Database = { ... } // Generated types
// export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
