import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Job,
  JobApplication,
  JobMessage,
  JobNotification,
  ApplicationStatus,
} from "@/types";
import { MOCK_JOBS, MOCK_APPLICATIONS, MOCK_NOTIFICATIONS } from "@/mocks/jobs-data";
import { useAuth } from "./AuthContext";

const STORAGE_KEYS = {
  JOBS: "jobs",
  APPLICATIONS: "applications",
  MESSAGES: "messages",
  NOTIFICATIONS: "notifications",
};

export const [JobsProvider, useJobs] = createContextHook(() => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [messages, setMessages] = useState<JobMessage[]>([]);
  const [notifications, setNotifications] = useState<JobNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [storedJobs, storedApplications, storedMessages, storedNotifications] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.JOBS),
        AsyncStorage.getItem(STORAGE_KEYS.APPLICATIONS),
        AsyncStorage.getItem(STORAGE_KEYS.MESSAGES),
        AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS),
      ]);

      setJobs(storedJobs ? JSON.parse(storedJobs) : MOCK_JOBS);
      setApplications(storedApplications ? JSON.parse(storedApplications) : MOCK_APPLICATIONS);
      setMessages(storedMessages ? JSON.parse(storedMessages) : []);
      setNotifications(storedNotifications ? JSON.parse(storedNotifications) : MOCK_NOTIFICATIONS);
    } catch (error) {
      console.error("Failed to load jobs data:", error);
      setJobs(MOCK_JOBS);
      setApplications(MOCK_APPLICATIONS);
      setMessages([]);
      setNotifications(MOCK_NOTIFICATIONS);
    } finally {
      setIsLoading(false);
    }
  };

  const saveJobs = useCallback(async (updatedJobs: Job[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(updatedJobs));
      setJobs(updatedJobs);
    } catch (error) {
      console.error("Failed to save jobs:", error);
    }
  }, []);

  const saveApplications = useCallback(async (updatedApplications: JobApplication[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(updatedApplications));
      setApplications(updatedApplications);
    } catch (error) {
      console.error("Failed to save applications:", error);
    }
  }, []);

  const saveMessages = useCallback(async (updatedMessages: JobMessage[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(updatedMessages));
      setMessages(updatedMessages);
    } catch (error) {
      console.error("Failed to save messages:", error);
    }
  }, []);

  const saveNotifications = useCallback(async (updatedNotifications: JobNotification[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updatedNotifications));
      setNotifications(updatedNotifications);
    } catch (error) {
      console.error("Failed to save notifications:", error);
    }
  }, []);

  const createJob = useCallback(async (jobData: Omit<Job, "id" | "createdAt" | "updatedAt" | "applicationsCount">) => {
    if (!user) return null;

    const newJob: Job = {
      ...jobData,
      id: `job-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      applicationsCount: 0,
    };

    const updatedJobs = [...jobs, newJob];
    await saveJobs(updatedJobs);

    return newJob;
  }, [jobs, saveJobs, user]);

  const updateJob = useCallback(async (jobId: string, updates: Partial<Job>) => {
    const updatedJobs = jobs.map(job =>
      job.id === jobId
        ? { ...job, ...updates, updatedAt: new Date().toISOString() }
        : job
    );
    await saveJobs(updatedJobs);
  }, [jobs, saveJobs]);

  const deleteJob = useCallback(async (jobId: string) => {
    const updatedJobs = jobs.filter(job => job.id !== jobId);
    await saveJobs(updatedJobs);
  }, [jobs, saveJobs]);

  const addNotification = useCallback(async (notification: JobNotification) => {
    const updatedNotifications = [...notifications, notification];
    await saveNotifications(updatedNotifications);
  }, [notifications, saveNotifications]);

  const applyToJob = useCallback(async (
    jobId: string,
    applicationData: {
      coverLetter: string;
      proposedRate?: string;
      availableFrom: string;
    }
  ) => {
    if (!user) return null;

    const job = jobs.find(j => j.id === jobId);
    if (!job) return null;

    const newApplication: JobApplication = {
      id: `app-${Date.now()}`,
      jobId,
      applicantId: user.id,
      applicantName: user.name,
      applicantCompany: user.company,
      applicantRole: user.role,
      applicantPhone: user.phone,
      applicantEmail: user.email,
      coverLetter: applicationData.coverLetter,
      proposedRate: applicationData.proposedRate,
      availableFrom: applicationData.availableFrom,
      status: "pending",
      appliedAt: new Date().toISOString(),
    };

    const updatedApplications = [...applications, newApplication];
    await saveApplications(updatedApplications);

    const updatedJobs = jobs.map(j =>
      j.id === jobId
        ? { ...j, applicationsCount: j.applicationsCount + 1 }
        : j
    );
    await saveJobs(updatedJobs);

    const notification: JobNotification = {
      id: `notif-${Date.now()}`,
      userId: job.postedBy,
      jobId,
      applicationId: newApplication.id,
      type: "new_application",
      title: "New Application Received",
      message: `${user.name} applied to ${job.title}`,
      read: false,
      createdAt: new Date().toISOString(),
    };
    await addNotification(notification);

    return newApplication;
  }, [addNotification, applications, jobs, saveApplications, saveJobs, user]);

  const updateApplicationStatus = useCallback(async (
    applicationId: string,
    status: ApplicationStatus,
    responseNote?: string
  ) => {
    const application = applications.find(a => a.id === applicationId);
    if (!application) return;

    const updatedApplications = applications.map(app =>
      app.id === applicationId
        ? {
            ...app,
            status,
            respondedAt: new Date().toISOString(),
            responseNote,
          }
        : app
    );
    await saveApplications(updatedApplications);

    if (status === "accepted" || status === "rejected") {
      const job = jobs.find(j => j.id === application.jobId);
      if (job) {
        const notification: JobNotification = {
          id: `notif-${Date.now()}`,
          userId: application.applicantId,
          jobId: application.jobId,
          applicationId,
          type: status === "accepted" ? "application_accepted" : "application_rejected",
          title: status === "accepted" ? "Application Accepted!" : "Application Update",
          message: status === "accepted"
            ? `Your application for ${job.title} has been accepted`
            : `Your application for ${job.title} has been reviewed`,
          read: false,
          createdAt: new Date().toISOString(),
        };
        await addNotification(notification);
      }
    }
  }, [addNotification, applications, jobs, saveApplications]);

  const sendMessage = useCallback(async (
    jobId: string,
    receiverId: string,
    message: string,
    applicationId?: string
  ) => {
    if (!user) return null;
    
    const newMessage: JobMessage = {
      id: `msg-${Date.now()}`,
      jobId,
      applicationId,
      senderId: user.id,
      senderName: user.name,
      receiverId,
      message,
      sentAt: new Date().toISOString(),
      read: false,
    };

    const updatedMessages = [...messages, newMessage];
    await saveMessages(updatedMessages);

    const job = jobs.find(j => j.id === jobId);
    if (job) {
      const notification: JobNotification = {
        id: `notif-${Date.now()}`,
        userId: receiverId,
        jobId,
        applicationId,
        type: "new_message",
        title: "New Message",
        message: `${user.name} sent you a message about ${job.title}`,
        read: false,
        createdAt: new Date().toISOString(),
      };
      await addNotification(notification);
    }

    return newMessage;
  }, [addNotification, jobs, messages, saveMessages, user]);

  const markMessageAsRead = useCallback(async (messageId: string) => {
    const updatedMessages = messages.map(msg =>
      msg.id === messageId ? { ...msg, read: true } : msg
    );
    await saveMessages(updatedMessages);
  }, [messages, saveMessages]);

  const markNotificationAsRead = useCallback(async (notificationId: string) => {
    const updatedNotifications = notifications.map(notif =>
      notif.id === notificationId ? { ...notif, read: true } : notif
    );
    await saveNotifications(updatedNotifications);
  }, [notifications, saveNotifications]);

  const markAllNotificationsAsRead = useCallback(async () => {
    const updatedNotifications = notifications.map(notif => ({ ...notif, read: true }));
    await saveNotifications(updatedNotifications);
  }, [notifications, saveNotifications]);

  const getJobById = useCallback((jobId: string) => {
    return jobs.find(job => job.id === jobId);
  }, [jobs]);

  const getApplicationsByJobId = useCallback((jobId: string) => {
    return applications.filter(app => app.jobId === jobId);
  }, [applications]);

  const getApplicationsByUserId = useCallback((userId: string) => {
    return applications.filter(app => app.applicantId === userId);
  }, [applications]);

  const getMessagesByJobId = useCallback((jobId: string) => {
    return messages.filter(msg => msg.jobId === jobId);
  }, [messages]);

  const getUnreadNotificationsCount = useCallback(() => {
    if (!user) return 0;
    return notifications.filter(notif => notif.userId === user.id && !notif.read).length;
  }, [notifications, user]);

  const getUserNotifications = useCallback(() => {
    if (!user) return [];
    return notifications.filter(notif => notif.userId === user.id).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [notifications, user]);

  return useMemo(() => ({
    jobs,
    applications,
    messages,
    notifications,
    isLoading,
    createJob,
    updateJob,
    deleteJob,
    applyToJob,
    updateApplicationStatus,
    sendMessage,
    markMessageAsRead,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    addNotification,
    getJobById,
    getApplicationsByJobId,
    getApplicationsByUserId,
    getMessagesByJobId,
    getUnreadNotificationsCount,
    getUserNotifications,
  }), [
    jobs,
    applications,
    messages,
    notifications,
    isLoading,
    createJob,
    updateJob,
    deleteJob,
    applyToJob,
    updateApplicationStatus,
    sendMessage,
    markMessageAsRead,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    addNotification,
    getJobById,
    getApplicationsByJobId,
    getApplicationsByUserId,
    getMessagesByJobId,
    getUnreadNotificationsCount,
    getUserNotifications,
  ]);
});
