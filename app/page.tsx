// app/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { formatPrice, getChangeUI } from "@/lib/format";
import { TrendingUp, TrendingDown, Newspaper, Zap, ArrowLeft, RefreshCw, Loader2 } from "lucide-react";
import PriceCardsCarousel from "@/components/PriceCardsCarousel";
import PushBanner from "@/components/PushBanner";

interface HomeData {
  usdSyp: any;
  gold: any;
  btc: any;
  currencies: any[];
  news: any[];
}

export default function HomePage() {
  const [data, setData] = useState<<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const supabase = createClient();

      const { data: usdSyp } = await supabase
        .from("exchange_rates")
        .select("buy_price, sell_price, change_24h")
        .eq("base_currency", "USD")
        .eq("target_currency", "SYP")
        .eq("is_latest", true)
        .order("fetched_at", { ascending: false })
        .limit(1)
        .single();

      const { data: gold } = await supabase
        .from("asset_prices")
        .select("price_usd, change_24h")
        .eq("asset_type", "gold_ounce")
        .eq("asset_code", "XAU")
        .eq("is_latest", true)
        .order("fetched_at", { ascending: false })
        .limit(1)
        .single();

      const { data: btc } = await supabase
        .from("asset_prices")
        .select("price_usd, change_24h")
        .eq("asset_type", "crypto")
        .eq("asset_code", "BTC")
        .eq("is_latest", true)
        .order("fetched_at", { ascending: false })
        .limit(1)
        .single();

      const { data: currencies } = await supabase
        .from("exchange_rates")
        .select("target_currency, buy_price, change_24h")
        .eq("base_currency", "USD")
        .neq("target_currency", "SYP")
        .eq("is_latest", true)
        .order("fetched_at", { ascending: false })
        .limit(6);

      const { data: news } = await supabase
        .from("news_articles")
        .select("title_ar, slug, summary, category, published_at")
        .order("published_at", { ascending: false })
        .limit(4);

      setData({
        usdSyp,
        gold,
        btc,
        currencies: currencies || [],
        news: news || [],
      });
      setLastUpdate(new Date());
      setError(null);
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError("تعذر تحميل البيانات");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // ✅ جلب أولي
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ✅ تحديث تلقائي كل 30 ثانية
  useEffect(() => {
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // ✅ Real-time subscription
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("homepage-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "exchange_rates", filter: "is_latest=eq.true" },
        () => fetchData()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "asset_prices", filter: "is_latest=eq.true" },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  const cards = data
    ? [
        {
          title: "الدولار / ليرة",
          price: data.usdSyp ? formatPrice(data.usdSyp.sell_price, "SYP") : "—",
          change: data.usdSyp?.change_24h?.toString() || "0",
          unit: "ل.س",
          href: "/prices/currency",
          color: "primary",
        },
        {
          title: "الذهب (أونصة)",
          price: data.gold ? formatPrice(data.gold.price_usd, "USD") : "—",
          change: data.gold?.change_24h?.toString() || "0",
          unit: "دولار",
          href: "/prices/gold",
          color: "yellow",
        },
        {
          title: "البيتكوين",
          price: data.btc ? formatPrice(data.btc.price_usd, "USD") : "—",
          change: data.btc?.change_24h?.toString() || "0",
          unit: "دولار",
          href: "/prices/crypto",
          color: "orange",
        },
      ]
    : [];

  if (loading && !data) {
    return <HomeSkeleton />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with refresh */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">الرئيسية</h1>
          {lastUpdate && (
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`} />
              آخر تحديث: {lastUpdate.toLocaleTimeString("ar-SY")}
            </p>
          )}
        </div>
        <button
          onClick={fetchData}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border hover:border-primary transition text-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          تحديث
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 mb-6 text-center">
          <p className="text-red-500 text-sm">{error}</p>
          <button onClick={fetchData} className="mt-2 text-sm text-red-500 underline">
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* Price Cards */}
      <section className="mb-10">
        <PriceCardsCarousel cards={cards} />
      </section>

      {/* Push Banner */}
      <PushBanner />

      {/* Currencies Table */}
      {data?.currencies && data.currencies.length > 0 && (
        <section className="mb-12">
          <SectionHeader title="العملات العالمية" href="/prices/currency" />
          <div className="rounded-2xl bg-card border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-right text-sm font-medium">العملة</th>
                    <th className="px-4 py-3 text-right text-sm font-medium">السعر (USD)</th>
                    <th className="px-4 py-3 text-right text-sm font-medium">التغير 24h</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.currencies.map((c: any) => {
                    const change = parseFloat(c.change_24h) || 0;
                    const { color } = getChangeUI(change);
                    return (
                      <tr key={c.target_currency} className="hover:bg-muted/30 transition">
                        <td className="px-4 py-3 font-medium">{c.target_currency}</td>
                        <td className="px-4 py-3">{formatPrice(c.buy_price, "USD")}</td>
                        <td className={`px-4 py-3 ${color}`}>
                          <span className="flex items-center gap-1">
                            {change > 0 ? "+" : ""}
                            {change.toFixed(2)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* News Section */}
      {data?.news && data.news.length > 0 && (
        <section className="mb-12">
          <SectionHeader title="آخر الأخبار الاقتصادية" href="/news" />
          <div className="grid gap-4 md:grid-cols-2">
            {data.news.map((article: any) => (
              <NewsCard
                key={article.slug}
                title={article.title_ar}
                summary={article.summary}
                date={new Date(article.published_at).toLocaleDateString("ar-SY")}
                slug={article.slug}
              />
            ))}
          </div>
        </section>
      )}

      {/* Quick Links */}
      <section>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Zap className="w-6 h-6 text-primary" />
          تصفح سريع
        </h2>
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          {[
            { href: "/prices/fuel", icon: "⛽", title: "المحروقات", desc: "بنزين ومازوت وغاز" },
            { href: "/prices/electricity", icon: "⚡", title: "الكهرباء", desc: "شرائح الاستهلاك" },
            { href: "/news", icon: "📰", title: "الأخبار", desc: "اقتصادية وسورية" },
            { href: "/savings", icon: "💰", title: "مدخراتي", desc: "محفظتك الشخصية" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-xl bg-card p-4 border border-border text-center hover:border-primary/30 hover:shadow-md transition"
            >
              <span className="text-3xl block mb-2">{link.icon}</span>
              <h3 className="font-bold">{link.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{link.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

// ==================== Components ====================

function NewsCard({ title, summary, date, slug }: { title: string; summary: string; date: string; slug: string }) {
  return (
    <Link href={`/news/${slug}`} className="group block">
      <article className="rounded-xl bg-card p-4 border border-border transition-all hover:shadow-md hover:border-primary/20">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-muted-foreground">{date}</span>
        </div>
        <h3 className="font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">{title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{summary}</p>
      </article>
    </Link>
  );
}

function SectionHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-bold">{title}</h2>
      <Link href={href} className="text-sm text-primary hover:underline flex items-center gap-1">
        عرض الكل
        <ArrowLeft className="w-4 h-4" />
      </Link>
    </div>
  );
}

// ==================== Skeleton Loading ====================

function HomeSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="h-8 w-32 bg-muted rounded-lg animate-pulse" />
        <div className="h-10 w-24 bg-muted rounded-full animate-pulse" />
      </div>

      {/* Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-3 mb-10">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl bg-card p-5 border border-border animate-pulse">
            <div className="h-6 w-24 bg-muted rounded mb-4" />
            <div className="h-12 w-32 bg-muted rounded mb-3" />
            <div className="h-4 w-20 bg-muted rounded" />
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="rounded-2xl bg-card border border-border overflow-hidden mb-12">
        <div className="h-12 bg-muted/50 animate-pulse" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-14 border-b border-border animate-pulse flex items-center px-4">
            <div className="h-4 w-20 bg-muted rounded" />
          </div>
        ))}
      </div>
    </div>
  );
         }
       
