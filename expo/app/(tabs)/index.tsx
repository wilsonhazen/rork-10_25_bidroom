import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { useJobs } from "@/contexts/JobsContext";
import { useAppointments } from "@/contexts/AppointmentsContext";
import { Job } from "@/types";
import { Stack, useRouter } from "expo-router";
import { Calendar, FileText, TrendingUp, Users } from "lucide-react-native";
import React, { useMemo } from "react";
import NotificationBell from "@/components/NotificationBell";
import OwnerDashboard from "@/components/dashboards/OwnerDashboard";
import ContractorDashboard from "@/components/dashboards/ContractorDashboard";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={[styles.statIconContainer, { backgroundColor: color + "15" }]}>
        <Text>{icon}</Text>
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );
}

interface JobCardProps {
  job: Job;
  onPress: () => void;
}

function JobCard({ job, onPress }: JobCardProps) {
  const urgencyColors = {
    low: Colors.success,
    medium: Colors.warning,
    high: Colors.secondary,
    urgent: Colors.error,
  };

  return (
    <TouchableOpacity style={styles.jobCard} onPress={onPress}>
      <View style={styles.jobHeader}>
        <Text style={styles.jobTitle} numberOfLines={1}>
          {job.title}
        </Text>
        <View
          style={[
            styles.urgencyBadge,
            { backgroundColor: urgencyColors[job.urgency] },
          ]}
        >
          <Text style={styles.urgencyText}>
            {job.urgency.toUpperCase()}
          </Text>
        </View>
      </View>
      <Text style={styles.jobDescription} numberOfLines={2}>
        {job.description}
      </Text>
      <View style={styles.jobFooter}>
        <View style={styles.jobMeta}>
          <Users size={14} color={Colors.textSecondary} />
          <Text style={styles.jobMetaText}>
            {job.applicationsCount} Application{job.applicationsCount !== 1 ? 's' : ''}
          </Text>
        </View>
        <Text style={styles.jobLocation}>{job.location}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { jobs } = useJobs();
  const { appointments } = useAppointments();

  const activeJobs = useMemo(
    () => jobs.filter((j) => j.status === "open").slice(0, 5),
    [jobs]
  );

  const upcomingAppointments = useMemo(
    () =>
      appointments
        .filter((a) => a.status === "scheduled")
        .slice(0, 2),
    [appointments]
  );

  const stats = useMemo(() => {
    const totalJobs = jobs.length;
    const activeJobsCount = jobs.filter((j) => j.status === "open").length;
    const totalApplications = jobs.reduce((acc, j) => acc + j.applicationsCount, 0);
    const upcomingCount = appointments.filter((a) => a.status === "scheduled").length;

    return {
      activeJobsCount,
      totalJobs,
      totalApplications,
      upcomingCount,
    };
  }, [jobs, appointments]);

  if (user?.role === "Project Manager" || user?.role === "Admin") {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            headerShown: true,
            headerTitle: "Dashboard",
            headerStyle: {
              backgroundColor: Colors.surface,
            },
            headerTitleStyle: {
              color: Colors.text,
              fontWeight: "700" as const,
            },
            headerRight: () => <NotificationBell />,
          }}
        />
        <OwnerDashboard />
      </View>
    );
  }

  if (user?.role === "GC" || user?.role === "Subcontractor" || user?.role === "Trade Specialist") {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            headerShown: true,
            headerTitle: "Dashboard",
            headerStyle: {
              backgroundColor: Colors.surface,
            },
            headerTitleStyle: {
              color: Colors.text,
              fontWeight: "700" as const,
            },
            headerRight: () => <NotificationBell />,
          }}
        />
        <ContractorDashboard />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "Bidroom",
          headerStyle: {
            backgroundColor: Colors.surface,
          },
          headerTitleStyle: {
            color: Colors.text,
            fontWeight: "700" as const,
          },
          headerRight: () => <NotificationBell />,
        }}
      />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.name}</Text>
          </View>

          <View style={styles.statsGrid}>
            <StatCard
              icon={<FileText size={20} color={Colors.primary} />}
              label="Active Jobs"
              value={stats.activeJobsCount}
              color={Colors.primary}
            />
            <StatCard
              icon={<TrendingUp size={20} color={Colors.success} />}
              label="Applications"
              value={stats.totalApplications}
              color={Colors.success}
            />
            <StatCard
              icon={<Calendar size={20} color={Colors.secondary} />}
              label="Appointments"
              value={stats.upcomingCount}
              color={Colors.secondary}
            />
            <StatCard
              icon={<FileText size={20} color={Colors.info} />}
              label="Total Jobs"
              value={stats.totalJobs}
              color={Colors.info}
            />
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Open Jobs</Text>
              <TouchableOpacity onPress={() => router.push('/jobs')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            {activeJobs.length > 0 ? (
              activeJobs.map((job) => (
                <JobCard 
                  key={job.id} 
                  job={job} 
                  onPress={() => {
                    console.log('Navigating to job details:', job.id, job.title);
                    router.push(`/job-details?id=${job.id}`);
                  }} 
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <FileText size={48} color={Colors.textTertiary} />
                <Text style={styles.emptyStateText}>No open jobs</Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
              <TouchableOpacity onPress={() => router.push('/schedule')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            {upcomingAppointments.map((appointment) => (
              <TouchableOpacity 
                key={appointment.id} 
                style={styles.appointmentCard} 
                onPress={() => {
                  console.log('Navigating to appointment details:', appointment.id);
                  router.push(`/appointment-details?id=${appointment.id}`);
                }}
              >
                <View style={styles.appointmentHeader}>
                  <View
                    style={[
                      styles.appointmentIcon,
                      { backgroundColor: Colors.primary + "15" },
                    ]}
                  >
                    <Calendar size={20} color={Colors.primary} />
                  </View>
                  <View style={styles.appointmentContent}>
                    <Text style={styles.appointmentTitle} numberOfLines={1}>
                      {appointment.title}
                    </Text>
                    <Text style={styles.appointmentContractor}>
                      {appointment.contractorCompany}
                    </Text>
                  </View>
                </View>
                <View style={styles.appointmentMeta}>
                  <Text style={styles.appointmentTime}>
                    {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
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
  content: {
    padding: 16,
  },
  welcomeSection: {
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  statsGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 12,
    marginBottom: 32,
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
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: "500" as const,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
  jobCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  jobHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "flex-start" as const,
    marginBottom: 8,
  },
  jobTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
    marginRight: 12,
  },
  urgencyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  urgencyText: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: Colors.white,
  },
  jobDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  jobFooter: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  },
  jobMeta: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
  },
  jobMetaText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: "500" as const,
  },
  jobLocation: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: "500" as const,
  },
  appointmentCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  appointmentHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    marginBottom: 8,
  },
  appointmentIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  appointmentContent: {
    flex: 1,
  },
  appointmentTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  appointmentContractor: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  appointmentMeta: {
    paddingLeft: 56,
  },
  appointmentTime: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: "500" as const,
  },
  emptyState: {
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 12,
  },
});
