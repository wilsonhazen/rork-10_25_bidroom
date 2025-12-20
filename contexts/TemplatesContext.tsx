import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ProjectTemplate, TemplateBasedProject } from "@/types";
import { PROJECT_TEMPLATES } from "@/mocks/house-build-template";
import { useAuth } from "./AuthContext";

const STORAGE_KEYS = {
  TEMPLATE_PROJECTS: "template_projects",
};

export const [TemplatesProvider, useTemplates] = createContextHook(() => {
  const { user } = useAuth();
  const [templates] = useState<ProjectTemplate[]>(PROJECT_TEMPLATES);
  const [templateProjects, setTemplateProjects] = useState<TemplateBasedProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.TEMPLATE_PROJECTS);
      setTemplateProjects(stored ? JSON.parse(stored) : []);
    } catch (error) {
      console.error("Failed to load template projects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveTemplateProjects = useCallback(async (updated: TemplateBasedProject[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TEMPLATE_PROJECTS, JSON.stringify(updated));
      setTemplateProjects(updated);
    } catch (error) {
      console.error("Failed to save template projects:", error);
    }
  }, []);

  const getTemplateById = useCallback((templateId: string) => {
    return templates.find(t => t.id === templateId);
  }, [templates]);

  const getTemplatesByCategory = useCallback((category: string) => {
    return templates.filter(t => t.category === category);
  }, [templates]);

  const createTemplateProject = useCallback(async (projectData: TemplateBasedProject) => {
    if (!user) return null;

    const updated = [...templateProjects, projectData];
    await saveTemplateProjects(updated);

    return projectData;
  }, [templateProjects, saveTemplateProjects, user]);

  const calculateSelectedPhaseCost = useCallback((template: ProjectTemplate, selectedPhases: string[]) => {
    const phases = template.phases.filter(p => selectedPhases.includes(p.id));
    const min = phases.reduce((sum, p) => sum + p.estimatedCost.min, 0);
    const max = phases.reduce((sum, p) => sum + p.estimatedCost.max, 0);
    return { min, max };
  }, []);

  const getPhasesByTrade = useCallback((template: ProjectTemplate, trade: string) => {
    return template.phases.filter(p => p.trades.includes(trade));
  }, []);

  const getPhaseDependencies = useCallback((template: ProjectTemplate, phaseId: string) => {
    const phase = template.phases.find(p => p.id === phaseId);
    if (!phase) return [];
    
    return template.phases.filter(p => phase.dependencies.includes(p.id));
  }, []);

  const validatePhaseSelection = useCallback((template: ProjectTemplate, selectedPhases: string[]) => {
    const errors: string[] = [];
    
    selectedPhases.forEach(phaseId => {
      const phase = template.phases.find(p => p.id === phaseId);
      if (!phase) return;
      
      phase.dependencies.forEach(depId => {
        if (!selectedPhases.includes(depId)) {
          const depPhase = template.phases.find(p => p.id === depId);
          if (depPhase) {
            errors.push(`${phase.name} requires ${depPhase.name}`);
          }
        }
      });
    });

    return { valid: errors.length === 0, errors };
  }, []);

  return useMemo(() => ({
    templates,
    templateProjects,
    isLoading,
    getTemplateById,
    getTemplatesByCategory,
    createTemplateProject,
    calculateSelectedPhaseCost,
    getPhasesByTrade,
    getPhaseDependencies,
    validatePhaseSelection,
  }), [
    templates,
    templateProjects,
    isLoading,
    getTemplateById,
    getTemplatesByCategory,
    createTemplateProject,
    calculateSelectedPhaseCost,
    getPhasesByTrade,
    getPhaseDependencies,
    validatePhaseSelection,
  ]);
});
