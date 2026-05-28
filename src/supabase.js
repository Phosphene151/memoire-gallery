import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zdhtqjrrzlzosbhxzahc.supabase.BSG'
const supabaseAnonKey = 'sb_publishable_7igSJ_GSje4APpwUAwX8CQ_gUsb8BSG'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
