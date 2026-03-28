import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Bid, BidSubmission } from "@/types";
import { useAuth } from "./AuthContext";

const STORAGE_KEYS = {
  BIDS: "bids",
  BID_SUBMISSIONS: "bid_submissions",
};

const MOCK_BIDS: Bid[] = [
  {
    id: "bid-1",
    projectName: "Downtown Office Renovation",
    description: "Complete renovation of 10,000 sq ft office space including electrical, plumbing, and HVAC upgrades.",
    dueDate: "2025-11-15",
    status: "pending",
    budget: "$250,000 - $300,000",
    contractorCount: 5,
    submittedCount: 2,
    createdAt: "2025-10-01T10:00:00.000Z",
  },
  {
    id: "bid-2",
    projectName: "Residential Complex Wiring",
    description: "Electrical installation for new 50-unit residential complex with smart home integration.",
    dueDate: "2025-11-01",
    status: "submitted",
    budget: "$180,000",
    contractorCount: 8,
    submittedCount: 6,
    createdAt: "2025-09-15T14:00:00.000Z",
  },
  {
    id: "bid-3",
    projectName: "Hospital Wing Expansion",
    description: "Medical grade electrical systems for new hospital wing including backup power systems.",
    dueDate: "2025-10-25",
    status: "awarded",
    budget: "$500,000",
    contractorCount: 12,
    submittedCount: 10,
    createdAt: "2025-09-01T09:00:00.000Z",
  },
];

const MOCK_BID_SUBMISSIONS: BidSubmission[] = [
  {
    id: "sub-1",
    bidId: "bid-1",
    contractorId: "1",
    contractorName: "John Smith",
    contractorCompany: "Premier Electric Solutions",
    amount: 275000,
    notes: "We can complete this project within 8 weeks with our experienced team. Includes all materials and labor.",
    submittedAt: "2025-10-05T10:00:00.000Z",
    documents: ["proposal.pdf", "insurance-cert.pdf"],
  },
  {
    id: "sub-2",
    bidId: "bid-1",
    contractorId: "2",
    contractorName: "Mike Johnson",
    contractorCompany: "Voltage Masters Inc",
    amount: 265000,
    notes: "Competitive pricing with 10-year warranty on all work. Can start immediately.",
    submittedAt: "2025-10-06T14:30:00.000Z",
    documents: ["quote.pdf"],
  },
];

