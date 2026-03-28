import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { useJobs } from "@/contexts/JobsContext";
import { Stack, useRouter } from "expo-router";
import {
  Bell,
  Building2,
  ChevronRight,
  FileText,
  HelpCircle,
  LogOut,
  Mail,
  MessageCircle,
  Phone,
  Settings,
  Shield,
  User,
} from "lucide-react-native";
import React from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onPress: () => void;
  destructive?: boolean;
}

function MenuItem({ icon, label, value, onPress, destructive }: MenuItemProps) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemLeft}>
        <View style={styles.menuIcon}><Text>{icon}</Text></View>
        <Text
          style={[styles.menuLabel, destructive && styles.menuLabelDestructive]}
        >
          {label}
        </Text>
      </View>
      <View style={styles.menuItemRight}>
        {value && <Text style={styles.menuValue}>{value}</Text>}
        <ChevronRight
          size={20}
          color={destructive ? Colors.error : Colors.textTertiary}
        />
      </View>
    </TouchableOpacity>
  );
}

interface MenuSectionProps {
  title: string;
  children: React.ReactNode;
}

function MenuSection({ title, children }: MenuSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { getUnreadNotificationsCount } = useJobs();

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Log Out",
          style: "destructive",
          onPress: logout,
        },
      ],
      { cancelable: true }
    );
  };

  const handleEditProfile = () => {
    router.push("/edit-profile");
  };

  const handleSettings = () => {
    router.push("/settings");
  };

  const handleNotifications = () => {
    router.push("/notifications");
  };

  const handleMessages = () => {
    router.push("/messages");
  };

  const handlePrivacy = () => {
    router.push("/privacy");
  };

  const handleHelp = () => {
    router.push("/help");
  };

  const handleTerms = () => {
    router.push("/terms");
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "Profile",
          headerLargeTitle: true,
          headerStyle: {
            backgroundColor: Colors.surface,
          },
          headerTitleStyle: {
            color: Colors.text,
            fontWeight: "700" as const,
          },
        }}
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>
              {user?.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </Text>
          </View>
          <Text style={styles.profileName}>{user?.name}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user?.role}</Text>
          </View>
          <Text style={styles.companyName}>{user?.company}</Text>
        </View>

        <MenuSection title="Account Information">
          <MenuItem
            icon={<Mail size={20} color={Colors.primary} />}
            label="Email"
            value={user?.email}
            onPress={handleEditProfile}
          />
          <MenuItem
            icon={<Phone size={20} color={Colors.primary} />}
            label="Phone"
            value={user?.phone}
            onPress={handleEditProfile}
          />
          <MenuItem
            icon={<Building2 size={20} color={Colors.primary} />}
            label="Company"
            value={user?.company}
            onPress={handleEditProfile}
          />
          <MenuItem
            icon={<User size={20} color={Colors.primary} />}
            label="Edit Profile"
            onPress={handleEditProfile}
          />
        </MenuSection>

        <MenuSection title="Communication">
          <MenuItem
            icon={<Bell size={20} color={Colors.textSecondary} />}
            label="Notifications"
            value={getUnreadNotificationsCount() > 0 ? `${getUnreadNotificationsCount()} new` : undefined}
            onPress={handleNotifications}
          />
          <MenuItem
            icon={<MessageCircle size={20} color={Colors.textSecondary} />}
            label="Messages"
            onPress={handleMessages}
          />
        </MenuSection>

        <MenuSection title="Preferences">
          <MenuItem
            icon={<Settings size={20} color={Colors.textSecondary} />}
            label="Settings"
            onPress={handleSettings}
          />
          <MenuItem
            icon={<Shield size={20} color={Colors.textSecondary} />}
            label="Privacy & Security"
            onPress={handlePrivacy}
          />
        </MenuSection>

        <MenuSection title="Support">
          <MenuItem
            icon={<HelpCircle size={20} color={Colors.textSecondary} />}
            label="Help & Support"
            onPress={handleHelp}
          />
          <MenuItem
            icon={<FileText size={20} color={Colors.textSecondary} />}
            label="Terms of Service"
            onPress={handleTerms}
          />
        </MenuSection>

        <MenuSection title="Account">
          <MenuItem
            icon={<LogOut size={20} color={Colors.error} />}
            label="Log Out"
            onPress={handleLogout}
            destructive
          />
        </MenuSection>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Bidroom v1.0.0</Text>
          <Text style={styles.footerText}>© 2025 Bidroom. All rights reserved.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    alignItems: "center" as const,
    paddingVertical: 32,
    paddingHorizontal: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary + "20",
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginBottom: 16,
  },
  avatarLargeText: {
    fontSize: 36,
    fontWeight: "700" as const,
    color: Colors.primary,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: Colors.primary + "15",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
  },
  roleText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
  companyName: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: Colors.textTertiary,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionContent: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  menuItem: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuItemLeft: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    flex: 1,
  },
  menuIcon: {
    width: 32,
    height: 32,
    marginRight: 12,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  menuLabel: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: "500" as const,
  },
  menuLabelDestructive: {
    color: Colors.error,
  },
  menuItemRight: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
  },
  menuValue: {
    fontSize: 14,
    color: Colors.textSecondary,
    maxWidth: 150,
  },
  footer: {
    alignItems: "center" as const,
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  footerText: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginBottom: 4,
  },
});
