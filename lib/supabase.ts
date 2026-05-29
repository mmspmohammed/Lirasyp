import { createBrowserClient } from '@supabase/ssr';

let client: ReturnType<typeof createBrowserClient> | undefined;

// ✅ عميل واحد ثابت (Singleton) لتحسين الأداء ومنع إعادة الاتصال
export const createClient = () => {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return client;
};

export const getLatestRate = async (base: string, target: string) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('exchange_rates')
    .select('buy_price, sell_price, change_24h, fetched_at')
    .eq('base_currency', base)
    .eq('target_currency', target)
    .eq('is_latest', true)
    .order('fetched_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  
  if (error) console.error('Error fetching rate:', error);
  return data;
};