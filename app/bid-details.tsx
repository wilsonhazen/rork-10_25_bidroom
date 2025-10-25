import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import {
  DollarSign,
  Calendar,
  Users,
  FileText,
  X,
  Building,
  CheckCircle,
  XCircle,
  Clock,
  Award,
  MessageCircle,
} from "lucide-react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import Colors from "@/constants/colors";
import { useBids } from "@/contexts/BidsContext";
import { useAuth } from "@/contexts/AuthContext";
import { BidSubmission, BidStatus } from "@/types";

export default function BidDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user, hasPermission } = useAuth();
  const { getBidById, getSubmissionsByBidId, hasUserSubmitted, awardBid, declineBid } = useBids();
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"details" | "submissions">("details");

  const bidId = Array.isArray(id) ? id[0] : id;
  const bid = getBidById(bidId as string);
  const submissions = getSubmissionsByBidId(bidId as string);
  const userSubmitted = user ? hasUserSubmitted(bidId as string, user.id) : false;

  const canViewAllBids = hasPermission("canViewAllBids");
  const isContractor = user?.role === "Subcontractor" || user?.role === "Trade Specialist" || user?.role === "GC";

  if (!bid) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: "Bid Details",
            headerShown: true,
          }}
        />
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Bid not found</Text>
        </View>
      </View>
    );
  }

  const statusColors: Record<BidStatus, string> = {
    pending: Colors.warning,
    submitted: Colors.info,
    awarded: Colors.success,
    declined: Colors.error,
  };

  const daysUntilDue = Math.ceil(
    (new Date(bid.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const handleAwardBid = (submissionId: string, contractorName: string) => {
    Alert.alert(
      "Award Bid",
      `Award this bid to ${contractorName}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Award", 
          onPress: async () => {
            await awardBid(bid.id, submissionId);
            Alert.alert(
              "Success",
              "Bid awarded successfully. Ready to start the project?",
              [
                { text: "Later", style: "cancel" },
                {
                  text: "Start Project",
                  onPress: () => router.push({ pathname: "/project-setup", params: { bidId: bid.id, submissionId } } as any)
                }
              ]
            );
          }
        }
      ]
    );
  };

  const handleDeclineBid = () => {
    Alert.alert(
      "Decline Bid",
      "Are you sure you want to decline this bid opportunity?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Decline", 
          style: "destructive",
          onPress: async () => {
            await declineBid(bid.id);
            router.back();
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Bid Details",
          headerShown: true,
          headerStyle: {
            backgroundColor: Colors.surface,
          },
          headerTintColor: Colors.text,
          headerShadowVisible: false,
        }}
      />

      <View style={styles.header}>
        <Text style={styles.projectName}>{bid.projectName}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusColors[bid.status] },
          ]}
        >
          <Text style={styles.statusText}>
            {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
          </Text>
        </View>
      </View>

      {canViewAllBids && (
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === "details" && styles.tabActive,
            ]}
            onPress={() => setSelectedTab("details")}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === "details" && styles.tabTextActive,
              ]}
            >
              Details
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === "submissions" && styles.tabActive,
            ]}
            onPress={() => setSelectedTab("submissions")}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === "submissions" && styles.tabTextActive,
              ]}
            >
              Submissions ({submissions.length})
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {selectedTab === "details" ? (
          <>
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Users size={24} color={Colors.primary} />
                <Text style={styles.statValue}>{bid.contractorCount}</Text>
                <Text style={styles.statLabel}>Contractors</Text>
              </View>
              <View style={styles.statCard}>
                <FileText size={24} color={Colors.success} />
                <Text style={styles.statValue}>{submissions.length}</Text>
                <Text style={styles.statLabel}>Submissions</Text>
              </View>
              <View style={styles.statCard}>
                <Clock size={24} color={daysUntilDue > 0 ? Colors.warning : Colors.error} />
                <Text style={styles.statValue}>
                  {daysUntilDue > 0 ? daysUntilDue : 0}
                </Text>
                <Text style={styles.statLabel}>Days Left</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{bid.description}</Text>
            </View>

            {bid.budget && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Budget</Text>
                <View style={styles.budgetContainer}>
                  <DollarSign size={20} color={Colors.primary} />
                  <Text style={styles.budgetText}>{bid.budget}</Text>
                </View>
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Timeline</Text>
              <View style={styles.timelineItem}>
                <Calendar size={18} color={Colors.textSecondary} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineLabel}>Created</Text>
                  <Text style={styles.timelineValue}>
                    {new Date(bid.createdAt).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </Text>
                </View>
              </View>
              <View style={styles.timelineItem}>
                <Calendar size={18} color={Colors.textSecondary} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineLabel}>Due Date</Text>
                  <Text style={[
                    styles.timelineValue,
                    daysUntilDue <= 0 && { color: Colors.error }
                  ]}>
                    {new Date(bid.dueDate).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </Text>
                </View>
              </View>
            </View>

            {canViewAllBids && (
              <View style={styles.section}>
                <TouchableOpacity
                  style={styles.declineButton}
                  onPress={handleDeclineBid}
                >
                  <XCircle size={20} color={Colors.white} />
                  <Text style={styles.declineButtonText}>Decline This Bid</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        ) : (
          <View style={styles.submissionsContainer}>
            {submissions.length === 0 ? (
              <View style={styles.emptySubmissions}>
                <FileText size={48} color={Colors.textTertiary} />
                <Text style={styles.emptySubmissionsTitle}>
                  No submissions yet
                </Text>
                <Text style={styles.emptySubmissionsText}>
                  Waiting for contractors to submit their bids
                </Text>
              </View>
            ) : (
              submissions.map((submission) => (
                <SubmissionCard 
                  key={submission.id} 
                  submission={submission} 
                  canAward={canViewAllBids && bid.status !== "awarded"}
                  onAward={() => handleAwardBid(submission.id, submission.contractorName)}
                />
              ))
            )}
          </View>
        )}
      </ScrollView>

      {isContractor && bid.status === "pending" && !userSubmitted && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={() => setShowSubmitModal(true)}
          >
            <Text style={styles.submitButtonText}>Submit Bid</Text>
          </TouchableOpacity>
        </View>
      )}

      {userSubmitted && (
        <View style={styles.footer}>
          <View style={styles.submittedBanner}>
            <CheckCircle size={20} color={Colors.success} />
            <Text style={styles.submittedText}>You have submitted your bid</Text>
          </View>
        </View>
      )}

      <SubmitBidModal
        visible={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        bidId={bid.id}
        bidName={bid.projectName}
      />
    </View>
  );
}

function SubmissionCard({ 
  submission, 
  canAward, 
  onAward 
}: { 
  submission: BidSubmission;
  canAward: boolean;
  onAward: () => void;
}) {
  const router = useRouter();
  const { user } = useAuth();

  const handleSendMessage = () => {
    router.push({ 
      pathname: "/messages", 
      params: { userId: submission.contractorId } 
    } as any);
  };

  return (
    <View style={styles.submissionCard}>
      <View style={styles.submissionHeader}>
        <View style={styles.submissionInfo}>
          <Text style={styles.submissionContractor}>
            {submission.contractorName}
          </Text>
          <View style={styles.submissionCompanyRow}>
            <Building size={14} color={Colors.textSecondary} />
            <Text style={styles.submissionCompany}>
              {submission.contractorCompany}
            </Text>
          </View>
        </View>
        <View style={styles.submissionAmount}>
          <Text style={styles.submissionAmountLabel}>Bid Amount</Text>
          <Text style={styles.submissionAmountValue}>
            ${submission.amount.toLocaleString()}
          </Text>
        </View>
      </View>

      <View style={styles.submissionBody}>
        <Text style={styles.submissionNotesLabel}>Notes:</Text>
        <Text style={styles.submissionNotes}>{submission.notes}</Text>
      </View>

      {submission.documents.length > 0 && (
        <View style={styles.documentsSection}>
          <Text style={styles.documentsLabel}>Documents:</Text>
          {submission.documents.map((doc, index) => (
            <View key={index} style={styles.documentItem}>
              <FileText size={16} color={Colors.primary} />
              <Text style={styles.documentName}>{doc}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.submissionFooter}>
        <Text style={styles.submissionDate}>
          Submitted {new Date(submission.submittedAt).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.messageButton}
          onPress={handleSendMessage}
        >
          <MessageCircle size={18} color={Colors.primary} />
          <Text style={styles.messageButtonText}>Send Message</Text>
        </TouchableOpacity>
        {canAward && (
          <TouchableOpacity
            style={styles.awardButton}
            onPress={onAward}
          >
            <Award size={18} color={Colors.white} />
            <Text style={styles.awardButtonText}>Award Bid</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function SubmitBidModal({
  visible,
  onClose,
  bidId,
  bidName,
}: {
  visible: boolean;
  onClose: () => void;
  bidId: string;
  bidName: string;
}) {
  const { submitBid } = useBids();
  const [formData, setFormData] = useState({
    amount: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!formData.amount || !formData.notes) return;

    setSubmitting(true);
    try {
      await submitBid(bidId, {
        amount: parseFloat(formData.amount),
        notes: formData.notes,
      });
      setFormData({ amount: "", notes: "" });
      onClose();
      Alert.alert("Success", "Your bid has been submitted successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to submit bid. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Submit Bid</Text>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.modalContent}
          contentContainerStyle={styles.modalContentInner}
        >
          <View style={styles.bidNameContainer}>
            <Text style={styles.bidNameLabel}>Project:</Text>
            <Text style={styles.bidName}>{bidName}</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Bid Amount *</Text>
            <View style={styles.amountInputContainer}>
              <Text style={styles.dollarSign}>$</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="50000"
                value={formData.amount}
                onChangeText={(text) =>
                  setFormData({ ...formData, amount: text })
                }
                keyboardType="numeric"
                placeholderTextColor={Colors.textTertiary}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Proposal & Notes *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your approach, timeline, materials, and any important details..."
              value={formData.notes}
              onChangeText={(text) =>
                setFormData({ ...formData, notes: text })
              }
              multiline
              numberOfLines={8}
              textAlignVertical="top"
              placeholderTextColor={Colors.textTertiary}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.modalSubmitButton,
              submitting && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={submitting || !formData.amount || !formData.notes}
          >
            <Text style={styles.submitButtonText}>
              {submitting ? "Submitting..." : "Submit Bid"}
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
  header: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  projectName: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 12,
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
    color: Colors.white,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  statsContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  section: {
    backgroundColor: Colors.surface,
    padding: 20,
    marginBottom: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: Colors.textSecondary,
  },
  budgetContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  budgetText: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.primary,
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 16,
  },
  timelineContent: {
    flex: 1,
  },
  timelineLabel: {
    fontSize: 13,
    color: Colors.textTertiary,
    marginBottom: 4,
  },
  timelineValue: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  submissionsContainer: {
    padding: 16,
  },
  emptySubmissions: {
    alignItems: "center",
    paddingVertical: 64,
  },
  emptySubmissionsTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubmissionsText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  submissionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  submissionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 16,
  },
  submissionInfo: {
    flex: 1,
  },
  submissionContractor: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 6,
  },
  submissionCompanyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  submissionCompany: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  submissionAmount: {
    alignItems: "flex-end",
  },
  submissionAmountLabel: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginBottom: 4,
  },
  submissionAmountValue: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: Colors.success,
  },
  submissionBody: {
    marginBottom: 12,
  },
  submissionNotesLabel: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  submissionNotes: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.text,
  },
  documentsSection: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginBottom: 12,
  },
  documentsLabel: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  documentItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
  },
  documentName: {
    fontSize: 14,
    color: Colors.primary,
  },
  submissionFooter: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  submissionDate: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  messageButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  messageButtonText: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.primary,
  },
  awardButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.success,
    borderRadius: 12,
    paddingVertical: 12,
  },
  awardButtonText: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.white,
  },
  declineButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.error,
    borderRadius: 12,
    paddingVertical: 14,
  },
  declineButtonText: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.white,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    padding: 16,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.white,
  },
  submittedBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
  },
  submittedText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.success,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  bidNameContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bidNameLabel: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginBottom: 4,
  },
  bidName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
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
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dollarSign: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: Colors.text,
    marginRight: 4,
  },
  amountInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
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
    minHeight: 140,
    paddingTop: 12,
  },
  modalSubmitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
});
