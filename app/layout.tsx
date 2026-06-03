// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/components/ThemeProvider";
import Header from "@/components/Header";
import FloatingActions from "@/components/FloatingActions";
import SwRegistration from "@/components/ServiceWorker";

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-tajawal",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL("https://lirasyp.sy"),
  title: {
    default: "LiraSYP | أسعار الصرف والذهب في سوريا",
    template: "%s | LiraSYP",
  },
  description:
    "تتبع لحظي لأسعار الدولار والليرة السورية والذهب والعملات الرقمية. مصادر موثوقة، تحديث فوري، إشعارات ذكية.",
  keywords: [
    "ليرة سورية",
    "دولار",
    "سعر الصرف",
    "ذهب",
    "عملات رقمية",
    "بيتكوين",
    "سوريا",
    "أسعار",
    "محروقات",
    "كهرباء",
  ],
  authors: [{ name: "LiraSYP" }],
  creator: "LiraSYP",
  publisher: "LiraSYP",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "ar_SY",
    url: "https://lirasyp.sy",
    siteName: "LiraSYP",
    title: "LiraSYP | أسعار الصرف والذهب في سوريا",
    description:
      "تتبع لحظي لأسعار الدولار والليرة السورية والذهب والعملات الرقمية.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "LiraSYP - أسعار الصرف والذهب في سوريا",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LiraSYP | أسعار الصرف والذهب في سوريا",
    description:
      "تتبع لحظي لأسعار الدولار والليرة السورية والذهب والعملات الرقمية.",
    images: ["/og-image.png"],
    creator: "@lirasyp",
  },
  alternates: {
    canonical: "https://lirasyp.sy",
  },
  verification: {
    google: "your-google-verification-code",
  },
  category: "finance",
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
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "LiraSYP",
              url: "https://lirasyp.sy",
              description:
                "تتبع لحظي لأسعار الدولار والليرة السورية والذهب والعملات الرقمية.",
              inLanguage: "ar",
              publisher: {
                "@type": "Organization",
                name: "LiraSYP",
                logo: {
                  "@type": "ImageObject",
                  url: "https://lirasyp.sy/logo.png",
                },
              },
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: "https://lirasyp.sy/search?q={search_term_string}",
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "LiraSYP",
              url: "https://lirasyp.sy",
              logo: "https://lirasyp.sy/logo.png",
              sameAs: [
                "https://twitter.com/lirasyp",
                "https://facebook.com/lirasyp",
              ],
              contactPoint: {
                "@type": "ContactPoint",
                email: "contact@lirasyp.sy",
                contactType: "customer service",
                availableLanguage: ["Arabic"],
              },
            }),
          }}
        />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://awvlqxxwktqtlobhvqwh.supabase.co" />
      </head>
      <body
        className={`${tajawal.variable} font-sans bg-background text-foreground antialiased`}
      >
        <SwRegistration />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <footer className="border-t border-border bg-card py-8">
              <div className="container mx-auto px-4">
                <div className="grid gap-8 md:grid-cols-3">
                  <div>
                    <h3 className="mb-3 text-lg font-bold">LiraSYP</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      منصة متخصصة في تتبع أسعار الصرف والذهب والعملات الرقمية في سوريا.
                      نقدم بيانات دقيقة ومحدثة من مصادر موثوقة.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="mb-3 text-lg font-bold">معلومات</h3>
                    <ul className="space-y-2 text-sm">
                      <li>
                        <a href="/about" className="text-muted-foreground hover:text-primary transition">
                          عن الموقع
                        </a>
                      </li>
                      <li>
                        <a href="/privacy" className="text-muted-foreground hover:text-primary transition">
                          سياسة الخصوصية
                        </a>
                      </li>
                      <li>
                        <a href="/terms" className="text-muted-foreground hover:text-primary transition">
                          شروط الاستخدام
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="mt-8 border-t border-border pt-4 text-center text-sm text-muted-foreground">
                  <p>الليرة عملتنا 2025-2026 created by E: Mohammed</p>
                 
                </div>
              </div>
            </footer>
          </div>
          <FloatingActions />
        </ThemeProvider>
      </body>
    </html>
  );
}
