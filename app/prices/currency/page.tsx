// app/prices/currency/page.tsx
import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase-server";
import { formatPrice, getChangeUI } from "@/lib/format";
import { ArrowLeft, DollarSign, RefreshCw } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "أسعار العملات | الدولار والليرة السورية",
  description: "أسعار صرف الدولار الأمريكي مقابل الليرة السورية واليورو والليرة التركية والريال السعودي.",
};

export const revalidate = 60;

function CurrencyRow({ currency, buyPrice, change, usdSypRate }: {
  currency: string; buyPrice: number; change: number; usdSypRate: number;
}) {
  const { color: changeColor } = getChangeUI(change);
  const flagMap: Record<string, string> = {
    USD: "🇺🇸", SYP: "🇸🇾", EUR: "🇪🇺", TRY: "🇹🇷",
    SAR: "🇸🇦", AED: "🇦🇪", GBP: "🇬🇧", JOD: "🇯🇴", CHF: "🇨🇭"
  };
  const nameMap: Record<string, string> = {
    USD: "دولار أمريكي", SYP: "ليرة سورية", EUR: "يورو", TRY: "ليرة تركية",
    SAR: "ريال سعودي", AED: "درهم إماراتي", GBP: "جنيه إسترليني", JOD: "دينار أردني", CHF: "فرنك سويسري"
  };

  const priceSyp = Number(buyPrice || 0) * Number(usdSypRate || 0);

  return (
    <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:border-primary/20 transition">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{flagMap[currency] || "💱"}</span>
        <div>
          <p className="font-bold">{currency}</p>
          <p className="text-xs text-muted-foreground">{nameMap[currency] || currency}</p>
        </div>
      </div>
      <div className="text-left">
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-muted-foreground">السعر بالدولار</p>
            <p className="font-bold">{formatPrice(Number(buyPrice || 0), "USD")}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">السعر بالليرة</p>
            <p className="font-bold">{formatPrice(priceSyp, "SYP")}</p>
          </div>
          <div className={"flex items-center gap-1 " + changeColor}>
            <span className="text-sm font-medium">{change > 0 ? "+" : ""}{change.toFixed(2)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

async function getCurrencyData() {
  const supabase = createServerSupabase();
  const { data: usdSyp } = await supabase
    .from("exchange_rates")
    .select("buy_price, sell_price, change_24h, fetched_at")
    .eq("base_currency", "USD").eq("target_currency", "SYP").eq("is_latest", true)
    .order("fetched_at", { ascending: false }).limit(1).single();
  
  const { data: currencies } = await supabase
    .from("exchange_rates")
    .select("target_currency, buy_price, sell_price, change_24h, fetched_at")
    .eq("base_currency", "USD").neq("target_currency", "SYP").eq("is_latest", true)
    .order("fetched_at", { ascending: false });
  
  const uniqueCurrencies = currencies ? Array.from(new Map(currencies.map((c: any) => [c.target_currency, c])).values()) : [];
  
  const tryCurrency = uniqueCurrencies.find((c: any) => c.target_currency === "TRY");
  const otherCurrencies = uniqueCurrencies.filter((c: any) => c.target_currency !== "TRY");
  
  return { usdSyp, tryCurrency, currencies: otherCurrencies };
}

export default async function CurrencyPage() {
  const data = await getCurrencyData();
  const lastUpdated = data.usdSyp?.fetched_at ? new Date(data.usdSyp.fetched_at).toLocaleString("ar-SY", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }) : null;

  // ✅ تحويل لأرقام آمن
  const usdSypSell = Number(data.usdSyp?.sell_price || 0);
  const usdSypBuy = Number(data.usdSyp?.buy_price || 0);
  const trySell = Number(data.tryCurrency?.sell_price || 0);
  const tryBuy = Number(data.tryCurrency?.buy_price || 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary transition">الرئيسية</Link>
        <ArrowLeft className="w-4 h-4" />
        <span>أسعار العملات</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold mb-2 flex items-center gap-2">
          <DollarSign className="w-8 h-8 text-primary" />
          أسعار العملات
        </h1>
        <p className="text-muted-foreground">أسعار صرف الدولار الأمريكي مقابل الليرة السورية والعملات العالمية</p>
        {lastUpdated && <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1"><RefreshCw className="w-3 h-3" />آخر تحديث: {lastUpdated}</p>}
      </div>

      {data.usdSyp && (
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-4">الدولار / ليرة سورية</h2>
          <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20 p-6">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-sm text-muted-foreground mb-1">سعر المبيع</p>
                <p className="text-4xl font-extrabold text-primary">{formatPrice(usdSypSell, "SYP")}</p>
                <p className="text-xs text-muted-foreground mt-1">ليرة سورية</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">سعر الشراء</p>
                <p className="text-4xl font-extrabold text-primary">{formatPrice(usdSypBuy, "SYP")}</p>
                <p className="text-xs text-muted-foreground mt-1">ليرة سورية</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">التغير 24 ساعة</p>
                <div className="text-2xl font-bold">{(Number(data.usdSyp.change_24h) || 0) > 0 ? "+" : ""}{(Number(data.usdSyp.change_24h) || 0).toFixed(2)}%</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {data.tryCurrency && data.usdSyp && (
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-4">الليرة التركية / ليرة سورية</h2>
          <div className="rounded-2xl bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 p-6">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-sm text-muted-foreground mb-1">سعر المبيع</p>
                <p className="text-4xl font-extrabold text-red-600">{formatPrice(trySell * usdSypSell, "SYP")}</p>
                <p className="text-xs text-muted-foreground mt-1">ليرة سورية</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">سعر الشراء</p>
                <p className="text-4xl font-extrabold text-red-600">{formatPrice(tryBuy * usdSypSell, "SYP")}</p>
                <p className="text-xs text-muted-foreground mt-1">ليرة سورية</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">التغير 24 ساعة</p>
                <div className="text-2xl font-bold">{(Number(data.tryCurrency.change_24h) || 0) > 0 ? "+" : ""}{(Number(data.tryCurrency.change_24h) || 0).toFixed(2)}%</div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section>
        <h2 className="text-lg font-bold mb-4">العملات العالمية</h2>
        {data.currencies && data.currencies.length > 0 ? (
          <div className="space-y-3">
            {data.currencies.map((c: any) => (
              <CurrencyRow 
                key={c.target_currency} 
                currency={c.target_currency} 
                buyPrice={Number(c.buy_price || 0)} 
                change={parseFloat(c.change_24h) || 0} 
                usdSypRate={usdSypSell}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl bg-card p-8 text-center border border-border"><p className="text-muted-foreground">لا توجد بيانات متاحة حالياً</p></div>
        )}
      </section>
    </div>
  );
}
