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
import { Stack, router, useLocalSearchParams } from "expo-router";
import {
  AlertCircle,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  ArrowUpCircle,
  Image as ImageIcon,
} from "lucide-react-native";
import { useDisputes } from "@/contexts/DisputesContext";

export default function DisputeDetailsPage() {
  const { id } = useLocalSearchParams();
  const { disputes, updateDisputeStatus, escalateDispute } = useDisputes();
  const [resolution, setResolution] = useState("");

  const dispute = disputes.find((d) => d.id === id);

  if (!dispute) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: "Dispute Not Found" }} />
        <View style={styles.notFound}>
          <AlertCircle size={48} color="#9ca3af" />
          <Text style={styles.notFoundText}>Dispute not found</Text>
        </View>
      </View>
    );
  }

  const getStatusIcon = () => {
    switch (dispute.status) {
      case "filed":
        return <AlertCircle size={24} color="#f59e0b" />;
      case "under_review":
        return <Clock size={24} color="#3b82f6" />;
      case "in_mediation":
        return <FileText size={24} color="#8b5cf6" />;
      case "resolved":
        return <CheckCircle size={24} color="#10b981" />;
      case "closed":
        return <XCircle size={24} color="#6b7280" />;
    }
  };

  const getStatusColor = () => {
    switch (dispute.status) {
      case "filed":
        return "#f59e0b";
      case "under_review":
        return "#3b82f6";
      case "in_mediation":
        return "#8b5cf6";
      case "resolved":
        return "#10b981";
      case "closed":
        return "#6b7280";
      default:
        return "#6b7280";
    }
  };

  const handleEscalate = () => {
    const stages = {
      internal: "platform",
      platform: "professional",
      professional: "legal",
    } as const;

    const nextStage = stages[dispute.resolutionStage as keyof typeof stages];
    if (nextStage) {
      escalateDispute(dispute.id, nextStage);
      Alert.alert("Success", `Dispute escalated to ${nextStage} mediation`);
    }
  };

  const handleResolve = () => {
    if (!resolution.trim()) {
      Alert.alert("Error", "Please provide a resolution description");
      return;
    }
    updateDisputeStatus(dispute.id, "resolved", resolution);
    Alert.alert("Success", "Dispute marked as resolved");
    router.back();
  };

  const handleClose = () => {
    Alert.alert(
      "Close Dispute",
      "Are you sure you want to close this dispute?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Close",
          style: "destructive",
          onPress: () => {
            updateDisputeStatus(dispute.id, "closed");
            router.back();
          },
        },
      ]
    );
  };

  const isResolved = dispute.status === "resolved" || dispute.status === "closed";

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Dispute Details",
          headerStyle: { backgroundColor: "#fff" },
          headerTintColor: "#111827",
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            {getStatusIcon()}
            <View style={styles.headerText}>
              <Text style={styles.disputeType}>
                {dispute.disputeType.replace("_", " ").toUpperCase()}
              </Text>
              <Text style={styles.disputeId}>Case #{dispute.id}</Text>
            </View>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + "20" }]}>
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {dispute.status.replace("_", " ").toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Filed By:</Text>
            <Text style={styles.infoValue}>{dispute.filedByName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Filed On:</Text>
            <Text style={styles.infoValue}>
              {new Date(dispute.createdAt).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Resolution Stage:</Text>
            <Text style={styles.infoValue}>
              {dispute.resolutionStage.charAt(0).toUpperCase() + dispute.resolutionStage.slice(1)}
            </Text>
          </View>
          {dispute.amountDisputed && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Amount in Dispute:</Text>
              <Text style={[styles.infoValue, styles.amountText]}>
                ${dispute.amountDisputed.toLocaleString()}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{dispute.description}</Text>
        </View>

        {dispute.desiredResolution && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Desired Resolution</Text>
            <Text style={styles.description}>{dispute.desiredResolution}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Evidence</Text>
          
          {dispute.evidence.photos.length > 0 && (
            <View style={styles.evidenceItem}>
              <ImageIcon size={20} color="#6b7280" />
              <Text style={styles.evidenceText}>
                {dispute.evidence.photos.length} photo(s)
              </Text>
            </View>
          )}
          
          {dispute.evidence.documents.length > 0 && (
            <View style={styles.evidenceItem}>
              <FileText size={20} color="#6b7280" />
              <Text style={styles.evidenceText}>
                {dispute.evidence.documents.length} document(s)
              </Text>
            </View>
          )}
          
          {dispute.evidence.messages.length > 0 && (
            <View style={styles.evidenceItem}>
              <MessageSquare size={20} color="#6b7280" />
              <Text style={styles.evidenceText}>
                {dispute.evidence.messages.length} message(s)
              </Text>
            </View>
          )}

          {dispute.evidence.photos.length === 0 &&
            dispute.evidence.documents.length === 0 &&
            dispute.evidence.messages.length === 0 && (
              <Text style={styles.noEvidence}>No evidence provided</Text>
            )}
        </View>

        {dispute.resolution && (
          <View style={[styles.section, styles.resolutionSection]}>
            <Text style={[styles.sectionTitle, styles.resolutionTitle]}>Resolution</Text>
            <Text style={styles.description}>{dispute.resolution}</Text>
            {dispute.resolvedAt && (
              <Text style={styles.resolvedDate}>
                Resolved on {new Date(dispute.resolvedAt).toLocaleDateString()}
              </Text>
            )}
          </View>
        )}

        {!isResolved && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Add Resolution</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Describe the resolution or outcome..."
                multiline
                numberOfLines={4}
                value={resolution}
                onChangeText={setResolution}
              />
            </View>

            <View style={styles.actionsContainer}>
              {dispute.resolutionStage !== "legal" && (
                <TouchableOpacity
                  style={styles.escalateButton}
                  onPress={handleEscalate}
                >
                  <ArrowUpCircle size={20} color="#f59e0b" />
                  <Text style={styles.escalateButtonText}>Escalate</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.resolveButton}
                onPress={handleResolve}
              >
                <CheckCircle size={20} color="#fff" />
                <Text style={styles.resolveButtonText}>Mark Resolved</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
              >
                <XCircle size={20} color="#ef4444" />
                <Text style={styles.closeButtonText}>Close Dispute</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        <View style={styles.infoBox}>
          <Text style={styles.infoBoxTitle}>Resolution Process</Text>
          <Text style={styles.infoBoxText}>
            1. Internal Discussion - Direct communication between parties{"\n"}
            2. Platform Mediation - Our team facilitates resolution{"\n"}
            3. Professional Mediation - Third-party mediator assists{"\n"}
            4. Legal Review - Legal professionals provide guidance
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
  notFound: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  notFoundText: {
    marginTop: 16,
    fontSize: 18,
    color: "#9ca3af",
  },
  header: {
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  headerText: {
    flex: 1,
  },
  disputeType: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#111827",
    marginBottom: 2,
  },
  disputeId: {
    fontSize: 13,
    color: "#6b7280",
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700" as const,
  },
  section: {
    padding: 20,
    backgroundColor: "#fff",
    marginTop: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#111827",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  infoLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#111827",
  },
  amountText: {
    color: "#ef4444",
  },
  description: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 22,
  },
  evidenceItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
  },
  evidenceText: {
    fontSize: 14,
    color: "#6b7280",
  },
  noEvidence: {
    fontSize: 14,
    color: "#9ca3af",
    fontStyle: "italic",
  },
  resolutionSection: {
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#86efac",
  },
  resolutionTitle: {
    color: "#15803d",
  },
  resolvedDate: {
    fontSize: 12,
    color: "#16a34a",
    marginTop: 8,
    fontStyle: "italic",
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: "top",
    backgroundColor: "#fff",
  },
  actionsContainer: {
    padding: 20,
    gap: 12,
    marginBottom: 20,
  },
  escalateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#f59e0b",
    padding: 14,
    borderRadius: 8,
  },
  escalateButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#f59e0b",
  },
  resolveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#10b981",
    padding: 14,
    borderRadius: 8,
  },
  resolveButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#fff",
  },
  closeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#ef4444",
    padding: 14,
    borderRadius: 8,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#ef4444",
  },
  infoBox: {
    margin: 20,
    padding: 16,
    backgroundColor: "#eff6ff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#93c5fd",
    marginBottom: 32,
  },
  infoBoxTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#1e40af",
    marginBottom: 8,
  },
  infoBoxText: {
    fontSize: 14,
    color: "#1e3a8a",
    lineHeight: 22,
  },
});
