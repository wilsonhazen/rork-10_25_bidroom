import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AutoMatchNotification, ContractorQualification, TemplatePhase } from "@/types";

const STORAGE_KEY = "auto_match_notifications";

export const [AutoMatchingProvider, useAutoMatching] = createContextHook(() => {
  const [notifications, setNotifications] = useState<AutoMatchNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      setNotifications(stored ? JSON.parse(stored) : []);
    } catch (error) {
      console.error("Failed to load auto-match notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveNotifications = async (updated: AutoMatchNotification[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setNotifications(updated);
    } catch (error) {
      console.error("Failed to save notifications:", error);
    }
  };

  const calculateMatchScore = useCallback((contractorTrades: string[], phaseRequiredTrades: string[], contractorRating: number, completedProjects: number) => {
    let score = 0;

    const tradeMatch = phaseRequiredTrades.some(trade => contractorTrades.includes(trade));
    if (tradeMatch) score += 40;

    if (contractorRating >= 4.5) score += 20;
    else if (contractorRating >= 4.0) score += 15;
    else if (contractorRating >= 3.5) score += 10;

    if (completedProjects >= 100) score += 20;
    else if (completedProjects >= 50) score += 15;
    else if (completedProjects >= 25) score += 10;
    else if (completedProjects >= 10) score += 5;

    score += Math.min(20, Math.random() * 20);

    return Math.min(100, score);
  }, []);

  const qualifyContractor = useCallback((contractor: any, phase: TemplatePhase): ContractorQualification => {
    const requirements = [
      {
        name: "Trade Match",
        met: phase.trades.some(t => contractor.trade === t || contractor.specialties?.includes(t)),
        value: contractor.trade,
      },
      {
        name: "Insurance Verified",
        met: contractor.verifications?.some((v: any) => v.type === "insurance" && v.verified) || false,
      },
      {
        name: "License Verified",
        met: contractor.verifications?.some((v: any) => v.type === "license" && v.verified) || false,
      },
      {
        name: "Minimum Rating",
        met: contractor.rating >= 3.5,
        value: contractor.rating.toFixed(1),
      },
      {
        name: "Experience",
        met: contractor.completedProjects >= 5,
        value: `${contractor.completedProjects} projects`,
      },
    ];

    const metCount = requirements.filter(r => r.met).length;
    const qualified = metCount >= 3;
    const score = (metCount / requirements.length) * 100;

    const reasons: string[] = [];
    if (!qualified) {
      reasons.push(...requirements.filter(r => !r.met).map(r => `Missing: ${r.name}`));
    }

    return {
      contractorId: contractor.id,
      phaseId: phase.id,
      qualified,
      reasons,
      requirements,
      score,
    };
  }, []);

  const createMatchNotification = useCallback(async (
    contractorId: string,
    projectId: string,
    phaseIds: string[],
    matchScore: number,
    matchReasons: string[]
  ) => {
    const notification: AutoMatchNotification = {
      id: `match-${Date.now()}-${contractorId}`,
      contractorId,
      projectId,
      phaseIds,
      matchScore,
      matchReasons,
      sentAt: new Date().toISOString(),
      viewed: false,
      responded: false,
    };

    await saveNotifications([...notifications, notification]);
    return notification;
  }, [notifications]);

  const markAsViewed = useCallback(async (notificationId: string) => {
    const updated = notifications.map(n => 
      n.id === notificationId ? { ...n, viewed: true } : n
    );
    await saveNotifications(updated);
  }, [notifications]);

  const markAsResponded = useCallback(async (notificationId: string) => {
    const updated = notifications.map(n => 
      n.id === notificationId ? { ...n, responded: true } : n
    );
    await saveNotifications(updated);
  }, [notifications]);

  const getNotificationsForContractor = useCallback((contractorId: string) => {
    return notifications.filter(n => n.contractorId === contractorId);
  }, [notifications]);

  const getUnviewedCount = useCallback((contractorId: string) => {
    return notifications.filter(n => n.contractorId === contractorId && !n.viewed).length;
  }, [notifications]);

  return useMemo(() => ({
    notifications,
    isLoading,
    calculateMatchScore,
    qualifyContractor,
    createMatchNotification,
    markAsViewed,
    markAsResponded,
    getNotificationsForContractor,
    getUnviewedCount,
  }), [
    notifications,
    isLoading,
    calculateMatchScore,
    qualifyContractor,
    createMatchNotification,
    markAsViewed,
    markAsResponded,
    getNotificationsForContractor,
    getUnviewedCount,
  ]);
});
