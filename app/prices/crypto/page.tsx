// app/prices/crypto/page.tsx
import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase-server";
import { formatPrice, formatChange, getChangeUI } from "@/lib/format";
import { ArrowLeft, TrendingUp, TrendingDown, Bitcoin } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "العملات الرقمية | بيتكوين وإيثيريوم",
  description:
    "أسعار العملات الرقمية من Binance: بيتكوين، إيثيريوم، بينانس، سولانا، كاردانو، ترون، PAX Gold. تحديث لحظي.",
  keywords: [
    "بيتكوين",
    "إيثيريوم",
    "BNB",
    "سولانا",
    "كاردانو",
    "ترون",
    "PAXG",
    "Binance",
    "crypto",
  ],
  openGraph: {
    title: "العملات الرقمية | LiraSYP",
    description: "أسعار العملات الرقمية من Binance محدثة لحظياً.",
  },
};

export const revalidate = 60;

// ==================== Components ====================

function CryptoCard({
  name,
  code,
  price,
  change,
  icon,
  color,
}: {
  name: string;
  code: string;
  price: number;
  change: number;
  icon: string;
  color: string;
}) {
  const { color: changeColor } = getChangeUI(change);

  return (
    <div className="rounded-2xl bg-card p-5 border border-border hover:border-primary/20 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-bold text-white"
            style={{ backgroundColor: color }}
          >
            
          </span>
          <div>
            <h3 className="font-bold text-lg">{name}</h3>
            <p className="text-sm text-muted-foreground">{code}</p>
          </div>
        </div>
        <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${changeColor} bg-opacity-10`}>
          {changeIcon}
          <span>{{change > 0 ? "+" : ""}{change.toFixed(2)}%}</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-3xl font-extrabold">{formatPrice(price, "USD")}</p>
        <p className="text-sm text-muted-foreground mt-1">دولار أمريكي</p>
      </div>
    </div>
  );
}

// ==================== Data Fetching ====================

async function getCryptoData() {
  const supabase = createServerSupabase();

  const { data: cryptos } = await supabase
    .from("asset_prices")
    .select("asset_code, asset_name_ar, price_usd, price_syp, change_24h, change_1h, fetched_at")
    .eq("asset_type", "crypto")
    .eq("is_latest", true)
    .order("market_cap_rank", { ascending: true })
    .limit(10);

  return cryptos || [];
}

// ==================== Main Page ====================

const CRYPTO_META: Record<string, { name: string; icon: string; color: string }> = {
  BTC: { name: "بيتكوين", icon: "₿", color: "#F7931A" },
  ETH: { name: "إيثيريوم", icon: "Ξ", color: "#627EEA" },
  BNB: { name: "بينانس", icon: "B", color: "#F3BA2F" },
  SOL: { name: "سولانا", icon: "S", color: "#00FFA3" },
  ADA: { name: "كاردانو", icon: "A", color: "#0033AD" },
  TRX: { name: "ترون", icon: "T", color: "#FF060A" },
  PAXG: { name: "PAX Gold", icon: "P", color: "#C9A96E" },
};

export default async function CryptoPage() {
  const cryptos = await getCryptoData();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary transition">الرئيسية</Link>
        <ArrowLeft className="w-4 h-4" />
        <span>العملات الرقمية</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold mb-2 flex items-center gap-2">
          <Bitcoin className="w-8 h-8 text-orange-500" />
          العملات الرقمية
        </h1>
        <p className="text-muted-foreground">
          أسعار العملات الرقمية من Binance API - تحديث لحظي
        </p>
      </div>

      {/* Crypto Grid */}
      {cryptos.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cryptos.map((crypto: any) => {
            const meta = CRYPTO_META[crypto.asset_code] || {
              name: crypto.asset_name_ar || crypto.asset_code,
              icon: crypto.asset_code[0],
              color: "#666",
            };

            return (
              <CryptoCard
                key={crypto.asset_code}
                name={meta.name}
                code={crypto.asset_code}
                price={crypto.price_usd}
                change={crypto.change_24h || 0}
                icon={meta.icon}
                color={meta.color}
              />
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl bg-card p-8 text-center border border-border">
          <p className="text-muted-foreground">لا توجد بيانات متاحة حالياً</p>
        </div>
      )}

      {/* Info */}
      <div className="mt-8 rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground">
        <p className="font-medium mb-2">ℹ️ معلومات:</p>
        <ul className="space-y-1 list-disc list-inside">
          <li>الأسعار من Binance API</li>
          <li>التغير يُحسب خلال 24 ساعة</li>
          <li>الأسعار قد تختلف بين المنصات</li>
          <li>تداول العملات الرقمية ينطوي على مخاطر عالية</li>
        </ul>
      </div>

      {/* SEO Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            itemListElement: cryptos.map((crypto: any, index: number) => ({
              "@type": "ListItem",
              position: index + 1,
              item: {
                "@type": "FinancialProduct",
                name: CRYPTO_META[crypto.asset_code]?.name || crypto.asset_code,
                description: `سعر ${CRYPTO_META[crypto.asset_code]?.name || crypto.asset_code}`,
                offers: {
                  "@type": "Offer",
                  price: crypto.price_usd,
                  priceCurrency: "USD",
                },
              },
            })),
          }),
        }}
      />
    </div>
  );
}
