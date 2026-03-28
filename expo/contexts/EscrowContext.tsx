import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect, useCallback, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useAuth } from "./AuthContext";

export interface EscrowAccount {
  id: string;
  projectId: string;
  balance: number;
  totalDeposited: number;
  totalReleased: number;
  totalRefunded: number;
  createdAt: string;
  updatedAt: string;
}

export interface EscrowTransaction {
  id: string;
  escrowAccountId: string;
  projectId: string;
  type: "deposit" | "release" | "refund" | "hold";
  amount: number;
  fromUserId: string;
  fromUserName: string;
  toUserId?: string;
  toUserName?: string;
  paymentId?: string;
  milestoneId?: string;
  reason: string;
  status: "pending" | "completed" | "failed" | "cancelled";
  initiatedAt: string;
  completedAt?: string;
}

const ESCROW_STORAGE_KEY = "@escrow_accounts";
const TRANSACTIONS_STORAGE_KEY = "@escrow_transactions";

export const [EscrowContext, useEscrow] = createContextHook(() => {
  const { user } = useAuth();
  const [escrowAccounts, setEscrowAccounts] = useState<EscrowAccount[]>([]);
  const [transactions, setTransactions] = useState<EscrowTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [accountsData, transactionsData] = await Promise.all([
        AsyncStorage.getItem(ESCROW_STORAGE_KEY),
        AsyncStorage.getItem(TRANSACTIONS_STORAGE_KEY),
      ]);

      if (accountsData) setEscrowAccounts(JSON.parse(accountsData));
      if (transactionsData) setTransactions(JSON.parse(transactionsData));
    } catch (error) {
      console.error("Error loading escrow data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveAccounts = async (accounts: EscrowAccount[]) => {
    try {
      await AsyncStorage.setItem(ESCROW_STORAGE_KEY, JSON.stringify(accounts));
      setEscrowAccounts(accounts);
    } catch (error) {
      console.error("Error saving escrow accounts:", error);
    }
  };

  const saveTransactions = async (txs: EscrowTransaction[]) => {
    try {
      await AsyncStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(txs));
      setTransactions(txs);
    } catch (error) {
      console.error("Error saving transactions:", error);
    }
  };

  const createEscrowAccount = useCallback(
    (projectId: string) => {
      const newAccount: EscrowAccount = {
        id: Date.now().toString(),
        projectId,
        balance: 0,
        totalDeposited: 0,
        totalReleased: 0,
        totalRefunded: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updated = [...escrowAccounts, newAccount];
      saveAccounts(updated);
      return newAccount;
    },
    [escrowAccounts]
  );

  const depositToEscrow = useCallback(
    (projectId: string, amount: number, reason: string, paymentId?: string) => {
      if (!user) return;

      const account = escrowAccounts.find((a) => a.projectId === projectId);
      if (!account) return;

      const transaction: EscrowTransaction = {
        id: Date.now().toString(),
        escrowAccountId: account.id,
        projectId,
        type: "deposit",
        amount,
        fromUserId: user.id,
        fromUserName: user.name,
        paymentId,
        reason,
        status: "completed",
        initiatedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      };

      const updatedAccounts = escrowAccounts.map((a) =>
        a.id === account.id
          ? {
              ...a,
              balance: a.balance + amount,
              totalDeposited: a.totalDeposited + amount,
              updatedAt: new Date().toISOString(),
            }
          : a
      );

      saveAccounts(updatedAccounts);
      saveTransactions([...transactions, transaction]);
    },
    [user, escrowAccounts, transactions]
  );

  const releaseFromEscrow = useCallback(
    (
      projectId: string,
      amount: number,
      toUserId: string,
      toUserName: string,
      reason: string,
      milestoneId?: string
    ) => {
      if (!user) return;

      const account = escrowAccounts.find((a) => a.projectId === projectId);
      if (!account || account.balance < amount) return;

      const transaction: EscrowTransaction = {
        id: Date.now().toString(),
        escrowAccountId: account.id,
        projectId,
        type: "release",
        amount,
        fromUserId: user.id,
        fromUserName: user.name,
        toUserId,
        toUserName,
        milestoneId,
        reason,
        status: "completed",
        initiatedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      };

      const updatedAccounts = escrowAccounts.map((a) =>
        a.id === account.id
          ? {
              ...a,
              balance: a.balance - amount,
              totalReleased: a.totalReleased + amount,
              updatedAt: new Date().toISOString(),
            }
          : a
      );

      saveAccounts(updatedAccounts);
      saveTransactions([...transactions, transaction]);
    },
    [user, escrowAccounts, transactions]
  );

  const refundFromEscrow = useCallback(
    (projectId: string, amount: number, toUserId: string, toUserName: string, reason: string) => {
      if (!user) return;

      const account = escrowAccounts.find((a) => a.projectId === projectId);
      if (!account || account.balance < amount) return;

      const transaction: EscrowTransaction = {
        id: Date.now().toString(),
        escrowAccountId: account.id,
        projectId,
        type: "refund",
        amount,
        fromUserId: user.id,
        fromUserName: user.name,
        toUserId,
        toUserName,
        reason,
        status: "completed",
        initiatedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      };

      const updatedAccounts = escrowAccounts.map((a) =>
        a.id === account.id
          ? {
              ...a,
              balance: a.balance - amount,
              totalRefunded: a.totalRefunded + amount,
              updatedAt: new Date().toISOString(),
            }
          : a
      );

      saveAccounts(updatedAccounts);
      saveTransactions([...transactions, transaction]);
    },
    [user, escrowAccounts, transactions]
  );

  const getEscrowAccount = useCallback(
    (projectId: string) => {
      return escrowAccounts.find((a) => a.projectId === projectId);
    },
    [escrowAccounts]
  );

  const getTransactionsForProject = useCallback(
    (projectId: string) => {
      return transactions.filter((t) => t.projectId === projectId);
    },
    [transactions]
  );

  const getPendingTransactions = useCallback(() => {
    return transactions.filter((t) => t.status === "pending");
  }, [transactions]);

  const value = useMemo(
    () => ({
      escrowAccounts,
      transactions,
      isLoading,
      createEscrowAccount,
      depositToEscrow,
      releaseFromEscrow,
      refundFromEscrow,
      getEscrowAccount,
      getTransactionsForProject,
      getPendingTransactions,
    }),
    [
      escrowAccounts,
      transactions,
      isLoading,
      createEscrowAccount,
      depositToEscrow,
      releaseFromEscrow,
      refundFromEscrow,
      getEscrowAccount,
      getTransactionsForProject,
      getPendingTransactions,
    ]
  );

  return value;
});
