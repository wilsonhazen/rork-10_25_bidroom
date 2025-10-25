import Colors from "@/constants/colors";
import { Appointment } from "@/types";
import { Stack, useRouter } from "expo-router";
import { Calendar, Clock, MapPin, Check, X, AlertCircle } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { useAppointments } from "@/contexts/AppointmentsContext";

type AppointmentFilter = "all" | "scheduled" | "completed";

interface AppointmentCardProps {
  appointment: Appointment;
  onPress: () => void;
  onStatusUpdate: (id: string, status: "completed" | "no_show" | "cancelled") => void;
}

function AppointmentCard({ appointment, onPress, onStatusUpdate }: AppointmentCardProps) {
  const appointmentDate = new Date(appointment.date);
  const isValidDate = !isNaN(appointmentDate.getTime());

  const typeColors = {
    estimate: Colors.info,
    site_visit: Colors.secondary,
    meeting: Colors.success,
  };

  const typeLabels = {
    estimate: "Estimate",
    site_visit: "Site Visit",
    meeting: "Meeting",
  };

  const statusColors = {
    scheduled: Colors.info,
    completed: Colors.success,
    cancelled: Colors.error,
    no_show: Colors.warning,
  };

  const statusLabels = {
    scheduled: "Scheduled",
    completed: "Completed",
    cancelled: "Cancelled",
    no_show: "No Show",
  };

  return (
    <TouchableOpacity 
      style={styles.appointmentCard} 
      onPress={onPress}
    >
      <View style={styles.appointmentHeader}>
        <View
          style={[
            styles.appointmentIcon,
            { backgroundColor: typeColors[appointment.type] + "15" },
          ]}
        >
          <Calendar size={24} color={typeColors[appointment.type]} />
        </View>
        <View style={styles.appointmentContent}>
          <Text style={styles.appointmentTitle} numberOfLines={1}>
            {appointment.title}
          </Text>
          <Text style={styles.appointmentContractor} numberOfLines={1}>
            {appointment.contractorCompany}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusColors[appointment.status] + "15" },
          ]}
        >
          <View
            style={[
              styles.statusDot,
              { backgroundColor: statusColors[appointment.status] },
            ]}
          />
        </View>
      </View>

      <View style={styles.appointmentDetails}>
        <View style={styles.detailRow}>
          <Clock size={14} color={Colors.textSecondary} />
          <Text style={styles.detailText}>
            {isValidDate
              ? appointmentDate.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })
              : "Invalid date"}{" "}
            at {appointment.time}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <MapPin size={14} color={Colors.textSecondary} />
          <Text style={styles.detailText} numberOfLines={1}>
            {appointment.location}
          </Text>
        </View>
      </View>

      <View style={styles.appointmentFooter}>
        <View
          style={[
            styles.typeBadge,
            { backgroundColor: typeColors[appointment.type] + "15" },
          ]}
        >
          <Text
            style={[styles.typeBadgeText, { color: typeColors[appointment.type] }]}
          >
            {typeLabels[appointment.type]}
          </Text>
        </View>
        <Text style={[styles.statusLabel, { color: statusColors[appointment.status] }]}>
          {statusLabels[appointment.status]}
        </Text>
      </View>

      {appointment.status === "scheduled" && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: Colors.success }]}
            onPress={() => onStatusUpdate(appointment.id, "completed")}
          >
            <Check size={16} color={Colors.white} />
            <Text style={styles.actionBtnText}>Complete</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: Colors.warning }]}
            onPress={() => onStatusUpdate(appointment.id, "no_show")}
          >
            <AlertCircle size={16} color={Colors.white} />
            <Text style={styles.actionBtnText}>No Show</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: Colors.error }]}
            onPress={() => onStatusUpdate(appointment.id, "cancelled")}
          >
            <X size={16} color={Colors.white} />
            <Text style={styles.actionBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function ScheduleScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { appointments, getPendingEstimateRequests, updateAppointment } = useAppointments();
  const [filter, setFilter] = useState<AppointmentFilter>("all");

  const pendingRequests = getPendingEstimateRequests();

  const userAppointments = useMemo(() => {
    if (!user) return [];
    return appointments.filter(
      appt => appt.createdBy === user.id || appt.contractorId === user.id
    );
  }, [appointments, user]);

  const filteredAppointments = useMemo(() => {
    if (filter === "all") return userAppointments;
    return userAppointments.filter((a) => a.status === filter);
  }, [userAppointments, filter]);

  const groupedAppointments = useMemo(() => {
    const groups: Record<string, Appointment[]> = {};

    filteredAppointments.forEach((appointment) => {
      const date = new Date(appointment.date);
      if (isNaN(date.getTime())) {
        console.warn(`Invalid date for appointment ${appointment.id}: ${appointment.date}`);
        return;
      }
      const key = date.toISOString().split("T")[0];
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(appointment);
    });

    return Object.entries(groups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, appointments]) => ({
        date,
        appointments: appointments.sort((a, b) => a.time.localeCompare(b.time)),
      }));
  }, [filteredAppointments]);

  const stats = useMemo(() => {
    return {
      total: userAppointments.length,
      scheduled: userAppointments.filter((a) => a.status === "scheduled").length,
      completed: userAppointments.filter((a) => a.status === "completed").length,
    };
  }, [userAppointments]);

  const handleStatusUpdate = async (id: string, status: "completed" | "no_show" | "cancelled") => {
    await updateAppointment(id, { status });
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "Schedule",
          headerStyle: {
            backgroundColor: Colors.surface,
          },
          headerTitleStyle: {
            color: Colors.text,
            fontWeight: "700" as const,
          },
        }}
      />

      {pendingRequests.length > 0 && (
        <View style={styles.pendingBanner}>
          <AlertCircle size={20} color={Colors.warning} />
          <Text style={styles.pendingText}>
            {pendingRequests.length} estimate request{pendingRequests.length !== 1 ? "s" : ""} pending response
          </Text>
        </View>
      )}

      <View style={styles.statsSection}>
        <TouchableOpacity
          style={[styles.statCard, filter === "all" && styles.statCardActive]}
          onPress={() => setFilter("all")}
        >
          <Text
            style={[
              styles.statValue,
              filter === "all" && styles.statValueActive,
            ]}
          >
            {stats.total}
          </Text>
          <Text
            style={[
              styles.statLabel,
              filter === "all" && styles.statLabelActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.statCard,
            filter === "scheduled" && styles.statCardActive,
          ]}
          onPress={() => setFilter("scheduled")}
        >
          <Text
            style={[
              styles.statValue,
              filter === "scheduled" && styles.statValueActive,
            ]}
          >
            {stats.scheduled}
          </Text>
          <Text
            style={[
              styles.statLabel,
              filter === "scheduled" && styles.statLabelActive,
            ]}
          >
            Scheduled
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.statCard,
            filter === "completed" && styles.statCardActive,
          ]}
          onPress={() => setFilter("completed")}
        >
          <Text
            style={[
              styles.statValue,
              filter === "completed" && styles.statValueActive,
            ]}
          >
            {stats.completed}
          </Text>
          <Text
            style={[
              styles.statLabel,
              filter === "completed" && styles.statLabelActive,
            ]}
          >
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={groupedAppointments}
        renderItem={({ item }) => (
          <View style={styles.dateGroup}>
            <Text style={styles.dateHeader}>
              {(() => {
                const date = new Date(item.date);
                return isNaN(date.getTime())
                  ? "Invalid date"
                  : date.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    });
              })()}
            </Text>
            {item.appointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onPress={() => {
                  router.push(`/appointment-details?id=${appointment.id}`);
                }}
                onStatusUpdate={handleStatusUpdate}
              />
            ))}
          </View>
        )}
        keyExtractor={(item) => item.date}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Calendar size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyStateTitle}>No appointments</Text>
            <Text style={styles.emptyStateDescription}>
              Appointments will appear here once scheduled
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  pendingBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.warning + "20",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.warning + "40",
  },
  pendingText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.warning,
  },
  statsSection: {
    flexDirection: "row" as const,
    padding: 16,
    gap: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    alignItems: "center" as const,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  statCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + "10",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  statValueActive: {
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: "600" as const,
  },
  statLabelActive: {
    color: Colors.primary,
  },
  listContent: {
    padding: 16,
  },
  dateGroup: {
    marginBottom: 24,
  },
  dateHeader: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 12,
  },
  appointmentCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  appointmentHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginBottom: 12,
  },
  appointmentIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginRight: 12,
  },
  appointmentContent: {
    flex: 1,
  },
  appointmentTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  appointmentContractor: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statusBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  appointmentDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },
  appointmentFooter: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginBottom: 8,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.white,
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
});
