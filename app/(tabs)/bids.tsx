import Colors from "@/constants/colors";
import { Bid, BidStatus } from "@/types";
import { useBids } from "@/contexts/BidsContext";
import { useAuth } from "@/contexts/AuthContext";
import { Stack, useRouter } from "expo-router";
import { Calendar, FileText, Plus, Users, X, Building2 } from "lucide-react-native";
import React, { useState } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
} from "react-native";

const STATUS_FILTERS: (BidStatus | "all")[] = ["all", "pending", "submitted", "awarded", "declined"];

const STATUS_LABELS: Record<BidStatus | "all", string> = {
  all: "All",
  pending: "Pending",
  submitted: "Submitted",
  awarded: "Awarded",
  declined: "Declined",
};

interface BidCardProps {
  bid: Bid;
  onPress: () => void;
  submissionsCount: number;
}

function BidCard({ bid, onPress, submissionsCount }: BidCardProps) {
  const statusColors: Record<BidStatus, string> = {
    pending: Colors.warning,
    submitted: Colors.info,
    awarded: Colors.success,
    declined: Colors.error,
  };

  const daysUntilDue = Math.ceil(
    (new Date(bid.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <TouchableOpacity style={styles.bidCard} onPress={onPress}>
      <View style={styles.bidHeader}>
        <View style={styles.bidTitleSection}>
          <Text style={styles.bidTitle} numberOfLines={1}>
            {bid.projectName}
          </Text>
          <Text style={styles.bidDate}>
            Created {new Date(bid.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <View
          style={[
            styles.bidStatus,
            { backgroundColor: statusColors[bid.status] + "15" },
          ]}
        >
          <Text style={[styles.bidStatusText, { color: statusColors[bid.status] }]}>
            {STATUS_LABELS[bid.status]}
          </Text>
        </View>
      </View>

      <Text style={styles.bidDescription} numberOfLines={2}>
        {bid.description}
      </Text>

      {bid.budget && (
        <View style={styles.budgetRow}>
          <Text style={styles.budgetLabel}>Budget:</Text>
          <Text style={styles.budgetValue}>{bid.budget}</Text>
        </View>
      )}

      <View style={styles.bidMetrics}>
        <View style={styles.metricItem}>
          <Users size={16} color={Colors.textSecondary} />
          <Text style={styles.metricText}>
            {submissionsCount}/{bid.contractorCount} Bids
          </Text>
        </View>
        <View style={styles.metricItem}>
          <Calendar size={16} color={Colors.textSecondary} />
          <Text style={styles.metricText}>
            {daysUntilDue > 0 ? `${daysUntilDue} days left` : "Overdue"}
          </Text>
        </View>
      </View>

      {submissionsCount > 0 && (
        <View style={styles.submissionsSection}>
          <Text style={styles.submissionsTitle}>
            {submissionsCount} submission{submissionsCount > 1 ? 's' : ''} received
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function BidsScreen() {
  const router = useRouter();
  const { hasPermission } = useAuth();
  const { bids, getSubmissionsByBidId, isLoading } = useBids();
  const [selectedStatus, setSelectedStatus] = useState<BidStatus | "all">("all");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const canCreateBids = hasPermission("canCreateBids");

  const filteredBids = bids.filter((bid) => {
    if (selectedStatus === "all") return true;
    return bid.status === selectedStatus;
  });

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "Bids",
          headerStyle: {
            backgroundColor: Colors.surface,
          },
          headerTitleStyle: {
            color: Colors.text,
            fontWeight: "700" as const,
          },
          headerRight: () => canCreateBids ? (
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setShowCreateModal(true)}
            >
              <Plus size={24} color={Colors.primary} />
            </TouchableOpacity>
          ) : null,
        }}
      />

      <View style={styles.filtersSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        >
          {STATUS_FILTERS.map((status) => {
            const count =
              status === "all"
                ? bids.length
                : bids.filter((b) => b.status === status).length;

            return (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterChip,
                  selectedStatus === status && styles.filterChipActive,
                ]}
                onPress={() => setSelectedStatus(status)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedStatus === status && styles.filterChipTextActive,
                  ]}
                >
                  {STATUS_LABELS[status]} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {isLoading ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>Loading bids...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredBids}
          renderItem={({ item }) => (
            <BidCard 
              bid={item} 
              submissionsCount={getSubmissionsByBidId(item.id).length}
              onPress={() => router.push(`/bid-details?id=${item.id}`)}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <FileText size={48} color={Colors.textTertiary} />
              <Text style={styles.emptyStateTitle}>No bids found</Text>
              <Text style={styles.emptyStateDescription}>
                {canCreateBids ? "Tap the + button to create your first bid" : "Check back later for new bids"}
              </Text>
            </View>
          }
        />
      )}

      <CreateBidModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </View>
  );
}

function CreateBidModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const { createBid } = useBids();
  const [formData, setFormData] = useState({
    projectName: "",
    description: "",
    dueDate: "",
    budget: "",
    contractorCount: "5",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!formData.projectName || !formData.description || !formData.dueDate) return;

    setSubmitting(true);
    try {
      await createBid({
        projectName: formData.projectName,
        description: formData.description,
        dueDate: formData.dueDate,
        budget: formData.budget,
        status: "pending",
        contractorCount: parseInt(formData.contractorCount) || 5,
      });
      setFormData({
        projectName: "",
        description: "",
        dueDate: "",
        budget: "",
        contractorCount: "5",
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Create New Bid</Text>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.modalContent}
          contentContainerStyle={styles.modalContentInner}
        >
          <TouchableOpacity
            style={styles.templateButton}
            onPress={() => {
              onClose();
              router.push("/template-selection");
            }}
          >
            <Building2 size={20} color={Colors.primary} />
            <View style={styles.templateButtonContent}>
              <Text style={styles.templateButtonTitle}>Use Project Template</Text>
              <Text style={styles.templateButtonText}>Complete house build with 20+ phases</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR CREATE CUSTOM BID</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Project Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Downtown Office Renovation"
              value={formData.projectName}
              onChangeText={(text) =>
                setFormData({ ...formData, projectName: text })
              }
              placeholderTextColor={Colors.textTertiary}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe the project scope and requirements..."
              value={formData.description}
              onChangeText={(text) =>
                setFormData({ ...formData, description: text })
              }
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              placeholderTextColor={Colors.textTertiary}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Due Date *</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={formData.dueDate}
              onChangeText={(text) =>
                setFormData({ ...formData, dueDate: text })
              }
              placeholderTextColor={Colors.textTertiary}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Budget (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., $250,000 - $300,000"
              value={formData.budget}
              onChangeText={(text) =>
                setFormData({ ...formData, budget: text })
              }
              placeholderTextColor={Colors.textTertiary}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Number of Contractors to Invite</Text>
            <TextInput
              style={styles.input}
              placeholder="5"
              value={formData.contractorCount}
              onChangeText={(text) =>
                setFormData({ ...formData, contractorCount: text })
              }
              keyboardType="numeric"
              placeholderTextColor={Colors.textTertiary}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              submitting && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={submitting || !formData.projectName || !formData.description || !formData.dueDate}
          >
            <Text style={styles.submitButtonText}>
              {submitting ? "Creating..." : "Create Bid"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  addButton: {
    padding: 8,
  },
  filtersSection: {
    backgroundColor: Colors.surface,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filtersContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: Colors.surface,
  },
  listContent: {
    padding: 16,
  },
  bidCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bidHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "flex-start" as const,
    marginBottom: 12,
  },
  bidTitleSection: {
    flex: 1,
    marginRight: 12,
  },
  bidTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  bidDate: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  bidStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  bidStatusText: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  bidDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  budgetRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginBottom: 12,
  },
  budgetLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginRight: 8,
  },
  budgetValue: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  bidMetrics: {
    flexDirection: "row" as const,
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginBottom: 12,
  },
  metricItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
  },
  metricText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: "500" as const,
  },
  submissionsSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  submissionsTitle: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
  emptyState: {
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center" as const,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  modalContent: {
    flex: 1,
  },
  modalContentInner: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textArea: {
    minHeight: 120,
    paddingTop: 12,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center" as const,
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.white,
  },
  templateButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    backgroundColor: Colors.primary + "10",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primary + "40",
    marginBottom: 24,
  },
  templateButtonContent: {
    flex: 1,
  },
  templateButtonTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.primary,
    marginBottom: 4,
  },
  templateButtonText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  divider: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginBottom: 24,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.textTertiary,
  },
});
