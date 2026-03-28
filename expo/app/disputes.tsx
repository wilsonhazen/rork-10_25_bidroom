import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { Stack, router } from "expo-router";
import { AlertCircle, FileText, Clock, CheckCircle, XCircle, ChevronRight } from "lucide-react-native";
import { useDisputes } from "@/contexts/DisputesContext";
import { useAuth } from "@/contexts/AuthContext";
import { Dispute, DisputeType } from "@/types";

const DisputeStatusBadge: React.FC<{ status: Dispute["status"] }> = ({ status }) => {
  const config = {
    filed: { bg: "#fef3c7", color: "#92400e", label: "Filed" },
    under_review: { bg: "#dbeafe", color: "#1e40af", label: "Under Review" },
    in_mediation: { bg: "#e0e7ff", color: "#3730a3", label: "In Mediation" },
    resolved: { bg: "#d1fae5", color: "#065f46", label: "Resolved" },
    closed: { bg: "#f3f4f6", color: "#374151", label: "Closed" },
  };

  const style = config[status];

  return (
    <View style={[styles.badge, { backgroundColor: style.bg }]}>
      <Text style={[styles.badgeText, { color: style.color }]}>{style.label}</Text>
    </View>
  );
};

const DisputeCard: React.FC<{ dispute: Dispute; onPress: () => void }> = ({
  dispute,
  onPress,
}) => {
  const getStatusIcon = () => {
    switch (dispute.status) {
      case "filed":
        return <AlertCircle size={20} color="#f59e0b" />;
      case "under_review":
        return <Clock size={20} color="#3b82f6" />;
      case "in_mediation":
        return <FileText size={20} color="#8b5cf6" />;
      case "resolved":
        return <CheckCircle size={20} color="#10b981" />;
      case "closed":
        return <XCircle size={20} color="#6b7280" />;
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>{getStatusIcon()}</View>
        <View style={styles.cardContent}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle}>{dispute.disputeType.replace("_", " ").toUpperCase()}</Text>
            <DisputeStatusBadge status={dispute.status} />
          </View>
          <Text style={styles.cardDescription} numberOfLines={2}>
            {dispute.description}
          </Text>
          <View style={styles.cardMeta}>
            <Text style={styles.metaText}>Filed by: {dispute.filedByName}</Text>
            <Text style={styles.metaText}>
              {new Date(dispute.createdAt).toLocaleDateString()}
            </Text>
          </View>
          {dispute.amountDisputed && (
            <Text style={styles.amountText}>
              Amount in dispute: ${dispute.amountDisputed.toLocaleString()}
            </Text>
          )}
        </View>
        <ChevronRight size={20} color="#9ca3af" />
      </View>
    </TouchableOpacity>
  );
};

