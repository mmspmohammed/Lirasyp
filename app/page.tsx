import { createServerSupabase } from "@/lib/supabase-server";
import { formatPrice } from "@/lib/format";
import HomePageClient from "@/components/home/HomePageClient";

interface HomeData {
  usdSyp: { buy_price: number; sell_price: number; change_24h: number } | null;
  gold: { price_usd: number; change_24h: number } | null;
  btc: { price_usd: number; change_24h: number } | null;
  currencies: Array<{ target_currency: string; buy_price: number; change_24h: number }>;
  news: Array<{ title_ar: string; slug: string; summary: string; category: string; published_at: string }>;
}

async function getHomeData(): Promise<<HomeData> {
  const supabase = createServerSupabase();

  const [
    { data: usdSyp },
    { data: gold },
    { data: btc },
    { data: currencies },
    { data: news },
  ] = await Promise.all([
    supabase
      .from("exchange_rates")
      .select("buy_price, sell_price, change_24h")
      .eq("base_currency", "USD")
      .eq("target_currency", "SYP")
      .eq("is_latest", true)
      .order("fetched_at", { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from("asset_prices")
      .select("price_usd, change_24h")
      .eq("asset_type", "gold_ounce")
      .eq("asset_code", "XAU")
      .eq("is_latest", true)
      .order("fetched_at", { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from("asset_prices")
      .select("price_usd, change_24h")
      .eq("asset_type", "crypto")
      .eq("asset_code", "BTC")
      .eq("is_latest", true)
      .order("fetched_at", { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from("exchange_rates")
      .select("target_currency, buy_price, change_24h")
      .eq("base_currency", "USD")
      .neq("target_currency", "SYP")
      .eq("is_latest", true)
      .order("fetched_at", { ascending: false })
      .limit(6),
    supabase
      .from("news_articles")
      .select("title_ar, slug, summary, category, published_at")
      .order("published_at", { ascending: false })
      .limit(4),
  ]);

  return {
    usdSyp: usdSyp || null,
    gold: gold || null,
    btc: btc || null,
    currencies: currencies || [],
    news: news || [],
  };
}

export default async function HomePage() {
  const data = await getHomeData();
  return <HomePageClient initialData={data} />;
}
