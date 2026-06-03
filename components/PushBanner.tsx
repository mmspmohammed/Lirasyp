// components/PushBanner.tsx
"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";

export default function PushBanner() {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSubscription() {
      if (!("Notification" in window) || !("serviceWorker" in navigator)) {
        setLoading(false);
        return;
      }

      if (Notification.permission === "denied") {
        setLoading(false);
        return;
      }

      try {
        const registration = await navigator.serviceWorker.ready;
        const existingSub = await registration.pushManager.getSubscription();
        if (existingSub) {
          // ✅ الإشعارات مفعلة — لا تظهر البانر
          setVisible(false);
        } else {
          // ❌ مو مفعلة — اعرض البانر
          setVisible(true);
        }
      } catch {
        setVisible(false);
      } finally {
        setLoading(false);
      }
    }

    checkSubscription();
  }, []);

  async function handleSubscribe() {
    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setLoading(false);
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      if (!vapidKey) {
        console.error("VAPID key missing");
        setLoading(false);
        return;
      }

      const newSub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey) as unknown as BufferSource,
      });

      // حفظ بالسيرفر
      const json = newSub.toJSON();
      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: newSub.endpoint,
          auth: json.keys?.auth,
          p256dh: json.keys?.p256dh,
          user_agent: navigator.userAgent,
        }),
      });

      // ✅ اخفِ البانر بعد النجاح
      setVisible(false);
    } catch (err) {
      console.error("Subscribe failed:", err);
      setLoading(false);
    }
  }

  if (loading || !visible) return null;

  return (
    <section className="mb-10">
      <div className="rounded-2xl bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-500/10 border border-red-500/20 p-5 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
            <Bell className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h3 className="font-bold text-base">🔔 فعّل التنبيهات لتصلك الإشعارات في لحظة تغيرها</h3>
            <p className="text-sm text-muted-foreground">
              احصل على إشعارات فورية عند تغير أسعار الدولار، الذهب، والعملات الرقمية.
            </p>
          </div>
        </div>
        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="px-5 py-2.5 rounded-full bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition shadow-lg shadow-red-500/20 shrink-0 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BellOff className="w-4 h-4" />}
          تفعيل الإشعارات
        </button>
      </div>
    </section>
  );
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
