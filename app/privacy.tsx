import Colors from "@/constants/colors";
import { Stack } from "expo-router";
import { Shield, Eye, Database, Trash2, Download } from "lucide-react-native";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";

interface PrivacyItemProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  onPress: () => void;
  destructive?: boolean;
}

function PrivacyItem({ icon, label, description, onPress, destructive }: PrivacyItemProps) {
  return (
    <TouchableOpacity style={styles.privacyItem} onPress={onPress}>
      <View style={styles.privacyLeft}>
        <View style={styles.privacyIcon}><Text>{icon}</Text></View>
        <View style={styles.privacyContent}>
          <Text style={[styles.privacyLabel, destructive && styles.destructiveText]}>
            {label}
          </Text>
          <Text style={styles.privacyDescription}>{description}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

interface PrivacySectionProps {
  title: string;
  children: React.ReactNode;
}

function PrivacySection({ title, children }: PrivacySectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
}

export default function PrivacyScreen() {
  const handleDataAccess = () => {
    Alert.alert(
      "Data Access",
      "You can view and manage what data we collect about you.",
      [{ text: "OK" }]
    );
  };

  const handlePermissions = () => {
    Alert.alert(
      "App Permissions",
      "Manage app permissions for camera, location, and notifications.",
      [{ text: "OK" }]
    );
  };

  const handleDownloadData = () => {
    Alert.alert(
      "Download Your Data",
      "Request a copy of all your data. We'll email you a link when it's ready.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Request", onPress: () => Alert.alert("Success", "Data export requested. You'll receive an email when ready.") }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This will permanently delete your account and all associated data. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => Alert.alert("Notice", "Account deletion is not available in this demo version.")
        }
      ]
    );
  };

  const handleDataRetention = () => {
    Alert.alert(
      "Data Retention",
      "Learn about how long we keep your data and why.",
      [{ text: "OK" }]
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "Privacy & Security",
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
        <View style={styles.header}>
          <Shield size={48} color={Colors.primary} />
          <Text style={styles.headerTitle}>Your Privacy Matters</Text>
          <Text style={styles.headerDescription}>
            We take your privacy seriously and give you control over your data.
          </Text>
        </View>

        <PrivacySection title="Data Management">
          <PrivacyItem
            icon={<Eye size={20} color={Colors.primary} />}
            label="View My Data"
            description="See what information we have about you"
            onPress={handleDataAccess}
          />
          <PrivacyItem
            icon={<Download size={20} color={Colors.primary} />}
            label="Download My Data"
            description="Get a copy of all your data"
            onPress={handleDownloadData}
          />
          <PrivacyItem
            icon={<Database size={20} color={Colors.textSecondary} />}
            label="Data Retention Policy"
            description="Learn how long we keep your data"
            onPress={handleDataRetention}
          />
        </PrivacySection>

        <PrivacySection title="Permissions">
          <PrivacyItem
            icon={<Shield size={20} color={Colors.textSecondary} />}
            label="App Permissions"
            description="Manage camera, location, and notification access"
            onPress={handlePermissions}
          />
        </PrivacySection>

        <PrivacySection title="Account">
          <PrivacyItem
            icon={<Trash2 size={20} color={Colors.error} />}
            label="Delete My Account"
            description="Permanently delete your account and data"
            onPress={handleDeleteAccount}
            destructive
          />
        </PrivacySection>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            For more information, please read our Privacy Policy and Terms of Service.
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
  header: {
    alignItems: "center" as const,
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  headerDescription: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center" as const,
    lineHeight: 22,
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
  privacyItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  privacyLeft: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    flex: 1,
  },
  privacyIcon: {
    width: 32,
    height: 32,
    marginRight: 12,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  privacyContent: {
    flex: 1,
  },
  privacyLabel: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: "500" as const,
    marginBottom: 2,
  },
  destructiveText: {
    color: Colors.error,
  },
  privacyDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  footer: {
    alignItems: "center" as const,
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  footerText: {
    fontSize: 13,
    color: Colors.textTertiary,
    textAlign: "center" as const,
    lineHeight: 20,
  },
});
