import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { createServerSupabase } from '@/lib/supabase-server';
import { formatPrice, getChangeUI, formatRelativeTime, formatNumber } from '@/lib/format';
import { SITE_URL } from '@/lib/env';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'أسعار العملات الرقمية في سوريا | الليرة عملتنا',
  description: 'أسعار البيتكوين، الإيثيريوم، التيثر، والعملات الرقمية الأخرى مقابل الدولار والليرة السورية',
  keywords: ['بيتكوين سوريا', 'إيثيريوم', 'عملات رقمية', 'كريبتو', 'USDT', 'BTC'],
  alternates: { canonical: `${SITE_URL}/prices/crypto` },
  openGraph: {
    title: 'العملات الرقمية | الليرة عملتنا',
    description: 'أسعار الكريبتو مقابل الدولار والليرة السورية - تحديث لحظي',
    url: `${SITE_URL}/prices/crypto`,
    type: 'website',
  },
};

// ✅ خريطة الرموز
const CRYPTO_META: Record<string, { icon: string; name: string }> = {
  BTC: { icon: '₿', name: 'بيتكوين' },
  ETH: { icon: 'Ξ', name: 'إيثيريوم' },
  USDT: { icon: '₮', name: 'تيثر' },
  TRX: { icon: '⚡', name: 'ترون' },
  SOL: { icon: '◎', name: 'سولانا' },
  ADA: { icon: '₳', name: 'كاردانو' },
  PAXG: { icon: '🪙', name: 'PAX Gold' },
};

// ✅ تعريف النوع
type CryptoAsset = {
  asset_code: string;
  asset_name_ar: string;
  price_usd: number;
  price_syp: number | null;
  change_24h: number | null;
  fetched_at: string;
};

async function getCryptoData() {
  const supabase = createServerSupabase();
  
  const { data: cryptos } = await supabase
    .from('asset_prices')
    .select('asset_code, asset_name_ar, price_usd, price_syp, change_24h, fetched_at')    .eq('asset_type', 'crypto')
    .eq('is_latest', true)
    .in('asset_code', ['BTC', 'ETH', 'USDT', 'TRX', 'SOL', 'ADA', 'PAXG'])
    .order('asset_code');

  return { cryptos: cryptos as CryptoAsset[] || [] };
}

// ✅ مكون بطاقة العملة الرقمية
function CryptoCard({ code, name, priceUsd, priceSyp, change }: {
  code: string;
  name: string;
  priceUsd: number;
  priceSyp: number | null;
  change: number;
}) {
  const meta = CRYPTO_META[code] || { icon: '💎', name };
  const changeFmt = getChangeUI(change);

  return (
    <div className="bg-card rounded-xl p-4 border border-muted hover:border-primary/50 transition">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-mono">{meta.icon}</span>
          <div>
            <h3 className="font-bold">{name}</h3>
            <p className="text-xs text-muted-foreground font-mono">{code}</p>
          </div>
        </div>
        <div className={`flex items-center gap-1 text-sm font-medium ${changeFmt.color}`}>
          <changeFmt.Icon className="h-4 w-4" />
          {changeFmt.text}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-muted/30 rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">USD</p>
          <p className="text-lg font-bold font-mono">
            {/* ✅ تبسيط عرض USDT: سعر ثابت $1.00 */}
            {code === 'USDT' ? '$1.00' : `$${formatNumber(priceUsd, 2)}`}
          </p>
        </div>
        <div className="bg-muted/30 rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">SYP</p>
          <p className="text-lg font-bold font-mono">
            {priceSyp ? formatPrice(priceSyp, 'SYP') : '—'}
          </p>
        </div>
      </div>    </div>
  );
}

async function CryptoContent() {
  const { cryptos } = await getCryptoData();

  if (!cryptos.length) {
    return (
      <div className="text-center py-12">
        <RefreshCw className="h-8 w-8 mx-auto text-muted-foreground animate-spin mb-3" />
        <p className="text-muted-foreground">جاري تحميل أسعار العملات الرقمية...</p>
      </div>
    );
  }

  const lastUpdate = cryptos[0]?.fetched_at;

  return (
    <div className="container mx-auto px-4 py-4 space-y-6">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">العملات الرقمية</h1>
          <p className="text-sm text-muted-foreground mt-1">
            محدث {lastUpdate ? formatRelativeTime(lastUpdate) : '—'}
          </p>
        </div>
        <Link href="/" className="flex items-center gap-1 text-sm text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" />
          الرئيسية
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {cryptos.map((crypto) => (
          <CryptoCard
            key={crypto.asset_code}
            code={crypto.asset_code}
            name={crypto.asset_name_ar}
            priceUsd={crypto.price_usd}
            priceSyp={crypto.price_syp}
            change={crypto.change_24h ?? 0} // ✅ التعامل مع null بأمان
          />
        ))}
      </div>

      <div className="bg-muted/30 rounded-lg p-3 text-xs text-muted-foreground">
        ⚠️ أسعار العملات الرقمية شديدة التقلب. البيانات لأغراض إعلامية فقط وليست نصيحة استثمارية.
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            itemListElement: cryptos.map((c, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              item: {
                '@type': 'FinancialProduct',
                name: c.asset_name_ar,
                tickerSymbol: c.asset_code,
                description: `سعر ${c.asset_name_ar} (${c.asset_code})`,
                offers: {
                  '@type': 'Offer',
                  price: c.price_usd,
                  priceCurrency: 'USD',
                },
              },
            })),
          }),
        }}
      />
    </div>
  );
}

export default function CryptoPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="h-8 bg-muted rounded w-40 animate-pulse" />
        <div className="grid gap-3 sm:grid-cols-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-card rounded-xl p-4 border border-muted animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-8 w-8 bg-muted rounded" />
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-24" />
                  <div className="h-3 bg-muted rounded w-12" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="h-12 bg-muted rounded" />
                <div className="h-12 bg-muted rounded" />
              </div>
            </div>
          ))}        </div>
      </div>
    }>
      <CryptoContent />
    </Suspense>
  );
}
