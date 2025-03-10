import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from Nuxt runtime config
const config = useRuntimeConfig();
const supabaseUrl = config.public.SUPABASE_URL;
const supabaseAnonKey = config.public.SUPABASE_ANON_KEY;

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default defineEventHandler(async (event) => {
  try {
    const { data, error } = await supabase.from('test').select('*').limit(1); // Select one row to keep DB active
    if (error) throw error;

    return { db: true, message: 'Database is alive' };
  } catch (err) {
    console.error('DB Health Check Failed:', err);
    return { db: false, message: 'Database check failed' };
  }
});