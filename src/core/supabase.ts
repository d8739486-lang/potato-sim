import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://larhnthjisczxgrshefq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_VfNAc2syW1ggppp6bvd7_A_coe49U98';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