export default function DisputesPage() {
  const { user } = useAuth();
  const { disputes, fileDispute, isLoading } = useDisputes();
  const [showNewDispute, setShowNewDispute] = useState(false);
  const [newDispute, setNewDispute] = useState({
    projectId: "",
    type: "quality" as DisputeType,
    description: "",
    amount: "",
  });

  const userDisputes = disputes.filter(
    (d) => d.filedBy === user?.id || d.projectId.includes(user?.id || "")
  );

  const activeDisputes = userDisputes.filter(
    (d) => d.status !== "resolved" && d.status !== "closed"
  );

  const handleFileDispute = () => {
    if (!newDispute.description.trim()) {
      Alert.alert("Error", "Please provide a description");
      return;
    }

    fileDispute(
      newDispute.projectId || "project-1",
      newDispute.type,
      newDispute.description,
      { photos: [], documents: [], messages: [] },
      parseFloat(newDispute.amount) || undefined,
      "Seeking resolution"
    );

    setShowNewDispute(false);
    setNewDispute({
      projectId: "",
      type: "quality",
      description: "",
      amount: "",
    });
    Alert.alert("Success", "Dispute filed successfully");
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Dispute Resolution",
          headerStyle: { backgroundColor: "#fff" },
          headerTintColor: "#111827",
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Dispute Management</Text>
          <Text style={styles.subtitle}>
            Resolve issues through our structured mediation process
          </Text>
        </View>

        <View style={styles.stats}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{activeDisputes.length}</Text>
            <Text style={styles.statLabel}>Active Disputes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {userDisputes.filter((d) => d.status === "resolved").length}
            </Text>
            <Text style={styles.statLabel}>Resolved</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.newDisputeButton}
          onPress={() => setShowNewDispute(!showNewDispute)}
        >
          <Text style={styles.newDisputeButtonText}>
            {showNewDispute ? "Cancel" : "File New Dispute"}
          </Text>
        </TouchableOpacity>

        {showNewDispute && (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>File a New Dispute</Text>

            <Text style={styles.label}>Dispute Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
              {(["payment", "quality", "scope", "timeline", "damage", "safety", "contract"] as DisputeType[]).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    newDispute.type === type && styles.typeButtonActive,
                  ]}
                  onPress={() => setNewDispute({ ...newDispute, type })}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      newDispute.type === type && styles.typeButtonTextActive,
                    ]}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Describe the issue in detail..."
              multiline
              numberOfLines={4}
              value={newDispute.description}
              onChangeText={(text) => setNewDispute({ ...newDispute, description: text })}
            />

            <Text style={styles.label}>Amount in Dispute (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              keyboardType="numeric"
              value={newDispute.amount}
              onChangeText={(text) => setNewDispute({ ...newDispute, amount: text })}
            />

            <TouchableOpacity style={styles.submitButton} onPress={handleFileDispute}>
              <Text style={styles.submitButtonText}>Submit Dispute</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Disputes</Text>
          {activeDisputes.length === 0 ? (
            <View style={styles.emptyState}>
              <CheckCircle size={48} color="#9ca3af" />
              <Text style={styles.emptyText}>No active disputes</Text>
            </View>
          ) : (
            activeDisputes.map((dispute) => (
              <DisputeCard
                key={dispute.id}
                dispute={dispute}
                onPress={() => router.push(`/dispute-details?id=${dispute.id}`)}
              />
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resolved Disputes</Text>
          {userDisputes
            .filter((d) => d.status === "resolved" || d.status === "closed")
            .map((dispute) => (
              <DisputeCard
                key={dispute.id}
                dispute={dispute}
                onPress={() => router.push(`/dispute-details?id=${dispute.id}`)}
              />
            ))}
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Dispute Resolution Process</Text>
          <Text style={styles.infoText}>
            1. File Dispute - Submit your concern{"\n"}
            2. Internal Review - Both parties discuss{"\n"}
            3. Platform Mediation - Our team assists{"\n"}
            4. Professional Mediation - Third-party review{"\n"}
            5. Resolution - Agreement reached
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  title: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#111827",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  stats: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: "#111827",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: "#6b7280",
  },
  newDisputeButton: {
    margin: 16,
    marginTop: 8,
    backgroundColor: "#3b82f6",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  newDisputeButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#fff",
  },
  formContainer: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#111827",
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#374151",
    marginBottom: 8,
  },
  typeScroll: {
    marginBottom: 16,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    marginRight: 8,
    backgroundColor: "#fff",
  },
  typeButtonActive: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#6b7280",
  },
  typeButtonTextActive: {
    color: "#fff",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 16,
    minHeight: 100,
    textAlignVertical: "top",
    backgroundColor: "#fff",
  },
  submitButton: {
    backgroundColor: "#10b981",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#fff",
  },
  section: {
    padding: 16,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#111827",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  cardContent: {
    flex: 1,
  },
  cardTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: "#111827",
  },
  cardDescription: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
    marginBottom: 8,
  },
  cardMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  metaText: {
    fontSize: 12,
    color: "#9ca3af",
  },
  amountText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#ef4444",
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600" as const,
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: "#9ca3af",
  },
  infoContainer: {
    margin: 16,
    marginTop: 8,
    backgroundColor: "#eff6ff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#93c5fd",
    marginBottom: 32,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#1e40af",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#1e3a8a",
    lineHeight: 22,
  },
});
