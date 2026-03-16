import { createClient } from '@supabase/supabase-js';

// Get the environment to use (development, production, special-production, etc.)
const environment = process.env.DB_ENVIRONMENT || 'development';

// Get Supabase credentials from environment variables
const supabaseUrl = process.env[`SUPABASE_URL_${environment.toUpperCase()}`] || process.env.SUPABASE_URL;
const supabaseKey = process.env[`SUPABASE_KEY_${environment.toUpperCase()}`] || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    `Supabase credentials not found for environment: ${environment}. ` +
    `Please set SUPABASE_URL_${environment.toUpperCase()} and SUPABASE_KEY_${environment.toUpperCase()} ` +
    `or SUPABASE_URL and SUPABASE_KEY environment variables.`
  );
}

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
  },
});