export const [BidsProvider, useBids] = createContextHook(() => {
  const { user } = useAuth();
  const [bids, setBids] = useState<Bid[]>([]);
  const [bidSubmissions, setBidSubmissions] = useState<BidSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [storedBids, storedSubmissions] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.BIDS),
        AsyncStorage.getItem(STORAGE_KEYS.BID_SUBMISSIONS),
      ]);

      setBids(storedBids ? JSON.parse(storedBids) : MOCK_BIDS);
      setBidSubmissions(storedSubmissions ? JSON.parse(storedSubmissions) : MOCK_BID_SUBMISSIONS);
    } catch (error) {
      console.error("Failed to load bids data:", error);
      setBids(MOCK_BIDS);
      setBidSubmissions(MOCK_BID_SUBMISSIONS);
    } finally {
      setIsLoading(false);
    }
  };

  const saveBids = useCallback(async (updatedBids: Bid[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.BIDS, JSON.stringify(updatedBids));
      setBids(updatedBids);
    } catch (error) {
      console.error("Failed to save bids:", error);
    }
  }, []);

  const saveBidSubmissions = useCallback(async (updatedSubmissions: BidSubmission[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.BID_SUBMISSIONS, JSON.stringify(updatedSubmissions));
      setBidSubmissions(updatedSubmissions);
    } catch (error) {
      console.error("Failed to save bid submissions:", error);
    }
  }, []);

  const createBid = useCallback(async (bidData: Omit<Bid, "id" | "createdAt" | "submittedCount">) => {
    if (!user) return null;

    const newBid: Bid = {
      ...bidData,
      id: `bid-${Date.now()}`,
      createdAt: new Date().toISOString(),
      submittedCount: 0,
    };

    const updatedBids = [...bids, newBid];
    await saveBids(updatedBids);

    return newBid;
  }, [bids, saveBids, user]);

  const updateBid = useCallback(async (bidId: string, updates: Partial<Bid>) => {
    const updatedBids = bids.map(bid =>
      bid.id === bidId ? { ...bid, ...updates } : bid
    );
    await saveBids(updatedBids);
  }, [bids, saveBids]);

  const deleteBid = useCallback(async (bidId: string) => {
    const updatedBids = bids.filter(bid => bid.id !== bidId);
    await saveBids(updatedBids);

    const updatedSubmissions = bidSubmissions.filter(sub => sub.bidId !== bidId);
    await saveBidSubmissions(updatedSubmissions);
  }, [bids, bidSubmissions, saveBids, saveBidSubmissions]);

  const submitBid = useCallback(async (
    bidId: string,
    submissionData: {
      amount: number;
      notes: string;
      documents?: string[];
    }
  ) => {
    if (!user) return null;

    const bid = bids.find(b => b.id === bidId);
    if (!bid) return null;

    const existingSubmission = bidSubmissions.find(
      sub => sub.bidId === bidId && sub.contractorId === user.id
    );
    if (existingSubmission) {
      return null;
    }

    const newSubmission: BidSubmission = {
      id: `sub-${Date.now()}`,
      bidId,
      contractorId: user.id,
      contractorName: user.name,
      contractorCompany: user.company,
      amount: submissionData.amount,
      notes: submissionData.notes,
      submittedAt: new Date().toISOString(),
      documents: submissionData.documents || [],
    };

    const updatedSubmissions = [...bidSubmissions, newSubmission];
    await saveBidSubmissions(updatedSubmissions);

    const updatedBids = bids.map(b =>
      b.id === bidId
        ? { ...b, submittedCount: b.submittedCount + 1, status: "submitted" as const }
        : b
    );
    await saveBids(updatedBids);

    return newSubmission;
  }, [bids, bidSubmissions, saveBids, saveBidSubmissions, user]);

  const awardBid = useCallback(async (bidId: string, submissionId: string) => {
    const updatedBids = bids.map(bid =>
      bid.id === bidId ? { ...bid, status: "awarded" as const } : bid
    );
    await saveBids(updatedBids);
  }, [bids, saveBids]);

  const declineBid = useCallback(async (bidId: string) => {
    const updatedBids = bids.map(bid =>
      bid.id === bidId ? { ...bid, status: "declined" as const } : bid
    );
    await saveBids(updatedBids);
  }, [bids, saveBids]);

  const getBidById = useCallback((bidId: string) => {
    return bids.find(bid => bid.id === bidId);
  }, [bids]);

  const getSubmissionsByBidId = useCallback((bidId: string) => {
    return bidSubmissions.filter(sub => sub.bidId === bidId);
  }, [bidSubmissions]);

  const getSubmissionsByUserId = useCallback((userId: string) => {
    return bidSubmissions.filter(sub => sub.contractorId === userId);
  }, [bidSubmissions]);

  const hasUserSubmitted = useCallback((bidId: string, userId: string) => {
    return bidSubmissions.some(sub => sub.bidId === bidId && sub.contractorId === userId);
  }, [bidSubmissions]);

  return useMemo(() => ({
    bids,
    bidSubmissions,
    isLoading,
    createBid,
    updateBid,
    deleteBid,
    submitBid,
    awardBid,
    declineBid,
    getBidById,
    getSubmissionsByBidId,
    getSubmissionsByUserId,
    hasUserSubmitted,
  }), [
    bids,
    bidSubmissions,
    isLoading,
    createBid,
    updateBid,
    deleteBid,
    submitBid,
    awardBid,
    declineBid,
    getBidById,
    getSubmissionsByBidId,
    getSubmissionsByUserId,
    hasUserSubmitted,
  ]);
});
