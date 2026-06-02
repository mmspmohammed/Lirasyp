"use client";

import { useEffect, useCallback, useState } from "react";
import { Bell, X, Check, BellOff, Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function NotificationModal({ open, onClose }: Props) {
  const [status, setStatus] = useState<"idle" | "loading" | "granted" | "denied" | "unsupported">("idle");
  const [subscription, setSubscription] = useState<<PushSubscription | null>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
      checkStatus();
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  async function checkStatus() {
    console.log("🔍 Checking notification support...");

    if (!("Notification" in window)) {
      console.warn("❌ Notification API not supported");
      setStatus("unsupported");
      return;
    }
    if (!("serviceWorker" in navigator)) {
      console.warn("❌ Service Worker not supported");
      setStatus("unsupported");
      return;
    }
    if (!("PushManager" in window)) {
      console.warn("❌ PushManager not supported");
      setStatus("unsupported");
      return;
    }

    if (Notification.permission === "denied") {
      console.warn("❌ Notification permission denied");
      setStatus("denied");
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      console.log("✅ Service Worker ready:", registration.scope);

      const existingSub = await registration.pushManager.getSubscription();
      console.log("📡 Existing subscription:", existingSub);

      if (existingSub) {
        setSubscription(existingSub);
        setStatus("granted");
      } else {
        setStatus("idle");
      }
    } catch (err) {
      console.error("❌ Error checking status:", err);
      setStatus("unsupported");
    }
  }

  async function subscribe() {
    console.log("🚀 Starting subscription...");
    setStatus("loading");

    try {
      const permission = await Notification.requestPermission();
      console.log("🔔 Permission result:", permission);

      if (permission !== "granted") {
        setStatus("denied");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      console.log("✅ SW ready for subscribe");

      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      console.log("🔑 VAPID Key:", vapidKey ? "exists" : "MISSING!");

      if (!vapidKey) {
        console.error("❌ NEXT_PUBLIC_VAPID_PUBLIC_KEY is not set");
        alert("مفتاح VAPID غير مُعد — تواصل مع المطور");
        setStatus("idle");
        return;
      }

      let applicationServerKey: ArrayBufferView;
      try {
        applicationServerKey = urlBase64ToUint8Array(vapidKey) as ArrayBufferView;
        console.log("🔧 Converted VAPID key to Uint8Array");
      } catch (convErr) {
        console.error("❌ Failed to convert VAPID key:", convErr);
        setStatus("idle");
        return;
      }

      console.log("📡 Calling pushManager.subscribe...");
      const newSub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });
      console.log("✅ Subscribed:", newSub);

      await saveSubscription(newSub);
      setSubscription(newSub);
      setStatus("granted");
    } catch (err: any) {
      console.error("❌ Subscribe error:", err);
      alert("فشل الاشتراك: " + (err.message || "خطأ غير معروف"));
      setStatus("idle");
    }
  }

  async function unsubscribe() {
    setStatus("loading");
    try {
      if (subscription) await subscription.unsubscribe();
      const registration = await navigator.serviceWorker.ready;
      const existingSub = await registration.pushManager.getSubscription();
      if (existingSub) await existingSub.unsubscribe();

      await deleteSubscription();
      setSubscription(null);
      setStatus("idle");
    } catch (err: any) {
      console.error("❌ Unsubscribe error:", err);
      setStatus("granted");
    }
  }

  async function saveSubscription(sub: PushSubscription) {
    console.log("💾 Saving subscription...");
    const json = sub.toJSON();
    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        endpoint: sub.endpoint,
        auth: json.keys?.auth,
        p256dh: json.keys?.p256dh,
        user_agent: navigator.userAgent,
      }),
    });
    console.log("💾 Save response:", res.status);
    if (!res.ok) throw new Error("Failed to save subscription");
  }

  async function deleteSubscription() {
    const res = await fetch("/api/unsubscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint: subscription?.endpoint }),
    });
    if (!res.ok) throw new Error("Failed to delete subscription");
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full sm:w-[480px] sm:rounded-2xl rounded-t-3xl bg-background shadow-2xl flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
              <Bell className="w-4 h-4 text-red-500" />
            </div>
            <h2 className="text-lg font-bold">الإشعارات</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 text-center">
          {status === "unsupported" && (
            <div className="py-8">
              <BellOff className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">متصفحك لا يدعم الإشعارات</p>
            </div>
          )}

          {status === "denied" && (
            <div className="py-8">
              <BellOff className="w-12 h-12 text-red-500/30 mx-auto mb-3" />
              <p className="text-red-500 mb-2">تم حظر الإشعارات</p>
              <p className="text-sm text-muted-foreground">يرجى تفعيلها من إعدادات المتصفح</p>
            </div>
          )}

          {status === "idle" && (
            <div className="py-8">
              <Bell className="w-12 h-12 text-primary/30 mx-auto mb-3" />
              <p className="font-bold mb-2">🔔 فعّل التنبيهات</p>
              <p className="text-sm text-muted-foreground mb-6">
                احصل على إشعارات فورية عند تغير الأسعار.
              </p>
              <button onClick={subscribe} className="px-6 py-3 rounded-full bg-red-500 text-white font-medium hover:bg-red-600 transition shadow-lg">
                تفعيل الإشعارات
              </button>
            </div>
          )}

          {status === "loading" && (
            <div className="py-8">
              <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-3" />
              <p className="text-muted-foreground">جاري المعالجة...</p>
            </div>
          )}

          {status === "granted" && (
            <div className="py-8">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-3">
                <Check className="w-8 h-8 text-green-500" />
              </div>
              <p className="font-bold text-green-600 mb-1">✅ الإشعارات مفعلة</p>
              <p className="text-sm text-muted-foreground mb-6">
                ستصلك التنبيهات فوراً عند أي تغير.
              </p>
              <button onClick={unsubscribe} className="px-5 py-2.5 rounded-full border border-red-500 text-red-500 font-medium hover:bg-red-500/10 transition">
                <BellOff className="w-4 h-4 inline-block mr-1" />
                إيقاف الإشعارات
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
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
