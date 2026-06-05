// app/page.tsx
import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase-server";
import { formatPrice } from "@/lib/format";
import { Zap, ArrowLeft, DollarSign, Coins, Bitcoin } from "lucide-react";
import AnimatedHeroCards from "@/components/AnimatedHeroCards";
import LiveTickerBar from "@/components/LiveTickerBar";
import SparklineChart from "@/components/SparklineChart";
import ScrollReveal from "@/components/ScrollReveal";
import PushBanner from "@/components/PushBanner";

export const revalidate = 60;

export const metadata = {
  title: "الرئيسية | الليرة عملتنا",
  description: "تتبع لحظي لأسعار الدولار والليرة السورية والذهب والعملات الرقمية في سوريا.",
  openGraph: {
    title: "الليرة عملتنا | أسعار الصرف والذهب في سوريا",
    description: "تتبع لحظي لأسعار الدولار والليرة السورية والذهب والعملات الرقمية.",
  },
};

// ─── مكونات فرعية ────────────────────────────────────────

function NewsCard({
  title,
  summary,
  date,
  slug,
  category,
}: {
  title: string;
  summary: string;
  date: string;
  slug: string;
  category?: string;
}) {
  return (
    <Link href={`/news/${slug}`} className="group block h-full">
      <article className="relative rounded-xl bg-card p-5 border border-border h-full transition-all duration-300 hover:shadow-lg hover:border-primary/30 hover:-translate-y-1 overflow-hidden">
        {/* شريط فئة لوني */}
        {category && (
          <span className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/60 to-transparent" />
        )}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {date}
          </span>
          {category && (
            <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              {category}
            </span>
          )}
        </div>
        <h3 className="font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2 text-base">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {summary}
        </p>
        <div className="mt-3 flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
          اقرأ المزيد
          <ArrowLeft className="w-3 h-3" />
        </div>
      </article>
    </Link>
  );
}

function SectionHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <span className="w-1.5 h-6 bg-primary rounded-full inline-block" />
        {title}
      </h2>
      <Link
        href={href}
        className="text-sm text-primary hover:underline flex items-center gap-1 font-medium transition-colors"
      >
        عرض الكل
        <ArrowLeft className="w-4 h-4" />
      </Link>
    </div>
  );
}

function QuickLinkCard({
  href,
  icon,
  title,
  desc,
}: {
  href: string;
  icon: string;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-xl bg-card p-5 border border-border text-center transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:-translate-y-1 hover:bg-primary/5"
    >
      <span className="text-4xl block mb-3 transition-transform duration-300 group-hover:scale-110 inline-block">
        {icon}
      </span>
      <h3 className="font-bold mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground">{desc}</p>
    </Link>
  );
}

// ─── جلب البيانات الرئيسية + بيانات الرسوم البيانية ─────

async function getHomeData() {
  const supabase = createServerSupabase();

  // البيانات الرئيسية – متوازية
  const [
    { data: usdSyp },
    { data: gold },
    { data: btc },
    { data: currencies },
    { data: news },
    // بيانات الرسوم البيانية المصغرة
    { data: usdSparkline },
    { data: goldSparkline },
    { data: btcSparkline },
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
    // USD/SYP sparkline – آخر 30 نقطة
    supabase
      .from("exchange_rates")
      .select("sell_price")
      .eq("base_currency", "USD")
      .eq("target_currency", "SYP")
      .order("fetched_at", { ascending: false })
      .limit(30),
    // Gold sparkline – آخر 30 نقطة
    supabase
      .from("asset_prices")
      .select("price_usd")
      .eq("asset_type", "gold_ounce")
      .eq("asset_code", "XAU")
      .order("fetched_at", { ascending: false })
      .limit(30),
    // BTC sparkline – آخر 30 نقطة
    supabase
      .from("asset_prices")
      .select("price_usd")
      .eq("asset_type", "crypto")
      .eq("asset_code", "BTC")
      .order("fetched_at", { ascending: false })
      .limit(30),
  ]);

  // عكس ترتيب بيانات sparkline لتصبح زمنياً من الأقدم للأحدث
  const reversePrices = (arr: any[] | null) =>
    arr ? arr.reverse().map((r: any) => r.sell_price ?? r.price_usd ?? 0) : [];

  return {
    usdSyp,
    gold,
    btc,
    currencies: currencies || [],
    news: news || [],
    usdSparklineData: reversePrices(usdSparkline),
    goldSparklineData: reversePrices(goldSparkline),
    btcSparklineData: reversePrices(btcSparkline),
  };
}

// ─── الصفحة الرئيسية ─────────────────────────────────────

