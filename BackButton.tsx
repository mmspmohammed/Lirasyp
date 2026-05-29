'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

/**
 * زر رجوع موحد للصفحات الفرعية
 * يحافظ على اتساق التصميم ويقلل التكرار
 */
export default function BackButton() {
  return (
    <Link 
      href="/" 
      className="flex items-center gap-1 text-sm text-primary hover:underline transition"
    >
      <ArrowLeft className="h-4 w-4" />
      الرئيسية
    </Link>
  );
}