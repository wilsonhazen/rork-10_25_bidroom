import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface ProfileView {
  id: string;
  viewerId: string;
  viewerName?: string;
  contractorId: string;
  timestamp: string;
  source: "search" | "direct" | "referral" | "saved";
}

export interface ResponseMetric {
  id: string;
  contractorId: string;
  leadId: string;
  leadType: "job" | "bid" | "message" | "quote_request";
  receivedAt: string;
  respondedAt?: string;
  responseTime?: number;
}

export interface LeadConversion {
  id: string;
  contractorId: string;
  leadId: string;
  leadType: "job" | "bid" | "quote_request";
  leadDate: string;
  convertedToProject: boolean;
  convertedAt?: string;
  projectValue?: number;
  daysToConvert?: number;
}

export interface ProfileCompletion {
  contractorId: string;
  completionPercentage: number;
  missingFields: string[];
  suggestions: string[];
  lastChecked: string;
}

export interface AnalyticsData {
  profileViews: ProfileView[];
  responseMetrics: ResponseMetric[];
  leadConversions: LeadConversion[];
  profileCompletion?: ProfileCompletion;
}

const STORAGE_KEY = "@analytics_data";

export const [AnalyticsContext, useAnalytics] = createContextHook(() => {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    profileViews: [],
    responseMetrics: [],
    leadConversions: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [user?.id]);

  const loadAnalytics = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        setAnalyticsData(data);
      }
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveAnalytics = async (data: AnalyticsData) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setAnalyticsData(data);
    } catch (error) {
      console.error("Error saving analytics:", error);
    }
  };

  const trackProfileView = (
    contractorId: string,
    viewerId: string,
    viewerName: string,
    source: ProfileView["source"]
  ) => {
    const newView: ProfileView = {
      id: Date.now().toString(),
      viewerId,
      viewerName,
      contractorId,
      timestamp: new Date().toISOString(),
      source,
    };

    const updated = {
      ...analyticsData,
      profileViews: [...analyticsData.profileViews, newView],
    };
    saveAnalytics(updated);
  };

  const trackLeadResponse = (
    leadId: string,
    leadType: ResponseMetric["leadType"],
    contractorId: string
  ) => {
    const existingMetric = analyticsData.responseMetrics.find(
      (m) => m.leadId === leadId
    );

    if (existingMetric && !existingMetric.respondedAt) {
      const respondedAt = new Date().toISOString();
      const receivedTime = new Date(existingMetric.receivedAt).getTime();
      const respondedTime = new Date(respondedAt).getTime();
      const responseTime = Math.floor((respondedTime - receivedTime) / 1000 / 60);

      const updated = {
        ...analyticsData,
        responseMetrics: analyticsData.responseMetrics.map((m) =>
          m.id === existingMetric.id
            ? { ...m, respondedAt, responseTime }
            : m
        ),
      };
      saveAnalytics(updated);
    } else if (!existingMetric) {
      const newMetric: ResponseMetric = {
        id: Date.now().toString(),
        contractorId,
        leadId,
        leadType,
        receivedAt: new Date().toISOString(),
        respondedAt: new Date().toISOString(),
        responseTime: 0,
      };

      const updated = {
        ...analyticsData,
        responseMetrics: [...analyticsData.responseMetrics, newMetric],
      };
      saveAnalytics(updated);
    }
  };

  const trackLeadReceived = (
    leadId: string,
    leadType: ResponseMetric["leadType"],
    contractorId: string
  ) => {
    const newMetric: ResponseMetric = {
      id: Date.now().toString(),
      contractorId,
      leadId,
      leadType,
      receivedAt: new Date().toISOString(),
    };

    const updated = {
      ...analyticsData,
      responseMetrics: [...analyticsData.responseMetrics, newMetric],
    };
    saveAnalytics(updated);
  };

  const trackLeadConversion = (
    leadId: string,
    leadType: LeadConversion["leadType"],
    contractorId: string,
    leadDate: string,
    projectValue?: number
  ) => {
    const convertedAt = new Date().toISOString();
    const leadTime = new Date(leadDate).getTime();
    const convertedTime = new Date(convertedAt).getTime();
    const daysToConvert = Math.floor(
      (convertedTime - leadTime) / 1000 / 60 / 60 / 24
    );

    const newConversion: LeadConversion = {
      id: Date.now().toString(),
      contractorId,
      leadId,
      leadType,
      leadDate,
      convertedToProject: true,
      convertedAt,
      projectValue,
      daysToConvert,
    };

    const updated = {
      ...analyticsData,
      leadConversions: [...analyticsData.leadConversions, newConversion],
    };
    saveAnalytics(updated);
  };

  const calculateProfileCompletion = (contractor: any): ProfileCompletion => {
    const fields = [
      { name: "company", value: contractor.company, weight: 5 },
      { name: "phone", value: contractor.phone, weight: 5 },
      { name: "email", value: contractor.email, weight: 5 },
      { name: "location", value: contractor.location, weight: 5 },
      { name: "trade", value: contractor.trade, weight: 5 },
      { name: "avatar", value: contractor.avatar, weight: 10 },
      { name: "yearsInBusiness", value: contractor.yearsInBusiness, weight: 5 },
      { name: "licenseNumber", value: contractor.licenseNumber, weight: 10 },
      { name: "insuranceAmount", value: contractor.insuranceAmount, weight: 10 },
      { name: "specialties", value: contractor.specialties?.length, weight: 5 },
      { name: "portfolio", value: contractor.portfolio?.length, weight: 15 },
      { name: "certifications", value: contractor.certifications?.length, weight: 10 },
      { name: "verifications", value: contractor.verifications?.filter((v: any) => v.verified).length, weight: 15 },
    ];

    const totalWeight = fields.reduce((sum, field) => sum + field.weight, 0);
    let earnedWeight = 0;
    const missingFields: string[] = [];

    fields.forEach((field) => {
      if (field.value) {
        earnedWeight += field.weight;
      } else {
        missingFields.push(field.name);
      }
    });

    const completionPercentage = Math.round((earnedWeight / totalWeight) * 100);

    const suggestions: string[] = [];
    if (!contractor.avatar) suggestions.push("Add a professional photo");
    if (!contractor.portfolio?.length) suggestions.push("Add portfolio projects");
    if (!contractor.certifications?.length) suggestions.push("Add certifications");
    if (!contractor.licenseNumber) suggestions.push("Add your license number");
    if (!contractor.insuranceAmount) suggestions.push("Add insurance information");
    if (!contractor.verifications?.some((v: any) => v.verified)) suggestions.push("Complete identity verification");

    return {
      contractorId: contractor.id,
      completionPercentage,
      missingFields,
      suggestions,
      lastChecked: new Date().toISOString(),
    };
  };

  const getProfileViewsForContractor = (contractorId: string) => {
    return analyticsData.profileViews.filter(
      (view) => view.contractorId === contractorId
    );
  };

  const getResponseRateForContractor = (contractorId: string) => {
    const metrics = analyticsData.responseMetrics.filter(
      (m) => m.contractorId === contractorId
    );
    if (metrics.length === 0) return 0;

    const responded = metrics.filter((m) => m.respondedAt).length;
    return Math.round((responded / metrics.length) * 100);
  };

  const getAverageResponseTime = (contractorId: string) => {
    const metrics = analyticsData.responseMetrics.filter(
      (m) => m.contractorId === contractorId && m.responseTime
    );
    if (metrics.length === 0) return 0;

    const totalTime = metrics.reduce((sum, m) => sum + (m.responseTime || 0), 0);
    return Math.round(totalTime / metrics.length);
  };

  const getConversionRateForContractor = (contractorId: string) => {
    const conversions = analyticsData.leadConversions.filter(
      (c) => c.contractorId === contractorId
    );
    const leads = analyticsData.responseMetrics.filter(
      (m) => m.contractorId === contractorId
    );

    if (leads.length === 0) return 0;

    const converted = conversions.filter((c) => c.convertedToProject).length;
    return Math.round((converted / leads.length) * 100);
  };

  return {
    analyticsData,
    isLoading,
    trackProfileView,
    trackLeadResponse,
    trackLeadReceived,
    trackLeadConversion,
    calculateProfileCompletion,
    getProfileViewsForContractor,
    getResponseRateForContractor,
    getAverageResponseTime,
    getConversionRateForContractor,
  };
});
