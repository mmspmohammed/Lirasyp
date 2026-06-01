// app/page.tsx
import { Suspense } from "react";
import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase-server";
import { formatPrice, formatChange, getChangeUI } from "@/lib/format";
import { TrendingUp, TrendingDown, Newspaper, DollarSign, Coins, Zap, Fuel, ArrowLeft, Bell } from "lucide-react";

export const revalidate = 60;

export const metadata = {
  title: "الرئيسية",
  description: "تتبع لحظي لأسعار الدولار والليرة السورية والذهب والعملات الرقمية في سوريا.",
  openGraph: {
    title: "LiraSYP | أسعار الصرف والذهب في سوريا",
    description: "تتبع لحظي لأسعار الدولار والليرة السورية والذهب والعملات الرقمية.",
  },
};

function PriceCard({ title, icon, price, change, unit, href, color }: {
  title: string; icon: React.ReactNode; price: string; change: string;
  unit: string; href: string; color: string;
}) {
  const { color: changeColor } = getChangeUI(parseFloat(change) || 0);
  const isPositive = parseFloat(change) >= 0;
  return (
    <Link href={href} className="group block">
      <div className="rounded-2xl bg-card p-5 border border-border transition-all duration-300 hover:shadow-lg hover:border-primary/30 hover:-translate-y-1">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{icon}</span>
            <h3 className="font-bold text-lg">{title}</h3>
          </div>
          <ArrowLeft className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl font-extrabold">{price}</span>
          <span className="text-sm text-muted-foreground">{unit}</span>
        </div>
        <div className={`flex items-center gap-1 text-sm font-medium ${changeColor}`}>
          {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          <span>{change}%</span>
          <span className="text-muted-foreground mr-1">آخر 24 ساعة</span>
        </div>
      </div>
    </Link>
  );
}

function NewsCard({ title, summary, category, date, slug }: {
  title: string; summary: string; category: string; date: string; slug: string;
}) {
  return (
    <Link href={`/news/${slug}`} className="group block">
      <article className="rounded-xl bg-card p-4 border border-border transition-all hover:shadow-md hover:border-primary/20">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">{category}</span>
          <span className="text-xs text-muted-foreground">{date}</span>
        </div>
        <h3 className="font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">{title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{summary}</p>
      </article>
    </Link>
  );
}

function SectionHeader({ title, href, icon }: { title: string; href: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">{icon}<h2 className="text-xl font-bold">{title}</h2></div>
      <Link href={href} className="text-sm text-primary hover:underline flex items-center gap-1">عرض الكل<ArrowLeft className="w-4 h-4" /></Link>
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
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero */}
      <section className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          تتبع لحظي للأسعار في سوريا
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          أسعار الدولار والليرة السورية والذهب والعملات الرقمية محدثة لحظياً من مصادر موثوقة مع إشعارات فورية عند التغيرات المهمة.
        </p>
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          <Link href="/prices/currency" className="px-6 py-3 rounded-full bg-primary text-white font-medium hover:bg-primary/90 transition">💵 أسعار العملات</Link>
          <Link href="/prices/gold" className="px-6 py-3 rounded-full bg-card border border-border font-medium hover:border-primary transition">🥇 أسعار الذهب</Link>
          <Link href="/prices/crypto" className="px-6 py-3 rounded-full bg-card border border-border font-medium hover:border-primary transition">₿ العملات الرقمية</Link>
        </div>
      </section>

      {/* Price Cards */}
      <section className="mb-8">
        <SectionHeader title="أهم الأسعار" href="/prices" icon={<DollarSign className="w-6 h-6 text-primary" />} />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <PriceCard title="الدولار / ليرة" icon="💵" price={data.usdSyp ? formatPrice(data.usdSyp.sell_price, "SYP") : "—"} change={data.usdSyp?.change_24h?.toString() || "0"} unit="ل.س" href="/prices/currency" color="primary" />
          <PriceCard title="الذهب (أونصة)" icon="🥇" price={data.gold ? formatPrice(data.gold.price_usd, "USD") : "—"} change={data.gold?.change_24h?.toString() || "0"} unit="دولار" href="/prices/gold" color="yellow" />
          <PriceCard title="البيتكوين" icon="₿" price={data.btc ? formatPrice(data.btc.price_usd, "USD") : "—"} change={data.btc?.change_24h?.toString() || "0"} unit="دولار" href="/prices/crypto" color="orange" />
        </div>
      </section>

      {/* ✅ بانر التنبيهات - بين الكروت والأخبار */}
      <section className="mb-10">
        <div className="rounded-2xl bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-500/10 border border-red-500/20 p-5 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
              <Bell className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h3 className="font-bold text-base">🔔 فعّل التنبيهات لتصلك كل التغيرات</h3>
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
          <SectionHeader title="العملات العالمية" href="/prices/currency" icon={<Coins className="w-6 h-6 text-primary" />} />
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
                          <span className="flex items-center gap-1">{icon}{formatChange(change)}</span>
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
      {data.news.length > 0 && (
        <section className="mb-12">
          <SectionHeader title="آخر الأخبار الاقتصادية" href="/news" icon={<Newspaper className="w-6 h-6 text-primary" />} />
          <div className="grid gap-4 md:grid-cols-2">
            {data.news.map((article: any) => (
              <NewsCard key={article.slug} title={article.title_ar} summary={article.summary} category={article.category} date={new Date(article.published_at).toLocaleDateString("ar-SY")} slug={article.slug} />
            ))}
          </div>
        </section>
      )}

      {/* Quick Links */}
      <section>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Zap className="w-6 h-6 text-primary" />تصفح سريع</h2>
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
