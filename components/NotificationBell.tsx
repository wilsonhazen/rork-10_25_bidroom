import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { Bell } from "lucide-react-native";
import { useRouter } from "expo-router";
import Colors from "@/constants/colors";
import { useNotifications } from "@/contexts/NotificationsContext";

export default function NotificationBell() {
  const router = useRouter();
  const { unreadCount } = useNotifications();

  const handlePress = () => {
    router.push("/notifications");
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={styles.container}
      testID="notification-bell"
    >
      <Bell size={24} color={Colors.text} />
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {unreadCount > 99 ? "99+" : unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginRight: 16,
    position: "relative" as const,
    width: 40,
    height: 40,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  badge: {
    position: "absolute" as const,
    top: 0,
    right: 0,
    backgroundColor: Colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: "700" as const,
  },
});
