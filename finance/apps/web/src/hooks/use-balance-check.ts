"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";

export function useBalanceCheck() {
  const [blocked, setBlocked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkBalance = async () => {
      try {
        const { data: customerMeters } = await authClient.usage.meters.list({
          query: {
            page: 1,
            limit: 10,
          },
        });

        const hasNegativeBalance = customerMeters?.result?.items.some(
          (meter) => meter.balance < 0,
        );

        setBlocked(hasNegativeBalance || false);
      } catch (error) {
        console.error("Error checking balance:", error);
        setBlocked(false);
      } finally {
        setLoading(false);
      }
    };

    checkBalance();
  }, []);

  return { blocked, loading };
}
