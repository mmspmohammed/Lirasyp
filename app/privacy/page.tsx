// app/privacy/page.tsx
import Link from "next/link";
import { ArrowLeft, Shield, Lock, Eye, Database, Bell } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "سياسة الخصوصية",
  description:
    "سياسة الخصوصية لموقع LiraSYP. كيف نجمع ونستخدم ونحمي بياناتك الشخصية.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary transition">الرئيسية</Link>
        <ArrowLeft className="w-4 h-4" />
        <span>سياسة الخصوصية</span>
      </nav>

      {/* Header */}
      <div className="text-center mb-12">
        <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
        <h1 className="text-3xl font-extrabold mb-4">سياسة الخصوصية</h1>
        <p className="text-muted-foreground">
          آخر تحديث: {new Date().toLocaleDateString("ar-SY", { year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Content */}
      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            1. البيانات التي نجمعها
          </h2>
          <div className="rounded-xl bg-card p-5 border border-border">
            <p className="text-muted-foreground mb-3">
              نحن لا نجمع بيانات شخصية حساسة. البيانات التي قد نجمعها تشمل:
            </p>
            <ul className="space-y-2 text-muted-foreground list-disc list-inside">
              <li>عنوان IP (للأمان وتحليل الاستخدام)</li>
              <li>نوع المتصفح ونظام التشغيل</li>
              <li>بيانات الاشتراك بالإشعارات (Push Notifications) - اختياري</li>
              <li>إحصائيات الاستخدام العامة</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            2. كيف نستخدم البيانات
          </h2>
          <div className="rounded-xl bg-card p-5 border border-border">
            <ul className="space-y-2 text-muted-foreground list-disc list-inside">
              <li>توفير خدمة تتبع الأسعار</li>
              <li>إرسال الإشعارات التي طلبتها (اختياري)</li>
              <li>تحسين أداء الموقع وتجربة المستخدم</li>
              <li>الحماية من الاستخدام الضار</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            3. حماية البيانات
          </h2>
          <div className="rounded-xl bg-card p-5 border border-border">
            <p className="text-muted-foreground mb-3">
              نتخذ إجراءات أمنية مناسبة لحماية بياناتك:
            </p>
            <ul className="space-y-2 text-muted-foreground list-disc list-inside">
              <li>استخدام بروتوكول HTTPS لتشفير الاتصال</li>
              <li>تخزين البيانات على خوادم آمنة (Supabase)</li>
              <li>عدم مشاركة البيانات مع أطراف ثالثة</li>
              <li>تحديثات أمنية منتظمة</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            4. الإشعارات (Push Notifications)
          </h2>
          <div className="rounded-xl bg-card p-5 border border-border">
            <p className="text-muted-foreground mb-3">
              الإشعارات هي خدمة اختيارية. إذا اخترت تفعيلها:
            </p>
            <ul className="space-y-2 text-muted-foreground list-disc list-inside">
              <li>نحتفظ بمفتاح اشتراكك لتتمكن من استقبال الإشعارات</li>
              <li>يمكنك إيقاف الإشعارات في أي وقت من إعدادات المتصفح</li>
              <li>لا نرسل إشعارات دعائية بدون إذن</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">5. ملفات تعريف الارتباط (Cookies)</h2>
          <div className="rounded-xl bg-card p-5 border border-border">
            <p className="text-muted-foreground">
              الموقع يستخدم ملفات تعريف الارتباط الأساسية فقط لتحسين الأداء وتذكر تفضيلاتك
              (مثل الوضع الليلي/النهاري). لا نستخدم ملفات تعريف ارتباط تتبعية.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">6. حقوقك</h2>
          <div className="rounded-xl bg-card p-5 border border-border">
            <p className="text-muted-foreground mb-3">لديك الحق في:</p>
            <ul className="space-y-2 text-muted-foreground list-disc list-inside">
              <li>الوصول إلى بياناتك الشخصية</li>
              <li>طلب حذف بياناتك</li>
              <li>إيقاف الإشعارات في أي وقت</li>
              <li>الاعتراض على معالجة بياناتك</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">7. التواصل معنا</h2>
          <div className="rounded-xl bg-card p-5 border border-border">
            <p className="text-muted-foreground">
              إذا كان لديك أي استفسارات حول سياسة الخصوصية، يمكنك التواصل معنا عبر البريد الإلكتروني:
              <a href="mailto:privacy@lirasyp.sy" className="text-primary hover:underline mx-1">
                privacy@lirasyp.sy
              </a>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
