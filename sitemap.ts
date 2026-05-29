import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';
import { SITE_URL, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } from '@/lib/env';

const supabaseBuild = createClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY);

const STATIC_PAGES: MetadataRoute.Sitemap = [
  { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
  { url: `${SITE_URL}/prices/currency`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
  { url: `${SITE_URL}/prices/gold`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
  { url: `${SITE_URL}/prices/crypto`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
  { url: `${SITE_URL}/prices/fuel`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
  { url: `${SITE_URL}/prices/electricity`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
  { url: `${SITE_URL}/news`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.85 },
  { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  { url: `${SITE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  { url: `${SITE_URL}/terms`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const { data: articles, error } = await supabaseBuild
      .from('news_articles')
      .select('slug, published_at, updated_at')
      .order('published_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Sitemap error:', error);
      return STATIC_PAGES;
    }

    const newsEntries: MetadataRoute.Sitemap = (articles || []).map((a: any) => ({
      url: `${SITE_URL}/news/${a.slug}`,
      lastModified: new Date(a.updated_at || a.published_at),
      changeFrequency: 'monthly',
      priority: 0.6,
    }));

    return [...STATIC_PAGES, ...newsEntries];
    
  } catch (err) {
    console.error('Sitemap generation failed:', err);
    return STATIC_PAGES;
  }
}
