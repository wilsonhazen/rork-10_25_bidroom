import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import {
  Bell,
  BellOff,
  FileText,
  CheckCircle,
  XCircle,
  MessageCircle,
  Calendar,
  AlertCircle,
  Briefcase,
  DollarSign,
  AlertTriangle,
  FileCheck,
  Users,
  Clock,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { useNotifications, Notification, NotificationType } from "@/contexts/NotificationsContext";

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case "new_job":
    case "job_updated":
    case "job_cancelled":
      return <Briefcase size={20} color={Colors.info} />;
    case "new_application":
    case "application_withdrawn":
      return <FileText size={20} color={Colors.primary} />;
    case "application_accepted":
      return <CheckCircle size={20} color={Colors.success} />;
    case "application_rejected":
      return <XCircle size={20} color={Colors.error} />;
    case "new_message":
      return <MessageCircle size={20} color={Colors.secondary} />;
    case "estimate_requested":
    case "estimate_confirmed":
    case "estimate_reminder":
    case "estimate_completed":
    case "estimate_cancelled":
    case "appointment_scheduled":
    case "appointment_confirmed":
    case "appointment_reminder":
    case "appointment_cancelled":
    case "appointment_rescheduled":
      return <Calendar size={20} color={Colors.warning} />;
    case "bid_invitation":
    case "bid_submitted":
    case "bid_accepted":
    case "bid_rejected":
    case "bid_updated":
      return <FileCheck size={20} color={Colors.info} />;
    case "project_created":
    case "project_started":
    case "project_completed":
      return <Briefcase size={20} color={Colors.success} />;
    case "milestone_created":
    case "milestone_submitted":
    case "milestone_approved":
    case "milestone_rejected":
    case "milestone_payment_released":
      return <CheckCircle size={20} color={Colors.primary} />;
    case "payment_received":
    case "payment_sent":
    case "payment_failed":
    case "escrow_deposited":
    case "escrow_released":
      return <DollarSign size={20} color={Colors.success} />;
    case "change_order_requested":
    case "change_order_approved":
    case "change_order_rejected":
      return <FileText size={20} color={Colors.warning} />;
    case "dispute_filed":
    case "dispute_resolved":
    case "dispute_escalated":
      return <AlertTriangle size={20} color={Colors.error} />;
    case "progress_update_posted":
    case "progress_update_late":
      return <TrendingUp size={20} color={Colors.info} />;
    case "contract_ready":
    case "contract_signed":
    case "document_uploaded":
    case "document_approval_needed":
      return <FileCheck size={20} color={Colors.primary} />;
    case "inspection_scheduled":
    case "inspection_completed":
      return <CheckCircle size={20} color={Colors.info} />;
    case "team_member_added":
    case "team_member_removed":
      return <Users size={20} color={Colors.secondary} />;
    case "deadline_approaching":
    case "deadline_missed":
      return <Clock size={20} color={Colors.error} />;
    case "system_alert":
      return <AlertCircle size={20} color={Colors.warning} />;
    default:
      return <Bell size={20} color={Colors.textSecondary} />;
  }
};

const getNotificationColor = (type: NotificationType) => {
  if (type.includes("accepted") || type.includes("approved") || type.includes("completed") || type.includes("resolved")) {
    return Colors.success;
  }
  if (type.includes("rejected") || type.includes("cancelled") || type.includes("dispute") || type.includes("missed")) {
    return Colors.error;
  }
  if (type.includes("payment") || type.includes("escrow")) {
    return Colors.success;
  }
  if (type.includes("reminder") || type.includes("approaching") || type.includes("late")) {
    return Colors.warning;
  }
  if (type.includes("message")) {
    return Colors.secondary;
  }
  return Colors.primary;
};

