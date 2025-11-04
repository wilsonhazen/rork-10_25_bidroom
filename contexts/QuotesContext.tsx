import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Quote, QuoteLineItem } from '@/types';
import { useAuth } from './AuthContext';

const STORAGE_KEY = 'quotes';

export const [QuotesProvider, useQuotes] = createContextHook(() => {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  const loadQuotes = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const all = JSON.parse(stored);
        setQuotes(all);
      }
    } catch (error) {
      console.error('Failed to load quotes:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadQuotes();
    }
  }, [user, loadQuotes]);

  const createQuote = useCallback(async (data: {
    receiverId: string;
    jobId?: string;
    title: string;
    description: string;
    lineItems: Omit<QuoteLineItem, 'id' | 'total'>[];
    tax: number;
    validUntil: string;
  }) => {
    if (!user) return;

    const lineItems: QuoteLineItem[] = data.lineItems.map((item, idx) => ({
      id: `line_${Date.now()}_${idx}`,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.quantity * item.unitPrice,
    }));

    const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
    const total = subtotal + data.tax;

    const newQuote: Quote = {
      id: `quote_${Date.now()}`,
      senderId: user.id,
      senderName: user.name,
      receiverId: data.receiverId,
      jobId: data.jobId,
      title: data.title,
      description: data.description,
      lineItems,
      subtotal,
      tax: data.tax,
      total,
      validUntil: data.validUntil,
      status: 'sent',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [...quotes, newQuote];
    setQuotes(updated);

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save quote:', error);
    }

    return newQuote;
  }, [user, quotes]);

  const updateQuoteStatus = useCallback(async (
    quoteId: string,
    status: Quote['status']
  ) => {
    const updated = quotes.map(q =>
      q.id === quoteId
        ? { ...q, status, updatedAt: new Date().toISOString() }
        : q
    );
    setQuotes(updated);

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to update quote status:', error);
    }
  }, [quotes]);

  const getQuoteById = useCallback((quoteId: string) => {
    return quotes.find(q => q.id === quoteId);
  }, [quotes]);

  const getQuotesByJob = useCallback((jobId: string) => {
    return quotes.filter(q => q.jobId === jobId);
  }, [quotes]);

  const getSentQuotes = useCallback(() => {
    if (!user) return [];
    return quotes.filter(q => q.senderId === user.id);
  }, [quotes, user]);

  const getReceivedQuotes = useCallback(() => {
    if (!user) return [];
    return quotes.filter(q => q.receiverId === user.id);
  }, [quotes, user]);

  return useMemo(() => ({
    quotes,
    loading,
    createQuote,
    updateQuoteStatus,
    getQuoteById,
    getQuotesByJob,
    getSentQuotes,
    getReceivedQuotes,
  }), [
    quotes,
    loading,
    createQuote,
    updateQuoteStatus,
    getQuoteById,
    getQuotesByJob,
    getSentQuotes,
    getReceivedQuotes,
  ]);
});
