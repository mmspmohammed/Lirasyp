// app/sitemap.ts
import { MetadataRoute } from "next";
import { createServerClient } from "@/lib/supabase-server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://lirasyp.sy";

  const supabase = createServerClient();

  // جلب الأخبار
  const { data: news } = await supabase
    .from("news_articles")
    .select("slug, updated_at")
    .order("updated_at", { ascending: false })
    .limit(100);

  // الصفحات الثابتة
  const staticPages = [
    { url: `${baseUrl}/`, priority: 1.0, changeFrequency: "hourly" as const },
    { url: `${baseUrl}/prices/currency`, priority: 0.9, changeFrequency: "hourly" as const },
    { url: `${baseUrl}/prices/gold`, priority: 0.9, changeFrequency: "hourly" as const },
    { url: `${baseUrl}/prices/crypto`, priority: 0.9, changeFrequency: "hourly" as const },
    { url: `${baseUrl}/prices/fuel`, priority: 0.8, changeFrequency: "daily" as const },
    { url: `${baseUrl}/prices/electricity`, priority: 0.8, changeFrequency: "daily" as const },
    { url: `${baseUrl}/news`, priority: 0.8, changeFrequency: "hourly" as const },
    { url: `${baseUrl}/about`, priority: 0.5, changeFrequency: "monthly" as const },
    { url: `${baseUrl}/privacy`, priority: 0.3, changeFrequency: "monthly" as const },
    { url: `${baseUrl}/terms`, priority: 0.3, changeFrequency: "monthly" as const },
  ];

  // صفحات الأخبار الديناميكية
  const newsPages =
    news?.map((article: any) => ({
      url: `${baseUrl}/news/${article.slug}`,
      lastModified: new Date(article.updated_at),
      priority: 0.7,
      changeFrequency: "weekly" as const,
    })) || [];

  return [...staticPages, ...newsPages];
}