function TrendingUp({ size, color }: { size: number; color: string }) {
  return <FileText size={size} color={color} />;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const handleNotificationPress = (notification: Notification) => {
    markAsRead(notification.id);

    if (notification.actionUrl) {
      router.push(notification.actionUrl as any);
    } else if (notification.jobId) {
      router.push(`/job-details?id=${notification.jobId}`);
    } else if (notification.appointmentId) {
      router.push(`/appointment-details?id=${notification.appointmentId}`);
    } else if (notification.bidId) {
      router.push(`/bid-details?id=${notification.bidId}`);
    } else if (notification.projectId) {
      router.push(`/project-dashboard?id=${notification.projectId}`);
    }
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
  };

  const groupedNotifications = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const groups: {
      title: string;
      data: Notification[];
    }[] = [];

    const todayNotifs = notifications.filter((n) => {
      const date = new Date(n.createdAt);
      return date >= today;
    });

    const yesterdayNotifs = notifications.filter((n) => {
      const date = new Date(n.createdAt);
      return date >= yesterday && date < today;
    });

    const thisWeekNotifs = notifications.filter((n) => {
      const date = new Date(n.createdAt);
      return date >= weekAgo && date < yesterday;
    });

    const olderNotifs = notifications.filter((n) => {
      const date = new Date(n.createdAt);
      return date < weekAgo;
    });

    if (todayNotifs.length > 0) {
      groups.push({ title: "Today", data: todayNotifs });
    }
    if (yesterdayNotifs.length > 0) {
      groups.push({ title: "Yesterday", data: yesterdayNotifs });
    }
    if (thisWeekNotifs.length > 0) {
      groups.push({ title: "This Week", data: thisWeekNotifs });
    }
    if (olderNotifs.length > 0) {
      groups.push({ title: "Older", data: olderNotifs });
    }

    return groups;
  }, [notifications]);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "Notifications",
          headerStyle: {
            backgroundColor: Colors.surface,
          },
          headerTitleStyle: {
            color: Colors.text,
            fontWeight: "700" as const,
          },
          headerRight: () =>
            unreadCount > 0 ? (
              <TouchableOpacity
                style={styles.markAllButton}
                onPress={handleMarkAllRead}
              >
                <Text style={styles.markAllText}>Mark All Read</Text>
              </TouchableOpacity>
            ) : null,
        }}
      />

      {notifications.length === 0 ? (
        <View style={styles.emptyState}>
          <BellOff size={64} color={Colors.textTertiary} />
          <Text style={styles.emptyStateTitle}>No Notifications</Text>
          <Text style={styles.emptyStateText}>
            You&apos;re all caught up! Notifications will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={groupedNotifications}
          renderItem={({ item }) => (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{item.title}</Text>
              {item.data.map((notification) => (
                <TouchableOpacity
                  key={notification.id}
                  style={[
                    styles.notificationCard,
                    !notification.read && styles.notificationCardUnread,
                    notification.priority === "high" && styles.notificationCardHigh,
                    notification.priority === "critical" && styles.notificationCardCritical,
                  ]}
                  onPress={() => handleNotificationPress(notification)}
                >
                  <View
                    style={[
                      styles.iconContainer,
                      {
                        backgroundColor:
                          getNotificationColor(notification.type) + "15",
                      },
                    ]}
                  >
                    {getNotificationIcon(notification.type)}
                  </View>

                  <View style={styles.notificationContent}>
                    <Text
                      style={[
                        styles.notificationTitle,
                        !notification.read && styles.notificationTitleUnread,
                      ]}
                    >
                      {notification.title}
                    </Text>
                    <Text
                      style={[
                        styles.notificationMessage,
                        !notification.read && styles.notificationMessageUnread,
                      ]}
                      numberOfLines={2}
                    >
                      {notification.message}
                    </Text>
                    <Text style={styles.notificationTime}>
                      {formatNotificationTime(notification.createdAt)}
                    </Text>
                  </View>

                  {!notification.read && <View style={styles.unreadDot} />}
                </TouchableOpacity>
              ))}
            </View>
          )}
          keyExtractor={(item) => item.title}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

function formatNotificationTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  markAllText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
  listContent: {
    paddingVertical: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: Colors.textSecondary,
    textTransform: "uppercase" as const,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  notificationCard: {
    flexDirection: "row" as const,
    backgroundColor: Colors.surface,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  notificationCardUnread: {
    backgroundColor: Colors.primary + "08",
  },
  notificationCardHigh: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.warning,
  },
  notificationCardCritical: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.error,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  notificationTitleUnread: {
    fontWeight: "700" as const,
  },
  notificationMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 6,
  },
  notificationMessageUnread: {
    color: Colors.text,
  },
  notificationTime: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginLeft: 8,
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
    marginTop: 24,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center" as const,
    lineHeight: 22,
  },
});
