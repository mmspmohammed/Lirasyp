'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 p-4 text-center">
      <div className="rounded-full bg-danger/10 p-4">
        <AlertTriangle className="h-8 w-8 text-danger" />
      </div>
      
      <div className="space-y-2">
        <h2 className="text-lg font-bold">عذراً، حدث خطأ غير متوقع</h2>
        <p className="text-sm text-muted-foreground">
          نعمل على حل المشكلة، يرجى المحاولة مرة أخرى
        </p>
      </div>
      
      <button
        onClick={() => reset()}
        className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-background transition hover:opacity-90"
      >
        <RefreshCw className="h-4 w-4" />
        إعادة المحاولة
      </button>
    </div>
  );
}