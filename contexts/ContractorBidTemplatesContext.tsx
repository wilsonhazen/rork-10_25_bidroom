import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ContractorBidTemplate } from "@/types";
import { useAuth } from "./AuthContext";

const STORAGE_KEY = "contractor_bid_templates";

export const [ContractorBidTemplatesProvider, useContractorBidTemplates] = createContextHook(() => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<ContractorBidTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      setTemplates(stored ? JSON.parse(stored) : []);
    } catch (error) {
      console.error("Failed to load bid templates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveTemplates = async (updated: ContractorBidTemplate[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setTemplates(updated);
    } catch (error) {
      console.error("Failed to save bid templates:", error);
    }
  };

  const createTemplate = useCallback(async (templateData: Omit<ContractorBidTemplate, "id" | "createdAt" | "contractorId">) => {
    if (!user) return null;

    const newTemplate: ContractorBidTemplate = {
      ...templateData,
      id: `template-${Date.now()}`,
      contractorId: user.id,
      createdAt: new Date().toISOString(),
    };

    await saveTemplates([...templates, newTemplate]);
    return newTemplate;
  }, [templates, user]);

  const updateTemplate = useCallback(async (templateId: string, updates: Partial<ContractorBidTemplate>) => {
    const updated = templates.map(t => t.id === templateId ? { ...t, ...updates } : t);
    await saveTemplates(updated);
  }, [templates]);

  const deleteTemplate = useCallback(async (templateId: string) => {
    const updated = templates.filter(t => t.id !== templateId);
    await saveTemplates(updated);
  }, [templates]);

  const getTemplatesByTrade = useCallback((trade: string) => {
    return templates.filter(t => t.contractorId === user?.id && t.trade === trade);
  }, [templates, user]);

  const getTemplateForPhase = useCallback((phaseName: string) => {
    return templates.find(t => t.contractorId === user?.id && t.phaseName === phaseName);
  }, [templates, user]);

  const calculateEstimate = useCallback((template: ContractorBidTemplate, quantity: number = 1) => {
    let amount = template.baseRate;
    
    if (template.unit !== "fixed") {
      amount = template.baseRate * quantity;
    }

    return amount;
  }, []);

  return useMemo(() => ({
    templates,
    isLoading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplatesByTrade,
    getTemplateForPhase,
    calculateEstimate,
  }), [
    templates,
    isLoading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplatesByTrade,
    getTemplateForPhase,
    calculateEstimate,
  ]);
});
