'use client';

import { Menu, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import SideDrawer from './SideDrawer';

export default function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handler = () => setDrawerOpen(true);
    window.addEventListener('toggle-drawer', handler);
    return () => window.removeEventListener('toggle-drawer', handler);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-card/95 backdrop-blur border-b border-muted">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl" aria-hidden="true">🇸🇾</span>
            <h1 className="font-bold text-lg tracking-tight">الليرة عملتنا</h1>
          </div>
          <div className="flex items-center gap-2">
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-lg hover:bg-muted transition"
                aria-label="تبديل الوضع"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            )}
            <button
              onClick={() => setDrawerOpen(true)}
              className="p-2 rounded-lg hover:bg-muted transition"
              aria-label="فتح القائمة"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>
      <SideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
