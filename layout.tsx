import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Tajawal } from 'next/font/google';
import { ThemeProvider } from '@/components/ThemeProvider';
import Header from '@/components/Header';
import { SITE_NAME, SITE_URL } from '@/lib/env';

const tajawal = Tajawal({
  subsets: ['arabic'],
  weight: ['400', '500', '700'],
  variable: '--font-tajawal',
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'الليرة عملتنا | أسعار الدولار، الذهب، والمحروقات في سوريا',
    template: `%s | الليرة عملتنا`,
  },
  description: 'موقع الليرة عملتنا يعرض أسعار الدولار مقابل الليرة السورية، الذهب، المحروقات، الكهرباء، والعملات الرقمية بشكل لحظي وموثوق. تحديث كل 5 دقائق.',
  keywords: ['سعر الدولار في سوريا', 'الليرة السورية', 'سعر الذهب سوريا', 'أسعار المحروقات', 'تعرفة الكهرباء', 'عملات رقمية سوريا', 'اقتصاد سوريا'],
  authors: [{ name: 'فريق الليرة عملتنا' }],
  creator: 'LiraSYP Team',
  publisher: 'LiraSYP.sy',
  formatDetection: { email: false, address: false, telephone: false },
  
  openGraph: {
    type: 'website',
    locale: 'ar_SY',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: 'الليرة عملتنا - أسعار اقتصادية لحظية في سوريا',
    description: 'تابع أسعار الدولار، الذهب، والمحروقات في سوريا بشكل لحظي وموثوق.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: SITE_NAME }],
  },
  
  twitter: {
    card: 'summary_large_image',
    title: 'الليرة عملتنا | أسعار اقتصادية سوريا',
    description: 'أسعار الدولار، الذهب، والعملات في سوريا - تحديث لحظي',
    images: ['/og-image.png'],
  },
  
  alternates: {
    canonical: '/',
  },
  
  robots: {    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0B1120' },
    { media: '(prefers-color-scheme: light)', color: '#F8FAFC' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  description: 'موقع اقتصادي يعرض أسعار الصرف، الذهب، والمحروقات في سوريا',
  inLanguage: 'ar-SY',
  publisher: {
    '@type': 'Organization',
    name: SITE_NAME,
    logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link rel="preconnect" href="https://awvlqxxwktqtlobhvqwh.supabase.co" />
      </head>      <body className={`${tajawal.variable} font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          {/* ✅ تم التعديل: mb-20 بدل pb-20 ليترك مساحة للـ Footer */}
          <main className="min-h-screen mb-20">{children}</main>
          
          {/* ✅ Footer: sticky بدل fixed ليتصرف بشكل طبيعي مع التمرير */}
          <footer className="sticky bottom-0 w-full bg-card/95 backdrop-blur border-t border-muted p-3 text-center text-xs text-muted-foreground z-50">
            © {new Date().getFullYear()} {SITE_NAME} • الأسعار استرشادية
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}