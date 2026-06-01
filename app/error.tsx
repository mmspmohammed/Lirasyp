// app/error.tsx
"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home, MessageCircle } from "lucide-react";
import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Error:", error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center text-center">
      <div className="w-24 h-24 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-6">
        <AlertTriangle className="w-12 h-12 text-red-500" />
      </div>

      <h1 className="text-3xl font-extrabold mb-4">عذراً، حدث خطأ</h1>
      <p className="text-muted-foreground max-w-md mb-2">
        حدث خطأ غير متوقع أثناء تحميل الصفحة. يرجى المحاولة مرة أخرى.
      </p>

      {error.message && (
        <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/10 rounded-lg px-4 py-2 mb-6 max-w-md">
          {error.message}
        </p>
      )}

      {error.digest && (
        <p className="text-xs text-muted-foreground mb-8">
          كود الخطأ: <code className="bg-muted px-2 py-1 rounded">{error.digest}</code>
        </p>
      )}

      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={reset}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-white font-medium hover:bg-primary/90 transition"
        >
          <RefreshCw className="w-4 h-4" />
          إعادة المحاولة
        </button>

        <Link
          href="/"
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-card border border-border font-medium hover:border-primary transition"
        >
          <Home className="w-4 h-4" />
          الصفحة الرئيسية
        </Link>
      </div>

      <div className="mt-12 p-6 rounded-2xl bg-muted/50 max-w-md">
        <div className="flex items-center gap-2 mb-3">
          <MessageCircle className="w-5 h-5 text-primary" />
          <h3 className="font-bold">هل المشكلة مستمرة؟</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          إذا استمرت المشكلة، يمكنك التواصل معنا عبر البريد الإلكتروني:
        </p>
        <a
          href="mailto:support@lirasyp.sy"
          className="text-primary hover:underline text-sm"
        >
          support@lirasyp.sy
        </a>
      </div>
    </div>
  );
}
