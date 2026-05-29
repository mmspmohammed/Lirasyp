import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { RefreshCw, Zap, Calendar, FileText } from 'lucide-react';
import { createServerSupabase } from '@/lib/supabase-server';
import { formatPrice, formatRelativeTime, formatNumber } from '@/lib/format';
import { SITE_URL } from '@/lib/env';
import BackButton from '@/components/BackButton';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'تعرفة الكهرباء في سوريا | الليرة عملتنا',
  description: 'أسعار شرائح الكهرباء: منزلي أقل من 300 كيلوواط، منزلي أكثر من 300، تجاري، وصناعي - أسعار رسمية محدثة',
  keywords: ['تعرفة الكهرباء سوريا', 'شرائح الكهرباء', 'كهرباء منزلي', 'كهرباء تجاري', 'كيلوواط'],
  alternates: { canonical: `${SITE_URL}/prices/electricity` },
  openGraph: {
    title: 'الكهرباء | الليرة عملتنا',
    description: 'تعرفة الكهرباء في سوريا حسب الشرائح - أسعار رسمية',
    url: `${SITE_URL}/prices/electricity`,
    type: 'website',
  },
};

type ElectricityTariff = {
  id: string;
  tier_key: 'residential_under_300' | 'residential_over_300' | 'commercial' | 'industrial';
  tier_name_ar: string;
  price_per_kwh: number;
  currency: 'SYP' | 'USD';
  effective_from: string;
  effective_to: string | null;
  is_active: boolean;
  updated_at: string;
  source_reference: string | null;
};

const TIER_META: Record<ElectricityTariff['tier_key'], { icon: string; color: string; desc: string }> = {
  residential_under_300: { icon: '🏠', color: 'bg-green-500/10 text-green-400', desc: 'تعرفة مدعومة' },
  residential_over_300: { icon: '🏠', color: 'bg-yellow-500/10 text-yellow-400', desc: 'تعرفة عادية' },
  commercial: { icon: '🏢', color: 'bg-blue-500/10 text-blue-400', desc: 'قطاع تجاري' },
  industrial: { icon: '🏭', color: 'bg-purple-500/10 text-purple-400', desc: 'قطاع صناعي' },
};

// ✅ تنسيق التاريخ بأمان للسيرفر (مع خيارات صريحة)
const formatDateAR = (date: string | Date) => {
  try {
    return new Date(date).toLocaleDateString('ar-SY', {
      year: 'numeric',
      month: 'long',      day: 'numeric',
    });
  } catch {
    // Fallback في حال عدم دعم locale على السيرفر
    return new Date(date).toISOString().split('T')[0];
  }
};

async function getElectricityData() {
  const supabase = createServerSupabase();
  
  const { data: tariffs, error } = await supabase
    .from('electricity_tariffs')
    .select('*')
    .eq('is_active', true)
    .eq('currency', 'SYP')
    .order('tier_key');

  // ✅ معالجة الخطأ
  if (error) throw error;

  return { tariffs: (tariffs as ElectricityTariff[] | null) ?? [] };
}

function TariffCard({ tariff }: { tariff: ElectricityTariff }) {
  const meta = TIER_META[tariff.tier_key];
  
  return (
    <div className="bg-card rounded-xl p-4 border border-muted hover:border-primary/50 transition">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{meta.icon}</span>
          <div>
            <h3 className="font-bold">{tariff.tier_name_ar}</h3>
            <span className={`text-[10px] px-2 py-0.5 rounded ${meta.color}`}>
              {meta.desc}
            </span>
          </div>
        </div>
        <Zap className="h-5 w-5 text-muted-foreground" />
      </div>

      <div className="bg-muted/30 rounded-lg p-4 text-center mb-3">
        <p className="text-xs text-muted-foreground mb-1">سعر الكيلوواط/ساعة</p>
        <p className="text-2xl font-bold font-mono">{formatPrice(tariff.price_per_kwh, 'SYP')}</p>
      </div>

      <div className="space-y-2 text-xs text-muted-foreground">
        <div className="flex items-center justify-between">
          <span>تاريخ البدء:</span>          {/* ✅ تنسيق آمن للسيرفر */}
          <span className="font-medium">{formatDateAR(tariff.effective_from)}</span>
        </div>
        {tariff.effective_to && (
          <div className="flex items-center justify-between">
            <span>تاريخ الانتهاء:</span>
            <span className="font-medium">{formatDateAR(tariff.effective_to)}</span>
          </div>
        )}
        <div className="flex items-center justify-between pt-2 border-t border-muted">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            محدّث
          </span>
          <span>{formatRelativeTime(tariff.updated_at)}</span>
        </div>
      </div>

      {tariff.source_reference && (
        <a
          href={tariff.source_reference}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex items-center gap-1 text-[10px] text-primary hover:underline"
        >
          <FileText className="h-3 w-3" />
          مصدر القرار الرسمي
        </a>
      )}
    </div>
  );
}

