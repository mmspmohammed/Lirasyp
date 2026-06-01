// app/news/[slug]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase-server";
import { sanitizeHTML } from "@/lib/sanitize";
import { formatDateAR } from "@/lib/format";
import { CATEGORY_META } from "@/lib/categories";
import { ArrowLeft, Calendar, Tag, Share2, ExternalLink } from "lucide-react";
import type { Metadata } from "next";

// ==================== Dynamic Metadata ====================

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const supabase = createServerClient();
  const { data: article } = await supabase
    .from("news_articles")
    .select("title_ar, summary, category, image_url, seo_keywords")
    .eq("slug", params.slug)
    .single();

  if (!article) {
    return {
      title: "الخبر غير موجود",
    };
  }

  const meta = CATEGORY_META[article.category as keyof typeof CATEGORY_META] || CATEGORY_META.economy;

  return {
    title: article.title_ar,
    description: article.summary,
    keywords: article.seo_keywords || [meta.label, "سوريا", "اقتصاد"],
    openGraph: {
      title: article.title_ar,
      description: article.summary,
      images: article.image_url ? [{ url: article.image_url }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title_ar,
      description: article.summary,
      images: article.image_url ? [article.image_url] : undefined,
    },
    alternates: {
      canonical: `https://lirasyp.sy/news/${params.slug}`,
    },
  };
}

// ==================== Data Fetching ====================

async function getArticle(slug: string) {
  const supabase = createServerClient();

  const { data: article } = await supabase
    .from("news_articles")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!article) return null;

  // جلب مقالات ذات صلة
  const { data: related } = await supabase
    .from("news_articles")
    .select("title_ar, slug, summary, category, published_at")
    .eq("category", article.category)
    .neq("slug", slug)
    .order("published_at", { ascending: false })
    .limit(3);

  return { article, related: related || [] };
}

// ==================== Main Page ====================

export default async function ArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  const data = await getArticle(params.slug);

  if (!data) {
    notFound();
  }

  const { article, related } = data;
  const meta = CATEGORY_META[article.category as keyof typeof CATEGORY_META] || CATEGORY_META.economy;

  const cleanContent = sanitizeHTML(article.content || article.summary);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary transition">الرئيسية</Link>
        <ArrowLeft className="w-4 h-4" />
        <Link href="/news" className="hover:text-primary transition">الأخبار</Link>
        <ArrowLeft className="w-4 h-4" />
        <span className="line-clamp-1">{article.title_ar}</span>
      </nav>

      <article className="max-w-3xl mx-auto">
        {/* Category & Date */}
        <div className="flex items-center gap-3 mb-4">
          <span
            className="text-sm px-3 py-1 rounded-full font-medium"
            style={{ backgroundColor: `${meta.color}20`, color: meta.color }}
          >
            {meta.label}
          </span>
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {formatDateAR(article.published_at)}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-extrabold mb-6 leading-tight">
          {article.title_ar}
        </h1>

        {/* Image */}
        {article.image_url && (
          <div className="rounded-2xl overflow-hidden mb-6">
            <img
              src={article.image_url}
              alt={article.title_ar}
              className="w-full h-64 md:h-96 object-cover"
              loading="eager"
            />
          </div>
        )}

        {/* Source */}
        <div className="flex items-center justify-between mb-6 p-4 rounded-xl bg-muted/50">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              المصدر: <strong>{article.source_name}</strong>
            </span>
          </div>
          {article.source_url && (
            <a
              href={article.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              <ExternalLink className="w-4 h-4" />
              المصدر الأصلي
            </a>
          )}
        </div>

        {/* Content */}
        <div
          className="prose prose-lg max-w-none dark:prose-invert mb-8"
          dangerouslySetInnerHTML={{ __html: cleanContent }}
        />

        {/* Share */}
        <div className="flex items-center gap-3 mb-8 p-4 rounded-xl bg-muted/50">
          <Share2 className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">مشاركة:</span>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: article.title_ar,
                  url: `https://lirasyp.sy/news/${article.slug}`,
                });
              }
            }}
            className="text-sm px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition"
          >
            مشاركة
          </button>
        </div>

        {/* Related Articles */}
        {related.length > 0 && (
          <section className="border-t border-border pt-8">
            <h2 className="text-xl font-bold mb-4">مقالات ذات صلة</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {related.map((r: any) => (
                <Link key={r.slug} href={`/news/${r.slug}`} className="group block">
                  <article className="rounded-xl bg-card p-4 border border-border hover:border-primary/20 transition">
                    <span
                      className="text-xs px-2 py-1 rounded-full"
                      style={{
                        backgroundColor: `${CATEGORY_META[r.category as keyof typeof CATEGORY_META]?.color || CATEGORY_META.economy.color}20`,
                        color: CATEGORY_META[r.category as keyof typeof CATEGORY_META]?.color || CATEGORY_META.economy.color,
                      }}
                    >
                      {CATEGORY_META[r.category as keyof typeof CATEGORY_META]?.label || "اقتصاد"}
                    </span>
                    <h3 className="font-bold mt-2 group-hover:text-primary transition-colors line-clamp-2">
                      {r.title_ar}
                    </h3>
                  </article>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>

      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            headline: article.title_ar,
            description: article.summary,
            image: article.image_url ? [article.image_url] : [],
            datePublished: article.published_at,
            dateModified: article.updated_at || article.published_at,
            author: {
              "@type": "Organization",
              name: article.source_name,
            },
            publisher: {
              "@type": "Organization",
              name: "LiraSYP",
              logo: {
                "@type": "ImageObject",
                url: "https://lirasyp.sy/logo.png",
              },
            },
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `https://lirasyp.sy/news/${article.slug}`,
            },
            articleBody: article.content,
            keywords: article.seo_keywords?.join(", "),
          }),
        }}
      />
    </div>
  );
}
