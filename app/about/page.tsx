import type { Metadata } from 'next';
import Link from 'next/link';
import { Shield, Zap, Globe, Mail } from 'lucide-react';
import { formatDateAR } from '@/lib/format'; // ✅ استيراد دالة التاريخ الآمنة
import { SITE_URL, SITE_NAME } from '@/lib/env';
import BackButton from '@/components/BackButton';

// ✅ صفحة ثابتة تماماً ← توفير موارد السيرفر + كاش أفضل
export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'عن الموقع | الليرة عملتنا',
  description: 'موقع الليرة عملتنا يعرض أسعار الدولار، الذهب، المحروقات، والكهرباء في سوريا بشكل لحظي وموثوق من مصادر رسمية',
  keywords: ['عن الليرة عملتنا', 'موقع اقتصادي سوريا', 'أسعار موثوقة', 'مصادر البيانات'],
  alternates: { canonical: `${SITE_URL}/about` },
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <div className="mb-6">
        <BackButton />
      </div>

      <header className="mb-8 text-center">
        <h1 className="text-2xl font-bold mb-2">عن {SITE_NAME}</h1>
        <p className="text-muted-foreground">
          منصة اقتصادية موثوقة لأسعار سوريا
        </p>
      </header>

      <section className="space-y-6">
        {/* الرسالة */}
        <div className="bg-card rounded-xl p-5 border border-muted">
          <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            رسالتنا
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            نهدف لتوفير مصدر موثوق ومركزي لأسعار الصرف، الذهب، المحروقات، والكهرباء في سوريا، 
            مع تحديثات لحظية وبيانات من مصادر رسمية وموثوقة. نؤمن بأن الشفافية المالية حق لكل مواطن.
          </p>
        </div>

        {/* الميزات */}
        <div className="bg-card rounded-xl p-5 border border-muted">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            لماذا تختارنا؟
          </h2>          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <span className="text-primary mt-0.5">✓</span>
              <span><strong>تحديث لحظي:</strong> أسعار تتحدث كل 5 دقائق من مصادر موثوقة</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary mt-0.5">✓</span>
              <span><strong>شفافية كاملة:</strong> نذكر مصدر كل سعر وتاريخ آخر تحديث</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary mt-0.5">✓</span>
              <span><strong>واجهة بسيطة:</strong> تصميم متجاوب يعمل بسلاسة على جميع الأجهزة</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary mt-0.5">✓</span>
              <span><strong>خصوصية تامة:</strong> لا نجمع بيانات شخصية، ونحترم خصوصيتك</span>
            </li>
          </ul>
        </div>

        {/* مصادر البيانات */}
        <div className="bg-card rounded-xl p-5 border border-muted">
          <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            مصادر البيانات
          </h2>
          <div className="text-sm space-y-2 text-muted-foreground">
            <p>نعتمد على مصادر متعددة لضمان الدقة:</p>
            <ul className="list-disc list-inside space-y-1 mr-4">
       
            </ul>
          </div>
        </div>

        {/* التواصل */}
        <div className="bg-card rounded-xl p-5 border border-muted">
          <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            تواصل معنا
          </h2>
          <p className="text-sm text-muted-foreground mb-3">
            لديك ملاحظة أو اقتراح؟ نسمعك دائماً:
          </p>
          <a 
            href="mailto:contact@lirasyp.sy"             className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium"
          >
            <Mail className="h-4 w-4" />
            contact@lirasyp.sy
          </a>
        </div>

        {/* تنويه */}
        <div className="bg-muted/30 rounded-lg p-4 text-xs text-muted-foreground border-l-4 border-amber-500">
          <strong>تنويه هام:</strong> الأسعار المعروضة لأغراض إعلامية واسترشادية فقط. 
          قد تختلف الأسعار الفعلية في السوق المحلي. لا نتحمل مسؤولية أي قرارات مالية مبنية على هذه البيانات.
        </div>
      </section>

      {/* ✅ Schema.org مُصحح: sameAs للروابط الخارجية فقط */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'AboutPage',
            name: `عن ${SITE_NAME}`,
            description: 'موقع اقتصادي يعرض أسعار الصرف، الذهب، والمحروقات في سوريا',
            publisher: {
              '@type': 'Organization',
              name: SITE_NAME,
              url: SITE_URL,
              logo: `${SITE_URL}/logo.png`,
            },
            // ✅ sameAs للروابط الاجتماعية الحقيقية (أضفها لاحقاً إذا وجدت)
            // sameAs: [
            //   'https://twitter.com/lirasyp',
            //   'https://facebook.com/lirasyp',
            // ],
          }),
        }}
      />
    </div>
  );
}