async function ElectricityContent() {
  const { tariffs } = await getElectricityData();

  if (!tariffs.length) {
    return (
      <div className="text-center py-12">
        <RefreshCw className="h-8 w-8 mx-auto text-muted-foreground animate-spin mb-3" />
        <p className="text-muted-foreground">لا توجد بيانات تعرفة كهرباء متوفرة حالياً</p>
      </div>
    );
  }

  const lastUpdate = tariffs[0]?.updated_at;

  // ✅ مثال توضيحي واضح للمستخدم
  const EXAMPLE_CONSUMPTION = 250; // كيلوواط/شهر - قيمة توضيحية فقط
  const under300Tariff = tariffs.find(t => t.tier_key === 'residential_under_300');  const exampleCost = under300Tariff ? EXAMPLE_CONSUMPTION * under300Tariff.price_per_kwh : 0;

  return (
    <div className="container mx-auto px-4 py-4 space-y-6">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">تعرفة الكهرباء</h1>
          <p className="text-sm text-muted-foreground mt-1">
            محدّث {lastUpdate ? formatRelativeTime(lastUpdate) : '—'} • أسعار رسمية
          </p>
        </div>
        <BackButton />
      </div>

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-xs text-blue-200">
        💡 الأسعار حسب شرائح وزارة الكهرباء السورية. قد تطبق رسوم إضافية أو دعم حسب القرار الرسمي.
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {tariffs.map((tariff) => (
          <TariffCard key={tariff.id} tariff={tariff} />
        ))}
      </div>

      {under300Tariff && (
        <div className="bg-card rounded-xl p-4 border border-muted">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <Zap className="h-4 w-4" />
            مثال حسابي توضيحي
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">استهلاك منزلي (مثال):</span>
              <span className="font-medium">{EXAMPLE_CONSUMPTION} كيلوواط/شهر</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">الشريحة:</span>
              <span className="font-medium">منزلي أقل من 300 كيلوواط</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-muted">
              <span className="text-muted-foreground">التكلفة التقديرية:</span>
              <span className="font-bold font-mono">{formatPrice(exampleCost, 'SYP')}</span>
            </div>
          </div>
          <p className="mt-3 text-[10px] text-muted-foreground italic">
            ⚠️ هذا مثال توضيحي فقط لأغراض الشرح. الفاتورة الفعلية قد تختلف حسب العداد والرسوم الإضافية والقرارات الرسمية.
          </p>
        </div>
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: tariffs.map(t => ({
              '@type': 'Question',
              name: `كم سعر الكهرباء لـ ${t.tier_name_ar}؟`,
              acceptedAnswer: {
                '@type': 'Answer',
                text: `سعر الكيلوواط/ساعة لـ ${t.tier_name_ar} هو ${formatPrice(t.price_per_kwh, 'SYP')} حسب القرار الرسمي ساري المفعول من ${formatDateAR(t.effective_from)}.`,
              },
            })),
          }),
        }}
      />
    </div>
  );
}

export default function ElectricityPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="h-8 bg-muted rounded w-40 animate-pulse" />
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg h-12 animate-pulse" />
        <div className="grid gap-3 sm:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card rounded-xl p-4 border border-muted animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-8 w-8 bg-muted rounded" />
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-32" />
                  <div className="h-3 bg-muted rounded w-20" />
                </div>
              </div>
              <div className="h-16 bg-muted rounded mb-3" />
              <div className="space-y-2">
                <div className="h-3 bg-muted/50 rounded" />
                <div className="h-3 bg-muted/50 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    }>
      <ElectricityContent />
    </Suspense>  );
}