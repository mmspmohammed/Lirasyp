// app/news/page.tsx
import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase-server";

import { formatRelativeTime } from "@/lib/format";
import { CATEGORY_META } from "@/lib/categories";
import { ArrowLeft, Newspaper, Calendar, Tag } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "الأخبار الاقتصادية | آخر التحديثات",
  description:
    "آخر الأخبار الاقتصادية والمالية في سوريا والعالم. تغطية شاملة لأسعار الصرف والذهب والمحروقات.",
  keywords: [
    "أخبار اقتصادية",
    "سوريا",
    "اقتصاد",
    "أسعار",
    "ذهب",
    "دولار",
    "محروقات",
  ],
  openGraph: {
    title: "الأخبار الاقتصادية | LiraSYP",
    description: "آخر الأخبار الاقتصادية في سوريا والعالم.",
  },
};

export const revalidate = 120;

// ==================== Components ====================

function NewsCard({
  title,
  summary,
  category,
  date,
  slug,
  source,
}: {
  title: string;
  summary: string;
  category: string;
  date: string;
  slug: string;
  source: string;
}) {
  const meta = CATEGORY_META[category as keyof typeof CATEGORY_META] || CATEGORY_META.economy;

  return (
  
<Link href={`/news/${encodeURIComponent(slug)}`} className="group block">
      <article className="rounded-2xl bg-card p-5 border border-border transition-all duration-300 hover:shadow-lg hover:border-primary/20 hover:-translate-y-1">
        <div className="flex items-center gap-2 mb-3">
          <span
            className="text-xs px-3 py-1 rounded-full font-medium"
            style={{ backgroundColor: `${meta.color}20`, color: meta.color }}
          >
            {meta.label}
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatRelativeTime(date)}
          </span>
        </div>
        <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{summary}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">المصدر: {source}</span>
          <span className="text-sm text-primary group-hover:underline">اقرأ المزيد →</span>
        </div>
      </article>
    </Link>
  );
}

// ==================== Data Fetching ====================

async function getNewsData() {
  const supabase = createServerSupabase();

  const { data: news } = await supabase
    .from("news_articles")
    .select("title_ar, slug, summary, category, source_name, published_at, is_featured")
    .order("published_at", { ascending: false })
    .limit(20);

  return news || [];
}

// ==================== Main Page ====================

export default async function NewsPage() {
  const news = await getNewsData();

  const featured = news.filter((n: any) => n.is_featured);
  const regular = news.filter((n: any) => !n.is_featured);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary transition">الرئيسية</Link>
        <ArrowLeft className="w-4 h-4" />
        <span>الأخبار</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold mb-2 flex items-center gap-2">
          <Newspaper className="w-8 h-8 text-primary" />
          الأخبار الاقتصادية
        </h1>
        <p className="text-muted-foreground">
          آخر الأخبار والتحليلات الاقتصادية في سوريا والمنطقة
        </p>
      </div>

      {/* Featured News */}
      {featured.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Tag className="w-5 h-5 text-primary" />
            أخبار مميزة
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {featured.map((article: any) => (
              <NewsCard
                key={article.slug}
                title={article.title_ar}
                summary={article.summary}
                category={article.category}
                date={article.published_at}
                slug={article.slug}
                source={article.source_name}
              />
            ))}
          </div>
        </section>
      )}

      {/* Regular News */}
      <section>
        <h2 className="text-lg font-bold mb-4">آخر الأخبار</h2>
        {regular.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {regular.map((article: any) => (
              <NewsCard
                key={article.slug}
                title={article.title_ar}
                summary={article.summary}
                category={article.category}
                date={article.published_at}
                slug={article.slug}
                source={article.source_name}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl bg-card p-8 text-center border border-border">
            <p className="text-muted-foreground">لا توجد أخبار متاحة حالياً</p>
          </div>
        )}
      </section>
    </div>
  );
}
