import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MarketPricing } from "@/types";
import { PROJECT_TEMPLATES } from "@/mocks/house-build-template";

const STORAGE_KEY = "market_pricing";

const MOCK_MARKET_PRICING: MarketPricing[] = PROJECT_TEMPLATES[0].phases.map(phase => ({
  phaseId: phase.id,
  region: "national",
  averageCost: phase.estimatedCost,
  lastUpdated: new Date().toISOString(),
  dataPoints: Math.floor(Math.random() * 500) + 100,
  trend: ["increasing", "stable", "decreasing"][Math.floor(Math.random() * 3)] as "increasing" | "stable" | "decreasing",
}));

export const [MarketPricingProvider, useMarketPricing] = createContextHook(() => {
  const [marketPricing, setMarketPricing] = useState<MarketPricing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      setMarketPricing(stored ? JSON.parse(stored) : MOCK_MARKET_PRICING);
    } catch (error) {
      console.error("Failed to load market pricing:", error);
      setMarketPricing(MOCK_MARKET_PRICING);
    } finally {
      setIsLoading(false);
    }
  };

  const getPricingForPhase = useCallback((phaseId: string, region: string = "national") => {
    return marketPricing.find(p => p.phaseId === phaseId && p.region === region);
  }, [marketPricing]);

  const getPricingTrend = useCallback((phaseId: string) => {
    const pricing = marketPricing.find(p => p.phaseId === phaseId);
    return pricing?.trend || "stable";
  }, [marketPricing]);

  const calculateBundleDiscount = useCallback((phaseCount: number) => {
    if (phaseCount >= 10) return 0.15;
    if (phaseCount >= 5) return 0.10;
    if (phaseCount >= 3) return 0.05;
    return 0;
  }, []);

  const getMarketAverage = useCallback((phaseIds: string[]) => {
    const prices = phaseIds.map(id => getPricingForPhase(id)).filter(Boolean);
    const min = prices.reduce((sum, p) => sum + (p?.averageCost.min || 0), 0);
    const max = prices.reduce((sum, p) => sum + (p?.averageCost.max || 0), 0);
    return { min, max };
  }, [getPricingForPhase]);

  return useMemo(() => ({
    marketPricing,
    isLoading,
    getPricingForPhase,
    getPricingTrend,
    calculateBundleDiscount,
    getMarketAverage,
  }), [
    marketPricing,
    isLoading,
    getPricingForPhase,
    getPricingTrend,
    calculateBundleDiscount,
    getMarketAverage,
  ]);
});
