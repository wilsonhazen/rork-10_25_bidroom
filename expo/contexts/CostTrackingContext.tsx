import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CostTracking, PhaseMilestone } from "@/types";

const STORAGE_KEY = "cost_tracking";

export const [CostTrackingProvider, useCostTracking] = createContextHook(() => {
  const [costTracking, setCostTracking] = useState<CostTracking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      setCostTracking(stored ? JSON.parse(stored) : []);
    } catch (error) {
      console.error("Failed to load cost tracking:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveCostTracking = async (updated: CostTracking[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setCostTracking(updated);
    } catch (error) {
      console.error("Failed to save cost tracking:", error);
    }
  };

  const initializePhaseTracking = useCallback(async (
    projectId: string,
    phaseId: string,
    estimated: number,
    milestones: Omit<PhaseMilestone, "id" | "completed" | "completedAt" | "paidAt">[]
  ) => {
    const tracking: CostTracking = {
      projectId,
      phaseId,
      estimated,
      actual: 0,
      variance: 0,
      variancePercentage: 0,
      status: "on_track",
      milestones: milestones.map((m, idx) => ({
        ...m,
        id: `milestone-${phaseId}-${idx}`,
        completed: false,
      })),
    };

    await saveCostTracking([...costTracking, tracking]);
    return tracking;
  }, [costTracking]);

  const updateActualCost = useCallback(async (projectId: string, phaseId: string, actual: number) => {
    const updated = costTracking.map(ct => {
      if (ct.projectId === projectId && ct.phaseId === phaseId) {
        const variance = actual - ct.estimated;
        const variancePercentage = (variance / ct.estimated) * 100;
        
        let status: "under" | "on_track" | "over" = "on_track";
        if (variancePercentage < -5) status = "under";
        else if (variancePercentage > 10) status = "over";

        return {
          ...ct,
          actual,
          variance,
          variancePercentage,
          status,
        };
      }
      return ct;
    });

    await saveCostTracking(updated);
  }, [costTracking]);

  const completeMilestone = useCallback(async (projectId: string, phaseId: string, milestoneId: string) => {
    const updated = costTracking.map(ct => {
      if (ct.projectId === projectId && ct.phaseId === phaseId) {
        return {
          ...ct,
          milestones: ct.milestones.map((m: PhaseMilestone) => 
            m.id === milestoneId
              ? { ...m, completed: true, completedAt: new Date().toISOString() }
              : m
          ),
        };
      }
      return ct;
    });

    await saveCostTracking(updated);
  }, [costTracking]);

  const markMilestonePaid = useCallback(async (projectId: string, phaseId: string, milestoneId: string) => {
    const updated = costTracking.map(ct => {
      if (ct.projectId === projectId && ct.phaseId === phaseId) {
        return {
          ...ct,
          milestones: ct.milestones.map((m: PhaseMilestone) => 
            m.id === milestoneId
              ? { ...m, paidAt: new Date().toISOString() }
              : m
          ),
        };
      }
      return ct;
    });

    await saveCostTracking(updated);
  }, [costTracking]);

  const getProjectCostTracking = useCallback((projectId: string) => {
    return costTracking.filter(ct => ct.projectId === projectId);
  }, [costTracking]);

  const getPhaseCostTracking = useCallback((projectId: string, phaseId: string) => {
    return costTracking.find(ct => ct.projectId === projectId && ct.phaseId === phaseId);
  }, [costTracking]);

  const getProjectTotals = useCallback((projectId: string) => {
    const phases = costTracking.filter(ct => ct.projectId === projectId);
    
    return {
      totalEstimated: phases.reduce((sum, p) => sum + p.estimated, 0),
      totalActual: phases.reduce((sum, p) => sum + p.actual, 0),
      totalVariance: phases.reduce((sum, p) => sum + p.variance, 0),
      phasesOverBudget: phases.filter(p => p.status === "over").length,
      phasesUnderBudget: phases.filter(p => p.status === "under").length,
      phasesOnTrack: phases.filter(p => p.status === "on_track").length,
    };
  }, [costTracking]);

  const generatePaymentSchedule = useCallback((estimatedCost: number, phaseCount: number) => {
    const schedules = [
      { percentage: 0.20, name: "Initial Deposit", dueCondition: "Upon contract signing" },
      { percentage: 0.30, name: "Mid-Phase Payment", dueCondition: "50% completion" },
      { percentage: 0.30, name: "Near Completion", dueCondition: "90% completion" },
      { percentage: 0.20, name: "Final Payment", dueCondition: "Phase completion and inspection" },
    ];

    return schedules.map((s, idx) => ({
      id: `milestone-${idx}`,
      phaseId: "",
      name: s.name,
      percentage: s.percentage,
      amount: estimatedCost * s.percentage,
      dueCondition: s.dueCondition,
      completed: false,
    }));
  }, []);

  return useMemo(() => ({
    costTracking,
    isLoading,
    initializePhaseTracking,
    updateActualCost,
    completeMilestone,
    markMilestonePaid,
    getProjectCostTracking,
    getPhaseCostTracking,
    getProjectTotals,
    generatePaymentSchedule,
  }), [
    costTracking,
    isLoading,
    initializePhaseTracking,
    updateActualCost,
    completeMilestone,
    markMilestonePaid,
    getProjectCostTracking,
    getPhaseCostTracking,
    getProjectTotals,
    generatePaymentSchedule,
  ]);
});
