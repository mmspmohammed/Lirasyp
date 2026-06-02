import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { sanitizeHTML } from "@/lib/sanitize";
import { formatDateAR } from "@/lib/format";
import { CATEGORY_META } from "@/lib/categories";
import { ArrowLeft, Calendar, Tag, ExternalLink } from "lucide-react";
import type { Metadata } from "next";

// ✅ client بسيط بدون cookies للبيانات العامة
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const dynamic = "force-dynamic";

function safeDecode(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const slug = safeDecode(params.slug || "");

  const { data: article } = await supabase
    .from("news_articles")
    .select("title_ar, summary, category, image_url")
    .eq("slug", slug)
    .limit(1)
    .maybeSingle();

  if (!article) return { title: "الخبر غير موجود" };

  return {
    title: article.title_ar || "خبر",
    description: article.summary || "",
  };
}

async function getArticle(slug: string) {
  const { data: article, error } = await supabase
    .from("news_articles")
    .select("*")
    .eq("slug", slug)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Supabase error:", error.message);
    return null;
  }
  if (!article) return null;

  const { data: related } = await supabase
    .from("news_articles")
    .select("title_ar, slug, category, published_at")
    .eq("category", article.category || "economy")
    .neq("slug", slug)
    .order("published_at", { ascending: false })
    .limit(3);

  return { article, related: related || [] };
}

export default async function ArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  const slug = safeDecode(params.slug || "");
  const data = await getArticle(slug);

  if (!data) notFound();

  const { article, related } = data;

  // ✅ fallback لكل قيمة
  const categoryKey = (article.category as keyof typeof CATEGORY_META) || "economy";
  const meta = CATEGORY_META[categoryKey] || CATEGORY_META.economy;
  const title = article.title_ar || "خبر";
  const summary = article.summary || "";
  const content = sanitizeHTML(article.content || summary);
  const source = article.source_name || "";
  const date = article.published_at || new Date().toISOString();
  const image = article.image_url || null;

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary transition">الرئيسية</Link>
        <ArrowLeft className="w-4 h-4" />
        <Link href="/news" className="hover:text-primary transition">الأخبار</Link>
        <ArrowLeft className="w-4 h-4" />
        <span className="line-clamp-1">{title}</span>
      </nav>

      <article className="max-w-3xl mx-auto">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="text-sm px-3 py-1 rounded-full font-medium bg-primary/10 text-primary">
            {meta.label}
          </span>
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {formatDateAR(date)}
          </span>
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold mb-6 leading-tight">
          {title}
        </h1>

        {image && (
          <div className="rounded-2xl overflow-hidden mb-6">
            <img
              src={image}
              alt={title}
              className="w-full h-64 md:h-96 object-cover"
              loading="eager"
            />
          </div>
        )}

        {source && (
          <div className="flex items-center justify-between mb-6 p-4 rounded-xl bg-muted/50">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                المصدر: <strong>{source}</strong>
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
        )}

        {content ? (
          <div
            className="prose prose-lg max-w-none dark:prose-invert mb-8"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        ) : (
          <p className="text-muted-foreground mb-8">{summary}</p>
        )}

        {related.length > 0 && (
          <section className="border-t border-border pt-8">
            <h2 className="text-xl font-bold mb-4">مقالات ذات صلة</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {related.map((r: any) => {
                const rMeta =
                  CATEGORY_META[(r.category as keyof typeof CATEGORY_META) || "economy"] ||
                  CATEGORY_META.economy;
                return (
                  <Link
                    key={r.slug || Math.random()}
                    href={`/news/${r.slug || ""}`}
                    className="group block"
                  >
                    <article className="rounded-xl bg-card p-4 border border-border hover:border-primary/20 transition">
                      <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                        {rMeta.label}
                      </span>
                      <h3 className="font-bold mt-2 group-hover:text-primary transition-colors line-clamp-2">
                        {r.title_ar || "خبر"}
                      </h3>
                    </article>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </article>
    </div>
  );
}
