import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { createServerSupabase } from '@/lib/supabase-server';
import { formatPrice, formatChange, formatRelativeTime } from '@/lib/format';
import { SITE_NAME } from '@/lib/env';

type NewsArticle = {
  title_ar: string;
  category: string;
  published_at: string;
  slug?: string | null;
};

function PriceCard({ title, icon, price, change, href }: {
  title: string;
  icon: string;
  price: string;
  change: { text: string; color: string };
  href: string;
}) {
  return (
    <Link href={href} className="block min-w-[160px] snap-start">
      <div className="bg-card rounded-xl p-4 border border-muted hover:border-primary/50 transition shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl" aria-hidden="true">{icon}</span>
          <span className="text-xs text-muted-foreground">{title}</span>
        </div>
        
        <div className="space-y-1">
          <p className="text-xl font-bold tracking-tight">{price}</p>
          <div className={`flex items-center gap-1 text-xs font-medium ${change.color}`}>
            {change.text.includes('📈') ? <TrendingUp className="h-3 w-3" /> : 
             change.text.includes('📉') ? <TrendingDown className="h-3 w-3" /> : 
             <Minus className="h-3 w-3" />}
            {change.text}
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-muted flex items-center justify-between text-xs text-muted-foreground">
          <span>التفاصيل</span>
          <ArrowLeft className="h-3 w-3" />
        </div>
      </div>
    </Link>
  );
}

