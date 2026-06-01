// components/NotificationModal.tsx
"use client";

import { useEffect, useCallback, useState } from "react";
import { Bell, X, Check, AlertTriangle, TrendingUp, TrendingDown, DollarSign, Gem, Bitcoin } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

// بيانات تجريبية للإشعارات - لاحقاً بتجيب من Supabase
const MOCK_ALERTS = [
  {
    id: 1,
    title: "📈 الدولار يرتفع",
    body: "سعر الدولار وصل لـ 15,200 ل.س (+0.5%)",
    time: "منذ 5 دقائق",
    type: "up",
    asset: "usd",
    read: false,
  },
  {
    id: 2,
    title: "📉 الذهب ينخفض",
    body: "سعر الأونصة وقع لـ $2,340 (-0.3%)",
    time: "منذ 15 دقيقة",
    type: "down",
    asset: "gold",
    read: false,
  },
  {
    id: 3,
    title: "📊 البيتكوين مستقر",
    body: "BTC عند $67,000 بدون تغير يذكر",
    time: "منذ ساعة",
    type: "neutral",
    asset: "btc",
    read: true,
  },
];

export default function NotificationModal({ open, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const [alerts, setAlerts] = useState(MOCK_ALERTS);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  const markAsRead = (id: number) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
  };

  const filteredAlerts = activeTab === "unread" 
    ? alerts.filter(a => !a.read) 
    : alerts;

  const unreadCount = alerts.filter(a => !a.read).length;

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notif-title"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="
          relative
          w-full
          sm:w-[480px]
          sm:max-w-[90vw]
          sm:rounded-2xl
          rounded-t-3xl
          bg-background
          shadow-2xl
          animate-in
          slide-in-from-bottom
          sm:zoom-in-95
          duration-300
          flex
          flex-col
          max-h-[85vh]
          sm:max-h-[80vh]
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
              <Bell className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <h2 id="notif-title" className="text-lg font-bold">
                الإشعارات
              </h2>
              {unreadCount > 0 && (
                <span className="text-xs text-red-500">
                  {unreadCount} غير مقروء
                </span>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="
              w-8 h-8
              rounded-full
              flex items-center justify-center
              text-muted-foreground
              hover:bg-muted
              hover:text-foreground
              transition
              focus:outline-none focus:ring-2 focus:ring-red-500
            "
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drag Handle (mobile) */}
        <div className="sm:hidden flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 rounded-full bg-muted" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 pt-3 pb-2">
          <button
            onClick={() => setActiveTab("all")}
            className={`
              flex-1 py-2 rounded-lg text-sm font-medium transition
              ${activeTab === "all" 
                ? "bg-red-500 text-white" 
                : "bg-muted text-muted-foreground hover:bg-muted/80"
              }
            `}
          >
            الكل ({alerts.length})
          </button>
          <button
            onClick={() => setActiveTab("unread")}
            className={`
              flex-1 py-2 rounded-lg text-sm font-medium transition
              ${activeTab === "unread" 
                ? "bg-red-500 text-white" 
                : "bg-muted text-muted-foreground hover:bg-muted/80"
              }
            `}
          >
            غير مقروء ({unreadCount})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">لا توجد إشعارات</p>
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`
                  rounded-xl p-4 border transition
                  ${alert.read 
                    ? "bg-muted/30 border-border" 
                    : "bg-red-500/5 border-red-500/20"
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={`
                    w-10 h-10 rounded-lg flex items-center justify-center shrink-0
                    ${alert.type === "up" ? "bg-green-500/10 text-green-500" : ""}
                    ${alert.type === "down" ? "bg-red-500/10 text-red-500" : ""}
                    ${alert.type === "neutral" ? "bg-blue-500/10 text-blue-500" : ""}
                  `}>
                    {alert.asset === "usd" && <DollarSign className="w-5 h-5" />}
                    {alert.asset === "gold" && <Gem className="w-5 h-5" />}
                    {alert.asset === "btc" && <Bitcoin className="w-5 h-5" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-sm">{alert.title}</h3>
                      {!alert.read && (
                        <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{alert.body}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{alert.time}</span>
                      {!alert.read && (
                        <button
                          onClick={() => markAsRead(alert.id)}
                          className="text-xs text-red-500 hover:underline flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          تحديد كمقروء
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border text-center shrink-0">
          <p className="text-xs text-muted-foreground">
            🔕 يمكنك إدارة الإشعارات من الإعدادات
          </p>
        </div>
      </div>
    </div>
  );
}
