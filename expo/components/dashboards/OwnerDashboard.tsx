import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import {
  Briefcase,
  CheckCircle2,
  DollarSign,
  FileText,
  Calendar,
  ArrowRight,
  Users,
  Hammer,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import Colors from "@/constants/colors";
import { useJobs } from "@/contexts/JobsContext";
import { useBids } from "@/contexts/BidsContext";
import { useProjects } from "@/contexts/ProjectsContext";
import { useAppointments } from "@/contexts/AppointmentsContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  calculateProjectStats,
  calculateWorkflowMetrics,
  generateAlerts,
  getNextActions,
  getProjectPhase,
  getProjectHealthStatus,
} from "@/utils/dashboard";

interface StatCardProps {
  icon: React.ReactElement;
  label: string;
  value: string | number;
  subtext?: string;
  color: string;
  onPress?: () => void;
}

function StatCard({ icon, label, value, subtext, color, onPress }: StatCardProps) {
  const iconEl = React.cloneElement(icon, { size: 20, color } as any);
  
  if (onPress) {
    return (
      <TouchableOpacity style={[styles.statCard, { borderLeftColor: color }]} onPress={onPress}>
        <View style={[styles.statIconContainer, { backgroundColor: color + "15" }]}>
          {iconEl}
        </View>
        <View style={styles.statContent}>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statLabel}>{label}</Text>
          {subtext && <Text style={styles.statSubtext}>{subtext}</Text>}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={[styles.statIconContainer, { backgroundColor: color + "15" }]}>
        {iconEl}
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
        {subtext && <Text style={styles.statSubtext}>{subtext}</Text>}
      </View>
    </View>
  );
}