function NewsCard({ title, category, time }: {
  title: string;
  category: string;
  time: string;
}) {
  const categoryColors: Record<string, string> = {
    economy: 'bg-blue-500/10 text-blue-400',
    fuel: 'bg-orange-500/10 text-orange-400',
    electricity: 'bg-yellow-500/10 text-yellow-400',
    crypto: 'bg-purple-500/10 text-purple-400',
    gold: 'bg-amber-500/10 text-amber-400',
  };

  return (
    <article className="flex gap-3 p-3 rounded-lg hover:bg-muted/50 transition">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${categoryColors[category] || 'bg-muted text-muted-foreground'}`}>
            {category === 'economy' ? 'اقتصادي' : 
             category === 'fuel' ? 'محروقات' : 
             category === 'electricity' ? 'كهرباء' : 
             category === 'crypto' ? 'كريبتو' : 'ذهب'}
          </span>
          <span className="text-[10px] text-muted-foreground">{time}</span>
        </div>
        <h3 className="text-sm font-medium line-clamp-2 leading-snug">{title}</h3>
      </div>
      <ArrowLeft className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
    </article>
  );
}

// ✅ جلب البيانات من الخادم - استخراج .data من الـ responses
async function getMainData() {
  const supabase = createServerSupabase();
  
  const [usdRes, goldRes, btcRes] = await Promise.all([
    supabase.from('exchange_rates').select('buy_price, change_24h, fetched_at').eq('base_currency', 'USD').eq('target_currency', 'SYP').eq('is_latest', true).maybeSingle(),
    supabase.from('asset_prices').select('price_usd, price_syp, change_24h, fetched_at').eq('asset_code', 'XAU').eq('is_latest', true).maybeSingle(),
    supabase.from('asset_prices').select('price_usd, change_24h, fetched_at').eq('asset_code', 'BTC').eq('is_latest', true).maybeSingle(),
  ]);

  const { data: news } = await supabase
    .from('news_articles')
    .select('title_ar, category, published_at, slug')
    .order('published_at', { ascending: false })
    .limit(5);

  return { 
    usd: usdRes.data, 
    gold: goldRes.data, 
    btc: btcRes.data, 
    news 
  };
}

async function MainContent() {
  const { usd, gold, btc, news } = await getMainData();
  const lastUpdate = usd?.fetched_at || gold?.fetched_at || btc?.fetched_at;

  return (
    <div className="container mx-auto px-4 py-4 space-y-6">
      
      {lastUpdate && (
        <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">
          <span>🟢 محدث {formatRelativeTime(lastUpdate)}</span>
          <span className="hidden sm:inline">البيانات من مصادر موثوقة</span>
        </div>
      )}

      <section aria-labelledby="quick-prices">
        <h2 id="quick-prices" className="sr-only">أسعار سريعة</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x">
          
          {usd ? (
            <PriceCard
              title="دولار / ليرة"
              icon="💵"
              price={formatPrice(usd.buy_price, 'SYP')}
              change={formatChange(usd.change_24h || 0)}
              href="/prices/currency"
            />
          ) : (
            <div className="min-w-[160px] snap-start bg-card rounded-xl p-4 border border-muted animate-pulse">
              <div className="h-4 bg-muted rounded w-16 mb-3" />
              <div className="h-6 bg-muted rounded w-20 mb-2" />
              <div className="h-3 bg-muted rounded w-12" />
            </div>
          )}

          {gold?.price_syp ? (
            <PriceCard
              title="ذهب عيار 21"
              icon="🥇"
              price={formatPrice((gold.price_syp / 31.1035) * 0.875, 'SYP')}
              change={formatChange(gold.change_24h || 0)}
              href="/prices/gold"
            />
          ) : (
            <div className="min-w-[160px] snap-start bg-card rounded-xl p-4 border border-muted animate-pulse">
              <div className="h-4 bg-muted rounded w-16 mb-3" />
              <div className="h-6 bg-muted rounded w-20 mb-2" />
              <div className="h-3 bg-muted rounded w-12" />
            </div>
          )}

          {btc ? (
            <PriceCard
              title="بيتكوين"
              icon="₿"
              price={formatPrice(btc.price_usd, 'USD')}
              change={formatChange(btc.change_24h || 0)}
              href="/prices/crypto"
            />
          ) : (
            <div className="min-w-[160px] snap-start bg-card rounded-xl p-4 border border-muted animate-pulse">
              <div className="h-4 bg-muted rounded w-16 mb-3" />
              <div className="h-6 bg-muted rounded w-20 mb-2" />
              <div className="h-3 bg-muted rounded w-12" />
            </div>
          )}

          <Link href="/prices/fuel" className="block min-w-[160px] snap-start">
            <div className="bg-card rounded-xl p-4 border border-muted hover:border-primary/50 transition">
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">🛢️</span>
                <span className="text-xs text-muted-foreground">محروقات</span>
              </div>
              <p className="text-sm text-muted-foreground">أسعار يدوية</p>
              <div className="mt-3 pt-3 border-t border-muted flex items-center justify-between text-xs text-muted-foreground">
                <span>التفاصيل</span>
                <ArrowLeft className="h-3 w-3" />
              </div>
            </div>
          </Link>

          <Link href="/prices/electricity" className="block min-w-[160px] snap-start">
            <div className="bg-card rounded-xl p-4 border border-muted hover:border-primary/50 transition">
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">⚡</span>
                <span className="text-xs text-muted-foreground">كهرباء</span>
              </div>
              <p className="text-sm text-muted-foreground">تعرفة رسمية</p>
              <div className="mt-3 pt-3 border-t border-muted flex items-center justify-between text-xs text-muted-foreground">
                <span>التفاصيل</span>
                <ArrowLeft className="h-3 w-3" />
              </div>
            </div>
          </Link>

        </div>
      </section>

      <section aria-labelledby="latest-news">
        <div className="flex items-center justify-between mb-3">
          <h2 id="latest-news" className="font-bold text-lg">آخر الأخبار</h2>
          <Link href="/news" className="text-xs text-primary hover:underline">عرض الكل</Link>
        </div>
        
        <div className="bg-card rounded-xl border border-muted divide-y divide-muted">
          {news?.map((article: NewsArticle) => (
            <Link 
              key={article.slug || article.title_ar}
              href={`/news/${article.slug || 'news'}`}
            >
              <NewsCard
                title={article.title_ar}
                category={article.category}
                time={formatRelativeTime(article.published_at)}
              />
            </Link>
          )) || (
            [...Array(3)].map((_, i) => (
              <div key={i} className="p-3 flex gap-3 animate-pulse">
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-muted rounded w-20" />
                  <div className="h-4 bg-muted rounded w-full" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                </div>
                <div className="h-4 w-4 bg-muted rounded mt-1" />
              </div>
            ))
          )}
        </div>
      </section>

      <div className="bg-muted/30 rounded-lg p-3 text-xs text-muted-foreground text-center leading-relaxed">
        الأسعار المعروضة استرشادية وغير ملزمة قانونياً. 
        نعمل على تحديث البيانات كل 5 دقائق من مصادر موثوقة.
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'الرئيسية | ' + SITE_NAME,
            description: 'أسعار الدولار، الذهب، والمحروقات في سوريا بشكل لحظي',
            publisher: { '@type': 'Organization', name: SITE_NAME },
          }),
        }}
      />
      
      <Suspense fallback={
        <div className="container mx-auto px-4 py-8 space-y-6">
          <div className="h-8 bg-muted rounded w-48 animate-pulse" />
          <div className="flex gap-3 overflow-x-auto pb-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="min-w-[160px] bg-card rounded-xl p-4 border border-muted animate-pulse">
                <div className="h-4 bg-muted rounded w-16 mb-3" />
                <div className="h-6 bg-muted rounded w-20 mb-2" />
                <div className="h-3 bg-muted rounded w-12" />
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <div className="h-5 bg-muted rounded w-32 animate-pulse" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-card rounded-lg border border-muted animate-pulse" />
            ))}
          </div>
        </div>
      }>
        <MainContent />
      </Suspense>
    </>
  );
}
