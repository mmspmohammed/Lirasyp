"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

export function useRates() {
  const [rates, setRates] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    async function fetchRates() {
      try {
        setLoading(true);
        setError(null);

        const { data: exchangeData, error: exchangeErr } = await supabase
          .from("exchange_rates")
          .select("base_currency, target_currency, buy_price, sell_price")
          .eq("is_latest", true);

        if (exchangeErr) throw exchangeErr;

        const { data: assetData, error: assetErr } = await supabase
          .from("asset_prices")
          .select("asset_code, asset_type, price_usd, price_syp")
          .eq("is_latest", true);

        if (assetErr) throw assetErr;

        const mapped: Record<string, number> = {};
        mapped["USD"] = 1;

        exchangeData?.forEach((item: any) => {
          const rate = item.sell_price || item.buy_price;
          if (rate && rate > 0) mapped[item.target_currency] = rate;
        });

        assetData?.forEach((item: any) => {
          if (item.price_usd) mapped[item.asset_code] = item.price_usd;
          if (item.price_syp) mapped[`${item.asset_code}_SYP`] = item.price_syp;
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

    const channel = supabase
      .channel("exchange-rates-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "exchange_rates", filter: "is_latest=eq.true" }, () => fetchRates())
      .subscribe();

    const channel2 = supabase
      .channel("asset-prices-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "asset_prices", filter: "is_latest=eq.true" }, () => fetchRates())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(channel2);
    };
  }, []);

  return { rates, loading, error };
}

export function useUsdSypRate() {
  const { rates, loading, error } = useRates();
  return { rate: rates["SYP"] || null, loading, error };
}

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
    loading, error,
  };
}

export function useGoldRate() {
  const { rates, loading, error } = useRates();
  return { ounceUsd: rates["XAU"] || null, paxgUsd: rates["PAXG"] || null, loading, error };
}
