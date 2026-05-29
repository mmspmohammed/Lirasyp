// hooks/useRates.ts

"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase/client";

export interface Rate {
  code: string;
  price: number;
}

export function useRates() {
  const [rates, setRates] = useState<
    Record<string, number>
  >({});

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    fetchRates();

    const channel = supabase
      .channel("rates-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "rates",
        },
        () => {
          fetchRates();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchRates() {
    const { data, error } = await supabase
      .from("rates")
      .select("*");

    if (error) {
      console.error(error);
      return;
    }

    const mapped: Record<string, number> =
      {};

    data.forEach((item: Rate) => {
      mapped[item.code] = item.price;
    });

    setRates(mapped);
    setLoading(false);
  }

  return {
    rates,
    loading,
  };
}
