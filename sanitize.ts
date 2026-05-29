// lib/sanitize.ts

/**
 * ✅ تنظيف محتوى HTML لمنع XSS
 * يعمل على السيرفر والعميل
 */

import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window;

const DOMPurify = createDOMPurify(
  window as unknown as Window & typeof globalThis
);

export const sanitizeHTML = (html: string): string => {
  if (!html) return '';

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p',
      'br',
      'strong',
      'em',
      'u',
      'del',
      's',
      'ins',
      'sub',
      'sup',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'ul',
      'ol',
      'li',
      'blockquote',
      'pre',
      'code',
      'a',
      'img',
      'figure',
      'figcaption',
      'hr',
    ],

    ALLOWED_ATTR: [
      'href',
      'src',
      'alt',
      'title',
      'target',
      'rel',
      'class',
    ],

    ADD_ATTR: ['target'],

    FORBID_ATTR: [
      'onerror',
      'onload',
      'onclick',
      'onmouseover',
    ],
  });
};

export default sanitizeHTML; 