export default function OwnerDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const { jobs, applications } = useJobs();
  const { bids } = useBids();
  const { milestones, getUserProjects } = useProjects();
  const { appointments } = useAppointments();
  
  const [activeTab, setActiveTab] = useState<"overview" | "active" | "pipeline">("overview");

  const userProjects = useMemo(() => getUserProjects(), [getUserProjects]);
  const activeProjects = useMemo(() => userProjects.filter(p => p.status === "active"), [userProjects]);
  
  const projectStats = useMemo(() => calculateProjectStats(userProjects), [userProjects]);
  
  const workflowMetrics = useMemo(
    () => calculateWorkflowMetrics(jobs, applications, bids, appointments, milestones),
    [jobs, applications, bids, appointments, milestones]
  );

  const alerts = useMemo(
    () => generateAlerts(userProjects, milestones, applications, appointments),
    [userProjects, milestones, applications, appointments]
  );

  const nextActions = useMemo(
    () => getNextActions(user?.role || "Project Manager", userProjects, milestones, applications, bids),
    [user?.role, userProjects, milestones, applications, bids]
  );

  const upcomingAppointments = useMemo(
    () => appointments.filter(a => a.status === "scheduled").slice(0, 3),
    [appointments]
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.subtitle}>Manage your construction projects from start to finish</Text>
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          icon={<Hammer />}
          label="Active Projects"
          value={projectStats.activeProjects}
          subtext={`${projectStats.totalProjects} total`}
          color={Colors.primary}
        />
        <StatCard
          icon={<FileText />}
          label="Open Jobs"
          value={workflowMetrics.jobsPosted}
          subtext={`${workflowMetrics.applicationsPending} pending`}
          color={Colors.secondary}
          onPress={() => router.push("/jobs")}
        />
        <StatCard
          icon={<DollarSign />}
          label="Total Value"
          value={`$${(projectStats.totalRevenue / 1000).toFixed(0)}k`}
          subtext={`${projectStats.completionRate}% complete`}
          color={Colors.success}
        />
        <StatCard
          icon={<CheckCircle2 />}
          label="Milestones"
          value={`${workflowMetrics.milestonesCompleted}/${workflowMetrics.milestonesTotal}`}
          subtext="completed"
          color={Colors.info}
        />
      </View>

      {alerts.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Alerts & Notifications</Text>
            <Text style={styles.badge}>{alerts.length}</Text>
          </View>
          {alerts.slice(0, 3).map((alert) => {
            const alertColors = {
              error: Colors.error,
              warning: Colors.warning,
              info: Colors.info,
              success: Colors.success,
            };
            return (
              <TouchableOpacity
                key={alert.id}
                style={styles.alertCard}
                onPress={() => alert.actionUrl && router.push(alert.actionUrl as any)}
              >
                <View style={[styles.alertIndicator, { backgroundColor: alertColors[alert.type] }]} />
                <View style={styles.alertContent}>
                  <Text style={styles.alertTitle}>{alert.title}</Text>
                  <Text style={styles.alertMessage}>{alert.message}</Text>
                </View>
                <ArrowRight size={18} color={Colors.textSecondary} />
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Next Actions</Text>
        </View>
        {nextActions.length > 0 ? (
          nextActions.slice(0, 4).map((action) => {
            const priorityColors = {
              high: Colors.error,
              medium: Colors.warning,
              low: Colors.textSecondary,
            };
            return (
              <TouchableOpacity
                key={action.id}
                style={styles.actionCard}
                onPress={() => router.push(action.actionUrl as any)}
              >
                <View style={styles.actionLeft}>
                  <View
                    style={[
                      styles.priorityDot,
                      { backgroundColor: priorityColors[action.priority] },
                    ]}
                  />
                  <View style={styles.actionContent}>
                    <Text style={styles.actionTitle}>{action.title}</Text>
                    <Text style={styles.actionDescription}>{action.description}</Text>
                  </View>
                </View>
                <ArrowRight size={18} color={Colors.textSecondary} />
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <CheckCircle2 size={48} color={Colors.success} />
            <Text style={styles.emptyStateText}>All caught up!</Text>
          </View>
        )}
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
          style={[styles.tab, activeTab === "active" && styles.tabActive]}
          onPress={() => setActiveTab("active")}
        >
          <Text style={[styles.tabText, activeTab === "active" && styles.tabTextActive]}>
            Active Projects
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "pipeline" && styles.tabActive]}
          onPress={() => setActiveTab("pipeline")}
        >
          <Text style={[styles.tabText, activeTab === "pipeline" && styles.tabTextActive]}>
            Pipeline
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "overview" && (
        <>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Workflow Summary</Text>
            </View>
            <View style={styles.workflowGrid}>
              <View style={styles.workflowItem}>
                <Text style={styles.workflowLabel}>Jobs Posted</Text>
                <Text style={styles.workflowValue}>{workflowMetrics.jobsPosted}</Text>
              </View>
              <View style={styles.workflowDivider} />
              <View style={styles.workflowItem}>
                <Text style={styles.workflowLabel}>Jobs Filled</Text>
                <Text style={styles.workflowValue}>{workflowMetrics.jobsFilled}</Text>
              </View>
              <View style={styles.workflowDivider} />
              <View style={styles.workflowItem}>
                <Text style={styles.workflowLabel}>Pending Apps</Text>
                <Text style={styles.workflowValue}>{workflowMetrics.applicationsPending}</Text>
              </View>
              <View style={styles.workflowDivider} />
              <View style={styles.workflowItem}>
                <Text style={styles.workflowLabel}>Bids Awarded</Text>
                <Text style={styles.workflowValue}>{workflowMetrics.bidsAwarded}</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
              <TouchableOpacity onPress={() => router.push("/schedule")}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((appointment) => (
                <TouchableOpacity
                  key={appointment.id}
                  style={styles.appointmentCard}
                  onPress={() => router.push(`/appointment-details?id=${appointment.id}` as any)}
                >
                  <View style={styles.appointmentIconContainer}>
                    <Calendar size={20} color={Colors.primary} />
                  </View>
                  <View style={styles.appointmentContent}>
                    <Text style={styles.appointmentTitle}>{appointment.title}</Text>
                    <Text style={styles.appointmentMeta}>
                      {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyStateSmall}>
                <Calendar size={32} color={Colors.textTertiary} />
                <Text style={styles.emptyStateTextSmall}>No upcoming appointments</Text>
              </View>
            )}
          </View>
        </>
      )}

      {activeTab === "active" && (
        <View style={styles.section}>
          {activeProjects.length > 0 ? (
            activeProjects.map((project) => {
              const projectMilestones = milestones.filter(m => m.projectId === project.id);
              const phase = getProjectPhase(project, projectMilestones);
              const health = getProjectHealthStatus(project, projectMilestones);
              
              const healthColors = {
                on_track: Colors.success,
                ahead: Colors.info,
                at_risk: Colors.warning,
                behind: Colors.error,
              };

              return (
                <TouchableOpacity
                  key={project.id}
                  style={styles.projectCard}
                  onPress={() => router.push(`/project-dashboard?id=${project.id}` as any)}
                >
                  <View style={styles.projectHeader}>
                    <View style={styles.projectTitleContainer}>
                      <Text style={styles.projectTitle}>{project.title}</Text>
                      <Text style={styles.projectPhase}>{phase}</Text>
                    </View>
                    <View
                      style={[
                        styles.healthBadge,
                        { backgroundColor: healthColors[health.status] },
                      ]}
                    >
                      <Text style={styles.healthBadgeText}>{health.status.replace("_", " ")}</Text>
                    </View>
                  </View>
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${project.completionPercentage}%`,
                            backgroundColor: healthColors[health.status],
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.progressText}>{project.completionPercentage}%</Text>
                  </View>
                  <View style={styles.projectFooter}>
                    <View style={styles.projectMeta}>
                      <DollarSign size={14} color={Colors.textSecondary} />
                      <Text style={styles.projectMetaText}>
                        ${project.paidAmount.toLocaleString()} / ${project.totalAmount.toLocaleString()}
                      </Text>
                    </View>
                    <View style={styles.projectMeta}>
                      <Users size={14} color={Colors.textSecondary} />
                      <Text style={styles.projectMetaText}>{project.contractorName}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Briefcase size={48} color={Colors.textTertiary} />
              <Text style={styles.emptyStateText}>No active projects</Text>
              <TouchableOpacity style={styles.primaryButton} onPress={() => router.push("/jobs")}>
                <Text style={styles.primaryButtonText}>Post a Job</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {activeTab === "pipeline" && (
        <>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Open Jobs</Text>
              <TouchableOpacity onPress={() => router.push("/jobs")}>
                <Text style={styles.seeAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            {jobs.filter(j => j.status === "open").slice(0, 3).map((job) => (
              <TouchableOpacity
                key={job.id}
                style={styles.pipelineCard}
                onPress={() => router.push(`/job-details?id=${job.id}` as any)}
              >
                <Text style={styles.pipelineTitle}>{job.title}</Text>
                <View style={styles.pipelineMeta}>
                  <View style={styles.pipelineMetaItem}>
                    <Users size={14} color={Colors.textSecondary} />
                    <Text style={styles.pipelineMetaText}>{job.applicationsCount} applications</Text>
                  </View>
                  <Text style={styles.pipelineMetaText}>{job.location}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Pending Bids</Text>
              <TouchableOpacity onPress={() => router.push("/bids")}>
                <Text style={styles.seeAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            {bids.filter(b => b.status === "pending" || b.status === "submitted").slice(0, 3).map((bid) => (
              <TouchableOpacity
                key={bid.id}
                style={styles.pipelineCard}
                onPress={() => router.push(`/bid-details?id=${bid.id}` as any)}
              >
                <Text style={styles.pipelineTitle}>{bid.projectName}</Text>
                <View style={styles.pipelineMeta}>
                  <View style={styles.pipelineMetaItem}>
                    <FileText size={14} color={Colors.textSecondary} />
                    <Text style={styles.pipelineMetaText}>
                      {bid.submittedCount} of {bid.contractorCount} submitted
                    </Text>
                  </View>
                  <Text style={styles.pipelineMetaText}>
                    Due {new Date(bid.dueDate).toLocaleDateString()}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      <View style={styles.quickActions}>
        <Text style={styles.quickActionsTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => router.push("/jobs")}
          >
            <Briefcase size={24} color={Colors.white} />
            <Text style={styles.quickActionText}>Post Job</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => router.push("/bids")}
          >
            <FileText size={24} color={Colors.white} />
            <Text style={styles.quickActionText}>Create Bid</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => router.push("/contractors")}
          >
            <Users size={24} color={Colors.white} />
            <Text style={styles.quickActionText}>Find Contractors</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => router.push("/schedule")}
          >
            <Calendar size={24} color={Colors.white} />
            <Text style={styles.quickActionText}>Schedule</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 20,
    paddingTop: 8,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  welcomeText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statsGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: "500" as const,
  },
  statSubtext: {
    fontSize: 10,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  badge: {
    backgroundColor: Colors.error,
    color: Colors.white,
    fontSize: 11,
    fontWeight: "700" as const,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
  alertCard: {
    flexDirection: "row" as const,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    alignItems: "center" as const,
    gap: 12,
  },
  alertIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 2,
  },
  alertMessage: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  actionCard: {
    flexDirection: "row" as const,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
  },
  actionLeft: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  tabBar: {
    flexDirection: "row" as const,
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.white,
  },
  workflowGrid: {
    flexDirection: "row" as const,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: "center" as const,
  },
  workflowItem: {
    flex: 1,
    alignItems: "center" as const,
  },
  workflowLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 4,
    textAlign: "center" as const,
  },
  workflowValue: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  workflowDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
  },
  appointmentCard: {
    flexDirection: "row" as const,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    alignItems: "center" as const,
    gap: 12,
  },
  appointmentIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.primary + "15",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  appointmentContent: {
    flex: 1,
  },
  appointmentTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 2,
  },
  appointmentMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  projectCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  projectHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "flex-start" as const,
    marginBottom: 12,
  },
  projectTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 2,
  },
  projectPhase: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  healthBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  healthBadgeText: {
    fontSize: 10,
    fontWeight: "700" as const,
    color: Colors.white,
    textTransform: "uppercase" as const,
  },
  progressContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: "hidden" as const,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
    minWidth: 36,
    textAlign: "right" as const,
  },
  projectFooter: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  projectMeta: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
  },
  projectMetaText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  pipelineCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  pipelineTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 8,
  },
  pipelineMeta: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  },
  pipelineMetaItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
  },
  pipelineMetaText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  quickActions: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 12,
  },
  quickActionsGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 20,
    alignItems: "center" as const,
    gap: 8,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  emptyState: {
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingVertical: 60,
    gap: 12,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  emptyStateSmall: {
    alignItems: "center" as const,
    paddingVertical: 32,
    gap: 8,
  },
  emptyStateTextSmall: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "600" as const,
  },
});
