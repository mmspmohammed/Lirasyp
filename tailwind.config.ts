import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class", // ✅ تم التعديل ليعمل مع next-themes الافتراضي
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        primary: "hsl(var(--primary))",
        muted: "hsl(var(--muted))",
        success: "#22c55e",
        danger: "#ef4444",
        border: "hsl(var(--muted))",
      },
      fontFamily: {
        sans: ["var(--font-tajawal)"],
      },
    },
  },
  // ✅ إضافة plugin Typography لدعم كلاس `prose`
  plugins: [
    require('@tailwindcss/typography'),
  ],
};

export default config;
