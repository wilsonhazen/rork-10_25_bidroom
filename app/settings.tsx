import Colors from "@/constants/colors";
import { Stack } from "expo-router";
import { Bell, Palette, Globe, Lock } from "lucide-react-native";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface SettingItemProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  value?: boolean;
  onToggle?: (value: boolean) => void;
  onPress?: () => void;
}

function SettingItem({ icon, label, description, value, onToggle, onPress }: SettingItemProps) {
  return (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={onPress}
      disabled={!onPress && !onToggle}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.settingLeft}>
        <View style={styles.settingIcon}><Text>{icon}</Text></View>
        <View style={styles.settingContent}>
          <Text style={styles.settingLabel}>{label}</Text>
          {description && (
            <Text style={styles.settingDescription}>{description}</Text>
          )}
        </View>
      </View>
      {onToggle && (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: Colors.border, true: Colors.primary }}
          thumbColor={Colors.white}
        />
      )}
    </TouchableOpacity>
  );
}

interface SettingSectionProps {
  title: string;
  children: React.ReactNode;
}

function SettingSection({ title, children }: SettingSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
}

export default function SettingsScreen() {
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [bidAlerts, setBidAlerts] = useState(true);
  const [jobUpdates, setJobUpdates] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoSync, setAutoSync] = useState(true);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "Settings",
          headerStyle: {
            backgroundColor: Colors.surface,
          },
          headerTitleStyle: {
            color: Colors.text,
            fontWeight: "700" as const,
          },
          headerTintColor: Colors.primary,
        }}
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <SettingSection title="Notifications">
          <SettingItem
            icon={<Bell size={20} color={Colors.primary} />}
            label="Push Notifications"
            description="Receive push notifications for important updates"
            value={pushNotifications}
            onToggle={setPushNotifications}
          />
          <SettingItem
            icon={<Bell size={20} color={Colors.primary} />}
            label="Email Notifications"
            description="Get updates via email"
            value={emailNotifications}
            onToggle={setEmailNotifications}
          />
          <SettingItem
            icon={<Bell size={20} color={Colors.primary} />}
            label="Bid Alerts"
            description="Notify me when new bids are submitted"
            value={bidAlerts}
            onToggle={setBidAlerts}
          />
          <SettingItem
            icon={<Bell size={20} color={Colors.primary} />}
            label="Job Updates"
            description="Notify me when jobs are updated"
            value={jobUpdates}
            onToggle={setJobUpdates}
          />
        </SettingSection>

        <SettingSection title="Appearance">
          <SettingItem
            icon={<Palette size={20} color={Colors.textSecondary} />}
            label="Dark Mode"
            description="Use dark theme (Coming soon)"
            value={darkMode}
            onToggle={setDarkMode}
          />
        </SettingSection>

        <SettingSection title="Data & Sync">
          <SettingItem
            icon={<Globe size={20} color={Colors.textSecondary} />}
            label="Auto Sync"
            description="Automatically sync data in the background"
            value={autoSync}
            onToggle={setAutoSync}
          />
        </SettingSection>

        <SettingSection title="Security">
          <SettingItem
            icon={<Lock size={20} color={Colors.textSecondary} />}
            label="Two-Factor Authentication"
            description="Add an extra layer of security (Coming soon)"
          />
        </SettingSection>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Settings are saved automatically
          </Text>
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
  settingItem: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingLeft: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    flex: 1,
  },
  settingIcon: {
    width: 32,
    height: 32,
    marginRight: 12,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: "500" as const,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  footer: {
    alignItems: "center" as const,
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  footerText: {
    fontSize: 13,
    color: Colors.textTertiary,
    textAlign: "center" as const,
  },
});
