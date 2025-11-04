import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SavedContractor } from '@/types';
import { useAuth } from './AuthContext';

const STORAGE_KEY = 'saved_contractors';

export const [SavedContractorsProvider, useSavedContractors] = createContextHook(() => {
  const { user } = useAuth();
  const [savedContractors, setSavedContractors] = useState<SavedContractor[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSavedContractors = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const all = JSON.parse(stored);
        const userSaved = all.filter((s: SavedContractor) => s.userId === user?.id);
        setSavedContractors(userSaved);
      }
    } catch (error) {
      console.error('Failed to load saved contractors:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadSavedContractors();
    }
  }, [user, loadSavedContractors]);

  const saveContractor = useCallback(async (contractorId: string, notes?: string) => {
    if (!user) return;

    const newSaved: SavedContractor = {
      id: `${user.id}_${contractorId}_${Date.now()}`,
      userId: user.id,
      contractorId,
      savedAt: new Date().toISOString(),
      notes,
    };

    const updated = [...savedContractors, newSaved];
    setSavedContractors(updated);

    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const all = stored ? JSON.parse(stored) : [];
      const filtered = all.filter((s: SavedContractor) => s.userId !== user.id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...filtered, ...updated]));
    } catch (error) {
      console.error('Failed to save contractor:', error);
    }
  }, [user, savedContractors]);

  const unsaveContractor = useCallback(async (contractorId: string) => {
    if (!user) return;

    const updated = savedContractors.filter((s) => s.contractorId !== contractorId);
    setSavedContractors(updated);

    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const all = stored ? JSON.parse(stored) : [];
      const filtered = all.filter(
        (s: SavedContractor) => !(s.userId === user.id && s.contractorId === contractorId)
      );
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to unsave contractor:', error);
    }
  }, [user, savedContractors]);

  const isSaved = useCallback((contractorId: string): boolean => {
    return savedContractors.some((s) => s.contractorId === contractorId);
  }, [savedContractors]);

  return useMemo(() => ({
    savedContractors,
    loading,
    saveContractor,
    unsaveContractor,
    isSaved,
  }), [savedContractors, loading, saveContractor, unsaveContractor, isSaved]);
});
