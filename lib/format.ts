// lib/format.ts

import {
  TrendingUp,
  TrendingDown,
  Minus,
  LucideIcon,
} from 'lucide-react';

/**
 * سياسة صارمة: جميع الأرقام تعرض باللغة الإنجليزية
 */
export const formatNumber = (
  num: number,
  decimals: number = 2
): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

export const formatPrice = (
  price: number,
  currency: 'SYP' | 'USD' = 'SYP'
): string => {
  const formatted = formatNumber(
    price,
    currency === 'SYP' ? 0 : 2
  );

  return currency === 'SYP'
    ? `${formatted} SYP`
    : `$${formatted}`;
};

export const formatChange = (
  change: number
): { text: string; color: string } => {
  if (change > 0) {
    return {
      text: `+${change.toFixed(2)}% 📈`,
      color: 'text-success',
    };
  }

  if (change < 0) {
    return {
      text: `${change.toFixed(2)}% 📉`,
      color: 'text-danger',
    };
  }

  return {
    text: `${change.toFixed(2)}% ⚪`,
    color: 'text-muted-foreground',
  };
};


export const getChangeUI = (
  change: number
): {
  text: string;
  color: string;
  bg: string;
  Icon: LucideIcon;
  icon: JSX.Element | null; // ✅ أضفنا الخاصية icon
  isPositive: boolean;
  isNegative: boolean;
} => {
  const fmt = formatChange(change);
  const isPositive = change > 0;
  const isNegative = change < 0;

  const bg = isPositive
    ? 'bg-green-500/10'
    : isNegative
    ? 'bg-red-500/10'
    : 'bg-muted/30';

  return {
    ...fmt,
    bg,
    Icon:
      change > 0
        ? TrendingUp
        : change < 0
        ? TrendingDown
        : Minus,
    // ✅ أضفنا الخاصية icon التي ترجع JSX
    icon:
      change > 0
        ? <TrendingUp className="w-3 h-3" />
        : change < 0
        ? <TrendingDown className="w-3 h-3" />
        : null,
    isPositive,
    isNegative,
  };
};

export const formatRelativeTime = (
  date: string | Date
): string => {
  const now = new Date();
  const then = new Date(date);

  const diff = Math.floor(
    (now.getTime() - then.getTime()) / 1000
  );

  if (diff < 60) return 'منذ لحظات';

  if (diff < 3600) {
    return `منذ ${Math.floor(diff / 60)} دقيقة`;
  }

  if (diff < 86400) {
    return `منذ ${Math.floor(diff / 3600)} ساعة`;
  }

  return `منذ ${Math.floor(diff / 86400)} يوم`;
};

export const formatDateAR = (
  date: string | Date
): string => {
  const d = new Date(date);

  const months: Record<number, string> = {
    0: 'يناير',
    1: 'فبراير',
    2: 'مارس',
    3: 'أبريل',
    4: 'مايو',
    5: 'يونيو',
    6: 'يوليو',
    7: 'أغسطس',
    8: 'سبتمبر',
    9: 'أكتوبر',
    10: 'نوفمبر',
    11: 'ديسمبر',
  };

  return `${d.getDate()} ${
    months[d.getMonth()]
  } ${d.getFullYear()}`;
};

export const calculateGoldGrams = (
  ouncePriceUsd: number,
  ouncePriceSyp: number | null
) => {
  const OUNCE_TO_GRAM = 31.1035;

  const gram24k_usd =
    ouncePriceUsd / OUNCE_TO_GRAM;

  const rate =
    ouncePriceSyp && ouncePriceUsd > 0
      ? ouncePriceSyp / ouncePriceUsd
      : 0;

  return {
    gram24k: {
      usd: gram24k_usd,
      syp: rate > 0 ? gram24k_usd * rate : null,
    },
    gram22k: {
      usd: gram24k_usd * 0.916,
      syp: rate > 0 ? gram24k_usd * 0.916 * rate : null,
    },
    gram21k: {
      usd: gram24k_usd * 0.875,
      syp: rate > 0 ? gram24k_usd * 0.875 * rate : null,
    },
    gram18k: {
      usd: gram24k_usd * 0.75,
      syp: rate > 0 ? gram24k_usd * 0.75 * rate : null,
    },
    gram14k: {
      usd: gram24k_usd * 0.585,
      syp: rate > 0 ? gram24k_usd * 0.585 * rate : null,
    },
  };
};

/**
 * ✅ sanitizeHTML بدون jsdom - يشتغل server + client
 * بيستخدم regex بسيط لإزالة الـ tags الخطرة
 */
export const sanitizeHTML = (
  html: string
): string => {
  if (!html) return '';

  // إزالة script tags ومحتواهن
  let clean = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

  // إزالة style tags ومحتواهن
  clean = clean.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

  // إزالة event handlers (onclick, onerror, etc.)
  clean = clean.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');

  // إزالة javascript: URLs
  clean = clean.replace(/javascript:/gi, '');

  // السماح بـ tags آمنة فقط
  const allowedTags = [
    'p', 'br', 'strong', 'em', 'u', 'b', 'i',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'a', 'img', 'span', 'div'
  ];

  // إزالة كل tags مش مسموح فيها
  const tagRegex = /<(\/?)([\w]+)[^>]*>/g;
  clean = clean.replace(tagRegex, (match, closing, tag) => {
    const lowerTag = tag.toLowerCase();
    if (allowedTags.includes(lowerTag)) {
      // للـ a tag: نتحقق من الـ href
      if (lowerTag === 'a') {
        const hrefMatch = match.match(/href\s*=\s*["']([^"']*)["']/i);
        if (hrefMatch) {
          const href = hrefMatch[1];
          if (href.startsWith('javascript:') || href.startsWith('data:')) {
            return `<${closing}a href="#">`;
          }
        }
        return match;
      }
      // للـ img tag: نتحقق من الـ src
      if (lowerTag === 'img') {
        const srcMatch = match.match(/src\s*=\s*["']([^"']*)["']/i);
        if (srcMatch) {
          const src = srcMatch[1];
          if (src.startsWith('javascript:') || src.startsWith('data:')) {
            return '';
          }
        }
        return match;
      }
      return match;
    }
    return '';
  });

  return clean;
};
