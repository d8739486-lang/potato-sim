import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://cxqusextxkgqhmrzlacs.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4cXVzZXh0eGtncWhtcnpsYWNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1NDE3NzMsImV4cCI6MjEwMDExNzc3M30.Mj6Dit-Fe62Q5o9SQqjtaxZGv0ulFTr44l1mHj1nX44'
);

async function run() {
  const { data, error } = await supabase.from('players').delete().eq('player_name', 'далбаеб');
  console.log('Result:', data, error);
}

run();
