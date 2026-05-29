import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { createServerSupabase } from '@/lib/supabase-server';
import { formatPrice, getChangeUI, formatRelativeTime, formatNumber, calculateGoldGrams } from '@/lib/format';
import { SITE_URL } from '@/lib/env';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'سعر الذهب في سوريا | الليرة عملتنا',
  description: 'أسعار الذهب عيار 24، 22، 21، 18، 14، والأونصة العالمية، و PAX Gold الرقمي مقابل الليرة السورية',
  keywords: ['سعر الذهب سوريا', 'ذهب عيار 21', 'ذهب عيار 24', 'أونصة ذهب', 'PAXG'],
  alternates: { canonical: `${SITE_URL}/prices/gold` },
  openGraph: {
    title: 'سعر الذهب | الليرة عملتنا',
    description: 'أسعار الذهب المحلية والعالمية - تحديث لحظي',
    url: `${SITE_URL}/prices/gold`,
    type: 'website',
  },
};

// ✅ تعريف الأنواع
type AssetPrice = {
  price_usd: number;
  price_syp: number | null;
  change_24h: number | null;
  fetched_at: string;
};

async function getGoldData() {
  const supabase = createServerSupabase();
  
  const { data: goldOunce } = await supabase
    .from('asset_prices')
    .select('price_usd, price_syp, change_24h, fetched_at')
    .eq('asset_code', 'XAU')
    .eq('asset_type', 'gold_ounce')
    .eq('is_latest', true)
    .maybeSingle();

  const { data: paxg } = await supabase
    .from('asset_prices')
    .select('price_usd, price_syp, change_24h, fetched_at')
    .eq('asset_code', 'PAXG')
    .eq('asset_type', 'crypto')
    .eq('is_latest', true)
    .maybeSingle();
  return { 
    goldOunce: goldOunce as AssetPrice | null, 
    paxg: paxg as AssetPrice | null 
  };
}

// ✅ مكون بطاقة الذهب (مع دعم العيارات المتعددة)
function GoldCard({ title, icon, priceUsd, priceSyp, change, isPaxg = false }: {
  title: string;
  icon: string;
  priceUsd: number;
  priceSyp: number | null;
  change: number;
  isPaxg?: boolean;
}) {
  const changeFmt = getChangeUI(change);
  
  // ✅ حساب أسعار الجرامات حسب العيار (دالة مساعدة من lib/format)
  const grams = calculateGoldGrams(priceUsd, priceSyp);

  // ✅ قائمة العيارات المدعومة
  const karats = [
    { label: '24K', purity: '99.9%', data: grams.gram24k },
    { label: '22K', purity: '91.6%', data: grams.gram22k },
    { label: '21K', purity: '87.5%', data: grams.gram21k },
    { label: '18K', purity: '75.0%', data: grams.gram18k },
    { label: '14K', purity: '58.5%', data: grams.gram14k },
  ] as const;

  return (
    <div className="bg-card rounded-xl p-4 border border-muted space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <div>
            <h3 className="font-bold">{title}</h3>
            {isPaxg && (
              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded">ذهب رقمي 🪙</span>
            )}
          </div>
        </div>
        <div className={`flex items-center gap-1 text-sm font-medium ${changeFmt.color}`}>
          <changeFmt.Icon className="h-4 w-4" />
          {changeFmt.text}
        </div>
      </div>

      {/* السعر بالوحدة الأساسية */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-muted/30 rounded-lg p-3 text-center">          <p className="text-xs text-muted-foreground mb-1">بالدولار</p>
          <p className="text-lg font-bold font-mono">${formatNumber(priceUsd, 2)}</p>
        </div>
        <div className="bg-muted/30 rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">بالليرة السورية</p>
          <p className="text-lg font-bold font-mono">{priceSyp ? formatPrice(priceSyp, 'SYP') : '—'}</p>
        </div>
      </div>

      {/* ✅ جدول أسعار الجرامات حسب العيار */}
      {!isPaxg && (
        <div className="pt-3 border-t border-muted">
          <p className="text-xs text-muted-foreground mb-2">أسعار الجرام حسب العيار</p>
          <div className="space-y-2">
            {karats.map((k) => (
              <div key={k.label} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">عيار {k.label}</span>
                  <span className="text-[10px] text-muted-foreground">({k.purity})</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-medium">{formatNumber(k.data.usd, 2)} $</span>
                  {k.data.syp && (
                    <span className="text-xs text-muted-foreground mr-2">
                      | {formatNumber(k.data.syp, 0)} SYP
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

async function GoldContent() {
  const { goldOunce, paxg } = await getGoldData();

  if (!goldOunce && !paxg) {
    return (
      <div className="text-center py-12">
        <RefreshCw className="h-8 w-8 mx-auto text-muted-foreground animate-spin mb-3" />
        <p className="text-muted-foreground">جاري تحميل أسعار الذهب...</p>
      </div>
    );
  }

  const lastUpdate = goldOunce?.fetched_at || paxg?.fetched_at;
  return (
    <div className="container mx-auto px-4 py-4 space-y-6">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">أسعار الذهب</h1>
          <p className="text-sm text-muted-foreground mt-1">
            محدث {lastUpdate ? formatRelativeTime(lastUpdate) : '—'}
          </p>
        </div>
        <Link href="/" className="flex items-center gap-1 text-sm text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" />
          الرئيسية
        </Link>
      </div>

      {goldOunce && (
        <GoldCard
          title="ذهب عالمي (أونصة)"
          icon="🥇"
          priceUsd={goldOunce.price_usd}
          priceSyp={goldOunce.price_syp}
          change={goldOunce.change_24h ?? 0} // ✅ التعامل مع null بأمان
        />
      )}

      {paxg && (
        <GoldCard
          title="PAX Gold (PAXG)"
          icon="🪙"
          priceUsd={paxg.price_usd}
          priceSyp={paxg.price_syp}
          change={paxg.change_24h ?? 0}
          isPaxg
        />
      )}

      <div className="bg-muted/30 rounded-lg p-3 text-xs text-muted-foreground space-y-2">
        <p>💡 <strong>ملاحظة:</strong> أونصة الذهب = 31.1035 جرام</p>
        <p>🔹 العيارات: 24ك (نقي) ← 22ك ← 21ك (الأشهر في سوريا) ← 18ك ← 14ك</p>
        <p className="pt-2 border-t border-muted">
          ⚠️ PAX Gold هو عملة رقمية مدعومة بالذهب الفعلي، كل 1 PAXG = 1 أونصة ذهب مخزنة.
        </p>
      </div>

      {goldOunce && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Product',
              name: 'Gold Ounce (XAU)',
              description: 'سعر الأونصة العالمية للذهب مقابل الدولار والليرة السورية',
              offers: {
                '@type': 'Offer',
                price: goldOunce.price_usd,
                priceCurrency: 'USD',
                availability: 'https://schema.org/InStock',
              },
            }),
          }}
        />
      )}
    </div>
  );
}

export default function GoldPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="h-8 bg-muted rounded w-32 animate-pulse" />
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-card rounded-xl p-4 border border-muted animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-40" />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-14 bg-muted rounded" />
              <div className="h-14 bg-muted rounded" />
            </div>
            <div className="h-20 bg-muted/50 rounded" />
          </div>
        ))}
      </div>
    }>
      <GoldContent />
    </Suspense>
  );
}
