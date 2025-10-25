import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Appointment, EstimateRequest, JobNotification } from "@/types";
import { useAuth } from "./AuthContext";
import { useJobs } from "./JobsContext";

const STORAGE_KEYS = {
  APPOINTMENTS: "appointments",
  ESTIMATE_REQUESTS: "estimate_requests",
};

export const [AppointmentsProvider, useAppointments] = createContextHook(() => {
  const { user } = useAuth();
  const { getJobById, addNotification } = useJobs();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [estimateRequests, setEstimateRequests] = useState<EstimateRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [storedAppointments, storedRequests] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.APPOINTMENTS),
        AsyncStorage.getItem(STORAGE_KEYS.ESTIMATE_REQUESTS),
      ]);

      setAppointments(storedAppointments ? JSON.parse(storedAppointments) : []);
      setEstimateRequests(storedRequests ? JSON.parse(storedRequests) : []);
    } catch (error) {
      console.error("Failed to load appointments data:", error);
      setAppointments([]);
      setEstimateRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveAppointments = useCallback(async (updatedAppointments: Appointment[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(updatedAppointments));
      setAppointments(updatedAppointments);
    } catch (error) {
      console.error("Failed to save appointments:", error);
    }
  }, []);

  const saveEstimateRequests = useCallback(async (updatedRequests: EstimateRequest[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ESTIMATE_REQUESTS, JSON.stringify(updatedRequests));
      setEstimateRequests(updatedRequests);
    } catch (error) {
      console.error("Failed to save estimate requests:", error);
    }
  }, []);

  const requestEstimate = useCallback(async (data: {
    jobId: string;
    applicationId: string;
    requestedFrom: string;
    requestedFromName: string;
    location: string;
    description: string;
    preferredDate?: string;
    preferredTime?: string;
  }) => {
    if (!user) return null;

    const job = getJobById(data.jobId);
    if (!job) return null;

    const newRequest: EstimateRequest = {
      id: `est-req-${Date.now()}`,
      jobId: data.jobId,
      applicationId: data.applicationId,
      requestedBy: user.id,
      requestedByName: user.name,
      requestedFrom: data.requestedFrom,
      requestedFromName: data.requestedFromName,
      location: data.location,
      description: data.description,
      preferredDate: data.preferredDate,
      preferredTime: data.preferredTime,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedRequests = [...estimateRequests, newRequest];
    await saveEstimateRequests(updatedRequests);

    const notification: JobNotification = {
      id: `notif-${Date.now()}`,
      userId: data.requestedFrom,
      jobId: data.jobId,
      applicationId: data.applicationId,
      type: "estimate_requested",
      title: "Estimate Request",
      message: `${user.name} requested an estimate for ${job.title}`,
      read: false,
      createdAt: new Date().toISOString(),
    };
    await addNotification(notification);

    return newRequest;
  }, [estimateRequests, getJobById, saveEstimateRequests, user, addNotification]);

  const confirmEstimate = useCallback(async (
    requestId: string,
    appointmentData: {
      date: string;
      time: string;
      notes?: string;
    }
  ) => {
    if (!user) return null;

    const request = estimateRequests.find(r => r.id === requestId);
    if (!request) return null;

    const job = getJobById(request.jobId);
    if (!job) return null;

    const newAppointment: Appointment = {
      id: `appt-${Date.now()}`,
      title: `Estimate: ${job.title}`,
      contractorId: request.requestedFrom,
      contractorName: request.requestedFromName,
      contractorCompany: request.requestedFromName,
      date: appointmentData.date,
      time: appointmentData.time,
      type: "estimate",
      location: request.location,
      status: "scheduled",
      notes: appointmentData.notes || request.description,
      jobId: request.jobId,
      applicationId: request.applicationId,
      createdBy: user.id,
      createdByName: user.name,
      requestedBy: request.requestedBy,
      confirmedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedAppointments = [...appointments, newAppointment];
    await saveAppointments(updatedAppointments);

    const updatedRequests = estimateRequests.map(r =>
      r.id === requestId
        ? {
            ...r,
            status: "confirmed" as const,
            appointmentId: newAppointment.id,
            updatedAt: new Date().toISOString(),
          }
        : r
    );
    await saveEstimateRequests(updatedRequests);

    const notification: JobNotification = {
      id: `notif-${Date.now()}`,
      userId: request.requestedBy,
      jobId: request.jobId,
      applicationId: request.applicationId,
      appointmentId: newAppointment.id,
      type: "estimate_confirmed",
      title: "Estimate Confirmed",
      message: `${request.requestedFromName} confirmed estimate for ${job.title} on ${new Date(appointmentData.date).toLocaleDateString()} at ${appointmentData.time}`,
      read: false,
      createdAt: new Date().toISOString(),
    };
    await addNotification(notification);

    return newAppointment;
  }, [appointments, estimateRequests, getJobById, saveAppointments, saveEstimateRequests, user, addNotification]);

  const createAppointment = useCallback(async (appointmentData: {
    title: string;
    contractorId: string;
    contractorName: string;
    contractorCompany: string;
    date: string;
    time: string;
    type: "estimate" | "site_visit" | "meeting";
    location: string;
    notes?: string;
    jobId?: string;
    applicationId?: string;
  }) => {
    if (!user) return null;

    const newAppointment: Appointment = {
      ...appointmentData,
      id: `appt-${Date.now()}`,
      status: "scheduled",
      createdBy: user.id,
      createdByName: user.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedAppointments = [...appointments, newAppointment];
    await saveAppointments(updatedAppointments);

    if (appointmentData.jobId) {
      const job = getJobById(appointmentData.jobId);
      if (job) {
        const notification: JobNotification = {
          id: `notif-${Date.now()}`,
          userId: appointmentData.contractorId,
          jobId: appointmentData.jobId,
          applicationId: appointmentData.applicationId,
          appointmentId: newAppointment.id,
          type: "estimate_requested",
          title: `New ${appointmentData.type.replace('_', ' ')} Scheduled`,
          message: `${user.name} scheduled a ${appointmentData.type.replace('_', ' ')} for ${job.title}`,
          read: false,
          createdAt: new Date().toISOString(),
        };
        await addNotification(notification);
      }
    }

    return newAppointment;
  }, [appointments, getJobById, saveAppointments, user, addNotification]);

  const updateAppointment = useCallback(async (
    appointmentId: string,
    updates: Partial<Appointment>
  ) => {
    const updatedAppointments = appointments.map(appt =>
      appt.id === appointmentId
        ? { ...appt, ...updates, updatedAt: new Date().toISOString() }
        : appt
    );
    await saveAppointments(updatedAppointments);

    const appointment = updatedAppointments.find(a => a.id === appointmentId);
    if (appointment && updates.status === "completed" && appointment.jobId) {
      const job = getJobById(appointment.jobId);
      if (job && appointment.requestedBy) {
        const notification: JobNotification = {
          id: `notif-${Date.now()}`,
          userId: appointment.requestedBy,
          jobId: appointment.jobId,
          applicationId: appointment.applicationId,
          appointmentId,
          type: "estimate_completed",
          title: "Estimate Completed",
          message: `${appointment.contractorName} completed the estimate for ${job.title}`,
          read: false,
          createdAt: new Date().toISOString(),
        };
        await addNotification(notification);
      }
    }
  }, [appointments, getJobById, saveAppointments, addNotification]);

  const deleteAppointment = useCallback(async (appointmentId: string) => {
    const updatedAppointments = appointments.filter(appt => appt.id !== appointmentId);
    await saveAppointments(updatedAppointments);
  }, [appointments, saveAppointments]);

  const getAppointmentsByUserId = useCallback((userId: string) => {
    return appointments.filter(
      appt => appt.createdBy === userId || appt.contractorId === userId
    );
  }, [appointments]);

  const getAppointmentsByJobId = useCallback((jobId: string) => {
    return appointments.filter(appt => appt.jobId === jobId);
  }, [appointments]);

  const getEstimateRequestsByUserId = useCallback((userId: string) => {
    return estimateRequests.filter(
      req => req.requestedBy === userId || req.requestedFrom === userId
    );
  }, [estimateRequests]);

  const getUpcomingAppointments = useCallback(() => {
    if (!user) return [];
    const now = new Date();
    return appointments
      .filter(appt => 
        (appt.createdBy === user.id || appt.contractorId === user.id) &&
        appt.status === "scheduled" &&
        new Date(appt.date) >= now
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [appointments, user]);

  const getPendingEstimateRequests = useCallback(() => {
    if (!user) return [];
    return estimateRequests.filter(
      req => req.requestedFrom === user.id && req.status === "pending"
    );
  }, [estimateRequests, user]);

  return useMemo(() => ({
    appointments,
    estimateRequests,
    isLoading,
    requestEstimate,
    confirmEstimate,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    getAppointmentsByUserId,
    getAppointmentsByJobId,
    getEstimateRequestsByUserId,
    getUpcomingAppointments,
    getPendingEstimateRequests,
  }), [
    appointments,
    estimateRequests,
    isLoading,
    requestEstimate,
    confirmEstimate,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    getAppointmentsByUserId,
    getAppointmentsByJobId,
    getEstimateRequestsByUserId,
    getUpcomingAppointments,
    getPendingEstimateRequests,
  ]);
});
