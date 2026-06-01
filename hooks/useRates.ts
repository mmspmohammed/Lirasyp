useRates_code = '''// hooks/useRates.ts
"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@/lib/supabase";

export interface Rate {
  code: string;
  price: number;
}

export function useRates() {
  const [rates, setRates] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createBrowserClient();
    
    async function fetchRates() {
      try {
        setLoading(true);
        setError(null);
        
        // جلب أسعار الصرف (USD → العملات)
        const { data: exchangeData, error: exchangeErr } = await supabase
          .from("exchange_rates")
          .select("base_currency, target_currency, buy_price, sell_price")
          .eq("is_latest", true);
        
        if (exchangeErr) throw exchangeErr;
        
        // جلب أسعار الأصول (ذهب + كريبتو)
        const { data: assetData, error: assetErr } = await supabase
          .from("asset_prices")
          .select("asset_code, asset_type, price_usd, price_syp")
          .eq("is_latest", true);
        
        if (assetErr) throw assetErr;
        
        const mapped: Record<string, number> = {};
        
        // إضافة أسعار الصرف
        exchangeData?.forEach((item: any) => {
          const key = `${item.base_currency}_${item.target_currency}`;
          mapped[key] = item.sell_price || item.buy_price;
          mapped[item.target_currency] = item.sell_price || item.buy_price;
        });
        
        // إضافة أسعار الأصول
        assetData?.forEach((item: any) => {
          mapped[item.asset_code] = item.price_usd;
          mapped[`${item.asset_code}_SYP`] = item.price_syp;
        });
        
        setRates(mapped);
      } catch (err: any) {
        console.error("Error fetching rates:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchRates();
    
    // Realtime subscription لـ exchange_rates
    const channel = supabase
      .channel("exchange-rates-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "exchange_rates",
          filter: "is_latest=eq.true",
        },
        () => {
          fetchRates();
        }
      )
      .subscribe();
    
    // Realtime subscription لـ asset_prices
    const channel2 = supabase
      .channel("asset-prices-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "asset_prices",
          filter: "is_latest=eq.true",
        },
        () => {
          fetchRates();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(channel2);
    };
  }, []);

  return { rates, loading, error };
}

// Hook متخصص لسعر USD/SYP
export function useUsdSypRate() {
  const { rates, loading, error } = useRates();
  return {
    rate: rates["SYP"] || rates["USD_SYP"] || null,
    loading,
    error,
  };
}

// Hook متخصص لأسعار الكريبتو
export function useCryptoRates() {
  const { rates, loading, error } = useRates();
  return {
    rates: {
      BTC: rates["BTC"] || null,
      ETH: rates["ETH"] || null,
      BNB: rates["BNB"] || null,
      SOL: rates["SOL"] || null,
      ADA: rates["ADA"] || null,
      TRX: rates["TRX"] || null,
      PAXG: rates["PAXG"] || null,
    },
    loading,
    error,
  };
}

// Hook متخصص لسعر الذهب
export function useGoldRate() {
  const { rates, loading, error } = useRates();
  return {
    ounceUsd: rates["XAU"] || null,
    paxgUsd: rates["PAXG"] || null,
    loading,
    error,
  };
}'''

with open('/mnt/agents/output/hooks/useRates.ts', 'w') as f:
    f.write(useRates_code)

print("✅ hooks/useRates.ts saved!")
