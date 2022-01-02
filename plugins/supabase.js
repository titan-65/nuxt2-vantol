import { createClient } from '@supabase/supabase-js';
import config from '~/nuxt.config';


const SUPABASE_URL = config.publicRuntimeConfig.supabaseUrl;
const SUPABASE_KEY = config.privateRuntimeConfig.supabaseKey;

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
