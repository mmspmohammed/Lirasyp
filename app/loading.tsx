// app/loading.tsx
import { Loader2 } from "lucide-react";

export default function LoadingPage() {
  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center text-center">
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-full border-4 border-muted animate-spin">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-4 h-4 rounded-full bg-primary" />
        </div>
        <Loader2 className="w-8 h-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin" />
      </div>

      <h2 className="text-xl font-bold mb-2">جاري التحميل...</h2>
      <p className="text-muted-foreground text-sm">
        يرجى الانتظار قليلاً
      </p>

      {/* Skeleton Cards */}
      <div className="w-full max-w-4xl mt-12 grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl bg-card p-5 border border-border animate-pulse"
          >
            <div className="h-8 bg-muted rounded-lg mb-4" />
            <div className="h-12 bg-muted rounded-lg mb-3" />
            <div className="h-4 bg-muted rounded w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
