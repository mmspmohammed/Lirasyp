// app/prices/fuel/page.tsx
import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase-server";
import { formatPrice } from "@/lib/format";
import { ArrowLeft, Fuel } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "أسعار المحروقات | بنزين ومازوت وغاز",
  description: "أسعار المحروقات في سوريا: بنزين أوكتان 95 و 90، مازوت، غاز منزلي وصناعي. تحديث دوري.",
  keywords: ["بنزين", "مازوت", "غاز", "محروقات", "سوريا", "أسعار الوقود"],
  openGraph: {
    title: "أسعار المحروقات | الليرة عملتنا",
    description: "أسعار البنزين والمازوت والغاز في سوريا.",
  },
};

export const revalidate = 300;

function FuelCard({
  name,
  priceUsd,
  priceSyp,
  unit,
  color,
  notes,
}: {
  name: string;
  priceUsd: number;
  priceSyp: number;
  unit: string;
  color: string;
  notes?: string;
}) {
  return (
    <div className="rounded-2xl bg-card p-5 border border-border hover:border-primary/20 transition">
      <div className="flex items-center gap-3 mb-4">
        <span
          className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold text-white"
          style={{ backgroundColor: color }}
        >
          {name[0]}
        </span>
        <div>
          <h3 className="font-bold text-lg">{name}</h3>
          <p className="text-sm text-muted-foreground">{unit}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-muted/50 p-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">بالدولار</p>
          <p className="text-xl font-bold">{formatPrice(priceUsd, "USD")}</p>
        </div>
        <div className="rounded-xl bg-muted/50 p-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">بالليرة</p>
          <p className="text-xl font-bold">{formatPrice(priceSyp, "SYP")}</p>
        </div>
      </div>
      {notes && (
        <p className="text-xs text-muted-foreground mt-3">{notes}</p>
      )}
    </div>
  );
}

async function getFuelData() {
  const supabase = createServerSupabase();
  const { data: fuels } = await supabase
    .from("fuel_prices")
    .select("id, material_type, material_name_ar, price_usd, price_syp, unit_ar, region, notes, updated_at")
    .order("material_name_ar", { ascending: true });
  return fuels || [];
}

export default async function FuelPage() {
  const fuels = await getFuelData();

  const grouped = fuels.reduce((acc: any, fuel: any) => {
    const type = fuel.material_type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(fuel);
    return acc;
  }, {});

  // ✅ مطابق تماماً لـ material_type بالداتا بيس
  const typeLabels: Record<string, { label: string; color: string }> = {
    gasoline_95: { label: "بنزين 95", color: "#ef4444" },
    gasoline_90: { label: "بنزين 90", color: "#dc2626" },
    diesel: { label: "المازوت", color: "#f97316" },
    gas_cylinder: { label: "الغاز", color: "#3b82f6" },
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary transition">الرئيسية</Link>
        <ArrowLeft className="w-4 h-4" />
        <span>أسعار المحروقات</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold mb-2 flex items-center gap-2">
          <Fuel className="w-8 h-8 text-red-500" />
          أسعار المحروقات
        </h1>
        <p className="text-muted-foreground">
          أسعار البنزين والمازوت والغاز في سوريا - تحديث دوري
        </p>
      </div>

      {Object.keys(grouped).length > 0 ? (
        <div className="space-y-8">
          {Object.entries(grouped).map(([type, items]: [string, any]) => {
            const meta = typeLabels[type] || { label: type, color: "#666" };
            return (
              <section key={type}>
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: meta.color }} />
                  {meta.label}
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {items.map((fuel: any) => (
                    <FuelCard
                      key={fuel.id}
                      name={fuel.material_name_ar}
                      priceUsd={fuel.price_usd}
                      priceSyp={fuel.price_syp}
                      unit={fuel.unit_ar}
                      color={meta.color}
                      notes={fuel.notes}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl bg-card p-8 text-center border border-border">
          <p className="text-muted-foreground">لا توجد بيانات متاحة حالياً</p>
        </div>
      )}

      <div className="mt-8 rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground">
        <p className="font-medium mb-2">ℹ️ ملاحظات:</p>
        <ul className="space-y-1 list-disc list-inside">
          <li>الأسعار بالليرة السورية قد تختلف حسب المنطقة</li>
          <li>البنزين أوكتان 95 هو الأكثر استخداماً للسيارات</li>
          <li>المازوت يستخدم للتدفئة والصناعة</li>
          <li>غاز المنازل (الأسطوانة) يختلف حسب الحجم</li>
        </ul>
      </div>
    </div>
  );
}
