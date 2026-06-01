// app/terms/page.tsx
import Link from "next/link";
import { ArrowLeft, FileText, AlertTriangle, CheckCircle } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "شروط الاستخدام",
  description:
    "شروط وأحكام استخدام موقع LiraSYP. يرجى قراءة هذه الشروط بعناية قبل استخدام الموقع.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary transition">الرئيسية</Link>
        <ArrowLeft className="w-4 h-4" />
        <span>شروط الاستخدام</span>
      </nav>

      {/* Header */}
      <div className="text-center mb-12">
        <FileText className="w-12 h-12 text-primary mx-auto mb-4" />
        <h1 className="text-3xl font-extrabold mb-4">شروط الاستخدام</h1>
        <p className="text-muted-foreground">
          باستخدامك للموقع، فإنك توافق على هذه الشروط
        </p>
      </div>

      {/* Content */}
      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            1. قبول الشروط
          </h2>
          <div className="rounded-xl bg-card p-5 border border-border">
            <p className="text-muted-foreground">
              باستخدامك لموقع LiraSYP، فإنك توافق على الالتزام بهذه الشروط والأحكام.
              إذا كنت لا توافق على أي جزء من هذه الشروط، يجب عليك عدم استخدام الموقع.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">2. استخدام الموقع</h2>
          <div className="rounded-xl bg-card p-5 border border-border">
            <p className="text-muted-foreground mb-3">
              يجب استخدام الموقع للأغراض المشروعة فقط. يُحظر:
            </p>
            <ul className="space-y-2 text-muted-foreground list-disc list-inside">
              <li>استخدام الموقع بأي طريقة تسبب ضرراً للموقع أو تعطله</li>
              <li>محاولة الوصول غير المصرح به إلى الأنظمة أو الشبكات</li>
              <li>استخدام الروبوتات أو البرامج الآلية دون إذن</li>
              <li>نشر محتوى ضار أو غير قانوني</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">3. دقة البيانات</h2>
          <div className="rounded-xl bg-card p-5 border border-border">
            <p className="text-muted-foreground">
              نسعى جاهدين لتوفير بيانات دقيقة ومحدثة، لكننا لا نضمن دقة أو اكتمال أو
              موثوقية أي معلومات على الموقع. الأسعار المعروضة هي للأغراض الإعلامية فقط
              وقد تختلف عن الأسعار الفعلية في السوق.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            4. إخلاء المسؤولية
          </h2>
          <div className="rounded-xl bg-card p-5 border border-border">
            <p className="text-muted-foreground mb-3">
              الموقع والمحتوى متاحان "كما هما" دون أي ضمانات من أي نوع. نحن لا نتحمل
              مسؤولية:
            </p>
            <ul className="space-y-2 text-muted-foreground list-disc list-inside">
              <li>أي خسائر مالية قد تنتج عن استخدام البيانات</li>
              <li>أي أخطاء أو انقطاعات في الخدمة</li>
              <li>أي أضرار ناتجة عن الاعتماد على المعلومات المعروضة</li>
              <li>محتوى المواقع الخارجية المرتبطة</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">5. الملكية الفكرية</h2>
          <div className="rounded-xl bg-card p-5 border border-border">
            <p className="text-muted-foreground">
              جميع المحتويات على الموقع (النصوص، الصور، الشعارات، التصميم) محمية بموجب
              قوانين حقوق النشر. لا يجوز نسخ أو إعادة إنتاج أو توزيع أي محتوى دون
              إذن كتابي مسبق.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">6. التعديلات على الشروط</h2>
          <div className="rounded-xl bg-card p-5 border border-border">
            <p className="text-muted-foreground">
              نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سيتم نشر أي تغييرات على هذه
              الصفحة مع تاريخ التحديث. استمرارك في استخدام الموقع بعد أي تغييرات يعني
              قبولك للشروط المعدلة.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">7. القانون الساري</h2>
          <div className="rounded-xl bg-card p-5 border border-border">
            <p className="text-muted-foreground">
              تخضع هذه الشروط لقوانين الجمهورية العربية السورية. أي نزاع ينشأ عن
              استخدام الموقع يخضع لاختصاص المحاكم السورية المختصة.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
