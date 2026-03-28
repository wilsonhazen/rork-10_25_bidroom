import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";

export type NotificationType =
  | "new_job"
  | "new_application"
  | "application_accepted"
  | "application_rejected"
  | "application_withdrawn"
  | "new_message"
  | "job_updated"
  | "job_cancelled"
  | "estimate_requested"
  | "estimate_confirmed"
  | "estimate_reminder"
  | "estimate_completed"
  | "estimate_cancelled"
  | "appointment_scheduled"
  | "appointment_confirmed"
  | "appointment_reminder"
  | "appointment_cancelled"
  | "appointment_rescheduled"
  | "bid_invitation"
  | "bid_submitted"
  | "bid_accepted"
  | "bid_rejected"
  | "bid_updated"
  | "project_created"
  | "project_started"
  | "project_completed"
  | "milestone_created"
  | "milestone_submitted"
  | "milestone_approved"
  | "milestone_rejected"
  | "milestone_payment_released"
  | "payment_received"
  | "payment_sent"
  | "payment_failed"
  | "escrow_deposited"
  | "escrow_released"
  | "change_order_requested"
  | "change_order_approved"
  | "change_order_rejected"
  | "dispute_filed"
  | "dispute_resolved"
  | "dispute_escalated"
  | "progress_update_posted"
  | "progress_update_late"
  | "contract_ready"
  | "contract_signed"
  | "document_uploaded"
  | "document_approval_needed"
  | "inspection_scheduled"
  | "inspection_completed"
  | "team_member_added"
  | "team_member_removed"
  | "system_alert"
  | "deadline_approaching"
  | "deadline_missed";

export type NotificationPriority = "low" | "normal" | "high" | "critical";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  read: boolean;
  actionUrl?: string;
  jobId?: string;
  applicationId?: string;
  appointmentId?: string;
  bidId?: string;
  projectId?: string;
  milestoneId?: string;
  disputeId?: string;
  data?: any;
  createdAt: string;
}

const STORAGE_KEY = "notifications";
const MAX_NOTIFICATIONS = 100;

export const [NotificationsProvider, useNotifications] = createContextHook(() => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const allNotifications: Notification[] = JSON.parse(stored);
        const userNotifications = allNotifications.filter(n => n.userId === user?.id);
        setNotifications(userNotifications);
      }
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user, loadNotifications]);

  const saveNotifications = useCallback(async (notifs: Notification[]) => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      let allNotifications: Notification[] = stored ? JSON.parse(stored) : [];
      
      allNotifications = allNotifications.filter(n => n.userId !== user?.id);
      allNotifications.push(...notifs);
      
      allNotifications = allNotifications.slice(-MAX_NOTIFICATIONS * 10);
      
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(allNotifications));
    } catch (error) {
      console.error("Failed to save notifications:", error);
    }
  }, [user]);

  const addNotification = useCallback((notification: Omit<Notification, "id" | "userId" | "createdAt" | "read">) => {
    if (!user) return;

    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      userId: user.id,
      read: false,
      createdAt: new Date().toISOString(),
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev].slice(0, MAX_NOTIFICATIONS);
      saveNotifications(updated);
      return updated;
    });

    console.log("[Notification]", notification.type, notification.title);
  }, [user, saveNotifications]);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      );
      saveNotifications(updated);
      return updated;
    });
  }, [saveNotifications]);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      saveNotifications(updated);
      return updated;
    });
  }, [saveNotifications]);

  const deleteNotification = useCallback((notificationId: string) => {
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== notificationId);
      saveNotifications(updated);
      return updated;
    });
  }, [saveNotifications]);

  const deleteAllNotifications = useCallback(() => {
    setNotifications([]);
    saveNotifications([]);
  }, [saveNotifications]);

  const getUnreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  const getUnreadNotifications = useMemo(() => {
    return notifications.filter(n => !n.read);
  }, [notifications]);

  const getNotificationsByType = useCallback((type: NotificationType) => {
    return notifications.filter(n => n.type === type);
  }, [notifications]);

  const getNotificationsByPriority = useCallback((priority: NotificationPriority) => {
    return notifications.filter(n => n.priority === priority);
  }, [notifications]);

  return useMemo(() => ({
    notifications,
    isLoading,
    unreadCount: getUnreadCount,
    unreadNotifications: getUnreadNotifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    getNotificationsByType,
    getNotificationsByPriority,
  }), [notifications, isLoading, getUnreadCount, getUnreadNotifications, addNotification, markAsRead, markAllAsRead, deleteNotification, deleteAllNotifications, getNotificationsByType, getNotificationsByPriority]);
});
