// app/prices/electricity/page.tsx
import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase-server";
import { formatPrice } from "@/lib/format";
import { ArrowLeft, Zap, Lightbulb, Calculator } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "أسعار الكهرباء | شرائح الاستهلاك",
  description:
    "شرائح استهلاك الكهرباء في سوريا مع الأسعار لكل كيلوواط ساعة. حساب تلقائي للفاتورة.",
  keywords: [
    "كهرباء",
    "شرائح الكهرباء",
    "كيلوواط",
    "سوريا",
    "فاتورة كهرباء",
    "طاقة",
  ],
  openGraph: {
    title: "أسعار الكهرباء | LiraSYP",
    description: "شرائح استهلاك الكهرباء في سوريا مع الأسعار.",
  },
};

export const revalidate = 300;

// ==================== Components ====================

function TierCard({
  tier,
  name,
  price,
  isActive,
}: {
  tier: string;
  name: string;
  price: number;
  isActive: boolean;
}) {
  return (
    <div
      className={`
        rounded-2xl p-5 border transition
        ${isActive
          ? "bg-primary/5 border-primary/30"
          : "bg-card border-border hover:border-primary/20"
        }
      `}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-muted-foreground">
          الشريحة {tier}
        </span>
        {isActive && (
          <span className="text-xs px-2 py-1 rounded-full bg-primary text-white">
            فعالة
          </span>
        )}
      </div>
      <h3 className="font-bold text-lg mb-2">{name}</h3>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-extrabold text-primary">
          {formatPrice(price, "SYP")}
        </span>
        <span className="text-sm text-muted-foreground">/ كيلوواط</span>
      </div>
    </div>
  );
}

// ==================== Data Fetching ====================

async function getElectricityData() {
  const supabase = createServerSupabase();

  const { data: tiers } = await supabase
    .from("electricity_tariffs")
    .select("tier_key, tier_name_ar, price_per_kwh, effective_from, effective_to, is_active")
    .eq("is_active", true)
    .order("price_per_kwh", { ascending: true });

  return tiers || [];
}

// ==================== Main Page ====================

export default async function ElectricityPage() {
  const tiers = await getElectricityData();

  // مثال حسابي
  const exampleConsumption = 300; // كيلوواط
  const exampleCost = tiers.reduce((total: number, tier: any) => {
    return total + tier.price_per_kwh * exampleConsumption;
  }, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary transition">الرئيسية</Link>
        <ArrowLeft className="w-4 h-4" />
        <span>أسعار الكهرباء</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold mb-2 flex items-center gap-2">
          <Zap className="w-8 h-8 text-yellow-500" />
          شرائح الكهرباء
        </h1>
        <p className="text-muted-foreground">
          أسعار استهلاك الكهرباء في سوريا حسب شرائح الاستهلاك
        </p>
      </div>

      {/* Tiers */}
      {tiers.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {tiers.map((tier: any) => (
            <TierCard
              key={tier.tier_key}
              tier={tier.tier_key}
              name={tier.tier_name_ar}
              price={tier.price_per_kwh}
              isActive={tier.is_active}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl bg-card p-8 text-center border border-border mb-8">
          <p className="text-muted-foreground">لا توجد بيانات متاحة حالياً</p>
        </div>
      )}

      

      {/* Info */}
      <div className="rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground">
        <p className="font-medium mb-2">ℹ️ معلومات:</p>
        <ul className="space-y-1 list-disc list-inside">
          <li>الأسعار بالليرة السورية</li>
          <li>الشرائح تتدرج حسب كمية الاستهلاك</li>
          <li>كلما زاد الاستهلاك، زاد سعر الكيلوواط</li>
          <li>الأسعار قابلة للتغيير حسب قرارات الحكومة</li>
        </ul>
      </div>
    </div>
  );
}
