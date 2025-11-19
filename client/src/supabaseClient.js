
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rodqhbzowwvdsncduilm.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvZHFoYnpvd3d2ZHNuY2R1aWxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NzA4NzAsImV4cCI6MjA3OTE0Njg3MH0.936Fa_7cOU6Wt6WGkPpMemJnfc8pjXAwR0XxyjntO-c'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
