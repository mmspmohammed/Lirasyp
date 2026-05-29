import type { Metadata } from 'next';
import { formatDateAR } from '@/lib/format'; // ✅ تاريخ عربي آمن للسيرفر
import { SITE_URL, SITE_NAME } from '@/lib/env';
import BackButton from '@/components/BackButton';

// ✅ صفحة ثابتة ← كاش أفضل + توفير موارد
export const dynamic = 'force-static';

// ✅ تاريخ ثابت للفهرسة (لا يتغير مع كل طلب)
const POLICY_DATE = new Date('2026-01-01').toISOString();

export const metadata: Metadata = {
  title: 'سياسة الخصوصية | الليرة عملتنا',
  description: 'سياسة خصوصية موقع الليرة عملتنا: كيف نحمي بياناتك، ما نجمعه، وحقوقك كمستخدم',
  keywords: ['خصوصية', 'حماية البيانات', 'سياسة الاستخدام', 'أمان'],
  alternates: { canonical: `${SITE_URL}/privacy` },
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <div className="mb-6">
        <BackButton />
      </div>

      <header className="mb-8">
        <h1 className="text-2xl font-bold mb-2">سياسة الخصوصية</h1>
        <p className="text-sm text-muted-foreground">
          آخر تحديث: {formatDateAR(new Date())} {/* ✅ تاريخ عربي آمن */}
        </p>
      </header>

      <article className="prose prose-invert prose-sm max-w-none space-y-6">
        <section>
          <h2 className="text-lg font-bold mb-3">1. مقدمة</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            تحترم {SITE_NAME} خصوصيتك التزاماً كاملاً. توضح هذه السياسة نوع البيانات التي قد نجمعها، 
            وكيف نستخدمها، وما هي حقوقك كمستخدم. باستخدامك للموقع، فإنك توافق على ممارساتنا الموضحة هنا.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3">2. البيانات التي نجمعها</h2>
          <div className="text-sm space-y-3 text-muted-foreground">
            <p><strong>أ. بيانات التصفح التلقائية:</strong></p>
            <ul className="list-disc list-inside mr-4 space-y-1">
              <li>نوع المتصفح وإصداره</li>
              <li>نظام التشغيل والجهاز</li>
              <li>عنوان IP (لأغراض الأمان والإحصاءات المجمعة فقط)</li>
              <li>صفحات الموقع التي تزورها (لتحسين التجربة)</li>            </ul>
            
            <p className="mt-4"><strong>ب. بيانات الإشعارات (اختياري):</strong></p>
            <ul className="list-disc list-inside mr-4 space-y-1">
              <li>إذا فعّلت إشعارات المتصفح، نخزن مفتاح اشتراك فني فقط (بدون بيانات شخصية)</li>
              <li>نستخدم هذه البيانات حصرياً لإرسال تنبيهات تغير الأسعار التي طلبتها</li>
              <li>يمكنك إلغاء الاشتراك في أي وقت من القائمة الجانبية</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3">3. ما <em>لا</em> نجمعه</h2>
          <div className="bg-muted/30 rounded-lg p-4 text-sm text-muted-foreground">
            <ul className="space-y-2">
              <li>❌ لا نطلب أو نخزن أسماء، أرقام هواتف، أو عناوين بريد إلكتروني</li>
              <li>❌ لا نستخدم ملفات تعريف ارتباط (Cookies) لتتبعك عبر المواقع الأخرى</li>
              <li>❌ لا نبيع أو نشارك أي بيانات مع أطراف ثالثة لأغراض تسويقية</li>
              <li>❌ لا نحلل محتوى رسائلك أو نشاطك خارج موقعنا</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3">4. كيف نستخدم البيانات</h2>
          <ul className="text-sm space-y-2 text-muted-foreground list-disc list-inside mr-4">
            <li>تحسين أداء الموقع وسرعة التحميل</li>
            <li>كشف ومنع الأنشطة المشبوهة أو الهجمات الأمنية</li>
            <li>إرسال إشعارات الأسعار التي طلبتها فقط (إذا فعّلتها)</li>
            <li>تحليل إحصائي مجمع لفهم اتجاهات الاستخدام (بدون تحديد هوية)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3">5. حماية بياناتك</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            نتبع إجراءات أمان تقنية وإدارية معقولة لحماية بياناتك من الوصول غير المصرح به، 
            التعديل، أو الإتلاف. نستخدم اتصالاً مشفراً (HTTPS) لجميع عمليات نقل البيانات.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3">6. حقوقك</h2>
          <ul className="text-sm space-y-2 text-muted-foreground list-disc list-inside mr-4">
            <li>حق إلغاء اشتراك الإشعارات في أي وقت</li>
            <li>حق طلب حذف أي بيانات فنية مرتبطة بجهازك (تواصل معنا)</li>
            <li>حق معرفة نوع البيانات المجمعة عن زياراتك (عبر أدوات المطور في المتصفح)</li>
          </ul>
        </section>
        <section>
          <h2 className="text-lg font-bold mb-3">7. تغييرات على هذه السياسة</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            قد نحدّث سياسة الخصوصية دورياً. سننشر أي تغييرات في هذه الصفحة مع تاريخ التحديث. 
            نوصيك بمراجعة هذه الصفحة بين الحين والآخر.
          </p>
        </section>

        <section className="pt-4 border-t border-muted">
          <p className="text-xs text-muted-foreground">
            للاستفسار عن الخصوصية: <a href="mailto:privacy@lirasyp.sy" className="text-primary hover:underline">privacy@lirasyp.sy</a>
          </p>
        </section>
      </article>

      {/* ✅ Schema.org مُصحح: WebPage بدلاً من PrivacyPolicy غير القياسي */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage', // ✅ نوع قياسي معترف به من جوجل
            name: 'سياسة الخصوصية - الليرة عملتنا',
            description: 'كيف نجمع ونستخدم ونحمي بيانات مستخدمي موقع الليرة عملتنا',
            publisher: { '@type': 'Organization', name: SITE_NAME },
            inLanguage: 'ar-SY',
            datePublished: POLICY_DATE, // ✅ تاريخ ثابت لتحسين الكاش
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': `${SITE_URL}/privacy`,
            },
          }),
        }}
      />
    </div>
  );
}
