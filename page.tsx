import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import type { Metadata, ResolvingMetadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Calendar, ExternalLink } from 'lucide-react';
import { createServerSupabase } from '@/lib/supabase-server';
import { formatRelativeTime, formatDateAR, sanitizeHTML } from '@/lib/format';
import { SITE_URL, SITE_NAME, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } from '@/lib/env';
import { getCategoryMeta, CategoryKey } from '@/lib/categories';

export const revalidate = 300;

type RelatedArticle = {
  title_ar: string;
  slug: string;
  published_at: string;
  category: CategoryKey;
};

type NewsArticle = {
  id: string;
  title_ar: string;
  slug: string;
  summary: string;
  content: string | null;
  category: CategoryKey;
  published_at: string;
  updated_at: string | null;
  image_url: string | null;
  source_name: string;
  source_url: string | null;
  seo_keywords: string[] | null;
};

const supabaseBuild = createClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function getArticle(slug: string) {
  const supabase = createServerSupabase();
  
  const { data: article, error } = await supabase
    .from('news_articles')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw error;
  if (!article) notFound();

  const { data: related, error: relatedError } = await supabase
    .from('news_articles')
    .select('title_ar, slug, published_at, category')
    .eq('category', article.category)
    .neq('id', article.id)
    .order('published_at', { ascending: false })
    .limit(3);

  if (relatedError) console.warn('Related articles error:', relatedError);

  return { 
    article: article as NewsArticle, 
    related: (related as RelatedArticle[] | null) ?? [] 
  };
}

type Props = { params: { slug: string } };

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {  // ✅ Promise<Metadata> (قوس واحد!)
  const { slug } = params;
  const { article } = await getArticle(slug);
  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: `${article.title_ar} | ${SITE_NAME}`,
    description: article.summary,
    keywords: article.seo_keywords || [article.category, 'سوريا', 'اقتصاد'],
    alternates: { canonical: `${SITE_URL}/news/${article.slug}` },
    openGraph: {
      title: article.title_ar,
      description: article.summary,
      url: `${SITE_URL}/news/${article.slug}`,
      type: 'article',
      publishedTime: article.published_at,
      authors: [article.source_name],
      section: article.category,
      images: article.image_url 
        ? [{ url: article.image_url, width: 1200, height: 630, alt: article.title_ar }, ...previousImages]
        : previousImages,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title_ar,
      description: article.summary,
      images: article.image_url ? [article.image_url] : [],
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = params;
  const { article, related } = await getArticle(slug);
  
  const categoryMeta = getCategoryMeta(article.category);
  const safeContent = sanitizeHTML(article.content || '');

  return (
    <article className="container mx-auto px-4 py-4 max-w-3xl">
      
      <Link href="/news" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-4">
        <ArrowLeft className="h-4 w-4" />
        عودة للأخبار
      </Link>

      <header className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-xs px-2 py-1 rounded font-medium ${categoryMeta.color}`}>
            {categoryMeta.label}
          </span>
          <time className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDateAR(article.published_at)}
          </time>
        </div>
        
        <h1 className="text-2xl font-bold leading-tight mb-3">
          {article.title_ar}
        </h1>
        
        <p className="text-sm text-muted-foreground">
          المصدر: <span className="font-medium">{article.source_name}</span> • 
          محدّث {formatRelativeTime(article.published_at)}
        </p>
      </header>

      {article.image_url && (
        <figure className="mb-6 rounded-xl overflow-hidden border border-muted relative aspect-video">
          <Image
            src={article.image_url}
            alt={article.title_ar}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 800px"
            priority
          />
        </figure>
      )}
      
      <div className="bg-muted/30 rounded-lg p-4 mb-6 text-sm border-l-4 border-primary">
        {article.summary}
      </div>

      <div 
        className="prose prose-invert prose-sm max-w-none mb-8"
        dangerouslySetInnerHTML={{ __html: safeContent }}
      />

      {article.source_url && (
        <a
          href={article.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline mb-8"
        >
          <ExternalLink className="h-4 w-4" />
          اقرأ الخبر من مصدره الأصلي
        </a>
      )}

      {related.length > 0 && (
        <section className="border-t border-muted pt-6">
          <h2 className="font-bold mb-4">أخبار ذات صلة</h2>
          <div className="space-y-3">
            {related.map((item) => {
              const meta = getCategoryMeta(item.category);
              return (
                <Link 
                  key={item.slug} 
                  href={`/news/${item.slug}`}
                  className="block p-3 rounded-lg bg-card border border-muted hover:border-primary/50 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(item.published_at)}
                    </span>
                    <span className="text-[10px] bg-muted px-2 py-0.5 rounded">
                      {meta.label}
                    </span>
                  </div>
                  <p className="text-sm font-medium mt-2 line-clamp-2">
                    {item.title_ar}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'NewsArticle',
            headline: article.title_ar,
            description: article.summary,
            image: article.image_url ? [article.image_url] : [],
            datePublished: article.published_at,
            dateModified: article.updated_at || article.published_at,
            author: { '@type': 'Organization', name: article.source_name },
            publisher: {
              '@type': 'Organization',
              name: SITE_NAME,
              logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
            },
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': `${SITE_URL}/news/${article.slug}`,
            },
            keywords: (article.seo_keywords || [article.category]).join(', '),
          }),
        }}
      />
    </article>
  );
}

export async function generateStaticParams() {
  try {
    const { data, error } = await supabaseBuild
      .from('news_articles')
      .select('slug')
      .limit(100);
    
    if (error) {
      console.warn('Static params error:', error);
      return [];
    }
    
    return (data ?? []).map((a: { slug: string }) => ({ slug: a.slug }));
  } catch (err) {
    console.error('Static params generation failed:', err);
    return [];
  }
}
