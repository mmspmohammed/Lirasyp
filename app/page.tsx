// app/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { formatPrice, getChangeUI } from "@/lib/format";
import { 
  TrendingUp, TrendingDown, Newspaper, Zap, ArrowLeft, RefreshCw, 
  Loader2, DollarSign, BarChart3, BellRing, Sparkles, 
  Activity, Clock, Coins, Gem, Bitcoin, Wallet 
} from "lucide-react";
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
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [secondsSinceUpdate, setSecondsSinceUpdate] = useState(0);

  // تحديث عداد الثواني بعد آخر تحديث
  useEffect(() => {
    if (!lastUpdate) return;
    const interval = setInterval(() => {
      const seconds = Math.floor((Date.now() - lastUpdate.getTime()) / 1000);
      setSecondsSinceUpdate(seconds);
    }, 1000);
    return () => clearInterval(interval);
  }, [lastUpdate]);

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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

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
          icon: DollarSign,
          gradient: "from-blue-500/20 to-cyan-500/20",
          borderColor: "border-blue-500/30",
        },
        {
          title: "الذهب (أونصة)",
          price: data.gold ? formatPrice(data.gold.price_usd, "USD") : "—",
          change: data.gold?.change_24h?.toString() || "0",
          unit: "دولار",
          href: "/prices/gold",
          icon: Gem,
          gradient: "from-yellow-500/20 to-amber-500/20",
          borderColor: "border-yellow-500/30",
        },
        {
          title: "البيتكوين",
          price: data.btc ? formatPrice(data.btc.price_usd, "USD") : "—",
          change: data.btc?.change_24h?.toString() || "0",
          unit: "دولار",
          href: "/prices/crypto",
          icon: Bitcoin,
          gradient: "from-orange-500/20 to-red-500/20",
          borderColor: "border-orange-500/30",
        },
      ]
    : [];

  if (loading && !data) {
    return <HomeSkeleton />;
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      {/* Hero Section with Gradient */}
      <div className="relative rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6 md:p-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary animate-pulse" />
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-l from-foreground to-primary/70 bg-clip-text text-transparent">
                مرحباً بك في الليرة عملتنا
              </h1>
            </div>
            <p className="text-muted-foreground max-w-lg">
              تابع أسعار الصرف والذهب والعملات الرقمية بشكل لحظي مع تحديثات فورية وإشعارات ذكية.
            </p>
          </div>
          
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-center animate-fadeInUp">
          <p className="text-red-500 text-sm">{error}</p>
          <button onClick={fetchData} className="mt-2 text-sm text-red-500 underline">
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* Highlight Cards - Dynamic Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            أبرز الأسعار
          </h2>
          <span className="text-xs text-muted-foreground">تحديث مباشر</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card, i) => {
            const change = parseFloat(card.change) || 0;
            const { color: changeColor, bg: changeBg } = getChangeUI(change);
            const isPositive = change >= 0;
            const Icon = card.icon;
            
            return (
              <Link
                key={i}
                href={card.href}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br p-[1px] transition-all duration-300 hover:scale-[1.02]"
                style={{ background: `linear-gradient(135deg, ${card.borderColor.replace('border-', '').replace('/30', '')}, transparent)` }}
              >
                <div className={`relative h-full rounded-2xl bg-card p-5 backdrop-blur-sm transition-all duration-300 group-hover:shadow-xl`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-2 rounded-xl bg-gradient-to-br ${card.gradient}`}>
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${changeBg} ${changeColor}`}>
                      {isPositive ? "+" : ""}{change.toFixed(2)}%
                    </div>
                  </div>
                  <h3 className="font-medium text-muted-foreground text-sm mb-1">{card.title}</h3>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-3xl font-bold">{card.price}</span>
                    <span className="text-sm text-muted-foreground">{card.unit}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    {isPositive ? <TrendingUp className="w-3 h-3 text-green-500" /> : <TrendingDown className="w-3 h-3 text-red-500" />}
                    <span className={changeColor}>التغير 24h</span>
                  </div>
                  <ArrowLeft className="absolute left-4 bottom-4 w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all group-hover:-translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Price Cards Carousel (Horizontal Swipe) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Coins className="w-5 h-5 text-primary" />
            أسعار العملات 
          </h2>
          <Link href="/prices/currency" className="text-sm text-primary hover:underline flex items-center gap-1">
            عرض الكل <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
        <PriceCardsCarousel cards={cards.slice(0, 3)} />
      </section>

      {/* Push Notification Banner */}
      <PushBanner />

      {/* Currencies Table with Modern Design */}
      {data?.currencies && data.currencies.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              أسعار صرف العملات
            </h2>
            <span className="text-xs text-muted-foreground">مقابل الدولار الأمريكي</span>
          </div>
          <div className="rounded-2xl bg-card border border-border overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-muted/50 to-muted/30">
                  <tr>
                    <th className="px-5 py-4 text-right text-sm font-semibold">العملة</th>
                    <th className="px-5 py-4 text-right text-sm font-semibold">السعر (USD)</th>
                    <th className="px-5 py-4 text-right text-sm font-semibold">التغير 24h</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.currencies.map((c: any, idx: number) => {
                    const change = parseFloat(c.change_24h) || 0;
                    const { color, Icon: changeIcon } = getChangeUI(change);
                    return (
                      <tr key={c.target_currency} className="hover:bg-muted/30 transition-all duration-200 group">
                        <td className="px-5 py-3 font-medium">
                          <span className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                              {c.target_currency.charAt(0)}
                            </span>
                            {c.target_currency}
                          </span>
                        </td>
                        <td className="px-5 py-3 font-mono text-sm">{formatPrice(c.buy_price, "USD")}</td>
                        <td className={`px-5 py-3 ${color} flex items-center gap-1`}>
                          {changeIcon}
                          <span>{change > 0 ? "+" : ""}{change.toFixed(2)}%</span>
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

      {/* News Section with Cards */}
      {data?.news && data.news.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-primary" />
              آخر الأخبار الاقتصادية
            </h2>
            <Link href="/news" className="text-sm text-primary hover:underline flex items-center gap-1">
              جميع الأخبار <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {data.news.map((article: any, idx: number) => (
              <NewsCard
                key={article.slug}
                title={article.title_ar}
                summary={article.summary}
                date={new Date(article.published_at).toLocaleDateString("ar-SY")}
                slug={article.slug}
                index={idx}
              />
            ))}
          </div>
        </section>
      )}


// ==================== Enhanced News Card ====================
function NewsCard({ title, summary, date, slug, index }: { title: string; summary: string; date: string; slug: string; index: number }) {
  return (
    <Link href={`/news/${slug}`} className="group block">
      <article className="relative rounded-xl bg-card border border-border p-5 transition-all duration-300 hover:shadow-lg hover:border-primary/30 hover:-translate-y-1 animate-fadeInUp" style={{ animationDelay: `${index * 50}ms` }}>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-xs text-muted-foreground">{date}</span>
        </div>
        <h3 className="font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">{title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{summary}</p>
        <div className="mt-4 flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
          اقرأ المزيد <ArrowLeft className="w-3 h-3" />
        </div>
      </article>
    </Link>
  );
}

// ==================== Enhanced Skeleton ====================
function HomeSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      {/* Hero Skeleton */}
      <div className="rounded-3xl bg-muted/30 p-6 md:p-8 animate-pulse">
        <div className="h-8 w-64 bg-muted rounded-lg mb-3" />
        <div className="h-4 w-96 bg-muted rounded-lg" />
      </div>

      {/* Cards Skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl bg-card p-5 border border-border animate-pulse">
            <div className="flex justify-between mb-4">
              <div className="h-10 w-10 bg-muted rounded-xl" />
              <div className="h-6 w-16 bg-muted rounded-full" />
            </div>
            <div className="h-4 w-24 bg-muted rounded mb-2" />
            <div className="h-8 w-32 bg-muted rounded mb-2" />
            <div className="h-3 w-20 bg-muted rounded" />
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="rounded-2xl bg-card border border-border overflow-hidden">
        <div className="h-12 bg-muted/50 animate-pulse" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-14 border-b border-border animate-pulse flex items-center px-5">
            <div className="h-4 w-24 bg-muted rounded" />
          </div>
        ))}
      </div>
    </div>
  );
          }
