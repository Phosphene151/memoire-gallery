import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zdhtqjrrzlzosbhxzahc.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkaHRxanJyemx6b3NiaHh6YWhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4ODA3NDYsImV4cCI6MjA5NTQ1Njc0Nn0.jJT9VRI3sv0EFoml7sbw-SCjB9C68kLCdsQ7dNcG6lA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)