// scripts/check-salary.js â€” one-off diagnostic, can be deleted
const { createClient } = require('@supabase/supabase-js');

(async () => {
  const url = process.env.SUPABASE_URL || 'https://qxvvpedapgfchnnixyhj.supabase.co';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    || process.env.SUPABASE_ANON_KEY
    || process.env.VITE_SUPABASE_ANON_KEY;
  if (!key) {
    console.error('NO KEY FOUND in env. Set SUPABASE_SERVICE_ROLE_KEY and rerun.');
    process.exit(1);
  }
  const sb = createClient(url, key, { auth: { persistSession: false } });

  // 1) What's in salary_benchmarks (the live source the calculator reads from)
  const live = await sb
    .from('salary_benchmarks')
    .select('role,country,base_salary,remote_mult,effective_from,source')
    .order('effective_from', { ascending: false });
  console.log('=== salary_benchmarks (live) â€” total rows:', live.data?.length || 0);
  if (live.data) {
    // Show ai_ml BR + a few others
    const aiBr = live.data.filter(r => r.role === 'ai_ml' && r.country === 'BR').slice(0, 5);
    console.log('ai_ml/BR rows (most recent first):');
    aiBr.forEach(r => console.log('  ', JSON.stringify(r)));
  }

  // 2) What's in salary_benchmarks_proposed (admin staging)
  const prop = await sb
    .from('salary_benchmarks_proposed')
    .select('role,country,base_salary,remote_mult,source,approved')
    .limit(1000);
  console.log('\n=== salary_benchmarks_proposed â€” total rows:', prop.data?.length || 0);
  if (prop.data) {
    const aiBr = prop.data.filter(r => r.role === 'ai_ml' && r.country === 'BR');
    console.log('ai_ml/BR proposed rows:');
    aiBr.forEach(r => console.log('  ', JSON.stringify(r)));
  }
})().catch(e => { console.error(e); process.exit(1); });
