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
  Building2,
  CheckCircle,
  Circle,
  DollarSign,
  Calendar,
  ChevronRight,
  Upload,
  Info,
  AlertCircle,
} from "lucide-react-native";
import { Stack, useRouter } from "expo-router";
import Colors from "@/constants/colors";
import { useTemplates } from "@/contexts/TemplatesContext";
import { useAuth } from "@/contexts/AuthContext";
import { TemplatePhase } from "@/types";

export default function TemplateSelectionScreen() {
  const router = useRouter();
  const { hasPermission } = useAuth();
  const { templates, calculateSelectedPhaseCost, validatePhaseSelection } = useTemplates();
  
  const [selectedPhases, setSelectedPhases] = useState<string[]>([]);
  const [planUrl, setPlanUrl] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  
  const template = templates[0];
  const canViewPricing = hasPermission("canCreateBids");

  if (!canViewPricing) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: "Project Template",
            headerShown: true,
          }}
        />
        <View style={styles.centered}>
          <AlertCircle size={48} color={Colors.error} />
          <Text style={styles.errorTitle}>Access Denied</Text>
          <Text style={styles.errorText}>Only project owners can access templates</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const handleTogglePhase = (phaseId: string) => {
    if (selectedPhases.includes(phaseId)) {
      setSelectedPhases(selectedPhases.filter(id => id !== phaseId));
    } else {
      setSelectedPhases([...selectedPhases, phaseId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedPhases.length === template.phases.length) {
      setSelectedPhases([]);
    } else {
      setSelectedPhases(template.phases.map(p => p.id));
    }
  };

  const handleContinue = () => {
    const validation = validatePhaseSelection(template, selectedPhases);
    
    if (selectedPhases.length === 0) {
      Alert.alert("No Phases Selected", "Please select at least one phase to continue.");
      return;
    }

    if (!validation.valid) {
      Alert.alert(
        "Missing Dependencies",
        `The following dependencies are required:\n\n${validation.errors.join("\n")}`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Auto-Select Dependencies", onPress: autoSelectDependencies },
        ]
      );
      return;
    }

    router.push({
      pathname: "/template-bid-setup" as any,
      params: {
        templateId: template.id,
        selectedPhases: JSON.stringify(selectedPhases),
        planUrl,
        additionalNotes,
      },
    });
  };

  const autoSelectDependencies = () => {
    const allRequired = new Set<string>(selectedPhases);
    
    selectedPhases.forEach(phaseId => {
      const phase = template.phases.find(p => p.id === phaseId);
      if (phase) {
        phase.dependencies.forEach(depId => allRequired.add(depId));
      }
    });

    setSelectedPhases(Array.from(allRequired));
  };

  const selectedCost = calculateSelectedPhaseCost(template, selectedPhases);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Project Template",
          headerShown: true,
          headerStyle: { backgroundColor: Colors.surface },
          headerTintColor: Colors.text,
          headerShadowVisible: false,
        }}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Building2 size={32} color={Colors.primary} />
          </View>
          <Text style={styles.title}>{template.name}</Text>
          <Text style={styles.description}>{template.description}</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Calendar size={20} color={Colors.primary} />
              <Text style={styles.statValue}>{template.estimatedDuration}</Text>
              <Text style={styles.statLabel}>Duration</Text>
            </View>
            <View style={styles.statCard}>
              <Building2 size={20} color={Colors.primary} />
              <Text style={styles.statValue}>{template.phases.length}</Text>
              <Text style={styles.statLabel}>Phases</Text>
            </View>
            <View style={styles.statCard}>
              <DollarSign size={20} color={Colors.primary} />
              <Text style={styles.statValue}>
                ${(template.totalEstimatedCost.min / 1000).toFixed(0)}K+
              </Text>
              <Text style={styles.statLabel}>Est. Range</Text>
              <Text style={styles.statNote}>(For your planning only)</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Info size={20} color={Colors.primary} />
          <Text style={styles.infoText}>
            Select the phases you need for your project. Dependencies will be automatically validated.
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Select Phases</Text>
            <TouchableOpacity onPress={handleSelectAll} style={styles.selectAllButton}>
              <Text style={styles.selectAllText}>
                {selectedPhases.length === template.phases.length ? "Deselect All" : "Select All"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.phasesList}>
            {template.phases.map((phase: TemplatePhase, index: number) => {
              const isSelected = selectedPhases.includes(phase.id);
              const hasDependencies = phase.dependencies.length > 0;
              
              return (
                <TouchableOpacity
                  key={phase.id}
                  style={[styles.phaseCard, isSelected && styles.phaseCardSelected]}
                  onPress={() => handleTogglePhase(phase.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.phaseCheckbox}>
                    {isSelected ? (
                      <CheckCircle size={24} color={Colors.primary} />
                    ) : (
                      <Circle size={24} color={Colors.border} />
                    )}
                  </View>

                  <View style={styles.phaseContent}>
                    <View style={styles.phaseHeader}>
                      <View style={styles.phaseNumber}>
                        <Text style={styles.phaseNumberText}>{phase.order}</Text>
                      </View>
                      <View style={styles.phaseInfo}>
                        <Text style={styles.phaseName}>{phase.name}</Text>
                        <Text style={styles.phaseDescription}>{phase.description}</Text>
                      </View>
                    </View>

                    <View style={styles.phaseDetails}>
                      <View style={styles.phaseDetailRow}>
                        <Calendar size={14} color={Colors.textSecondary} />
                        <Text style={styles.phaseDetailText}>{phase.estimatedDuration}</Text>
                      </View>
                      <View style={styles.phaseDetailRow}>
                        <DollarSign size={14} color={Colors.textSecondary} />
                        <Text style={styles.phaseDetailText}>
                          ${(phase.estimatedCost.min / 1000).toFixed(0)}K - ${(phase.estimatedCost.max / 1000).toFixed(0)}K
                        </Text>
                      </View>
                    </View>
                    <View style={styles.pricingNote}>
                      <Info size={12} color={Colors.warning} />
                      <Text style={styles.pricingNoteText}>Market estimate - not shared with contractors</Text>
                    </View>

                    {hasDependencies && (
                      <View style={styles.dependenciesTag}>
                        <AlertCircle size={12} color={Colors.warning} />
                        <Text style={styles.dependenciesText}>
                          Requires {phase.dependencies.length} phase{phase.dependencies.length > 1 ? "s" : ""}
                        </Text>
                      </View>
                    )}

                    <View style={styles.tradesContainer}>
                      {phase.trades.slice(0, 3).map((trade, idx) => (
                        <View key={idx} style={styles.tradeTag}>
                          <Text style={styles.tradeTagText}>{trade}</Text>
                        </View>
                      ))}
                      {phase.trades.length > 3 && (
                        <Text style={styles.moreTradesText}>+{phase.trades.length - 3} more</Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Plans (Optional)</Text>
          <View style={styles.inputCard}>
            <Upload size={20} color={Colors.textSecondary} />
            <TextInput
              style={styles.input}
              placeholder="Paste link to plans (Dropbox, Google Drive, etc.)"
              placeholderTextColor={Colors.textTertiary}
              value={planUrl}
              onChangeText={setPlanUrl}
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>
          <Text style={styles.helperText}>
            Contractors will have access to these plans when submitting bids
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Notes (Optional)</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Any specific requirements, preferences, or additional information..."
            placeholderTextColor={Colors.textTertiary}
            value={additionalNotes}
            onChangeText={setAdditionalNotes}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        {selectedPhases.length > 0 && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Selection Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Selected Phases:</Text>
              <Text style={styles.summaryValue}>{selectedPhases.length} of {template.phases.length}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Market Estimate:</Text>
              <Text style={styles.summaryValue}>
                ${selectedCost.min.toLocaleString()} - ${selectedCost.max.toLocaleString()}
              </Text>
            </View>
            <View style={styles.warningBox}>
              <AlertCircle size={16} color={Colors.warning} />
              <Text style={styles.warningText}>
                This pricing is for your budgeting only. Contractors cannot see these estimates and will provide independent bids.
              </Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[styles.continueButton, selectedPhases.length === 0 && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={selectedPhases.length === 0}
        >
          <Text style={styles.continueButtonText}>Continue to Bid Setup</Text>
          <ChevronRight size={20} color={Colors.white} />
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
  header: {
    alignItems: "center" as const,
    marginBottom: 24,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary + "15",
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.text,
    textAlign: "center" as const,
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center" as const,
    lineHeight: 22,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: "row" as const,
    gap: 12,
    width: "100%" as const,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center" as const,
    gap: 6,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  statNote: {
    fontSize: 10,
    color: Colors.textTertiary,
    fontStyle: "italic" as const,
    textAlign: "center" as const,
  },
  infoCard: {
    flexDirection: "row" as const,
    gap: 12,
    backgroundColor: Colors.primary + "10",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary + "30",
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  selectAllButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  selectAllText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
  phasesList: {
    gap: 12,
  },
  phaseCard: {
    flexDirection: "row" as const,
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    gap: 12,
  },
  phaseCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + "08",
  },
  phaseCheckbox: {
    paddingTop: 2,
  },
  phaseContent: {
    flex: 1,
    gap: 12,
  },
  phaseHeader: {
    flexDirection: "row" as const,
    gap: 12,
  },
  phaseNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary + "20",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  phaseNumberText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.primary,
  },
  phaseInfo: {
    flex: 1,
  },
  phaseName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  phaseDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  phaseDetails: {
    flexDirection: "row" as const,
    gap: 16,
  },
  phaseDetailRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
  },
  phaseDetailText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  dependenciesTag: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    backgroundColor: Colors.warning + "15",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignSelf: "flex-start" as const,
  },
  dependenciesText: {
    fontSize: 12,
    color: Colors.warning,
    fontWeight: "600" as const,
  },
  tradesContainer: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 6,
    alignItems: "center" as const,
  },
  tradeTag: {
    backgroundColor: Colors.background,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tradeTagText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: "600" as const,
  },
  moreTradesText: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontStyle: "italic" as const,
  },
  inputCard: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
  },
  helperText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  textArea: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: Colors.text,
    minHeight: 120,
  },
  summaryCard: {
    backgroundColor: Colors.primary + "10",
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary + "30",
    marginBottom: 16,
    gap: 12,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  summaryRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  continueButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.white,
  },
  centered: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    padding: 32,
    gap: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
    marginTop: 16,
  },
  errorText: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center" as const,
  },
  backButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  pricingNote: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    backgroundColor: Colors.warning + "10",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  pricingNoteText: {
    fontSize: 11,
    color: Colors.warning,
    fontWeight: "600" as const,
    flex: 1,
  },
  warningBox: {
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
    gap: 10,
    backgroundColor: Colors.warning + "15",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: Colors.text,
    lineHeight: 18,
  },
});
