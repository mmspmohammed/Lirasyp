import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { createServerSupabase } from '@/lib/supabase-server';
import { formatPrice, getChangeUI, formatRelativeTime, formatNumber } from '@/lib/format';
import { SITE_URL } from '@/lib/env';

// ✅ إعادة التحقق كل 5 دقائق (300 ثانية)
export const revalidate = 300;

export const metadata: Metadata = {
  title: 'أسعار الدولار والعملات في سوريا | الليرة عملتنا',
  description: 'أسعار الدولار الأمريكي، اليورو، الليرة التركية، والريال السعودي مقابل الليرة السورية - تحديث لحظي كل 5 دقائق',
  keywords: ['سعر الدولار سوريا', 'صرف العملات', 'يورو سوري', 'ليرة تركية', 'ريال سعودي'],
  alternates: { canonical: `${SITE_URL}/prices/currency` },
  openGraph: {
    title: 'أسعار الدولار والعملات | الليرة عملتنا',
    description: 'أسعار العملات العالمية مقابل الليرة السورية - تحديث لحظي',
    url: `${SITE_URL}/prices/currency`,
    type: 'website',
  },
};

// ✅ تعريف الأنواع بدقة (بدون any)
type CurrencyRate = {
  target_currency: string;
  buy_price: number;
  sell_price: number;
  change_24h: number | null;
  fetched_at: string;
};

type CurrencyInfo = {
  code: string;
  name_ar: string;
  symbol: string;
};

// ✅ جلب البيانات من الخادم
async function getCurrencyData() {
  const supabase = createServerSupabase();
  
  const { data: usd } = await supabase
    .from('exchange_rates')
    .select('buy_price, sell_price, change_24h, fetched_at')
    .eq('base_currency', 'USD')
    .eq('target_currency', 'SYP')
    .eq('is_latest', true)
    .maybeSingle();
  const { data: currencies } = await supabase
    .from('exchange_rates')
    .select('target_currency, buy_price, sell_price, change_24h, fetched_at')
    .eq('base_currency', 'USD')
    .eq('is_latest', true)
    .in('target_currency', ['EUR', 'TRY', 'SAR', 'AED', 'GBP', 'JOD', 'CHF'])
    .order('target_currency');

  const { data: currencyInfo } = await supabase
    .from('currencies')
    .select('code, name_ar, symbol')
    .in('code', ['USD', 'EUR', 'TRY', 'SAR', 'AED', 'GBP', 'JOD', 'CHF']);

  return { usd, currencies: currencies || [], currencyInfo: currencyInfo || [] };
}

