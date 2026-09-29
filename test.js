import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cxqusextxkgqhmrzlacs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4cXVzZXh0eGtncWhtcnpsYWNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1NDE3NzMsImV4cCI6MjEwMDExNzc3M30.Mj6Dit-Fe62Q5o9SQqjtaxZGv0ulFTr44l1mHj1nX44';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log("Fetching...");
  const { data, error } = await supabase
    .from('players')
    .select('player_name, balance, rebirths')
    .order('rebirths', { ascending: false })
    .order('balance', { ascending: false })
    .limit(50);
    
  console.log("Data:", data);
  console.log("Error:", error);
}

test();
