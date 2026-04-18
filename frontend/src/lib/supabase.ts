import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fkcywhuzovaaxadmemnf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrY3l3aHV6b3ZhYXhhZG1lbW5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyOTcwMTUsImV4cCI6MjA4OTg3MzAxNX0.oxYDbKT3sidlHj9TcHosRAqgWOpIRvGYmWop8XYOXP0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
