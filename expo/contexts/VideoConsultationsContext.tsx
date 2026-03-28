import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VideoConsultation } from '@/types';
import { useAuth } from './AuthContext';

const STORAGE_KEY = 'video_consultations';

export const [VideoConsultationsProvider, useVideoConsultations] = createContextHook(() => {
  const { user } = useAuth();
  const [consultations, setConsultations] = useState<VideoConsultation[]>([]);
  const [loading, setLoading] = useState(true);

  const loadConsultations = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const all = JSON.parse(stored);
        setConsultations(all);
      }
    } catch (error) {
      console.error('Failed to load video consultations:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadConsultations();
    }
  }, [user, loadConsultations]);

  const requestConsultation = useCallback(async (data: {
    contractorId: string;
    contractorName: string;
    scheduledDate: string;
    scheduledTime: string;
    duration: number;
    topic: string;
    notes?: string;
  }) => {
    if (!user) return;

    const newConsultation: VideoConsultation = {
      id: `vc_${Date.now()}`,
      requestedBy: user.id,
      requestedByName: user.name,
      contractorId: data.contractorId,
      contractorName: data.contractorName,
      scheduledDate: data.scheduledDate,
      scheduledTime: data.scheduledTime,
      duration: data.duration,
      topic: data.topic,
      notes: data.notes,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [...consultations, newConsultation];
    setConsultations(updated);

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save consultation request:', error);
    }

    return newConsultation;
  }, [user, consultations]);

  const updateConsultationStatus = useCallback(async (
    consultationId: string,
    status: VideoConsultation['status'],
    meetingUrl?: string
  ) => {
    const updated = consultations.map(c =>
      c.id === consultationId
        ? { ...c, status, meetingUrl, updatedAt: new Date().toISOString() }
        : c
    );
    setConsultations(updated);

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to update consultation status:', error);
    }
  }, [consultations]);

  const getConsultationsByContractor = useCallback((contractorId: string) => {
    return consultations.filter(c => c.contractorId === contractorId);
  }, [consultations]);

  const getMyConsultations = useCallback(() => {
    if (!user) return [];
    return consultations.filter(c => 
      c.requestedBy === user.id || c.contractorId === user.id
    );
  }, [consultations, user]);

  return useMemo(() => ({
    consultations,
    loading,
    requestConsultation,
    updateConsultationStatus,
    getConsultationsByContractor,
    getMyConsultations,
  }), [
    consultations,
    loading,
    requestConsultation,
    updateConsultationStatus,
    getConsultationsByContractor,
    getMyConsultations,
  ]);
});
