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
  Clock,
  TrendingUp,
  AlertCircle,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import Colors from "@/constants/colors";
import { useJobs } from "@/contexts/JobsContext";
import { useBids } from "@/contexts/BidsContext";
import { useProjects } from "@/contexts/ProjectsContext";
import { useAppointments } from "@/contexts/AppointmentsContext";
import { useAuth } from "@/contexts/AuthContext";

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

export default function ContractorDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const { jobs, applications, getApplicationsByUserId } = useJobs();
  const { bids, bidSubmissions, getSubmissionsByUserId } = useBids();
  const { milestones, getUserProjects } = useProjects();
  const { appointments } = useAppointments();
  
  const [activeTab, setActiveTab] = useState<"overview" | "active" | "opportunities">("overview");

  const userApplications = useMemo(() => {
    if (!user) return [];
    return getApplicationsByUserId(user.id);
  }, [user, getApplicationsByUserId]);

  const userSubmissions = useMemo(() => {
    if (!user) return [];
    return getSubmissionsByUserId(user.id);
  }, [user, getSubmissionsByUserId]);

  const userProjects = useMemo(() => getUserProjects(), [getUserProjects]);
  const activeProjects = useMemo(() => userProjects.filter(p => p.status === "active"), [userProjects]);

  const stats = useMemo(() => {
    const activeApplications = userApplications.filter(a => a.status === "pending").length;
    const acceptedApplications = userApplications.filter(a => a.status === "accepted").length;
    const pendingBids = userSubmissions.filter(sub => {
      const bid = bids.find(b => b.id === sub.bidId);
      return bid?.status === "pending" || bid?.status === "submitted";
    }).length;
    const awardedBids = userSubmissions.filter(sub => {
      const bid = bids.find(b => b.id === sub.bidId);
      return bid?.status === "awarded";
    }).length;

    const totalEarnings = userProjects
      .filter(p => p.status === "completed")
      .reduce((sum, p) => sum + p.paidAmount, 0);

    const pendingPayments = userProjects
      .filter(p => p.status === "active")
      .reduce((sum, p) => sum + (p.totalAmount - p.paidAmount), 0);

    const inProgressMilestones = milestones.filter(m => 
      m.status === "in_progress" && 
      userProjects.some(p => p.id === m.projectId)
    ).length;

    const completedMilestones = milestones.filter(m => 
      m.status === "approved" && 
      userProjects.some(p => p.id === m.projectId)
    ).length;

    return {
      activeApplications,
      acceptedApplications,
      pendingBids,
      awardedBids,
      totalEarnings,
      pendingPayments,
      inProgressMilestones,
      completedMilestones,
      totalMilestones: milestones.filter(m => 
        userProjects.some(p => p.id === m.projectId)
      ).length,
    };
  }, [userApplications, userSubmissions, bids, userProjects, milestones]);

  const upcomingAppointments = useMemo(
    () => appointments.filter(a => a.status === "scheduled").slice(0, 3),
    [appointments]
  );

  const availableJobs = useMemo(() => {
    return jobs
      .filter(j => j.status === "open")
      .filter(j => !userApplications.some(a => a.jobId === j.id))
      .slice(0, 3);
  }, [jobs, userApplications]);

  const availableBids = useMemo(() => {
    return bids
      .filter(b => b.status === "pending")
      .filter(b => !userSubmissions.some(s => s.bidId === b.id))
      .slice(0, 3);
  }, [bids, userSubmissions]);

  const myApplications = useMemo(() => {
    return userApplications
      .filter(a => a.status === "pending")
      .slice(0, 3);
  }, [userApplications]);

  const urgentMilestones = useMemo(() => {
    const now = new Date();
    return milestones
      .filter(m => m.status === "in_progress" && userProjects.some(p => p.id === m.projectId))
      .filter(m => {
        const dueDate = new Date(m.dueDate);
        const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return daysUntilDue <= 7 && daysUntilDue >= 0;
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 3);
  }, [milestones, userProjects]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.subtitle}>Manage your jobs, bids, and active projects</Text>
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          icon={<Briefcase />}
          label="Active Projects"
          value={activeProjects.length}
          subtext={`${userProjects.length} total`}
          color={Colors.primary}
        />
        <StatCard
          icon={<FileText />}
          label="Applications"
          value={stats.activeApplications}
          subtext={`${stats.acceptedApplications} accepted`}
          color={Colors.secondary}
          onPress={() => router.push("/jobs")}
        />
        <StatCard
          icon={<DollarSign />}
          label="Total Earned"
          value={`$${(stats.totalEarnings / 1000).toFixed(0)}k`}
          subtext={`$${(stats.pendingPayments / 1000).toFixed(0)}k pending`}
          color={Colors.success}
        />
        <StatCard
          icon={<CheckCircle2 />}
          label="Milestones"
          value={`${stats.completedMilestones}/${stats.totalMilestones}`}
          subtext={`${stats.inProgressMilestones} in progress`}
          color={Colors.info}
        />
      </View>

      {urgentMilestones.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <AlertCircle size={20} color={Colors.warning} />
              <Text style={styles.sectionTitle}>Urgent Milestones</Text>
            </View>
            <Text style={styles.badge}>{urgentMilestones.length}</Text>
          </View>
          {urgentMilestones.map((milestone) => {
            const project = userProjects.find(p => p.id === milestone.projectId);
            const daysUntilDue = Math.ceil(
              (new Date(milestone.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
            );
            
            return (
              <TouchableOpacity
                key={milestone.id}
                style={styles.alertCard}
                onPress={() => router.push(`/project-dashboard?id=${milestone.projectId}` as any)}
              >
                <View style={[styles.alertIndicator, { backgroundColor: Colors.warning }]} />
                <View style={styles.alertContent}>
                  <Text style={styles.alertTitle}>{milestone.title}</Text>
                  <Text style={styles.alertMessage}>
                    {project?.title} • Due in {daysUntilDue} day{daysUntilDue !== 1 ? 's' : ''}
                  </Text>
                </View>
                <ArrowRight size={18} color={Colors.textSecondary} />
              </TouchableOpacity>
            );
          })}
        </View>
      )}

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
            Active Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "opportunities" && styles.tabActive]}
          onPress={() => setActiveTab("opportunities")}
        >
          <Text style={[styles.tabText, activeTab === "opportunities" && styles.tabTextActive]}>
            Opportunities
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "overview" && (
        <>
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

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Applications</Text>
              <TouchableOpacity onPress={() => router.push("/jobs")}>
                <Text style={styles.seeAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            {myApplications.length > 0 ? (
              myApplications.map((application) => {
                const job = jobs.find(j => j.id === application.jobId);
                if (!job) return null;
                
                return (
                  <TouchableOpacity
                    key={application.id}
                    style={styles.pipelineCard}
                    onPress={() => router.push(`/job-details?id=${job.id}` as any)}
                  >
                    <View style={styles.pipelineHeader}>
                      <Text style={styles.pipelineTitle}>{job.title}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: Colors.warning + "20" }]}>
                        <Text style={[styles.statusBadgeText, { color: Colors.warning }]}>PENDING</Text>
                      </View>
                    </View>
                    <Text style={styles.pipelineSubtext}>{job.location}</Text>
                  </TouchableOpacity>
                );
              })
            ) : (
              <View style={styles.emptyStateSmall}>
                <Clock size={32} color={Colors.textTertiary} />
                <Text style={styles.emptyStateTextSmall}>No pending applications</Text>
              </View>
            )}
          </View>
        </>
      )}

      {activeTab === "active" && (
        <>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Active Projects</Text>
            </View>
            {activeProjects.length > 0 ? (
              activeProjects.map((project) => {
                const projectMilestones = milestones.filter(m => m.projectId === project.id);
                const completedCount = projectMilestones.filter(m => m.status === "approved").length;
                
                return (
                  <TouchableOpacity
                    key={project.id}
                    style={styles.projectCard}
                    onPress={() => router.push(`/project-dashboard?id=${project.id}` as any)}
                  >
                    <View style={styles.projectHeader}>
                      <View style={styles.projectTitleContainer}>
                        <Text style={styles.projectTitle}>{project.title}</Text>
                        <Text style={styles.projectClient}>{project.ownerName}</Text>
                      </View>
                    </View>
                    <View style={styles.progressContainer}>
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width: `${project.completionPercentage}%`,
                              backgroundColor: Colors.primary,
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.progressText}>{project.completionPercentage}%</Text>
                    </View>
                    <View style={styles.projectFooter}>
                      <View style={styles.projectMeta}>
                        <CheckCircle2 size={14} color={Colors.textSecondary} />
                        <Text style={styles.projectMetaText}>
                          {completedCount}/{projectMilestones.length} milestones
                        </Text>
                      </View>
                      <View style={styles.projectMeta}>
                        <DollarSign size={14} color={Colors.textSecondary} />
                        <Text style={styles.projectMetaText}>
                          ${project.paidAmount.toLocaleString()} / ${project.totalAmount.toLocaleString()}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : (
              <View style={styles.emptyState}>
                <Briefcase size={48} color={Colors.textTertiary} />
                <Text style={styles.emptyStateText}>No active projects</Text>
                <TouchableOpacity style={styles.primaryButton} onPress={() => setActiveTab("opportunities")}>
                  <Text style={styles.primaryButtonText}>Find Opportunities</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </>
      )}

      {activeTab === "opportunities" && (
        <>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Available Jobs</Text>
              <TouchableOpacity onPress={() => router.push("/jobs")}>
                <Text style={styles.seeAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            {availableJobs.length > 0 ? (
              availableJobs.map((job) => (
                <TouchableOpacity
                  key={job.id}
                  style={styles.opportunityCard}
                  onPress={() => router.push(`/job-details?id=${job.id}` as any)}
                >
                  <View style={styles.opportunityHeader}>
                    <Text style={styles.opportunityTitle}>{job.title}</Text>
                    <View
                      style={[
                        styles.urgencyBadge,
                        { 
                          backgroundColor: job.urgency === "urgent" || job.urgency === "high" 
                            ? Colors.error 
                            : Colors.secondary 
                        },
                      ]}
                    >
                      <Text style={styles.urgencyText}>{job.urgency.toUpperCase()}</Text>
                    </View>
                  </View>
                  <Text style={styles.opportunityDescription} numberOfLines={2}>
                    {job.description}
                  </Text>
                  <View style={styles.opportunityFooter}>
                    <Text style={styles.opportunityLocation}>{job.location}</Text>
                    {job.budget && (
                      <Text style={styles.opportunityBudget}>{job.budget}</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyStateSmall}>
                <Briefcase size={32} color={Colors.textTertiary} />
                <Text style={styles.emptyStateTextSmall}>No jobs available</Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Available Bids</Text>
              <TouchableOpacity onPress={() => router.push("/bids")}>
                <Text style={styles.seeAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            {availableBids.length > 0 ? (
              availableBids.map((bid) => {
                const daysUntilDue = Math.ceil(
                  (new Date(bid.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                );
                
                return (
                  <TouchableOpacity
                    key={bid.id}
                    style={styles.opportunityCard}
                    onPress={() => router.push(`/bid-details?id=${bid.id}` as any)}
                  >
                    <View style={styles.opportunityHeader}>
                      <Text style={styles.opportunityTitle}>{bid.projectName}</Text>
                      {daysUntilDue <= 3 && (
                        <View style={[styles.urgencyBadge, { backgroundColor: Colors.warning }]}>
                          <Text style={styles.urgencyText}>URGENT</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.opportunityDescription} numberOfLines={2}>
                      {bid.description}
                    </Text>
                    <View style={styles.opportunityFooter}>
                      <Text style={styles.opportunityMeta}>
                        Due: {new Date(bid.dueDate).toLocaleDateString()}
                      </Text>
                      {bid.budget && (
                        <Text style={styles.opportunityBudget}>{bid.budget}</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : (
              <View style={styles.emptyStateSmall}>
                <FileText size={32} color={Colors.textTertiary} />
                <Text style={styles.emptyStateTextSmall}>No bids available</Text>
              </View>
            )}
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
            <Text style={styles.quickActionText}>Browse Jobs</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => router.push("/bids")}
          >
            <FileText size={24} color={Colors.white} />
            <Text style={styles.quickActionText}>View Bids</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => router.push("/schedule")}
          >
            <Calendar size={24} color={Colors.white} />
            <Text style={styles.quickActionText}>Schedule</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => router.push("/profile")}
          >
            <TrendingUp size={24} color={Colors.white} />
            <Text style={styles.quickActionText}>My Stats</Text>
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
  sectionTitleContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
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
  projectClient: {
    fontSize: 12,
    color: Colors.textSecondary,
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
  pipelineHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "flex-start" as const,
    marginBottom: 4,
  },
  pipelineTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
    marginRight: 8,
  },
  pipelineSubtext: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "700" as const,
  },
  opportunityCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  opportunityHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "flex-start" as const,
    marginBottom: 8,
  },
  opportunityTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
    marginRight: 8,
  },
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  urgencyText: {
    fontSize: 10,
    fontWeight: "700" as const,
    color: Colors.white,
  },
  opportunityDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 12,
    lineHeight: 18,
  },
  opportunityFooter: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  },
  opportunityLocation: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: "500" as const,
  },
  opportunityBudget: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: "600" as const,
  },
  opportunityMeta: {
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
