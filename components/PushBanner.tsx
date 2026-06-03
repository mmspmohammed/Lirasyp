 "use client";

import { usePushNotifications } from "@/hooks/usePushNotifications";
import { Bell, BellOff, Loader2 } from "lucide-react";

export default function PushBanner() {
  const { isSupported, isSubscribed, loading, subscribe, unsubscribe } = usePushNotifications();

  if (!isSupported) return null;

  return (
    <section className="mb-10">
      <div className="rounded-2xl bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-500/10 border border-red-500/20 p-5 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
            {isSubscribed ? (
              <Bell className="w-6 h-6 text-red-500" />
            ) : (
              <BellOff className="w-6 h-6 text-red-500" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-base">
              {isSubscribed
                ? "🔔 الإشعارات مفعلة"
                : "🔔 فعّل التنبيهات لتصلك الإشعارات في لحظة تغيرها"}
            </h3>
            
          </div>
        </div>
        <button
          onClick={isSubscribed ? unsubscribe : subscribe}
          disabled={loading}
          className={`px-5 py-2.5 rounded-full text-sm font-medium transition shadow-lg shrink-0 flex items-center gap-2 ${
            isSubscribed
              ? "bg-muted text-foreground border border-border hover:bg-muted/80"
              : "bg-red-500 text-white hover:bg-red-600 shadow-red-500/20"
          }`}
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? "جاري..." : isSubscribed ? "إيقاف الإشعارات" : "تفعيل الإشعارات"}
        </button>
      </div>
    </section>
  );
}
