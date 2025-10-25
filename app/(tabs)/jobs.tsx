import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
} from "react-native";
import {
  Briefcase,
  Plus,
  Search,
  MapPin,
  Clock,
  DollarSign,
  X,
} from "lucide-react-native";
import { Stack, useRouter } from "expo-router";
import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { useJobs } from "@/contexts/JobsContext";
import { Job, JobUrgency } from "@/types";
import { TRADES } from "@/constants/trades";

export default function JobsScreen() {
  const router = useRouter();
  const { user, hasPermission } = useAuth();
  const { jobs, createJob, isLoading } = useJobs();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrade, setSelectedTrade] = useState("All");
  const [showPostModal, setShowPostModal] = useState(false);

  const canPostJobs = hasPermission("canPostJobs");

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTrade =
        selectedTrade === "All" || job.trade === selectedTrade;
      return matchesSearch && matchesTrade;
    });
  }, [jobs, searchQuery, selectedTrade]);

  const renderJobCard = ({ item }: { item: Job }) => {
    const urgencyColors: Record<JobUrgency, string> = {
      low: Colors.success,
      medium: Colors.warning,
      high: Colors.secondary,
      urgent: Colors.error,
    };

    return (
      <TouchableOpacity
        style={styles.jobCard}
        onPress={() => {
          console.log('Navigating to job details from jobs page:', item.id, item.title);
          router.push(`/job-details?id=${item.id}`);
        }}
      >
        <View style={styles.jobHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.jobTitle}>{item.title}</Text>
            <Text style={styles.jobCompany}>{item.postedByCompany}</Text>
          </View>
          <View
            style={[
              styles.urgencyBadge,
              { backgroundColor: urgencyColors[item.urgency] },
            ]}
          >
            <Text style={styles.urgencyText}>
              {item.urgency.toUpperCase()}
            </Text>
          </View>
        </View>

        <Text style={styles.jobDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.jobDetails}>
          <View style={styles.detailItem}>
            <Briefcase size={16} color={Colors.textSecondary} />
            <Text style={styles.detailText}>{item.trade}</Text>
          </View>
          <View style={styles.detailItem}>
            <MapPin size={16} color={Colors.textSecondary} />
            <Text style={styles.detailText}>{item.location}</Text>
          </View>
        </View>

        <View style={styles.jobDetails}>
          {item.payRate && (
            <View style={styles.detailItem}>
              <DollarSign size={16} color={Colors.textSecondary} />
              <Text style={styles.detailText}>{item.payRate}</Text>
            </View>
          )}
          <View style={styles.detailItem}>
            <Clock size={16} color={Colors.textSecondary} />
            <Text style={styles.detailText}>
              Starts {new Date(item.startDate).toLocaleDateString()}
            </Text>
          </View>
        </View>

        <View style={styles.jobFooter}>
          <Text style={styles.applicationsCount}>
            {item.applicationsCount} application
            {item.applicationsCount !== 1 ? "s" : ""}
          </Text>
          <Text style={styles.postedTime}>
            Posted {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.safeArea}>
      <Stack.Screen
        options={{
          title: "Jobs & Gigs",
          headerShown: true,
          headerStyle: {
            backgroundColor: Colors.surface,
          },
          headerTintColor: Colors.text,
          headerShadowVisible: false,
          headerRight: () =>
            canPostJobs ? (
              <TouchableOpacity
                onPress={() => setShowPostModal(true)}
                style={styles.headerButton}
              >
                <Plus size={24} color={Colors.primary} />
              </TouchableOpacity>
            ) : null,
        }}
      />

      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color={Colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search jobs..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={Colors.textTertiary}
            />
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          {["All", ...TRADES.filter((t) => t !== "All")].map((trade) => (
            <TouchableOpacity
              key={trade}
              style={[
                styles.filterChip,
                selectedTrade === trade && styles.filterChipActive,
              ]}
              onPress={() => setSelectedTrade(trade)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedTrade === trade && styles.filterChipTextActive,
                ]}
              >
                {trade}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {isLoading ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Loading jobs...</Text>
          </View>
        ) : filteredJobs.length === 0 ? (
          <View style={styles.emptyState}>
            <Briefcase size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyStateText}>No jobs found</Text>
            <Text style={styles.emptyStateSubtext}>
              {searchQuery || selectedTrade !== "All"
                ? "Try adjusting your filters"
                : canPostJobs
                ? "Be the first to post a job!"
                : "Check back later for new opportunities"}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredJobs}
            renderItem={renderJobCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.jobsList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <PostJobModal
        visible={showPostModal}
        onClose={() => setShowPostModal(false)}
        onSubmit={async (jobData) => {
          if (!user) return;
          await createJob({
            ...jobData,
            postedBy: user.id,
            postedByName: user.name,
            postedByCompany: user.company,
          });
          setShowPostModal(false);
        }}
      />
    </View>
  );
}

function PostJobModal({
  visible,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    trade: "Electrical",
    location: "Los Angeles, CA",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    budget: "",
    payRate: "",
    urgency: "medium" as JobUrgency,
    requirements: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!formData.title || !formData.description) {
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        status: "open",
        requirements: formData.requirements
          .split("\n")
          .filter((r) => r.trim()),
      });
      setFormData({
        title: "",
        description: "",
        trade: "Electrical",
        location: "Los Angeles, CA",
        startDate: new Date().toISOString().split("T")[0],
        endDate: "",
        budget: "",
        payRate: "",
        urgency: "medium",
        requirements: "",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Post New Job</Text>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.modalContent}
          contentContainerStyle={styles.modalContentInner}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formGroup}>
            <Text style={styles.label}>Job Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Senior Electrician Needed"
              value={formData.title}
              onChangeText={(text) =>
                setFormData({ ...formData, title: text })
              }
              placeholderTextColor={Colors.textTertiary}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe the job requirements and responsibilities..."
              value={formData.description}
              onChangeText={(text) =>
                setFormData({ ...formData, description: text })
              }
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor={Colors.textTertiary}
            />
          </View>

          <View style={styles.formRow}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Trade</Text>
              <View style={styles.pickerContainer}>
                <Text style={styles.pickerText}>{formData.trade}</Text>
              </View>
            </View>

            <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Urgency</Text>
              <View style={styles.pickerContainer}>
                <Text style={styles.pickerText}>
                  {formData.urgency.charAt(0).toUpperCase() +
                    formData.urgency.slice(1)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              placeholder="City, State"
              value={formData.location}
              onChangeText={(text) =>
                setFormData({ ...formData, location: text })
              }
              placeholderTextColor={Colors.textTertiary}
            />
          </View>

          <View style={styles.formRow}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Start Date</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                value={formData.startDate}
                onChangeText={(text) =>
                  setFormData({ ...formData, startDate: text })
                }
                placeholderTextColor={Colors.textTertiary}
              />
            </View>

            <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>End Date (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                value={formData.endDate}
                onChangeText={(text) =>
                  setFormData({ ...formData, endDate: text })
                }
                placeholderTextColor={Colors.textTertiary}
              />
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Budget (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., $50,000"
                value={formData.budget}
                onChangeText={(text) =>
                  setFormData({ ...formData, budget: text })
                }
                placeholderTextColor={Colors.textTertiary}
              />
            </View>

            <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Pay Rate (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., $50/hour"
                value={formData.payRate}
                onChangeText={(text) =>
                  setFormData({ ...formData, payRate: text })
                }
                placeholderTextColor={Colors.textTertiary}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Requirements (one per line)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Valid license&#10;5+ years experience&#10;Own tools"
              value={formData.requirements}
              onChangeText={(text) =>
                setFormData({ ...formData, requirements: text })
              }
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor={Colors.textTertiary}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              submitting && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={submitting || !formData.title || !formData.description}
          >
            <Text style={styles.submitButtonText}>
              {submitting ? "Posting..." : "Post Job"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerButton: {
    padding: 8,
    marginRight: 8,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  filterContainer: {
    maxHeight: 50,
    marginBottom: 8,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
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
    color: Colors.white,
  },
  jobsList: {
    padding: 16,
    paddingTop: 8,
  },
  jobCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  jobHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  jobCompany: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  urgencyText: {
    fontSize: 10,
    fontWeight: "700" as const,
    color: Colors.white,
  },
  jobDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  jobDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  jobFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  applicationsCount: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
  postedTime: {
    fontSize: 12,
    color: Colors.textTertiary,
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
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.textTertiary,
    textAlign: "center",
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
  formGroup: {
    marginBottom: 20,
  },
  formRow: {
    flexDirection: "row",
    marginHorizontal: -8,
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
    minHeight: 100,
    paddingTop: 12,
  },
  pickerContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pickerText: {
    fontSize: 16,
    color: Colors.text,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 32,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.white,
  },
});
