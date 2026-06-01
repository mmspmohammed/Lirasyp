// app/prices/gold/page.tsx
import Link from "next/link";
import { createServerSupabase} from "@/lib/supabase-server";
import { formatPrice, formatChange, getChangeUI, calculateGoldGrams } from "@/lib/format";
import { ArrowLeft, TrendingUp, TrendingDown, Gem } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "أسعار الذهب | أونصة وعيارات",
  description:
    "أسعار الذهب العالمية بالأونصة والجرام. حساب تلقائي لعيارات 24، 22، 21، 18 قيراط. تحديث لحظي.",
  keywords: [
    "سعر الذهب",
    "أونصة ذهب",
    "عيار 24",
    "عيار 21",
    "جرام ذهب",
    "PAX Gold",
    "ذهب سوري",
  ],
  openGraph: {
    title: "أسعار الذهب | LiraSYP",
    description: "أسعار الذهب العالمية والعيارات محدثة لحظياً.",
  },
};

export const revalidate = 60;

// ==================== Components ====================

function GoldCard({
  title,
  price,
  change,
  unit,
  icon,
  color,
}: {
  title: string;
  price: number;
  change: number;
  unit: string;
  icon: string;
  color: string;
}) {
  const { icon: changeIcon, color: changeColor } = getChangeUI(change);

  return (
    <div className="rounded-2xl bg-card p-5 border border-border">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">{icon}</span>
        <h3 className="font-bold">{title}</h3>
      </div>
      <p className="text-3xl font-extrabold mb-2">{formatPrice(price, unit)}</p>
      <div className={`flex items-center gap-1 text-sm ${changeColor}`}>
        {changeIcon}
        <span>{formatChange(change)}</span>
        <span className="text-muted-foreground mr-1">24h</span>
      </div>
    </div>
  );
}

function KaratRow({
  name,
  purity,
  gramPrice,
  color,
}: {
  name: string;
  purity: number;
  gramPrice: number;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:border-primary/20 transition">
      <div className="flex items-center gap-3">
        <span
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: color }}
        />
        <div>
          <p className="font-bold">{name}</p>
          <p className="text-xs text-muted-foreground">نقاء {purity * 100}%</p>
        </div>
      </div>
      <div className="text-left">
        <p className="text-lg font-bold">{formatPrice(gramPrice, "USD")}</p>
        <p className="text-xs text-muted-foreground">/ غرام</p>
      </div>
    </div>
  );
}

// ==================== Data Fetching ====================

async function getGoldData() {
  const supabase = createServerSupabase();

  // جلب سعر الذهب (أونصة)
  const { data: gold } = await supabase
    .from("asset_prices")
    .select("price_usd, price_syp, change_24h, fetched_at")
    .eq("asset_type", "gold_ounce")
    .eq("asset_code", "XAU")
    .eq("is_latest", true)
    .order("fetched_at", { ascending: false })
    .limit(1)
    .single();

  // جلب PAXG
  const { data: paxg } = await supabase
    .from("asset_prices")
    .select("price_usd, change_24h")
    .eq("asset_type", "crypto")
    .eq("asset_code", "PAXG")
    .eq("is_latest", true)
    .order("fetched_at", { ascending: false })
    .limit(1)
    .single();

  return { gold, paxg };
}

// ==================== Main Page ====================

export default async function GoldPage() {
  const data = await getGoldData();

  const karats = [
    { name: "24 قيراط", purity: 1.0, color: "#FFD700" },
    { name: "22 قيراط", purity: 0.916, color: "#E5C100" },
    { name: "21 قيراط", purity: 0.875, color: "#D4AF37" },
    { name: "18 قيراط", purity: 0.75, color: "#C5A028" },
  ];

  const lastUpdated = data.gold?.fetched_at
    ? new Date(data.gold.fetched_at).toLocaleString("ar-SY", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary transition">الرئيسية</Link>
        <ArrowLeft className="w-4 h-4" />
        <span>أسعار الذهب</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold mb-2 flex items-center gap-2">
          <Gem className="w-8 h-8 text-yellow-500" />
          أسعار الذهب
        </h1>
        <p className="text-muted-foreground">
          أسعار الذهب العالمية بالأونصة والجرام مع حساب تلقائي للعيارات
        </p>
        {lastUpdated && (
          <p className="text-sm text-muted-foreground mt-2">
            آخر تحديث: {lastUpdated}
          </p>
        )}
      </div>

      {/* Main Prices */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {data.gold && (
          <GoldCard
            title="الذهب العالمي (أونصة)"
            price={data.gold.price_usd}
            change={data.gold.change_24h || 0}
            unit="USD"
            icon="🥇"
            color="yellow"
          />
        )}
        {data.paxg && (
          <GoldCard
            title="PAX Gold"
            price={data.paxg.price_usd}
            change={data.paxg.change_24h || 0}
            unit="USD"
            icon="🪙"
            color="gold"
          />
        )}
      </div>

      {/* SYP Price */}
      {data.gold?.price_syp && (
        <div className="rounded-2xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 p-6 mb-8 text-center">
          <p className="text-sm text-muted-foreground mb-1">السعر بالليرة السورية</p>
          <p className="text-4xl font-extrabold text-yellow-600">
            {formatPrice(data.gold.price_syp, "SYP")}
          </p>
          <p className="text-xs text-muted-foreground mt-1">ليرة سورية / أونصة</p>
        </div>
      )}

      {/* Karat Calculator */}
      {data.gold && (
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-4">حاسبة العيارات</h2>
          <div className="rounded-2xl bg-card border border-border p-6">
            <p className="text-sm text-muted-foreground mb-4">
              سعر الأونصة: {formatPrice(data.gold.price_usd, "USD")} | 
              1 أونصة = 31.1035 غرام
            </p>
            <div className="space-y-3">
              {karats.map((karat) => (
                <KaratRow
                  key={karat.name}
                  name={karat.name}
                  purity={karat.purity}
                  gramPrice={calculateGoldGrams(data.gold.price_usd, karat.purity)}
                  color={karat.color}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Info */}
      <div className="rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground">
        <p className="font-medium mb-2">ℹ️ معلومات مهمة:</p>
        <ul className="space-y-1 list-disc list-inside">
          <li>الأونصة = 31.1035 غرام من الذهب الخالص (24 قيراط)</li>
          <li>عيار 21 = 87.5% ذهب خالص</li>
          <li>عيار 18 = 75% ذهب خالص</li>
          <li>الأسعار العالمية قد تختلف عن أسعار السوق المحلي</li>
        </ul>
      </div>

      {/* SEO Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: "الذهب",
            description: "أسعار الذهب العالمية بالأونصة والجرام",
            brand: {
              "@type": "Brand",
              name: "Gold",
            },
            ...(data.gold && {
              offers: {
                "@type": "Offer",
                price: data.gold.price_usd,
                priceCurrency: "USD",
                availability: "https://schema.org/InStock",
              },
            }),
          }),
        }}
      />
    </div>
  );
}
