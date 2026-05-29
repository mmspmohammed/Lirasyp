'use client';

import { X, Sun, Moon, BellOff, Home, DollarSign, Gem, Coins, Bitcoin, Fuel, Zap, Newspaper, Info, Shield, FileText } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import Link from 'next/link';

// تعريف عناصر القائمة
const menuItems = [
  { href: '/', label: 'الرئيسية', icon: Home },
  { href: '/prices/currency', label: 'الدولار والعملات', icon: DollarSign },
  { href: '/prices/gold', label: 'الذهب', icon: Gem },
  { href: '/prices/crypto', label: 'العملات الرقمية', icon: Bitcoin },
  { href: '/prices/fuel', label: 'المحروقات', icon: Fuel },
  { href: '/prices/electricity', label: 'الكهرباء', icon: Zap },
  { href: '/news', label: 'الأخبار', icon: Newspaper },
  { href: '/about', label: 'عن الموقع', icon: Info },
  { href: '/privacy', label: 'سياسة الخصوصية', icon: Shield },
  { href: '/terms', label: 'شروط الاستخدام', icon: FileText },
];

interface SideDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function SideDrawer({ open, onClose }: SideDrawerProps) {
  const { theme, setTheme } = useTheme();
  const [pushEnabled, setPushEnabled] = useState(false);

  // ✅ التحقق من حالة الإشعارات عند الفتح
  useEffect(() => {
    if ('Notification' in window && open) {
      setPushEnabled(Notification.permission === 'granted');
    }
  }, [open]);

  // ✅ دالة إيقاف الإشعارات
  const handleDisablePush = async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        setPushEnabled(false);
        // 🗄️ حذف الاشتراك من قاعدة البيانات (اختياري)
        // await fetch('/api/unsubscribe', { method: 'POST' });
      }
    }
  };
  return (
    <>
      {/* خلفية معتمة عند فتح القائمة */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* القائمة المنزلقة */}
      <aside
        className={`fixed top-0 right-0 h-full w-72 bg-card border-l border-muted z-50 transform transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="القائمة الرئيسية"
      >
        {/* رأس القائمة */}
        <div className="flex items-center justify-between p-4 border-b border-muted">
          <span className="font-bold">القائمة</span>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition"
            aria-label="إغلاق القائمة"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* عناصر التنقل */}
        <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-180px)]">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition group"
            >
              <item.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* أدوات أسفل القائمة */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-muted bg-card/95 backdrop-blur space-y-3">          
          {/* زر تبديل الثيم */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-muted/50 hover:bg-muted transition"
          >
            <span className="text-sm font-medium">
              {theme === 'dark' ? 'الوضع الليلي 🌙' : 'الوضع النهاري ☀️'}
            </span>
            {theme === 'dark' ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </button>

          {/* زر إيقاف الإشعارات (يظهر فقط إذا كانت مفعلة) */}
          {pushEnabled && (
            <button
              onClick={handleDisablePush}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-danger/10 text-danger hover:bg-danger/20 transition text-sm font-medium"
            >
              <BellOff className="h-4 w-4" />
              إيقاف التنبيهات
            </button>
          )}
        </div>
      </aside>
    </>
  );
}