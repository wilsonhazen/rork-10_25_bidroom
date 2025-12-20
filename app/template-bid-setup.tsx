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
import DatePicker from "@/components/DatePicker";
import {
  CheckSquare,
  Send,
  DollarSign,
  Loader,
  ChevronDown,
  ChevronUp,
  Info,
  TrendingUp,
  Layers,
} from "lucide-react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import Colors from "@/constants/colors";
import { useTemplates } from "@/contexts/TemplatesContext";
import { useBids } from "@/contexts/BidsContext";
import { useAuth } from "@/contexts/AuthContext";

type PhaseBid = {
  phaseId: string;
  phaseName: string;
  phaseOrder: number;
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
  
  let selectedPhaseIds: string[] = [];
  try {
    if (typeof selectedPhasesParam === 'string') {
      selectedPhaseIds = JSON.parse(selectedPhasesParam);
    } else if (Array.isArray(selectedPhasesParam)) {
      selectedPhaseIds = selectedPhasesParam;
    }
  } catch (error) {
    console.error("Failed to parse selectedPhases:", error);
    selectedPhaseIds = [];
  }
  
  const selectedPhases = template?.phases.filter(p => selectedPhaseIds.includes(p.id)) || [];

  const [projectName, setProjectName] = useState(template?.name || "");
  const [projectDueDate, setProjectDueDate] = useState("");
  const [phaseBids, setPhaseBids] = useState<PhaseBid[]>(
    selectedPhases.map(phase => ({
      phaseId: phase.id,
      phaseName: phase.name,
      phaseOrder: phase.order,
      budget: "",
      dueDate: "",
      description: phase.description,
    }))
  );
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);

  const updatePhaseBid = (phaseId: string, field: keyof PhaseBid, value: string) => {
    setPhaseBids(prev => prev.map(pb => 
      pb.phaseId === phaseId ? { ...pb, [field]: value } : pb
    ));
  };

  const handlePostAllBids = async () => {
    if (!projectName.trim()) {
      Alert.alert("Missing Information", "Please enter a project name.");
      return;
    }

    if (!projectDueDate.trim()) {
      Alert.alert("Missing Due Date", "Please enter a project due date.");
      return;
    }

    const incompleteBids = phaseBids.filter(pb => !pb.budget.trim() || !pb.dueDate.trim());
    if (incompleteBids.length > 0) {
      Alert.alert(
        "Incomplete Information",
        `Please fill in budget and due date for all phases. ${incompleteBids.length} phase${incompleteBids.length > 1 ? 's' : ''} incomplete.`
      );
      return;
    }

    if (!user) {
      Alert.alert("Error", "You must be logged in to post bids.");
      return;
    }

    setPosting(true);

    try {
      const parentProjectId = `project-${Date.now()}`;
      
      for (const phaseBid of phaseBids) {
        const phase = template?.phases.find(p => p.id === phaseBid.phaseId);
        if (!phase) continue;

        await createBid({
          projectName: `${phaseBid.phaseName}`,
          description: `${phaseBid.description}\n\n**Phase Details:**\n- Estimated Duration: ${phase.estimatedDuration}\n- Required Trades: ${phase.trades.join(", ")}\n\n**Deliverables:**\n${phase.deliverables.map(d => `- ${d}`).join("\n")}\n\n**Tasks:**\n${phase.tasks.map(t => `- ${t}`).join("\n")}\n\n**Project Information:**\nAdditional Notes: ${additionalNotes || "None"}\nPlans: ${planUrl || "Not provided"}`,
          dueDate: phaseBid.dueDate,
          status: "pending",
          budget: phaseBid.budget,
          contractorCount: 0,
          parentProjectId,
          parentProjectName: projectName,
          phaseId: phaseBid.phaseId,
          phaseName: phaseBid.phaseName,
          phaseOrder: phaseBid.phaseOrder,
          templateId: template?.id,
        });
      }

      Alert.alert(
        "Success",
        `Project "${projectName}" created with ${phaseBids.length} separate phase bid${phaseBids.length > 1 ? "s" : ""}!\n\nContractors can now bid on individual phases.`,
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

  const applyBudgetToAll = () => {
    if (phaseBids.length === 0) return;
    const firstBudget = phaseBids[0].budget;
    if (!firstBudget) {
      Alert.alert("No Budget", "Please enter a budget for the first phase to copy to all.");
      return;
    }
    setPhaseBids(prev => prev.map(pb => ({ ...pb, budget: firstBudget })));
  };

  const applyDueDateToAll = () => {
    if (phaseBids.length === 0) return;
    const firstDueDate = phaseBids[0].dueDate;
    if (!firstDueDate) {
      Alert.alert("No Due Date", "Please enter a due date for the first phase to copy to all.");
      return;
    }
    setPhaseBids(prev => prev.map(pb => ({ ...pb, dueDate: firstDueDate })));
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
          <Text style={styles.title}>Setup Project Bids</Text>
          <Text style={styles.subtitle}>
            Each phase will be posted as a separate bid. Contractors can bid on individual phases or multiple phases.
          </Text>
        </View>

        <View style={styles.projectSection}>
          <View style={styles.projectHeader}>
            <Layers size={24} color={Colors.primary} />
            <Text style={styles.projectHeaderTitle}>Main Project Details</Text>
          </View>
          
          <View style={styles.formCard}>
            <Text style={styles.inputLabel}>Project Name</Text>
            <TextInput
              style={styles.input}
              placeholder={`e.g., ${template?.name} at [Location]`}
              placeholderTextColor={Colors.textTertiary}
              value={projectName}
              onChangeText={setProjectName}
            />

            <DatePicker
              label="Overall Project Due Date"
              value={projectDueDate}
              onChange={setProjectDueDate}
              placeholder="Select project due date"
              minimumDate={new Date()}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Individual Phase Bids ({phaseBids.length})</Text>
            <View style={styles.quickActions}>
              <TouchableOpacity style={styles.quickBtn} onPress={applyBudgetToAll}>
                <Text style={styles.quickBtnText}>Copy Budget</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickBtn} onPress={applyDueDateToAll}>
                <Text style={styles.quickBtnText}>Copy Date</Text>
              </TouchableOpacity>
            </View>
          </View>

          {phaseBids.map((phaseBid, index) => {
            const isExpanded = expandedPhase === phaseBid.phaseId;
            const phase = template?.phases.find(p => p.id === phaseBid.phaseId);
            const isComplete = phaseBid.budget.trim() && phaseBid.dueDate.trim();

            return (
              <View key={phaseBid.phaseId} style={styles.phaseCard}>
                <TouchableOpacity
                  style={styles.phaseCardHeader}
                  onPress={() => setExpandedPhase(isExpanded ? null : phaseBid.phaseId)}
                >
                  <View style={styles.phaseHeaderLeft}>
                    <View style={styles.phaseNumber}>
                      <Text style={styles.phaseNumberText}>{index + 1}</Text>
                    </View>
                    <View style={styles.phaseHeaderContent}>
                      <Text style={styles.phaseName}>{phaseBid.phaseName}</Text>
                      <View style={styles.phaseMetaRow}>
                        <View style={styles.estimateTag}>
                          <TrendingUp size={12} color={Colors.success} />
                          <Text style={styles.estimateText}>
                            ${phase?.estimatedCost.min.toLocaleString()} - ${phase?.estimatedCost.max.toLocaleString()}
                          </Text>
                        </View>
                        {isComplete && (
                          <View style={styles.completeTag}>
                            <CheckSquare size={12} color={Colors.success} />
                            <Text style={styles.completeText}>Ready</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                  {isExpanded ? (
                    <ChevronUp size={20} color={Colors.textSecondary} />
                  ) : (
                    <ChevronDown size={20} color={Colors.textSecondary} />
                  )}
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.phaseCardContent}>
                    <Text style={styles.phaseDescription}>{phaseBid.description}</Text>
                    
                    <View style={styles.phaseInfo}>
                      <Text style={styles.phaseInfoLabel}>Duration:</Text>
                      <Text style={styles.phaseInfoValue}>{phase?.estimatedDuration}</Text>
                    </View>
                    
                    <View style={styles.phaseInfo}>
                      <Text style={styles.phaseInfoLabel}>Trades:</Text>
                      <Text style={styles.phaseInfoValue}>{phase?.trades.join(", ")}</Text>
                    </View>

                    <View style={styles.inputRow}>
                      <View style={styles.inputColumn}>
                        <Text style={styles.inputLabel}>Budget</Text>
                        <TextInput
                          style={[styles.input, !phaseBid.budget && styles.inputIncomplete]}
                          placeholder="$50,000"
                          placeholderTextColor={Colors.textTertiary}
                          value={phaseBid.budget}
                          onChangeText={(text) => updatePhaseBid(phaseBid.phaseId, "budget", text)}
                        />
                      </View>

                      <View style={styles.inputColumn}>
                        <DatePicker
                          label="Due Date"
                          value={phaseBid.dueDate}
                          onChange={(date) => updatePhaseBid(phaseBid.phaseId, "dueDate", date)}
                          placeholder="Select due date"
                          minimumDate={new Date()}
                          style={!phaseBid.dueDate && styles.inputIncomplete}
                        />
                      </View>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {phaseBids.length > 0 && (() => {
          const totalEstimate = phaseBids.reduce((acc, phaseBid) => {
            const phase = template?.phases.find(p => p.id === phaseBid.phaseId);
            return {
              min: acc.min + (phase?.estimatedCost.min || 0),
              max: acc.max + (phase?.estimatedCost.max || 0),
            };
          }, { min: 0, max: 0 });

          return (
            <View style={styles.totalEstimateCard}>
              <View style={styles.totalEstimateHeader}>
                <DollarSign size={24} color={Colors.success} />
                <Text style={styles.totalEstimateTitle}>Total Project Estimate</Text>
              </View>
              <Text style={styles.totalEstimateAmount}>
                ${totalEstimate.min.toLocaleString()} - ${totalEstimate.max.toLocaleString()}
              </Text>
              <View style={styles.estimateDisclaimer}>
                <Info size={14} color={Colors.warning} />
                <Text style={styles.estimateDisclaimerText}>
                  Market estimate based on selected phases. Actual contractor bids may vary. This pricing is for your planning only and won&apos;t be visible to contractors.
                </Text>
              </View>
            </View>
          );
        })()}



        <TouchableOpacity
          style={[styles.postButton, posting && styles.postButtonDisabled]}
          onPress={handlePostAllBids}
          disabled={posting}
        >
          {posting ? (
            <>
              <Loader size={20} color={Colors.white} />
              <Text style={styles.postButtonText}>Creating Bids...</Text>
            </>
          ) : (
            <>
              <Send size={20} color={Colors.white} />
              <Text style={styles.postButtonText}>
                Post {phaseBids.length} Individual Phase Bid{phaseBids.length !== 1 ? "s" : ""}
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
    gap: 6,
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
  estimateTag: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    backgroundColor: Colors.success + "15",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignSelf: "flex-start" as const,
  },
  estimateText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.success,
  },
  totalEstimateCard: {
    backgroundColor: Colors.success + "10",
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.success + "40",
    marginBottom: 24,
    gap: 12,
  },
  totalEstimateHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
  },
  totalEstimateTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  totalEstimateAmount: {
    fontSize: 28,
    fontWeight: "800" as const,
    color: Colors.success,
    letterSpacing: 0.5,
  },
  estimateDisclaimer: {
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
    gap: 8,
    backgroundColor: Colors.warning + "10",
    padding: 12,
    borderRadius: 8,
    marginTop: 4,
  },
  estimateDisclaimerText: {
    flex: 1,
    fontSize: 12,
    color: Colors.text,
    lineHeight: 17,
  },
  newGroupEstimate: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    backgroundColor: Colors.success + "10",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  newGroupEstimateText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.success,
  },
  projectSection: {
    marginBottom: 24,
  },
  projectHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    marginBottom: 16,
  },
  projectHeaderTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  sectionHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 16,
  },
  quickBtn: {
    backgroundColor: Colors.primary + "15",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  quickBtnText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
  phaseCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
    overflow: "hidden" as const,
  },
  phaseCardHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    padding: 16,
  },
  phaseHeaderLeft: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
  },
  phaseNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary + "20",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  phaseNumberText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.primary,
  },
  phaseHeaderContent: {
    flex: 1,
    gap: 6,
  },
  phaseName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  phaseMetaRow: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 8,
    alignItems: "center" as const,
  },
  completeTag: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
    backgroundColor: Colors.success + "15",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  completeText: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: Colors.success,
  },
  phaseCardContent: {
    padding: 16,
    paddingTop: 0,
    gap: 12,
  },
  phaseDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  phaseInfo: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
  },
  phaseInfoLabel: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  phaseInfoValue: {
    fontSize: 13,
    color: Colors.text,
  },
  inputIncomplete: {
    borderColor: Colors.warning,
    borderWidth: 2,
  },
});