export default async function HomePage() {
  const data = await getHomeData();

  // بيانات البطاقات الرئيسية
  const heroCards = [
    {
      title: "الدولار / ليرة",
      formattedPrice: data.usdSyp
        ? formatPrice(data.usdSyp.sell_price, "SYP")
        : "—",
      rawPrice: data.usdSyp?.sell_price ?? 0,
      change: Number(data.usdSyp?.change_24h) || 0,
      unit: "ل.س",
      href: "/prices/currency",
      color: "primary" as const,
      sparklineData: data.usdSparklineData,
      icon: <DollarSign className="w-6 h-6" />,
      changeLabel: data.usdSyp?.change_24h
        ? `${Number(data.usdSyp.change_24h) >= 0 ? "+" : ""}${Number(data.usdSyp.change_24h).toFixed(2)}%`
        : "0%",
    },
    {
      title: "الذهب (أونصة)",
      formattedPrice: data.gold
        ? formatPrice(data.gold.price_usd, "USD")
        : "—",
      rawPrice: data.gold?.price_usd ?? 0,
      change: Number(data.gold?.change_24h) || 0,
      unit: "دولار",
      href: "/prices/gold",
      color: "yellow" as const,
      sparklineData: data.goldSparklineData,
      icon: <Coins className="w-6 h-6" />,
      changeLabel: data.gold?.change_24h
        ? `${Number(data.gold.change_24h) >= 0 ? "+" : ""}${Number(data.gold.change_24h).toFixed(2)}%`
        : "0%",
    },
    {
      title: "البيتكوين",
      formattedPrice: data.btc
        ? formatPrice(data.btc.price_usd, "USD")
        : "—",
      rawPrice: data.btc?.price_usd ?? 0,
      change: Number(data.btc?.change_24h) || 0,
      unit: "دولار",
      href: "/prices/crypto",
      color: "orange" as const,
      sparklineData: data.btcSparklineData,
      icon: <Bitcoin className="w-6 h-6" />,
      changeLabel: data.btc?.change_24h
        ? `${Number(data.btc.change_24h) >= 0 ? "+" : ""}${Number(data.btc.change_24h).toFixed(2)}%`
        : "0%",
    },
  ];

  // بيانات الشريط المتحرك
  const tickerItems = [
    {
      label: "دولار/ليرة",
      buy: data.usdSyp?.buy_price ?? 0,
      sell: data.usdSyp?.sell_price ?? 0,
      change: Number(data.usdSyp?.change_24h) || 0,
      unit: "ل.س",
    },
    {
      label: "ذهب",
      price: data.gold?.price_usd ?? 0,
      change: Number(data.gold?.change_24h) || 0,
      unit: "$",
    },
    {
      label: "بيتكوين",
      price: data.btc?.price_usd ?? 0,
      change: Number(data.btc?.change_24h) || 0,
      unit: "$",
    },
    ...(data.currencies || []).map((c: any) => ({
      label: `USD/${c.target_currency}`,
      buy: c.buy_price,
      sell: c.buy_price,
      change: Number(c.change_24h) || 0,
      unit: c.target_currency,
    })),
  ];

  const quickLinks = [
    { href: "/prices/fuel", icon: "⛽", title: "المحروقات", desc: "بنزين ومازوت وغاز" },
    { href: "/prices/electricity", icon: "⚡", title: "الكهرباء", desc: "شرائح الاستهلاك" },
    { href: "/news", icon: "📰", title: "الأخبار", desc: "اقتصادية وسورية" },
    { href: "/about", icon: "ℹ️", title: "عن الموقع", desc: "من نحن" },
  ];

  return (
    <div className="min-h-screen">
      {/* شريط الأسعار المتحرك */}
      <LiveTickerBar items={tickerItems} />

      <div className="container mx-auto px-4 py-6">
        {/* البطاقات الرئيسية التفاعلية مع رسوم بيانية مصغرة */}
        <ScrollReveal>
          <section className="mb-8">
            <AnimatedHeroCards cards={heroCards} />
          </section>
        </ScrollReveal>

        {/* بانر الإشعارات */}
        <ScrollReveal>
          <PushBanner />
        </ScrollReveal>

        {/* العملات الأخرى */}
        {data.currencies.length > 0 && (
          <ScrollReveal>
            <section className="mb-10 mt-10">
              <SectionHeader title="أسعار العملات الأخرى" href="/prices/currency" />
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {data.currencies.map((c: any) => {
                  const change = Number(c.change_24h) || 0;
                  const isUp = change >= 0;
                  return (
                    <Link
                      key={c.target_currency}
                      href={`/prices/currency#${c.target_currency.toLowerCase()}`}
                      className="flex items-center justify-between rounded-xl bg-card p-4 border border-border transition-all hover:border-primary/20 hover:shadow-md hover:bg-primary/5 group"
                    >
                      <div>
                        <span className="font-bold text-sm">USD/{c.target_currency}</span>
                        <p className="text-lg font-mono mt-1">
                          {formatPrice(c.buy_price, c.target_currency)}
                        </p>
                      </div>
                      <div
                        className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full ${
                          isUp
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        <span className="text-base">{isUp ? "↑" : "↓"}</span>
                        {Math.abs(change).toFixed(2)}%
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          </ScrollReveal>
        )}

        {/* آخر الأخبار */}
        {data.news.length > 0 && (
          <ScrollReveal>
            <section className="mb-10">
              <SectionHeader title="آخر الأخبار الاقتصادية" href="/news" />
              <div className="grid gap-4 sm:grid-cols-2">
                {data.news.map((article: any) => (
                  <NewsCard
                    key={article.slug}
                    title={article.title_ar}
                    summary={article.summary}
                    date={new Date(article.published_at).toLocaleDateString("ar-SY", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                    slug={article.slug}
                    category={article.category}
                  />
                ))}
              </div>
            </section>
          </ScrollReveal>
        )}

        {/* تصفح سريع */}
        <ScrollReveal>
          <section>
            <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
              <Zap className="w-6 h-6 text-primary" />
              تصفح سريع
            </h2>
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
              {quickLinks.map((link) => (
                <QuickLinkCard key={link.href} {...link} />
              ))}
            </div>
          </section>
        </ScrollReveal>
      </div>
    </div>
  );
      }
