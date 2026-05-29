// lib/format.ts

import {
  TrendingUp,
  TrendingDown,
  Minus,
  LucideIcon,
} from 'lucide-react';

import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window;

// ✅ حل مشكلة Netlify + TypeScript
const purify = createDOMPurify(
  window as unknown as Window & typeof globalThis
);

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
  Icon: LucideIcon;
  isPositive: boolean;
  isNegative: boolean;
} => {
  const fmt = formatChange(change);

  return {
    ...fmt,
    Icon:
      change > 0
        ? TrendingUp
        : change < 0
        ? TrendingDown
        : Minus,
    isPositive: change > 0,
    isNegative: change < 0,
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
      syp:
        rate > 0
          ? gram24k_usd * rate
          : null,
    },

    gram22k: {
      usd: gram24k_usd * 0.916,
      syp:
        rate > 0
          ? gram24k_usd * 0.916 * rate
          : null,
    },

    gram21k: {
      usd: gram24k_usd * 0.875,
      syp:
        rate > 0
          ? gram24k_usd * 0.875 * rate
          : null,
    },

    gram18k: {
      usd: gram24k_usd * 0.75,
      syp:
        rate > 0
          ? gram24k_usd * 0.75 * rate
          : null,
    },

    gram14k: {
      usd: gram24k_usd * 0.585,
      syp:
        rate > 0
          ? gram24k_usd * 0.585 * rate
          : null,
    },
  };
};

export const sanitizeHTML = (
  html: string
): string => {
  if (!html) return '';

  return purify.sanitize(html, {
    ALLOWED_TAGS: [
      'p',
      'br',
      'strong',
      'em',
      'u',
      'h1',
      'h2',
      'h3',
      'ul',
      'ol',
      'li',
      'a',
      'img',
    ],

    ALLOWED_ATTR: [
      'href',
      'src',
      'alt',
      'title',
      'target',
      'rel',
    ],

    FORBID_ATTR: [
      'onerror',
      'onload',
      'onclick',
    ],
  });
};