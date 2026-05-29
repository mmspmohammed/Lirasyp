import type { Metadata } from 'next';
import { formatDateAR } from '@/lib/format'; // ✅ تاريخ عربي آمن
import { SITE_URL, SITE_NAME } from '@/lib/env';
import BackButton from '@/components/BackButton';

// ✅ صفحة ثابتة ← كاش أفضل + توفير موارد
export const dynamic = 'force-static';

// ✅ تاريخ ثابت للفهرسة
const TERMS_DATE = new Date('2026-01-01').toISOString();

export const metadata: Metadata = {
  title: 'شروط الاستخدام | الليرة عملتنا',
  description: 'شروط وأحكام استخدام موقع الليرة عملتنا: المسؤوليات، إخلاء المسؤولية، والقيود القانونية',
  keywords: ['شروط الاستخدام', 'إخلاء مسؤولية', 'أحكام', 'قانوني'],
  alternates: { canonical: `${SITE_URL}/terms` },
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <div className="mb-6">
        <BackButton />
      </div>

      <header className="mb-8">
        <h1 className="text-2xl font-bold mb-2">شروط الاستخدام</h1>
        <p className="text-sm text-muted-foreground">
          آخر تحديث: {formatDateAR(new Date())} {/* ✅ تاريخ عربي آمن */}
        </p>
      </header>

      <article className="prose prose-invert prose-sm max-w-none space-y-6">
        <section>
          <h2 className="text-lg font-bold mb-3">1. قبول الشروط</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            باستخدامك لموقع {SITE_NAME} ("الموقع")، فإنك تقر بأنك قرأت وفهمت ووافقت على الالتزام 
            بهذه الشروط والأحكام. إذا كنت لا توافق عليها، يرجى التوقف عن استخدام الموقع فوراً.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3">2. طبيعة الخدمة</h2>
          <div className="text-sm space-y-3 text-muted-foreground">
            <p>يقدم الموقع:</p>
            <ul className="list-disc list-inside mr-4 space-y-1">
              <li>عرض أسعار صرف العملات، الذهب، المحروقات، والكهرباء في سوريا</li>
              <li>أخبار اقتصادية من مصادر خارجية موثوقة</li>
              <li>إشعارات اختيارية لتغير الأسعار</li>
            </ul>            <p className="mt-3"><strong>الموقع خدمة معلوماتية فقط ولا يقدم:</strong></p>
            <ul className="list-disc list-inside mr-4 space-y-1">
              <li>نصائح استثمارية أو مالية</li>
              <li>ضمانات لدقة الأسعار أو اكتمالها</li>
              <li>خدمات صرافة أو تحويل أموال</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3 text-danger">3. ⚠️ إخلاء المسؤولية (هام جداً)</h2>
          <div className="bg-danger/10 border border-danger/30 rounded-lg p-4 text-sm">
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <strong>الأسعار استرشادية:</strong> جميع الأسعار المعروضة لأغراض إعلامية فقط. 
                قد تختلف عن الأسعار الفعلية في السوق بسبب عوامل متعددة (توقيت التحديث، منطقة التطبيق، هوامش الصرافة).
              </li>
              <li>
                <strong>لا مسؤولية عن القرارات:</strong> لا نتحمل أي مسؤولية عن خسائر مالية أو قرارات 
                تتخذ بناءً على البيانات المعروضة. أنت المسؤول الوحيد عن قراراتك المالية.
              </li>
              <li>
                <strong>تغير المصادر:</strong> نحتفظ بالحق في تغيير مصادر البيانات أو إيقاف عرض أي سعر 
                دون إشعار مسبق إذا تبين عدم موثوقيته.
              </li>
              <li>
                <strong>أخبار خارجية:</strong> الأخبار المعروضة من مصادر خارجية، ونحن غير مسؤولين 
                عن دقة محتواها أو آرائها.
              </li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3">4. استخدامك للموقع</h2>
          <ul className="text-sm space-y-2 text-muted-foreground list-disc list-inside mr-4">
            <li>توافق على استخدام الموقع لأغراض شخصية وغير تجارية فقط</li>
            <li>لا تحاول اختراق الموقع، تعطيل خدمته، أو الوصول غير المصرح به لأي بيانات</li>
            <li>لا تعيد نشر أو استغلال محتوى الموقع (أسعار، نصوص، تصميم) دون إذن كتابي</li>
            <li>تتحمل مسؤولية تأمين جهازك واتصالك أثناء استخدام الموقع</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3">5. الملكية الفكرية</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            جميع حقوق المحتوى الأصلي للموقع (تصميم، نصوص، شعار، كود) محفوظة لـ {SITE_NAME}. 
            يُسمح بالاستخدام الشخصي غير التجاري مع ذكر المصدر. أي استخدام آخر يتطلب إذناً كتابياً.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold mb-3">6. تعديل الشروط</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            نحتفظ بالحق في تعديل هذه الشروط في أي وقت. التعديلات تصبح سارية فور نشرها في هذه الصفحة. 
            استمرارك في استخدام الموقع بعد التعديل يعني قبولك للشروط الجديدة.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3">7. القانون الواجب التطبيق</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            تخضع هذه الشروط وتُفسر وفقاً للقوانين النافذة. أي نزاع ينشأ عن استخدام الموقع 
            يُحال للجهات القضائية المختصة.
          </p>
        </section>

        <section className="pt-4 border-t border-muted">
          <p className="text-xs text-muted-foreground">
            للاستفسار القانوني: <a href="mailto:legal@lirasyp.sy" className="text-primary hover:underline">legal@lirasyp.sy</a>
          </p>
        </section>
      </article>

      {/* ✅ Schema.org مُصحح: WebPage + تاريخ ثابت */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage', // ✅ نوع قياسي معترف به
            name: 'شروط الاستخدام - الليرة عملتنا',
            description: 'الأحكام والشروط القانونية لاستخدام موقع الليرة عملتنا',
            publisher: { '@type': 'Organization', name: SITE_NAME },
            inLanguage: 'ar-SY',
            datePublished: TERMS_DATE, // ✅ تاريخ ثابت لتحسين الكاش
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': `${SITE_URL}/terms`,
            },
          }),
        }}
      />
    </div>
  );
}