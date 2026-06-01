// app/page.tsx
import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase-server";
import { formatPrice, getChangeUI } from "@/lib/format";
import { TrendingUp, TrendingDown, Newspaper, Zap, ArrowLeft, Bell } from "lucide-react";
import PriceCardsCarousel from "@/components/PriceCardsCarousel";

export const revalidate = 60;

export const metadata = {
  title: "الرئيسية",
  description: "تتبع لحظي لأسعار الدولار والليرة السورية والذهب والعملات الرقمية في سوريا.",
  openGraph: {
    title: "الليرة عملتنا | أسعار الصرف والذهب في سوريا",
    description: "تتبع لحظي لأسعار الدولار والليرة السورية والذهب والعملات الرقمية.",
  },
};

function NewsCard({ title, summary, date, slug }: {
  title: string; summary: string; date: string; slug: string;
}) {
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
        عرض الكل<<ArrowLeft className="w-4 h-4" />
      </Link>
    </div>
  );
}

async function getHomeData() {
  const supabase = createServerSupabase();
  const { data: usdSyp } = await supabase
    .from("exchange_rates")
    .select("buy_price, sell_price, change_24h")
    .eq("base_currency", "USD").eq("target_currency", "SYP").eq("is_latest", true)
    .order("fetched_at", { ascending: false }).limit(1).single();
  const { data: gold } = await supabase
    .from("asset_prices")
    .select("price_usd, change_24h")
    .eq("asset_type", "gold_ounce").eq("asset_code", "XAU").eq("is_latest", true)
    .order("fetched_at", { ascending: false }).limit(1).single();
  const { data: btc } = await supabase
    .from("asset_prices")
    .select("price_usd, change_24h")
    .eq("asset_type", "crypto").eq("asset_code", "BTC").eq("is_latest", true)
    .order("fetched_at", { ascending: false }).limit(1).single();
  const { data: currencies } = await supabase
    .from("exchange_rates")
    .select("target_currency, buy_price, change_24h")
    .eq("base_currency", "USD").neq("target_currency", "SYP").eq("is_latest", true)
    .order("fetched_at", { ascending: false }).limit(6);
  const { data: news } = await supabase
    .from("news_articles")
    .select("title_ar, slug, summary, category, published_at")
    .order("published_at", { ascending: false }).limit(4);
  return { usdSyp, gold, btc, currencies: currencies || [], news: news || [] };
}

export default async function HomePage() {
  const data = await getHomeData();
  
  const cards = [
    { title: "الدولار / ليرة", price: data.usdSyp ? formatPrice(data.usdSyp.sell_price, "SYP") : "—", change: data.usdSyp?.change_24h?.toString() || "0", unit: "ل.س", href: "/prices/currency", color: "primary" },
    { title: "الذهب (أونصة)", price: data.gold ? formatPrice(data.gold.price_usd, "USD") : "—", change: data.gold?.change_24h?.toString() || "0", unit: "دولار", href: "/prices/gold", color: "yellow" },
    { title: "البيتكوين", price: data.btc ? formatPrice(data.btc.price_usd, "USD") : "—", change: data.btc?.change_24h?.toString() || "0", unit: "دولار", href: "/prices/crypto", color: "orange" },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Price Cards - متحركة تلقائياً */}
      <section className="mb-10">
        <PriceCardsCarousel cards={cards} />
      </section>

      {/* بانر التنبيهات */}
      <section className="mb-10">
        <div className="rounded-2xl bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-500/10 border border-red-500/20 p-5 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
              <Bell className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h3 className="font-bold text-base">🔔 فعّل التنبيهات لتصلك الإشعارات في لحظة تغيرها</h3>
              <p className="text-sm text-muted-foreground">
                احصل على إشعارات فورية عند تغير أسعار الدولار، الذهب، والعملات الرقمية.
              </p>
            </div>
          </div>
          <button className="px-5 py-2.5 rounded-full bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition shadow-lg shadow-red-500/20 shrink-0">
            تفعيل الإشعارات
          </button>
        </div>
      </section>

      {/* Currencies Table */}
      {data.currencies.length > 0 && (
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
                          <span className="flex items-center gap-1">{change > 0 ? "+" : ""}{change.toFixed(2)}%</span>
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

      {/* News Section - بدون نوع الخبر */}
      {data.news.length > 0 && (
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
            { href: "/about", icon: "ℹ️", title: "عن الموقع", desc: "من نحن" },
          ].map((link) => (
            <Link key={link.href} href={link.href} className="rounded-xl bg-card p-4 border border-border text-center hover:border-primary/30 hover:shadow-md transition">
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
