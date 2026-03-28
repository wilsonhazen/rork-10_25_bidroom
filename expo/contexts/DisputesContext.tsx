import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect, useCallback, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Dispute, DisputeType, DisputeStatus } from "@/types";
import { useAuth } from "./AuthContext";

const STORAGE_KEY = "@disputes";

export const [DisputesContext, useDisputes] = createContextHook(() => {
  const { user } = useAuth();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDisputes();
  }, []);

  const loadDisputes = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setDisputes(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error loading disputes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveDisputes = async (updatedDisputes: Dispute[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDisputes));
      setDisputes(updatedDisputes);
    } catch (error) {
      console.error("Error saving disputes:", error);
    }
  };

  const fileDispute = useCallback(
    (
      projectId: string,
      disputeType: DisputeType,
      description: string,
      evidence: { photos: string[]; documents: string[]; messages: string[] },
      amountDisputed?: number,
      desiredResolution?: string,
      milestoneId?: string
    ) => {
      if (!user) return;

      const newDispute: Dispute = {
        id: Date.now().toString(),
        projectId,
        milestoneId,
        filedBy: user.id,
        filedByName: user.name,
        disputeType,
        description,
        evidence,
        amountDisputed,
        desiredResolution: desiredResolution || "",
        status: "filed",
        resolutionStage: "internal",
        createdAt: new Date().toISOString(),
      };

      const updated = [...disputes, newDispute];
      saveDisputes(updated);
    },
    [user, disputes]
  );

  const updateDisputeStatus = useCallback(
    (disputeId: string, status: DisputeStatus, resolution?: string) => {
      const updated = disputes.map((dispute) =>
        dispute.id === disputeId
          ? {
              ...dispute,
              status,
              resolution,
              resolvedAt: status === "resolved" ? new Date().toISOString() : dispute.resolvedAt,
            }
          : dispute
      );
      saveDisputes(updated);
    },
    [disputes]
  );

  const escalateDispute = useCallback(
    (disputeId: string, stage: Dispute["resolutionStage"]) => {
      const updated = disputes.map((dispute) =>
        dispute.id === disputeId ? { ...dispute, resolutionStage: stage } : dispute
      );
      saveDisputes(updated);
    },
    [disputes]
  );

  const assignAdmin = useCallback(
    (disputeId: string, adminId: string) => {
      const updated = disputes.map((dispute) =>
        dispute.id === disputeId
          ? { ...dispute, adminAssigned: adminId, status: "under_review" as DisputeStatus }
          : dispute
      );
      saveDisputes(updated);
    },
    [disputes]
  );

  const getDisputesForProject = useCallback(
    (projectId: string) => {
      return disputes.filter((d) => d.projectId === projectId);
    },
    [disputes]
  );

  const getDisputesFiledByUser = useCallback(
    (userId: string) => {
      return disputes.filter((d) => d.filedBy === userId);
    },
    [disputes]
  );

  const getActiveDisputes = useCallback(() => {
    return disputes.filter((d) => d.status !== "resolved" && d.status !== "closed");
  }, [disputes]);

  const value = useMemo(
    () => ({
      disputes,
      isLoading,
      fileDispute,
      updateDisputeStatus,
      escalateDispute,
      assignAdmin,
      getDisputesForProject,
      getDisputesFiledByUser,
      getActiveDisputes,
    }),
    [
      disputes,
      isLoading,
      fileDispute,
      updateDisputeStatus,
      escalateDispute,
      assignAdmin,
      getDisputesForProject,
      getDisputesFiledByUser,
      getActiveDisputes,
    ]
  );

  return value;
});
