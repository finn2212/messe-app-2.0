import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://usdjmwlpvhrsnojdikga.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzZGptd2xwdmhyc25vamRpa2dhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1OTc0MDMsImV4cCI6MjA1NzE3MzQwM30.yNCuiBdk84Ni1DWL0zb26w9QvAP49XbBXIIFNf4Xt4A'
const supabase = createClient(supabaseUrl, supabaseKey)

export default defineNuxtPlugin(() => {
  return {
    provide: {
      supabase,
    },
  }
})