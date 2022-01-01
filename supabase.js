import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(this.$config.supabaseUrl, this.$config.supabaseKey);
