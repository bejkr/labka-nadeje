
import { createClient } from '@supabase/supabase-js';

// Konfigurácia pre novú Supabase databázu (Live Production)
const supabaseUrl = 'https://qcwoyklifcekulkhrqmz.supabase.co';
const supabaseKey = 'sb_publishable_Z2xDV7F4QR3Y4gnLaXLGGg_yqmv72T-';

export const supabase = createClient(supabaseUrl, supabaseKey);
