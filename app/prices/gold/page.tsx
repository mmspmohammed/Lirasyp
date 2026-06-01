// app/prices/gold/page.tsx
import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase-server";
import { formatPrice, calculateGoldGrams } from "@/lib/format";
import { ArrowLeft, Gem } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "أسعار الذهب | أونصة وعيارات",
  description: "أسعار الذهب العالمية بالأونصة والجرام. حساب تلقائي لعيارات 24، 22، 21، 18 قيراط.",
};

export const revalidate = 60;

async function getGoldData() {
  const supabase = createServerSupabase();
  const { data: gold } = await supabase
    .from("asset_prices")
    .select("price_usd, price_syp, change_24h, fetched_at")
    .eq("asset_type", "gold_ounce").eq("asset_code", "XAU").eq("is_latest", true)
    .order("fetched_at", { ascending: false }).limit(1).single();
  const { data: paxg } = await supabase
    .from("asset_prices")
    .select("price_usd, change_24h")
    .eq("asset_type", "crypto").eq("asset_code", "PAXG").eq("is_latest", true)
    .order("fetched_at", { ascending: false }).limit(1).single();
  return { gold, paxg };
}

export default async function GoldPage() {
  const data = await getGoldData();
  const karats = [
    { name: "24 قيراط", purity: 1.0, color: "#FFD700" },
    { name: "22 قيراط", purity: 0.916, color: "#E5C100" },
    { name: "21 قيراط", purity: 0.875, color: "#D4AF37" },
    { name: "18 قيراط", purity: 0.75, color: "#C5A028" },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary transition">الرئيسية</Link>
        <ArrowLeft className="w-4 h-4" />
        <span>أسعار الذهب</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold mb-2 flex items-center gap-2">
          <Gem className="w-8 h-8 text-yellow-500" />
          أسعار الذهب
        </h1>
        <p className="text-muted-foreground">أسعار الذهب العالمية بالأونصة والجرام مع حساب تلقائي للعيارات</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {data.gold && (
          <div className="rounded-2xl bg-card p-5 border border-border">
            <div className="flex items-center gap-2 mb-3"><span className="text-2xl">🥇</span><h3 className="font-bold">الذهب العالمي (أونصة)</h3></div>
            <p className="text-3xl font-extrabold mb-2">{formatPrice(data.gold.price_usd, "USD")}</p>
            <div className="text-sm">{(data.gold.change_24h || 0) > 0 ? "+" : ""}{(data.gold.change_24h || 0).toFixed(2)}%</div>
          </div>
        )}
        {data.paxg && (
          <div className="rounded-2xl bg-card p-5 border border-border">
            <div className="flex items-center gap-2 mb-3"><span className="text-2xl">🪙</span><h3 className="font-bold">PAX Gold</h3></div>
            <p className="text-3xl font-extrabold mb-2">{formatPrice(data.paxg.price_usd, "USD")}</p>
            <div className="text-sm">{(data.paxg.change_24h || 0) > 0 ? "+" : ""}{(data.paxg.change_24h || 0).toFixed(2)}%</div>
          </div>
        )}
      </div>

      {data.gold?.price_syp && (
        <div className="rounded-2xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 p-6 mb-8 text-center">
          <p className="text-sm text-muted-foreground mb-1">السعر بالليرة السورية</p>
          <p className="text-4xl font-extrabold text-yellow-600">{formatPrice(data.gold.price_syp, "SYP")}</p>
          <p className="text-xs text-muted-foreground mt-1">ليرة سورية / أونصة</p>
        </div>
      )}

      {data.gold && (
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-4">حاسبة العيارات</h2>
          <div className="rounded-2xl bg-card border border-border p-6">
            <p className="text-sm text-muted-foreground mb-4">سعر الأونصة: {formatPrice(data.gold.price_usd, "USD")} | 1 أونصة = 31.1035 غرام</p>
            <div className="space-y-3">
              {karats.map((karat) => {
                const gramPrice = calculateGoldGrams(data.gold.price_usd, data.gold.price_syp).gram24k.usd * karat.purity;
                return (
                  <div key={karat.name} className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                    <div className="flex items-center gap-3">
                      <span className="w-4 h-4 rounded-full" style={{ backgroundColor: karat.color }} />
                      <div><p className="font-bold">{karat.name}</p><p className="text-xs text-muted-foreground">نقاء {(karat.purity * 100).toFixed(1)}%</p></div>
                    </div>
                    <p className="text-lg font-bold">{formatPrice(gramPrice, "USD")} / غرام</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
