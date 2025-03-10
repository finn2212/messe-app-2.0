import { createClient } from "@supabase/supabase-js";

// Get Supabase credentials from Nuxt runtime config
const config = useRuntimeConfig();
const supabaseUrl = "https://usdjmwlpvhrsnojdikga.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzZGptd2xwdmhyc25vamRpa2dhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1OTc0MDMsImV4cCI6MjA1NzE3MzQwM30.yNCuiBdk84Ni1DWL0zb26w9QvAP49XbBXIIFNf4Xt4A";

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default defineEventHandler(async (event) => {
  try {
    const { data, error } = await supabase.from("test").select("*").limit(1); // Select one row to keep DB active
    if (error) throw error;

    return { db: true, message: "Database is alive" };
  } catch (err) {
    console.error("DB Health Check Failed:", err);
    return { db: false, message: "Database check failed" };
  }
});
