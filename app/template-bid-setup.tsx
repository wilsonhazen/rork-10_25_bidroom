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
import {
  CheckSquare,
  Square,
  Send,
  Calendar,
  DollarSign,
  Users,
  Loader,
  ChevronDown,
  ChevronUp,
} from "lucide-react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import Colors from "@/constants/colors";
import { useTemplates } from "@/contexts/TemplatesContext";
import { useBids } from "@/contexts/BidsContext";
import { useAuth } from "@/contexts/AuthContext";
import { TemplatePhase } from "@/types";

type BidGroup = {
  id: string;
  name: string;
  phases: string[];
  budget: string;
  dueDate: string;
  description: string;
};

export default function TemplateBidSetupScreen() {
  const router = useRouter();
  const { templateId, selectedPhases: selectedPhasesParam, planUrl, additionalNotes } = useLocalSearchParams();
  const { user } = useAuth();
  const { getTemplateById } = useTemplates();
  const { createBid } = useBids();
  
  const template = getTemplateById(templateId as string);
  const selectedPhaseIds = JSON.parse(selectedPhasesParam as string);
  const selectedPhases = template?.phases.filter(p => selectedPhaseIds.includes(p.id)) || [];

  const [bidGroups, setBidGroups] = useState<BidGroup[]>([]);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);

  const [newGroup, setNewGroup] = useState({
    name: "",
    selectedPhases: [] as string[],
    budget: "",
    dueDate: "",
    description: "",
  });

  const handleTogglePhaseInGroup = (phaseId: string) => {
    if (newGroup.selectedPhases.includes(phaseId)) {
      setNewGroup({
        ...newGroup,
        selectedPhases: newGroup.selectedPhases.filter(id => id !== phaseId),
      });
    } else {
      setNewGroup({
        ...newGroup,
        selectedPhases: [...newGroup.selectedPhases, phaseId],
      });
    }
  };

  const handleAddGroup = () => {
    if (!newGroup.name.trim()) {
      Alert.alert("Missing Information", "Please enter a name for this bid group.");
      return;
    }
    if (newGroup.selectedPhases.length === 0) {
      Alert.alert("No Phases Selected", "Please select at least one phase for this bid group.");
      return;
    }
    if (!newGroup.budget.trim()) {
      Alert.alert("Missing Budget", "Please enter a budget for this bid group.");
      return;
    }
    if (!newGroup.dueDate.trim()) {
      Alert.alert("Missing Due Date", "Please enter a due date for this bid group.");
      return;
    }

    const group: BidGroup = {
      id: `group-${Date.now()}`,
      name: newGroup.name,
      phases: newGroup.selectedPhases,
      budget: newGroup.budget,
      dueDate: newGroup.dueDate,
      description: newGroup.description,
    };

    setBidGroups([...bidGroups, group]);
    setNewGroup({
      name: "",
      selectedPhases: [],
      budget: "",
      dueDate: "",
      description: "",
    });
  };

  const handleRemoveGroup = (groupId: string) => {
    Alert.alert(
      "Remove Bid Group",
      "Are you sure you want to remove this bid group?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => setBidGroups(bidGroups.filter(g => g.id !== groupId)),
        },
      ]
    );
  };

  const handlePostAllBids = async () => {
    if (bidGroups.length === 0) {
      Alert.alert("No Bid Groups", "Please create at least one bid group to post.");
      return;
    }

    if (!user) {
      Alert.alert("Error", "You must be logged in to post bids.");
      return;
    }

    setPosting(true);

    try {
      for (const group of bidGroups) {
        const phaseNames = group.phases
          .map(phaseId => template?.phases.find(p => p.id === phaseId)?.name)
          .filter(Boolean)
          .join(", ");

        await createBid({
          projectName: `${template?.name} - ${group.name}`,
          description: `${group.description}\n\nPhases: ${phaseNames}\n\nTemplate: ${template?.name}\n\nAdditional Notes: ${additionalNotes || "None"}\n\nPlans: ${planUrl || "Not provided"}`,
          dueDate: group.dueDate,
          status: "pending",
          budget: group.budget,
          contractorCount: 0,
        });
      }

      Alert.alert(
        "Success",
        `${bidGroups.length} bid${bidGroups.length > 1 ? "s" : ""} posted successfully!`,
        [
          {
            text: "View Bids",
            onPress: () => router.replace("/(tabs)/bids"),
          },
        ]
      );
    } catch (error) {
      console.error("Error posting bids:", error);
      Alert.alert("Error", "Failed to post bids. Please try again.");
    } finally {
      setPosting(false);
    }
  };

  const handleCreateSingleBid = () => {
    setBidGroups([
      {
        id: `group-single-${Date.now()}`,
        name: "Complete Project",
        phases: selectedPhaseIds,
        budget: "",
        dueDate: "",
        description: `Full ${template?.name} project including all selected phases`,
      },
    ]);
  };

  if (!template) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: "Bid Setup" }} />
        <View style={styles.centered}>
          <Text style={styles.errorText}>Template not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Create Bids",
          headerShown: true,
          headerStyle: { backgroundColor: Colors.surface },
          headerTintColor: Colors.text,
          headerShadowVisible: false,
        }}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Bid Groups</Text>
          <Text style={styles.subtitle}>
            Group phases together to post separate bids, or create a single bid for the entire project
          </Text>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickActionButton} onPress={handleCreateSingleBid}>
            <Text style={styles.quickActionText}>Create Single Bid for All Phases</Text>
          </TouchableOpacity>
        </View>

        {bidGroups.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bid Groups ({bidGroups.length})</Text>
            {bidGroups.map((group) => {
              const isExpanded = expandedGroup === group.id;
              const groupPhases = group.phases
                .map(phaseId => template.phases.find(p => p.id === phaseId))
                .filter(Boolean);

              return (
                <View key={group.id} style={styles.groupCard}>
                  <TouchableOpacity
                    style={styles.groupHeader}
                    onPress={() => setExpandedGroup(isExpanded ? null : group.id)}
                  >
                    <View style={styles.groupHeaderContent}>
                      <Text style={styles.groupName}>{group.name}</Text>
                      <Text style={styles.groupPhaseCount}>
                        {group.phases.length} phase{group.phases.length > 1 ? "s" : ""}
                      </Text>
                    </View>
                    {isExpanded ? (
                      <ChevronUp size={20} color={Colors.textSecondary} />
                    ) : (
                      <ChevronDown size={20} color={Colors.textSecondary} />
                    )}
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.groupContent}>
                      <View style={styles.groupDetail}>
                        <DollarSign size={16} color={Colors.textSecondary} />
                        <Text style={styles.groupDetailText}>{group.budget}</Text>
                      </View>
                      <View style={styles.groupDetail}>
                        <Calendar size={16} color={Colors.textSecondary} />
                        <Text style={styles.groupDetailText}>{group.dueDate}</Text>
                      </View>
                      {group.description && (
                        <Text style={styles.groupDescription}>{group.description}</Text>
                      )}

                      <View style={styles.phasesInGroup}>
                        {groupPhases.map((phase) => (
                          <View key={phase?.id} style={styles.phaseTag}>
                            <Text style={styles.phaseTagText}>{phase?.name}</Text>
                          </View>
                        ))}
                      </View>

                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => handleRemoveGroup(group.id)}
                      >
                        <Text style={styles.removeButtonText}>Remove Group</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Create New Bid Group</Text>

          <View style={styles.formCard}>
            <Text style={styles.inputLabel}>Group Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Foundation & Framing, Interior Finishes"
              placeholderTextColor={Colors.textTertiary}
              value={newGroup.name}
              onChangeText={(text) => setNewGroup({ ...newGroup, name: text })}
            />

            <Text style={styles.inputLabel}>Select Phases</Text>
            <View style={styles.phaseSelectionList}>
              {selectedPhases.map((phase: TemplatePhase) => {
                const isSelected = newGroup.selectedPhases.includes(phase.id);
                const alreadyInGroup = bidGroups.some(g => g.phases.includes(phase.id));

                return (
                  <TouchableOpacity
                    key={phase.id}
                    style={[
                      styles.phaseSelectionItem,
                      isSelected && styles.phaseSelectionItemSelected,
                      alreadyInGroup && styles.phaseSelectionItemDisabled,
                    ]}
                    onPress={() => !alreadyInGroup && handleTogglePhaseInGroup(phase.id)}
                    disabled={alreadyInGroup}
                  >
                    {isSelected ? (
                      <CheckSquare size={20} color={Colors.primary} />
                    ) : (
                      <Square size={20} color={alreadyInGroup ? Colors.textTertiary : Colors.border} />
                    )}
                    <Text
                      style={[
                        styles.phaseSelectionName,
                        alreadyInGroup && styles.phaseSelectionNameDisabled,
                      ]}
                    >
                      {phase.name}
                    </Text>
                    {alreadyInGroup && (
                      <Text style={styles.assignedTag}>Assigned</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputColumn}>
                <Text style={styles.inputLabel}>Budget</Text>
                <TextInput
                  style={styles.input}
                  placeholder="$50,000"
                  placeholderTextColor={Colors.textTertiary}
                  value={newGroup.budget}
                  onChangeText={(text) => setNewGroup({ ...newGroup, budget: text })}
                  keyboardType="default"
                />
              </View>

              <View style={styles.inputColumn}>
                <Text style={styles.inputLabel}>Due Date</Text>
                <TextInput
                  style={styles.input}
                  placeholder="2025-01-15"
                  placeholderTextColor={Colors.textTertiary}
                  value={newGroup.dueDate}
                  onChangeText={(text) => setNewGroup({ ...newGroup, dueDate: text })}
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>Description (Optional)</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Describe requirements for this group..."
              placeholderTextColor={Colors.textTertiary}
              value={newGroup.description}
              onChangeText={(text) => setNewGroup({ ...newGroup, description: text })}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <TouchableOpacity style={styles.addGroupButton} onPress={handleAddGroup}>
              <Users size={20} color={Colors.white} />
              <Text style={styles.addGroupButtonText}>Add Bid Group</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.postButton, (posting || bidGroups.length === 0) && styles.postButtonDisabled]}
          onPress={handlePostAllBids}
          disabled={posting || bidGroups.length === 0}
        >
          {posting ? (
            <>
              <Loader size={20} color={Colors.white} />
              <Text style={styles.postButtonText}>Posting Bids...</Text>
            </>
          ) : (
            <>
              <Send size={20} color={Colors.white} />
              <Text style={styles.postButtonText}>
                Post {bidGroups.length} Bid{bidGroups.length !== 1 ? "s" : ""}
              </Text>
            </>
          )}
        </TouchableOpacity>
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
  centered: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  quickActions: {
    marginBottom: 24,
  },
  quickActionButton: {
    backgroundColor: Colors.primary + "15",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primary + "40",
    borderStyle: "dashed" as const,
  },
  quickActionText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.primary,
    textAlign: "center" as const,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 16,
  },
  groupCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
    overflow: "hidden" as const,
  },
  groupHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    padding: 16,
  },
  groupHeaderContent: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  groupPhaseCount: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  groupContent: {
    padding: 16,
    paddingTop: 0,
    gap: 12,
  },
  groupDetail: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
  },
  groupDetailText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  groupDescription: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  phasesInGroup: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 8,
  },
  phaseTag: {
    backgroundColor: Colors.primary + "15",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  phaseTagText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: "600" as const,
  },
  removeButton: {
    marginTop: 8,
    paddingVertical: 12,
    alignItems: "center" as const,
  },
  removeButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.error,
  },
  formCard: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: Colors.text,
  },
  inputRow: {
    flexDirection: "row" as const,
    gap: 12,
  },
  inputColumn: {
    flex: 1,
  },
  textArea: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: Colors.text,
    minHeight: 100,
  },
  phaseSelectionList: {
    gap: 8,
  },
  phaseSelectionItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  phaseSelectionItemSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + "08",
  },
  phaseSelectionItemDisabled: {
    opacity: 0.5,
  },
  phaseSelectionName: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  phaseSelectionNameDisabled: {
    color: Colors.textTertiary,
  },
  assignedTag: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontStyle: "italic" as const,
  },
  addGroupButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
  },
  addGroupButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  postButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 8,
    backgroundColor: Colors.success,
    paddingVertical: 16,
    borderRadius: 12,
  },
  postButtonDisabled: {
    opacity: 0.5,
  },
  postButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.white,
  },
});