// ✅ مكون جدول العملات (بأنواع دقيقة)
function CurrencyTable({ currencies, currencyInfo, usdRate }: {
  currencies: CurrencyRate[];
  currencyInfo: CurrencyInfo[];
  usdRate: number;
}) {
  const getCurrencyMeta = (code: string) => 
    currencyInfo.find(c => c.code === code) || { name_ar: code, symbol: code };

  return (
    <div className="bg-card rounded-xl border border-muted overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-right p-3 font-medium">العملة</th>
              <th className="text-center p-3 font-medium">USD</th>
              <th className="text-center p-3 font-medium">SYP</th>
              <th className="text-left p-3 font-medium">التغير 24س</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-muted">
            {currencies.map((rate) => {
              const meta = getCurrencyMeta(rate.target_currency);
              const change = getChangeUI(rate.change_24h || 0);
              const buyInSyp = rate.buy_price ;
              const sellInSyp = rate.sell_price * usdRate;

              return (
                <tr key={rate.target_currency} className="hover:bg-muted/30 transition">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{meta.name_ar}</span>                      <span className="text-xs text-muted-foreground">{meta.symbol}</span>
                    </div>
                  </td>
                  <td className="text-center p-3 font-mono font-medium">
                    {formatNumber(buyInSyp, 0)} <span className="text-xs text-muted-foreground">USD</span>
                  </td>
                  <td className="text-center p-3 font-mono font-medium">
                    {formatNumber(sellInSyp, 0)} <span className="text-xs text-muted-foreground">SYP</span>
                  </td>
                  <td className={`text-left p-3 font-medium flex items-center justify-end gap-1 ${change.color}`}>
                    <change.Icon className="h-3 w-3" />
                    {change.text}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div className="p-3 bg-muted/30 text-xs text-muted-foreground text-center border-t border-muted">
        الأسعار مقابل الدولار الأمريكي • تم التحويل لليرة السورية باستخدام سعر البيع: {formatPrice(usdRate, 'SYP')}
      </div>
    </div>
  );
}

async function CurrencyContent() {
  const { usd, currencies, currencyInfo } = await getCurrencyData();
  
  if (!usd) {
    return (
      <div className="text-center py-12">
        <RefreshCw className="h-8 w-8 mx-auto text-muted-foreground animate-spin mb-3" />
        <p className="text-muted-foreground">جاري تحميل أسعار الصرف...</p>
      </div>
    );
  }

  const usdRate = usd.sell_price;
  const change = getChangeUI(usd.change_24h || 0);

  return (
    <div className="container mx-auto px-4 py-4 space-y-6">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">أسعار العملات</h1>
          <p className="text-sm text-muted-foreground mt-1">
            محدث {formatRelativeTime(usd.fetched_at)} • مصدر: LiraNews          </p>
        </div>
        <Link href="/" className="flex items-center gap-1 text-sm text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" />
          الرئيسية
        </Link>
      </div>

      {/* بطاقة الدولار الرئيسية */}
      <div className="bg-card rounded-xl p-4 border border-muted">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">💵</span>
            <div>
              <h2 className="font-bold">الدولار الأمريكي / الليرة السورية</h2>
              <p className="text-xs text-muted-foreground">USD/SYP</p>
            </div>
          </div>
          <div className={`flex items-center gap-1 text-sm font-medium ${change.color}`}>
            <change.Icon className="h-4 w-4" />
            {change.text}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted/30 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">سعر الشراء</p>
            <p className="text-lg font-bold font-mono">{formatPrice(usd.buy_price, 'SYP')}</p>
          </div>
          <div className="bg-muted/30 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">سعر البيع</p>
            <p className="text-lg font-bold font-mono">{formatPrice(usd.sell_price, 'SYP')}</p>
          </div>
        </div>
      </div>

      {/* جدول العملات الأخرى */}
      <div>
        <h3 className="font-bold mb-3">العملات العالمية مقابل الدولار</h3>
        {currencies.length > 0 ? (
          <CurrencyTable currencies={currencies} currencyInfo={currencyInfo} usdRate={usdRate} />
        ) : (
          <div className="bg-card rounded-xl p-6 border border-muted text-center text-muted-foreground">
            لا توجد بيانات عملات متوفرة حالياً
          </div>
        )}
      </div>

      <div className="bg-muted/30 rounded-lg p-3 text-xs text-muted-foreground">
        ⚠️ أسعار الصرف معروضة لأغراض إعلامية فقط. قد تختلف الأسعار الفعلية في مكاتب الصرافة.      </div>

      {/* ✅ Schema.org مُصحح: العملة الأساسية USD، السعر معروض بـ SYP */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ExchangeRateSpecification',
            currency: 'USD', // ✅ العملة الأساسية
            currentExchangeRate: {
              '@type': 'UnitPriceSpecification',
              price: usd.buy_price,
              priceCurrency: 'SYP', // ✅ العملة المعروض بها السعر
            },
            name: `سعر الدولار الأمريكي مقابل الليرة السورية`,
            description: `سعر الشراء: ${usd.buy_price} SYP، سعر البيع: ${usd.sell_price} SYP`,
          }),
        }}
      />
    </div>
  );
}

export default function CurrencyPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="h-8 bg-muted rounded w-48 animate-pulse" />
        <div className="bg-card rounded-xl p-4 border border-muted animate-pulse">
          <div className="h-6 bg-muted rounded w-32 mb-4" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-16 bg-muted rounded" />
            <div className="h-16 bg-muted rounded" />
          </div>
        </div>
        <div className="h-6 bg-muted rounded w-40 animate-pulse" />
        <div className="bg-card rounded-xl border border-muted animate-pulse">
          <div className="h-10 bg-muted rounded m-3" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-muted/50 rounded m-3" />
          ))}
        </div>
      </div>
    }>
      <CurrencyContent />
    </Suspense>
  );
}
