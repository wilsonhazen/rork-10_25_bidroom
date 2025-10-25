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
  MapPin,
  Calendar,
  Clock,
  User,
  Building,
  FileText,
  X,
  Check,
  XCircle,
  AlertCircle,
  Edit3,
} from "lucide-react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import Colors from "@/constants/colors";
import { useAppointments } from "@/contexts/AppointmentsContext";

export default function AppointmentDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { appointments, updateAppointment } = useAppointments();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);

  const appointment = appointments.find((a) => a.id === id);

  if (!appointment) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: "Appointment Details",
            headerShown: true,
          }}
        />
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Appointment not found</Text>
        </View>
      </View>
    );
  }

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

  const handleStatusUpdate = async (
    status: "completed" | "no_show" | "cancelled"
  ) => {
    Alert.alert(
      "Update Status",
      `Mark this appointment as ${statusLabels[status]}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            await updateAppointment(appointment.id, { status });
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Appointment Details",
          headerShown: true,
          headerStyle: {
            backgroundColor: Colors.surface,
          },
          headerTintColor: Colors.text,
          headerShadowVisible: false,
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View
            style={[
              styles.typeIcon,
              { backgroundColor: typeColors[appointment.type] + "20" },
            ]}
          >
            <Calendar size={32} color={typeColors[appointment.type]} />
          </View>
          <View style={styles.headerContent}>
            <Text style={styles.title}>{appointment.title}</Text>
            <View style={styles.headerBadges}>
              <View
                style={[
                  styles.typeBadge,
                  { backgroundColor: typeColors[appointment.type] },
                ]}
              >
                <Text style={styles.typeBadgeText}>
                  {typeLabels[appointment.type]}
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: statusColors[appointment.status] },
                ]}
              >
                <Text style={styles.statusBadgeText}>
                  {statusLabels[appointment.status]}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date & Time</Text>
          <View style={styles.dateTimeContainer}>
            <View style={styles.infoRow}>
              <Calendar size={20} color={Colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Date</Text>
                <Text style={styles.infoValue}>
                  {new Date(appointment.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Clock size={20} color={Colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Time</Text>
                <Text style={styles.infoValue}>{appointment.time}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.locationContainer}>
            <MapPin size={20} color={Colors.primary} />
            <Text style={styles.locationText}>{appointment.location}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contractor</Text>
          <View style={styles.contractorCard}>
            <View style={styles.contractorRow}>
              <User size={18} color={Colors.textSecondary} />
              <Text style={styles.contractorName}>
                {appointment.contractorName}
              </Text>
            </View>
            <View style={styles.contractorRow}>
              <Building size={18} color={Colors.textSecondary} />
              <Text style={styles.contractorCompany}>
                {appointment.contractorCompany}
              </Text>
            </View>
          </View>
        </View>

        {appointment.notes && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Notes</Text>
              {appointment.status === "scheduled" && (
                <TouchableOpacity
                  onPress={() => setShowNotesModal(true)}
                  style={styles.editButton}
                >
                  <Edit3 size={16} color={Colors.primary} />
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.notesText}>{appointment.notes}</Text>
          </View>
        )}

        {!appointment.notes && appointment.status === "scheduled" && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.addNotesButton}
              onPress={() => setShowNotesModal(true)}
            >
              <FileText size={20} color={Colors.primary} />
              <Text style={styles.addNotesText}>Add Notes</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Information</Text>
          <View style={styles.metadataContainer}>
            {appointment.createdByName && (
              <View style={styles.metadataRow}>
                <Text style={styles.metadataLabel}>Created By:</Text>
                <Text style={styles.metadataValue}>
                  {appointment.createdByName}
                </Text>
              </View>
            )}
            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>Created:</Text>
              <Text style={styles.metadataValue}>
                {new Date(appointment.createdAt).toLocaleDateString()}
              </Text>
            </View>
            {appointment.updatedAt && (
              <View style={styles.metadataRow}>
                <Text style={styles.metadataLabel}>Last Updated:</Text>
                <Text style={styles.metadataValue}>
                  {new Date(appointment.updatedAt).toLocaleDateString()}
                </Text>
              </View>
            )}
            {appointment.completedAt && (
              <View style={styles.metadataRow}>
                <Text style={styles.metadataLabel}>Completed:</Text>
                <Text style={styles.metadataValue}>
                  {new Date(appointment.completedAt).toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>
        </View>

        {appointment.jobId && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.viewJobButton}
              onPress={() =>
                router.push(`/job-details?id=${appointment.jobId}`)
              }
            >
              <Text style={styles.viewJobButtonText}>View Related Job</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {appointment.status === "scheduled" && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: Colors.success }]}
            onPress={() => handleStatusUpdate("completed")}
          >
            <Check size={20} color={Colors.white} />
            <Text style={styles.actionButtonText}>Complete</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: Colors.warning }]}
            onPress={() => handleStatusUpdate("no_show")}
          >
            <AlertCircle size={20} color={Colors.white} />
            <Text style={styles.actionButtonText}>No Show</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: Colors.error }]}
            onPress={() => handleStatusUpdate("cancelled")}
          >
            <XCircle size={20} color={Colors.white} />
            <Text style={styles.actionButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      <NotesModal
        visible={showNotesModal}
        onClose={() => setShowNotesModal(false)}
        currentNotes={appointment.notes || ""}
        onSave={async (notes) => {
          await updateAppointment(appointment.id, { notes });
          setShowNotesModal(false);
        }}
      />
    </View>
  );
}

function NotesModal({
  visible,
  onClose,
  currentNotes,
  onSave,
}: {
  visible: boolean;
  onClose: () => void;
  currentNotes: string;
  onSave: (notes: string) => Promise<void>;
}) {
  const [notes, setNotes] = useState(currentNotes);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(notes);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Edit Notes</Text>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.modalContent}>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Add notes about this appointment..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={10}
            textAlignVertical="top"
            placeholderTextColor={Colors.textTertiary}
            autoFocus
          />

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>
              {saving ? "Saving..." : "Save Notes"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
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
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    backgroundColor: Colors.surface,
    padding: 20,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  typeIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 12,
  },
  headerBadges: {
    flexDirection: "row",
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: Colors.white,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: Colors.white,
  },
  section: {
    backgroundColor: Colors.surface,
    padding: 20,
    marginBottom: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 12,
  },
  editButton: {
    padding: 4,
  },
  dateTimeContainer: {
    gap: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: Colors.textTertiary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  locationText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: Colors.text,
  },
  contractorCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  contractorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  contractorName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  contractorCompany: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  notesText: {
    fontSize: 15,
    lineHeight: 24,
    color: Colors.textSecondary,
  },
  addNotesButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: "dashed",
  },
  addNotesText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
  metadataContainer: {
    gap: 12,
  },
  metadataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metadataLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  metadataValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  viewJobButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  viewJobButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
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
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.white,
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
    padding: 16,
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
    minHeight: 200,
    paddingTop: 12,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 16,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.white,
  },
});
