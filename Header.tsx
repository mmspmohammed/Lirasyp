'use client';

import { Menu, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import SideDrawer from './SideDrawer';
import { SITE_NAME } from '@/lib/env';

export default function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(false);

  // ✅ تحقق محسّن: يتأكد من وجود Service Worker + اشتراك فعلي
  useEffect(() => {
    const checkPushStatus = async () => {
      if ('Notification' in window && 'serviceWorker' in navigator) {
        const permission = Notification.permission;
        if (permission === 'granted') {
          try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            setHasNotifications(!!subscription);
          } catch {
            setHasNotifications(false);
          }
        }
      }
    };
    checkPushStatus();
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-card/95 backdrop-blur border-b border-muted">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          
          {/* الشعار: نص + أيقونة */}
          <div className="flex items-center gap-2">
            <span className="text-xl" aria-hidden="true">🪙</span>
            <h1 className="font-bold text-lg tracking-tight">{SITE_NAME}</h1>
          </div>

          {/* الأزرار اليمنى */}
          <div className="flex items-center gap-2">
            {/* زر الإشعارات (يظهر فقط إذا كان هناك اشتراك فعلي) */}
            {hasNotifications && (
              <button
                className="p-2 rounded-lg hover:bg-muted transition"
                aria-label="عرض التنبيهات"
              >
                <Bell className="h-5 w-5" />
              </button>
            )}
            
            {/* زر القائمة الجانبية */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="p-2 rounded-lg hover:bg-muted transition"
              aria-label="فتح القائمة"
              aria-expanded={drawerOpen}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {/* القائمة الجانبية */}
      <SideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}