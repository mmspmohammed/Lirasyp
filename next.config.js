/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'lirasyp.sy' },
      { protocol: 'https', hostname: 'sana.sy' },
      { protocol: 'https', hostname: 'alwatan.sy' },
      { protocol: 'https', hostname: '**.cdninstagram.com' },
      { protocol: 'https', hostname: '**.cloudflare.com' },
    ],
    unoptimized: false,
  },

  compress: true,
  poweredByHeader: false,

  // ✅ Disable ESLint during builds (optional - install eslint if you want linting)
  eslint: {
    ignoreDuringBuilds: true,
  },

  // ✅ حل مشكلة ESM على Netlify (Next.js 14)
  experimental: {
    serverComponentsExternalPackages: ['html-encoding-sniffer', '@exodus/bytes'],
  },
};

module.exports = nextConfig;
