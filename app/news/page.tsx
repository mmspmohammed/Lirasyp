import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image'; // ✅ استيراد مكون الصورة المحسّن
import { RefreshCw, Calendar } from 'lucide-react';
import { createServerSupabase } from '@/lib/supabase-server';
import { formatRelativeTime } from '@/lib/format';
import { SITE_URL, SITE_NAME } from '@/lib/env';
import BackButton from '@/components/BackButton';
import { CATEGORY_META, getCategoryMeta, CategoryKey } from '@/lib/categories'; // ✅ استيراد مشترك

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'أخبار الاقتصاد في سوريا | الليرة عملتنا',
  description: 'آخر الأخبار الاقتصادية والمالية في سوريا: أسعار، قرارات، تحليلات - من مصادر موثوقة مثل سانا والاقتصاد السوري',
  keywords: ['أخبار سوريا', 'اقتصاد سوريا', 'أسعار', 'قرارات مالية', 'تحليلات'],
  alternates: { canonical: `${SITE_URL}/news` },
  openGraph: {
    title: 'الأخبار | الليرة عملتنا',
    description: 'آخر الأخبار الاقتصادية في سوريا - مصادر موثوقة',
    url: `${SITE_URL}/news`,
    type: 'website',
  },
};

type NewsArticle = {
  id: string;
  title_ar: string;
  slug: string;
  summary: string;
  category: CategoryKey;
  published_at: string;
  image_url: string | null;
  source_name: string;
};

async function getNewsData() {
  const supabase = createServerSupabase();
  
  const { data: articles, error } = await supabase
    .from('news_articles')
    .select('id, title_ar, slug, summary, category, published_at, image_url, source_name')
    .order('published_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return { articles: (articles as NewsArticle[] | null) ?? [] };
}
function NewsCard({ article }: { article: NewsArticle }) {
  const meta = getCategoryMeta(article.category);
  
  return (
    <Link href={`/news/${article.slug}`} className="block group">
      <article className="bg-card rounded-xl p-4 border border-muted hover:border-primary/50 transition flex gap-4">
        {/* ✅ صورة محسّنة مع Next.js Image */}
        <div className="flex-shrink-0 w-20 h-20 bg-muted rounded-lg overflow-hidden relative">
          {article.image_url ? (
            <Image
              src={article.image_url}
              alt={article.title_ar}
              fill
              className="object-cover group-hover:scale-105 transition"
              sizes="(max-width: 768px) 80px, 120px"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <span aria-hidden="true">{meta.icon}</span>
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${meta.color}`}>
              {meta.label}
            </span>
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatRelativeTime(article.published_at)}
            </span>
          </div>
          
          <h3 className="font-bold text-sm leading-snug line-clamp-2 group-hover:text-primary transition">
            {article.title_ar}
          </h3>
          
          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
            {article.summary}
          </p>
          
          <p className="text-[10px] text-muted-foreground mt-2">
            المصدر: {article.source_name}
          </p>
        </div>
      </article>
    </Link>
  );}

async function NewsContent() {
  const { articles } = await getNewsData();

  if (!articles.length) {
    return (
      <div className="text-center py-12">
        <RefreshCw className="h-8 w-8 mx-auto text-muted-foreground animate-spin mb-3" />
        <p className="text-muted-foreground">لا توجد أخبار متوفرة حالياً</p>
      </div>
    );
  }

  const categories = [...new Set(articles.map(a => a.category))];

  return (
    <div className="container mx-auto px-4 py-4 space-y-6">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">آخر الأخبار</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {articles.length} خبر • محدّث {formatRelativeTime(articles[0].published_at)}
          </p>
        </div>
        <BackButton />
      </div>

      {/* فئات الأخبار */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <Link 
          href="/news" 
          className="px-3 py-1.5 rounded-full text-xs font-medium bg-primary text-background whitespace-nowrap"
        >
          الكل
        </Link>
        {categories.map((cat) => {
          const meta = getCategoryMeta(cat);
          return (
            <Link
              key={cat}
              href={`/news?category=${cat}`}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border border-muted hover:border-primary/50 transition ${meta.color}`}
            >
              {meta.label}
            </Link>
          );
        })}
      </div>
      <div className="space-y-3">
        {articles.map((article) => (
          <NewsCard key={article.id} article={article} />
        ))}
      </div>

      {/* Schema.org */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Blog',
            name: 'أخبار الاقتصاد في سوريا',
            description: 'آخر الأخبار الاقتصادية والمالية في سوريا',
            publisher: { '@type': 'Organization', name: SITE_NAME },
            blogPost: articles.slice(0, 10).map((a, i) => ({
              '@type': 'BlogPosting',
              headline: a.title_ar,
              description: a.summary,
              datePublished: a.published_at,
              url: `${SITE_URL}/news/${a.slug}`,
              image: a.image_url || undefined,
              author: { '@type': 'Organization', name: a.source_name },
            })),
          }),
        }}
      />
    </div>
  );
}

export default function NewsPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="h-8 bg-muted rounded w-32 animate-pulse" />
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-8 w-16 bg-muted rounded-full animate-pulse" />
          ))}
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-card rounded-xl p-4 border border-muted animate-pulse flex gap-4">
              <div className="w-20 h-20 bg-muted rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-muted rounded w-24" />
                <div className="h-4 bg-muted rounded w-full" />                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    }>
      <NewsContent />
    </Suspense>
  );
}
