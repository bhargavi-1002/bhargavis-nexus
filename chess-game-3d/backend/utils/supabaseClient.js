const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with service role key for server-side operations
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('Warning: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables');
  console.warn('Using anon key as fallback - this may not have proper permissions');
}

// Use service role key if available, otherwise fall back to anon key
const supabaseKey = supabaseServiceKey || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
