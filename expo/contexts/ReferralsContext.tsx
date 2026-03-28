import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect, useCallback, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "./AuthContext";

export interface Referral {
  id: string;
  referrerId: string;
  referrerName: string;
  referredId?: string;
  referredName?: string;
  referredEmail?: string;
  referredPhone?: string;
  status: "pending" | "signed_up" | "converted" | "expired";
  referralCode: string;
  sentAt: string;
  signedUpAt?: string;
  convertedAt?: string;
  rewardAmount?: number;
  rewardPaid: boolean;
  expiresAt: string;
}

export interface ReferralReward {
  id: string;
  userId: string;
  referralId: string;
  amount: number;
  type: "signup" | "first_project" | "milestone";
  status: "pending" | "paid" | "cancelled";
  earnedAt: string;
  paidAt?: string;
}

export interface ReferralStats {
  totalReferrals: number;
  pendingReferrals: number;
  signedUpReferrals: number;
  convertedReferrals: number;
  totalEarned: number;
  pendingRewards: number;
  paidRewards: number;
}

const REFERRALS_KEY = "@referrals";
const REWARDS_KEY = "@referral_rewards";

export const [ReferralsContext, useReferrals] = createContextHook(() => {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [rewards, setRewards] = useState<ReferralReward[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [referralsData, rewardsData] = await Promise.all([
        AsyncStorage.getItem(REFERRALS_KEY),
        AsyncStorage.getItem(REWARDS_KEY),
      ]);

      if (referralsData) setReferrals(JSON.parse(referralsData));
      if (rewardsData) setRewards(JSON.parse(rewardsData));
    } catch (error) {
      console.error("Error loading referral data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveReferrals = async (data: Referral[]) => {
    try {
      await AsyncStorage.setItem(REFERRALS_KEY, JSON.stringify(data));
      setReferrals(data);
    } catch (error) {
      console.error("Error saving referrals:", error);
    }
  };

  const saveRewards = async (data: ReferralReward[]) => {
    try {
      await AsyncStorage.setItem(REWARDS_KEY, JSON.stringify(data));
      setRewards(data);
    } catch (error) {
      console.error("Error saving rewards:", error);
    }
  };

  const generateReferralCode = (userId: string): string => {
    const prefix = "REF";
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${random}`;
  };

  const createReferral = useCallback(
    (contactEmail?: string, contactPhone?: string) => {
      if (!user) return;

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 90);

      const newReferral: Referral = {
        id: Date.now().toString(),
        referrerId: user.id,
        referrerName: user.name,
        referredEmail: contactEmail,
        referredPhone: contactPhone,
        status: "pending",
        referralCode: generateReferralCode(user.id),
        sentAt: new Date().toISOString(),
        rewardPaid: false,
        expiresAt: expiresAt.toISOString(),
      };

      saveReferrals([...referrals, newReferral]);
      return newReferral;
    },
    [user, referrals]
  );

  const markReferralSignedUp = useCallback(
    (referralCode: string, newUserId: string, newUserName: string) => {
      const updated = referrals.map((ref) =>
        ref.referralCode === referralCode
          ? {
              ...ref,
              referredId: newUserId,
              referredName: newUserName,
              status: "signed_up" as const,
              signedUpAt: new Date().toISOString(),
            }
          : ref
      );
      saveReferrals(updated);

      const referral = updated.find((r) => r.referralCode === referralCode);
      if (referral) {
        const reward: ReferralReward = {
          id: Date.now().toString(),
          userId: referral.referrerId,
          referralId: referral.id,
          amount: 25,
          type: "signup",
          status: "pending",
          earnedAt: new Date().toISOString(),
        };
        saveRewards([...rewards, reward]);
      }
    },
    [referrals, rewards]
  );

  const markReferralConverted = useCallback(
    (referralId: string, projectValue: number) => {
      const updated = referrals.map((ref) =>
        ref.id === referralId
          ? {
              ...ref,
              status: "converted" as const,
              convertedAt: new Date().toISOString(),
              rewardAmount: (ref.rewardAmount || 0) + projectValue * 0.05,
            }
          : ref
      );
      saveReferrals(updated);

      const referral = updated.find((r) => r.id === referralId);
      if (referral) {
        const reward: ReferralReward = {
          id: Date.now().toString(),
          userId: referral.referrerId,
          referralId: referral.id,
          amount: projectValue * 0.05,
          type: "first_project",
          status: "pending",
          earnedAt: new Date().toISOString(),
        };
        saveRewards([...rewards, reward]);
      }
    },
    [referrals, rewards]
  );

  const payoutReward = useCallback(
    (rewardId: string) => {
      const updated = rewards.map((reward) =>
        reward.id === rewardId
          ? {
              ...reward,
              status: "paid" as const,
              paidAt: new Date().toISOString(),
            }
          : reward
      );
      saveRewards(updated);
    },
    [rewards]
  );

  const getReferralsByUser = useCallback(
    (userId: string) => {
      return referrals.filter((r) => r.referrerId === userId);
    },
    [referrals]
  );

  const getRewardsByUser = useCallback(
    (userId: string) => {
      return rewards.filter((r) => r.userId === userId);
    },
    [rewards]
  );

  const getReferralStats = useCallback(
    (userId: string): ReferralStats => {
      const userReferrals = getReferralsByUser(userId);
      const userRewards = getRewardsByUser(userId);

      return {
        totalReferrals: userReferrals.length,
        pendingReferrals: userReferrals.filter((r) => r.status === "pending").length,
        signedUpReferrals: userReferrals.filter((r) => r.status === "signed_up").length,
        convertedReferrals: userReferrals.filter((r) => r.status === "converted").length,
        totalEarned: userRewards.reduce((sum, r) => sum + r.amount, 0),
        pendingRewards: userRewards
          .filter((r) => r.status === "pending")
          .reduce((sum, r) => sum + r.amount, 0),
        paidRewards: userRewards
          .filter((r) => r.status === "paid")
          .reduce((sum, r) => sum + r.amount, 0),
      };
    },
    [getReferralsByUser, getRewardsByUser]
  );

  const value = useMemo(
    () => ({
      referrals,
      rewards,
      isLoading,
      createReferral,
      markReferralSignedUp,
      markReferralConverted,
      payoutReward,
      getReferralsByUser,
      getRewardsByUser,
      getReferralStats,
    }),
    [
      referrals,
      rewards,
      isLoading,
      createReferral,
      markReferralSignedUp,
      markReferralConverted,
      payoutReward,
      getReferralsByUser,
      getRewardsByUser,
      getReferralStats,
    ]
  );

  return value;
});
