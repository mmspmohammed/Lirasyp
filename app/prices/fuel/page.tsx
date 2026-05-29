import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { RefreshCw, MapPin, Calendar } from 'lucide-react';
import { createServerSupabase } from '@/lib/supabase-server';
import { formatPrice, formatRelativeTime, formatNumber } from '@/lib/format';
import { SITE_URL } from '@/lib/env';
import BackButton from '@/components/BackButton'; // ✅ مكون مشترك

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'أسعار المحروقات في سوريا | الليرة عملتنا',
  description: 'أسعار البنزين 95، البنزين 90، المازوت، والغاز المنزلي والصناعي في سوريا - تحديث يدوي من مصادر رسمية',
  keywords: ['أسعار المحروقات سوريا', 'بنزين 95', 'مازوت', 'غاز منزلي', 'أسطوانة غاز'],
  alternates: { canonical: `${SITE_URL}/prices/fuel` },
  openGraph: {
    title: 'المحروقات | الليرة عملتنا',
    description: 'أسعار المحروقات في سوريا - تحديث يدوي موثوق',
    url: `${SITE_URL}/prices/fuel`,
    type: 'website',
  },
};

// ✅ تعريف الأنواع بدقة
type FuelPrice = {
  id: string;
  material_type: 'gasoline_95' | 'gasoline_90' | 'diesel' | 'gas_cylinder';
  material_name_ar: string;
  price_usd: number;
  price_syp: number;
  unit_ar: string;
  region: string;
  updated_at: string;
  notes: string | null;
};

// ✅ خريطة عرض المواد (ثابتة ومنظّمة)
const FUEL_META: Record<FuelPrice['material_type'], { icon: string; category: string }> = {
  gasoline_95: { icon: '⛽', category: 'بنزين' },
  gasoline_90: { icon: '⛽', category: 'بنزين' },
  diesel: { icon: '🚛', category: 'مازوت' },
  gas_cylinder: { icon: '🔥', category: 'غاز' },
};

// ✅ أيقونات الفئات للعرض (تجنب عرض `false`)
const CATEGORY_ICONS: Record<string, string> = {
  'بنزين': '⛽',
  'مازوت': '🚛',
  'غاز': '🔥',};

// ✅ جلب البيانات مع معالجة الأخطاء
async function getFuelData() {
  const supabase = createServerSupabase();
  
  const { data: fuels, error } = await supabase
    .from('fuel_prices')
    .select('*')
    .eq('region', 'all_syria')
    .order('material_type');

  // ✅ معالجة الخطأ: Next.js سيعرض صفحة error.tsx تلقائياً
  if (error) throw error;

  // ✅ استخدام ?? للتعامل الدقيق مع null/undefined
  return { fuels: (fuels as FuelPrice[] | null) ?? [] };
}

// ✅ مكون بطاقة سعر المحروقات
function FuelCard({ fuel }: { fuel: FuelPrice }) {
  const meta = FUEL_META[fuel.material_type];
  
  return (
    <div className="bg-card rounded-xl p-4 border border-muted hover:border-primary/50 transition">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{meta.icon}</span>
          <div>
            <h3 className="font-bold">{fuel.material_name_ar}</h3>
            <p className="text-xs text-muted-foreground">{meta.category}</p>
          </div>
        </div>
        <span className="text-xs bg-muted px-2 py-1 rounded font-mono">
          {fuel.unit_ar}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-muted/30 rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">بالدولار</p>
          <p className="text-lg font-bold font-mono">${formatNumber(fuel.price_usd, 2)}</p>
        </div>
        <div className="bg-muted/30 rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">بالليرة السورية</p>
          <p className="text-lg font-bold font-mono">{formatPrice(fuel.price_syp, 'SYP')}</p>
        </div>
      </div>

      <div className="pt-3 border-t border-muted flex items-center justify-between text-xs text-muted-foreground">        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>محدّث {formatRelativeTime(fuel.updated_at)}</span>
        </div>
        <div className="flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          <span>{fuel.region === 'all_syria' ? 'كل سوريا' : fuel.region}</span>
        </div>
      </div>

      {fuel.notes && (
        <p className="mt-2 text-[10px] text-muted-foreground italic">
          💡 {fuel.notes}
        </p>
      )}
    </div>
  );
}

async function FuelContent() {
  const { fuels } = await getFuelData(); // ✅ الخطأ سيُرمي تلقائياً هنا

  if (!fuels.length) {
    return (
      <div className="text-center py-12">
        <RefreshCw className="h-8 w-8 mx-auto text-muted-foreground animate-spin mb-3" />
        <p className="text-muted-foreground">لا توجد بيانات محروقات متوفرة حالياً</p>
      </div>
    );
  }

  const lastUpdate = fuels[0]?.updated_at;

  // تجميع المواد حسب الفئة
  const grouped = fuels.reduce((acc, fuel) => {
    const cat = FUEL_META[fuel.material_type].category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(fuel);
    return acc;
  }, {} as Record<string, FuelPrice[]>);

  return (
    <div className="container mx-auto px-4 py-4 space-y-6">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">أسعار المحروقات</h1>
          <p className="text-sm text-muted-foreground mt-1">
            محدّث {lastUpdate ? formatRelativeTime(lastUpdate) : '—'} • إدخال يدوي
          </p>        </div>
        <BackButton /> {/* ✅ مكون مشترك */}
      </div>

      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-xs text-amber-200">
        ⚠️ أسعار المحروقات تُحدَّث يدوياً بناءً على القرارات الرسمية. قد تختلف الأسعار في السوق المحلي.
      </div>

      {Object.entries(grouped).map(([category, items]) => (
        <section key={category} className="space-y-3">
          <h2 className="font-bold text-lg flex items-center gap-2">
            {/* ✅ استخدام خريطة الأيقونات لتجنب عرض `false` */}
            <span aria-hidden="true">{CATEGORY_ICONS[category]}</span>
            {category}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {items.map((fuel) => (
              <FuelCard key={fuel.id} fuel={fuel} />
            ))}
          </div>
        </section>
      ))}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'أسعار المحروقات في سوريا',
            description: 'أسعار البنزين، المازوت، والغاز في سوريا - تحديث يدوي',
            itemListElement: fuels.map((f, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              item: {
                '@type': 'Product',
                name: f.material_name_ar,
                description: `سعر ${f.material_name_ar} (${f.unit_ar})`,
                offers: {
                  '@type': 'Offer',
                  price: f.price_syp,
                  priceCurrency: 'SYP',
                  availability: 'https://schema.org/InStock',
                },
              },
            })),
          }),
        }}
      />
    </div>  );
}

export default function FuelPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="h-8 bg-muted rounded w-40 animate-pulse" />
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg h-12 animate-pulse" />
        <div className="grid gap-3 sm:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card rounded-xl p-4 border border-muted animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-8 w-8 bg-muted rounded" />
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-24" />
                  <div className="h-3 bg-muted rounded w-16" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="h-12 bg-muted rounded" />
                <div className="h-12 bg-muted rounded" />
              </div>
              <div className="h-4 bg-muted/50 rounded mt-3" />
            </div>
          ))}
        </div>
      </div>
    }>
      <FuelContent />
    </Suspense>
  );
}
