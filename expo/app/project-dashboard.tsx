import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import {
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  AlertCircle,
  TrendingUp,
} from "lucide-react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import Colors from "@/constants/colors";
import { useProjects } from "@/contexts/ProjectsContext";
import { useAuth } from "@/contexts/AuthContext";

export default function ProjectDashboardScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const {
    getProjectById,
    getScopeByProjectId,
    getContractByProjectId,
    getMilestonesByProjectId,
    getProgressUpdatesByProjectId,
  } = useProjects();

  const projectId = Array.isArray(id) ? id[0] : id;
  const project = getProjectById(projectId as string);
  const scope = getScopeByProjectId(projectId as string);
  const milestones = getMilestonesByProjectId(projectId as string);
  const updates = getProgressUpdatesByProjectId(projectId as string);

  const [activeTab, setActiveTab] = useState<"overview" | "milestones" | "updates">("overview");

  if (!project) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: "Project Dashboard",
            headerShown: true,
          }}
        />
        <View style={styles.errorContainer}>
          <AlertCircle size={48} color={Colors.error} />
          <Text style={styles.errorTitle}>Project Not Found</Text>
          <Text style={styles.errorText}>Unable to load project information</Text>
        </View>
      </View>
    );
  }

  const completedMilestones = milestones.filter(m => m.status === "approved").length;
  const progressPercentage = milestones.length > 0 
    ? Math.round((completedMilestones / milestones.length) * 100) 
    : 0;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: project.title,
          headerShown: true,
          headerStyle: { backgroundColor: Colors.surface },
          headerTintColor: Colors.text,
          headerShadowVisible: false,
        }}
      />

      <View style={styles.statusBar}>
        <View style={styles.statusInfo}>
          <Text style={styles.statusLabel}>Status</Text>
          <Text style={styles.statusValue}>{project.status.toUpperCase()}</Text>
        </View>
        <View style={styles.progressInfo}>
          <Text style={styles.progressLabel}>Progress</Text>
          <Text style={styles.progressValue}>{progressPercentage}%</Text>
        </View>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "overview" && styles.tabActive]}
          onPress={() => setActiveTab("overview")}
        >
          <Text style={[styles.tabText, activeTab === "overview" && styles.tabTextActive]}>
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "milestones" && styles.tabActive]}
          onPress={() => setActiveTab("milestones")}
        >
          <Text style={[styles.tabText, activeTab === "milestones" && styles.tabTextActive]}>
            Milestones ({milestones.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "updates" && styles.tabActive]}
          onPress={() => setActiveTab("updates")}
        >
          <Text style={[styles.tabText, activeTab === "updates" && styles.tabTextActive]}>
            Updates ({updates.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {activeTab === "overview" && (
          <>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <DollarSign size={24} color={Colors.primary} />
                <Text style={styles.statValue}>${project.totalAmount.toLocaleString()}</Text>
                <Text style={styles.statLabel}>Total Budget</Text>
              </View>
              <View style={styles.statCard}>
                <DollarSign size={24} color={Colors.success} />
                <Text style={styles.statValue}>${project.paidAmount.toLocaleString()}</Text>
                <Text style={styles.statLabel}>Paid</Text>
              </View>
              <View style={styles.statCard}>
                <DollarSign size={24} color={Colors.warning} />
                <Text style={styles.statValue}>${project.escrowBalance.toLocaleString()}</Text>
                <Text style={styles.statLabel}>Escrow</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Project Details</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Owner:</Text>
                <Text style={styles.detailValue}>{project.ownerName}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Contractor:</Text>
                <Text style={styles.detailValue}>{project.contractorName}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Start Date:</Text>
                <Text style={styles.detailValue}>
                  {new Date(project.startDate).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>End Date:</Text>
                <Text style={styles.detailValue}>
                  {new Date(project.endDate).toLocaleDateString()}
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{project.description}</Text>
            </View>

            {scope && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Scope of Work</Text>
                <Text style={styles.scopeText}>
                  {scope.workBreakdown.phases.length} phases • {scope.materials.items.length} materials
                </Text>
              </View>
            )}
          </>
        )}

        {activeTab === "milestones" && (
          <View style={styles.milestonesContainer}>
            {milestones.length === 0 ? (
              <View style={styles.emptyState}>
                <FileText size={48} color={Colors.textTertiary} />
                <Text style={styles.emptyStateText}>No milestones yet</Text>
              </View>
            ) : (
              milestones.map((milestone, index) => (
                <View key={milestone.id} style={styles.milestoneCard}>
                  <View style={styles.milestoneHeader}>
                    <View style={styles.milestoneNumber}>
                      <Text style={styles.milestoneNumberText}>{index + 1}</Text>
                    </View>
                    <View style={styles.milestoneInfo}>
                      <Text style={styles.milestoneTitle}>{milestone.title}</Text>
                      <Text style={styles.milestoneDescription}>{milestone.description}</Text>
                    </View>
                    <View
                      style={[
                        styles.milestoneStatus,
                        {
                          backgroundColor:
                            milestone.status === "approved"
                              ? Colors.success
                              : milestone.status === "pending_review"
                              ? Colors.warning
                              : Colors.border,
                        },
                      ]}
                    >
                      {milestone.status === "approved" && (
                        <CheckCircle size={16} color={Colors.white} />
                      )}
                      {milestone.status === "pending_review" && (
                        <Clock size={16} color={Colors.white} />
                      )}
                    </View>
                  </View>
                  <View style={styles.milestoneFooter}>
                    <View style={styles.milestoneAmount}>
                      <DollarSign size={14} color={Colors.primary} />
                      <Text style={styles.milestoneAmountText}>
                        ${milestone.paymentAmount.toLocaleString()}
                      </Text>
                    </View>
                    <Text style={styles.milestoneDueDate}>
                      Due {new Date(milestone.dueDate).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === "updates" && (
          <View style={styles.updatesContainer}>
            {updates.length === 0 ? (
              <View style={styles.emptyState}>
                <TrendingUp size={48} color={Colors.textTertiary} />
                <Text style={styles.emptyStateText}>No updates yet</Text>
              </View>
            ) : (
              updates.map((update) => (
                <View key={update.id} style={styles.updateCard}>
                  <View style={styles.updateHeader}>
                    <Text style={styles.updateTitle}>{update.updateType} Update</Text>
                    <Text style={styles.updateDate}>
                      {new Date(update.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={styles.updateDescription}>
                    Work Completed: {update.workCompleted}
                  </Text>
                  {update.workPlanned && (
                    <Text style={styles.updateDescription}>
                      Work Planned: {update.workPlanned}
                    </Text>
                  )}
                  {update.issues && (
                    <Text style={[styles.updateDescription, { color: Colors.error }]}>
                      Issues: {update.issues}
                    </Text>
                  )}
                  {update.photos && update.photos.length > 0 && (
                    <Text style={styles.updatePhotos}>
                      {update.photos.length} photo{update.photos.length > 1 ? "s" : ""} attached
                    </Text>
                  )}
                </View>
              ))
            )}
          </View>
        )}
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
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  statusBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: Colors.surface,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statusInfo: {
    alignItems: "center",
  },
  statusLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.primary,
  },
  progressInfo: {
    alignItems: "center",
  },
  progressLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  progressValue: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.success,
  },
  tabBar: {
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
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.primary,
    fontWeight: "700" as const,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    gap: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  section: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textSecondary,
  },
  scopeText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  milestonesContainer: {
    gap: 12,
  },
  milestoneCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  milestoneHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },
  milestoneNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  milestoneNumberText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.primary,
  },
  milestoneInfo: {
    flex: 1,
  },
  milestoneTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  milestoneDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  milestoneStatus: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  milestoneFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  milestoneAmount: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  milestoneAmountText: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.primary,
  },
  milestoneDueDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  updatesContainer: {
    gap: 12,
  },
  updateCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  updateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  updateTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
    marginRight: 12,
  },
  updateDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  updateDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  updatePhotos: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: "600" as const,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    gap: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  errorText: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
  },
});
