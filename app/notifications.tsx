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
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { useJobs } from "@/contexts/JobsContext";
import { JobNotification } from "@/types";

const getNotificationIcon = (type: JobNotification["type"]) => {
  switch (type) {
    case "new_job":
      return <Briefcase size={20} color={Colors.info} />;
    case "new_application":
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
      return <Calendar size={20} color={Colors.warning} />;
    case "job_updated":
    case "job_cancelled":
      return <AlertCircle size={20} color={Colors.textSecondary} />;
    default:
      return <Bell size={20} color={Colors.textSecondary} />;
  }
};

const getNotificationColor = (type: JobNotification["type"]) => {
  switch (type) {
    case "new_job":
      return Colors.info;
    case "new_application":
      return Colors.primary;
    case "application_accepted":
      return Colors.success;
    case "application_rejected":
      return Colors.error;
    case "new_message":
      return Colors.secondary;
    case "estimate_requested":
    case "estimate_confirmed":
    case "estimate_reminder":
    case "estimate_completed":
      return Colors.warning;
    default:
      return Colors.textSecondary;
  }
};

export default function NotificationsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    getUserNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    getUnreadNotificationsCount,
  } = useJobs();

  const notifications = getUserNotifications();
  const unreadCount = getUnreadNotificationsCount();

  const handleNotificationPress = (notification: JobNotification) => {
    markNotificationAsRead(notification.id);

    if (notification.jobId) {
      router.push(`/job-details?id=${notification.jobId}`);
    } else if (notification.appointmentId) {
      router.push(`/appointment-details?id=${notification.appointmentId}`);
    }
  };

  const handleMarkAllRead = () => {
    markAllNotificationsAsRead();
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
      data: JobNotification[];
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
            You're all caught up! Notifications will appear here.
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
