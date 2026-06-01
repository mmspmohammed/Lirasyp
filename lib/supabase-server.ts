import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * ✅ عميل Supabase للخوادم (Server Components & Server Actions)
 * يستخدم cookies() من next/headers للتعامل مع الجلسة بأمان
 */
export const createServerClient= () => {
  const cookieStore = cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        // ✅ نترك set/remove فارغة لأن القراءة تكفي لعرض الأسعار العامة
        set() {},
        remove() {},
      },
    }
  );
};
