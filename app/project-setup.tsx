import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import {
  FileText,
  DollarSign,

  Building,
  ArrowRight,
  CheckCircle,
  Loader,
  AlertCircle,
} from "lucide-react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { useProjects } from "@/contexts/ProjectsContext";
import { useBids } from "@/contexts/BidsContext";
import { generateText } from "@rork-ai/toolkit-sdk";

export default function ProjectSetupScreen() {
  const { bidId, submissionId } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { getBidById, getSubmissionsByBidId } = useBids();
  const { createProject, createScopeOfWork, createContract, createMilestone } = useProjects();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [contractNotes, setContractNotes] = useState("");

  const [projectData, setProjectData] = useState({
    title: "",
    description: "",
    totalAmount: 0,
    escrowBalance: 0,
    startDate: "",
    endDate: "",
  });

  const [scopeData, setScopeData] = useState<any>(null);
  const [contractData, setContractData] = useState<any>(null);
  const [milestonesData, setMilestonesData] = useState<any[]>([]);

  const bid = getBidById(bidId as string);
  const submissions = getSubmissionsByBidId(bidId as string);
  const submission = submissions.find(s => s.id === submissionId);

  const generateContractAndScope = async () => {
    if (!bid || !submission || !user) return;

    setGenerating(true);
    setError("");

    try {
      const prompt = `Generate a comprehensive construction project contract and scope of work based on the following information:

Project: ${bid.projectName}
Description: ${bid.description}
Budget: ${bid.budget || submission.amount}
Contractor: ${submission.contractorName} from ${submission.contractorCompany}
Owner: ${user.name} from ${user.company}
Contractor Notes: ${submission.notes}
Owner Additional Notes: ${contractNotes || "None provided"}
Project Location: California

IMPORTANT: This contract must comply with California contractor law. Include the following provisions:

1. California Contractors State License Board (CSLB) Requirements:
   - Contractor license number must be displayed on all contracts
   - Notice to owner about contractor license verification at www.cslb.ca.gov
   - Three-day right to cancel notice (California Business & Professions Code § 7159)

2. California Payment Requirements (Civil Code § 8800):
   - Progress payment schedule must be clearly defined
   - Joint control provisions if applicable
   - Notice of right to file mechanics lien
   - Preliminary notice requirements

3. California Contract Requirements (Business & Professions Code § 7159):
   - Contract must be in writing for work over $500
   - Must include approximate start and completion dates
   - Must describe work to be performed
   - Must include total price and payment terms
   - Must contain notice of right to cancel
   - Must include contractor license number

4. Owner Protection Requirements:
   - Contractor must provide proof of workers' compensation insurance
   - Contractor must provide proof of general liability insurance ($1M minimum)
   - Right to demand lien releases before payments
   - Warranty provisions (minimum 1 year on workmanship)
   - Arbitration clause per California arbitration rules

5. Contractor Protection Requirements:
   - Payment schedule tied to milestone completion
   - Owner's obligation to provide site access
   - Change order procedures
   - Force majeure provisions
   - Dispute resolution procedures

6. Mandatory Disclosures:
   - Mechanics lien warning per Civil Code § 8118
   - Notice that contractor is required to be licensed and insured
   - Information about how to verify contractor's license
   - Notice of right to file complaint with CSLB

Please generate the following in JSON format:

{
  "scope": {
    "workBreakdown": {
      "phases": [
        {
          "name": "Phase name",
          "tasks": ["Task 1", "Task 2"],
          "timeline": "2-3 weeks",
          "dependencies": ["Previous phase"]
        }
      ]
    },
    "materials": {
      "items": [
        {
          "name": "Material name",
          "specifications": "Detailed specs",
          "quantity": "Amount",
          "supplier": "owner or contractor"
        }
      ]
    },
    "requirements": {
      "codes": ["Building code requirements"],
      "permits": ["Required permits"],
      "inspections": ["Inspection points"],
      "qualityStandards": ["Quality standards"]
    },
    "exclusions": ["What is not included"]
  },
  "contract": {
    "contractType": "Fixed Price Construction Contract",
    "terms": {
      "paymentSchedule": [
        {
          "milestone": "Deposit",
          "percentage": 20,
          "amount": ${submission.amount * 0.2},
          "dueDate": "Upon contract signing"
        }
      ],
      "timeline": "Project timeline description",
      "warranty": "Warranty terms (minimum 1 year on workmanship)",
      "liability": "General liability insurance required ($1M minimum)",
      "insurance": "Workers compensation and liability coverage required"
    }
  },
  "milestones": [
    {
      "title": "Milestone name",
      "description": "What needs to be completed",
      "dueDate": "YYYY-MM-DD",
      "paymentAmount": ${submission.amount * 0.2},
      "deliverables": ["Deliverable 1"],
      "acceptanceCriteria": ["Criteria 1"],
      "orderNumber": 1
    }
  ]
}

Make it detailed, professional, and legally sound with standard AIA construction contract terms adapted for California law.

Include all California-specific disclosures and notices required by law. Ensure warranty terms comply with California Civil Code requirements. Include arbitration provisions compliant with California Code of Civil Procedure.`;

      const response = await generateText(prompt);
      
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Failed to parse AI response");
      }

      const generated = JSON.parse(jsonMatch[0]);
      
      setScopeData(generated.scope);
      setContractData(generated.contract);
      setMilestonesData(generated.milestones);

      const totalAmount = submission.amount;
      setProjectData({
        title: bid.projectName,
        description: bid.description,
        totalAmount,
        escrowBalance: totalAmount,
        startDate: new Date().toISOString().split("T")[0],
        endDate: generated.milestones[generated.milestones.length - 1]?.dueDate || "",
      });

      setStep(2);
    } catch (err) {
      console.error("Error generating contract:", err);
      setError("Failed to generate contract. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleCreateProject = async () => {
    if (!user || !bid || !submission) return;

    setGenerating(true);
    setError("");

    try {
      const project = await createProject({
        bidId: bid.id,
        ownerId: user.id,
        ownerName: user.name,
        contractorId: submission.contractorId,
        contractorName: submission.contractorName,
        title: projectData.title,
        description: projectData.description,
        status: "setup",
        startDate: projectData.startDate,
        endDate: projectData.endDate,
        totalAmount: projectData.totalAmount,
        escrowBalance: projectData.escrowBalance,
      });

      if (!project) throw new Error("Failed to create project");

      await createScopeOfWork({
        projectId: project.id,
        workBreakdown: scopeData.workBreakdown,
        materials: scopeData.materials,
        requirements: scopeData.requirements,
        exclusions: scopeData.exclusions,
        approvedByOwner: false,
        approvedByContractor: false,
      });

      await createContract({
        projectId: project.id,
        contractType: contractData.contractType,
        terms: contractData.terms,
        paymentSchedule: contractData.terms.paymentSchedule,
        warrantyTerms: { description: contractData.terms.warranty },
        disputeResolution: { method: "Mediation then arbitration as per contract" },
        insuranceRequirements: { description: contractData.terms.insurance },
        ownerSigned: false,
        contractorSigned: false,
      });

      for (const milestone of milestonesData) {
        await createMilestone({
          projectId: project.id,
          title: milestone.title,
          description: milestone.description,
          dueDate: milestone.dueDate,
          paymentAmount: milestone.paymentAmount,
          deliverables: milestone.deliverables,
          acceptanceCriteria: milestone.acceptanceCriteria,
          status: "not_started",
          orderNumber: milestone.orderNumber,
        });
      }

      router.push({ pathname: "/project-dashboard", params: { id: project.id } } as any);
    } catch (err) {
      console.error("Error creating project:", err);
      setError("Failed to create project. Please try again.");
      setGenerating(false);
    }
  };

  if (!bid || !submission) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: "Project Setup", headerShown: true }} />
        <View style={styles.errorContainer}>
          <AlertCircle size={48} color={Colors.error} />
          <Text style={styles.errorTitle}>Bid Not Found</Text>
          <Text style={styles.errorText}>Unable to load bid information</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Project Setup",
          headerShown: true,
          headerStyle: { backgroundColor: Colors.surface },
          headerTintColor: Colors.text,
          headerShadowVisible: false,
        }}
      />

      <View style={styles.progressBar}>
        <View style={[styles.progressStep, step >= 1 && styles.progressStepActive]}>
          <View style={[styles.progressDot, step >= 1 && styles.progressDotActive]}>
            {step > 1 ? (
              <CheckCircle size={16} color={Colors.white} />
            ) : (
              <Text style={styles.progressNumber}>1</Text>
            )}
          </View>
          <Text style={[styles.progressLabel, step >= 1 && styles.progressLabelActive]}>
            Generate
          </Text>
        </View>

        <View style={[styles.progressLine, step >= 2 && styles.progressLineActive]} />

        <View style={[styles.progressStep, step >= 2 && styles.progressStepActive]}>
          <View style={[styles.progressDot, step >= 2 && styles.progressDotActive]}>
            {step > 2 ? (
              <CheckCircle size={16} color={Colors.white} />
            ) : (
              <Text style={styles.progressNumber}>2</Text>
            )}
          </View>
          <Text style={[styles.progressLabel, step >= 2 && styles.progressLabelActive]}>
            Review
          </Text>
        </View>

        <View style={[styles.progressLine, step >= 3 && styles.progressLineActive]} />

        <View style={[styles.progressStep, step >= 3 && styles.progressStepActive]}>
          <View style={[styles.progressDot, step >= 3 && styles.progressDotActive]}>
            <Text style={styles.progressNumber}>3</Text>
          </View>
          <Text style={[styles.progressLabel, step >= 3 && styles.progressLabelActive]}>
            Sign
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {step === 1 && (
          <View style={styles.stepContainer}>
            <View style={styles.bidSummary}>
              <Text style={styles.bidTitle}>{bid.projectName}</Text>
              <Text style={styles.bidDescription}>{bid.description}</Text>

              <View style={styles.detailsGrid}>
                <View style={styles.detailCard}>
                  <DollarSign size={20} color={Colors.primary} />
                  <Text style={styles.detailLabel}>Bid Amount</Text>
                  <Text style={styles.detailValue}>${submission.amount.toLocaleString()}</Text>
                </View>

                <View style={styles.detailCard}>
                  <Building size={20} color={Colors.primary} />
                  <Text style={styles.detailLabel}>Contractor</Text>
                  <Text style={styles.detailValue}>{submission.contractorName}</Text>
                </View>
              </View>

              <View style={styles.infoCard}>
                <FileText size={20} color={Colors.primary} />
                <View style={styles.infoCardContent}>
                  <Text style={styles.infoCardTitle}>AI Contract Generation</Text>
                  <Text style={styles.infoCardText}>
                    We will generate a comprehensive contract including:
                  </Text>
                  <View style={styles.featureList}>
                    <Text style={styles.featureItem}>• Detailed scope of work</Text>
                    <Text style={styles.featureItem}>• Payment milestones</Text>
                    <Text style={styles.featureItem}>• California contractor law protections</Text>
                    <Text style={styles.featureItem}>• Timeline & deliverables</Text>
                    <Text style={styles.featureItem}>• Owner & contractor legal safeguards</Text>
                  </View>
                </View>
              </View>

              <View style={styles.notesCard}>
                <Text style={styles.notesLabel}>Additional Notes (Optional)</Text>
                <Text style={styles.notesHelperText}>
                  Provide any additional details to help AI create a better contract
                  (e.g., special requirements, specific materials, timeline considerations)
                </Text>
                <TextInput
                  style={styles.notesInput}
                  placeholder="Enter notes here to improve AI-generated contract..."
                  placeholderTextColor={Colors.textTertiary}
                  value={contractNotes}
                  onChangeText={setContractNotes}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />
              </View>
            </View>

            {error ? (
              <View style={styles.errorBanner}>
                <AlertCircle size={20} color={Colors.error} />
                <Text style={styles.errorBannerText}>{error}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[styles.primaryButton, generating && styles.primaryButtonDisabled]}
              onPress={generateContractAndScope}
              disabled={generating}
            >
              {generating ? (
                <>
                  <Loader size={20} color={Colors.white} />
                  <Text style={styles.primaryButtonText}>Generating Contract...</Text>
                </>
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>Generate Contract</Text>
                  <ArrowRight size={20} color={Colors.white} />
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && scopeData && contractData && (
          <View style={styles.stepContainer}>
            <Text style={styles.sectionTitle}>Review Generated Contract</Text>

            <View style={styles.reviewCard}>
              <Text style={styles.reviewCardTitle}>Scope of Work</Text>
              <Text style={styles.reviewCardSubtitle}>
                {scopeData.workBreakdown.phases.length} phases • {scopeData.materials.items.length} materials
              </Text>
              
              <View style={styles.phasesList}>
                {scopeData.workBreakdown.phases.map((phase: any, index: number) => (
                  <View key={index} style={styles.phaseItem}>
                    <View style={styles.phaseNumber}>
                      <Text style={styles.phaseNumberText}>{index + 1}</Text>
                    </View>
                    <View style={styles.phaseContent}>
                      <Text style={styles.phaseName}>{phase.name}</Text>
                      <Text style={styles.phaseTimeline}>{phase.timeline}</Text>
                      <Text style={styles.phaseTasks}>{phase.tasks.length} tasks</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.reviewCard}>
              <Text style={styles.reviewCardTitle}>Payment Schedule</Text>
              <Text style={styles.reviewCardSubtitle}>
                {contractData.terms.paymentSchedule.length} milestone payments
              </Text>

              {contractData.terms.paymentSchedule.map((payment: any, index: number) => (
                <View key={index} style={styles.paymentItem}>
                  <View style={styles.paymentInfo}>
                    <Text style={styles.paymentMilestone}>{payment.milestone}</Text>
                    <Text style={styles.paymentDue}>{payment.dueDate}</Text>
                  </View>
                  <View style={styles.paymentAmount}>
                    <Text style={styles.paymentPercentage}>{payment.percentage}%</Text>
                    <Text style={styles.paymentValue}>${payment.amount.toLocaleString()}</Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.reviewCard}>
              <Text style={styles.reviewCardTitle}>Contract Terms</Text>
              <View style={styles.termsList}>
                <View style={styles.termItem}>
                  <Text style={styles.termLabel}>Warranty:</Text>
                  <Text style={styles.termValue}>{contractData.terms.warranty}</Text>
                </View>
                <View style={styles.termItem}>
                  <Text style={styles.termLabel}>Insurance:</Text>
                  <Text style={styles.termValue}>{contractData.terms.insurance}</Text>
                </View>
              </View>
            </View>

            {error ? (
              <View style={styles.errorBanner}>
                <AlertCircle size={20} color={Colors.error} />
                <Text style={styles.errorBannerText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => setStep(1)}
              >
                <Text style={styles.secondaryButtonText}>Regenerate</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.primaryButton, { flex: 1 }, generating && styles.primaryButtonDisabled]}
                onPress={handleCreateProject}
                disabled={generating}
              >
                {generating ? (
                  <>
                    <Loader size={20} color={Colors.white} />
                    <Text style={styles.primaryButtonText}>Creating...</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.primaryButtonText}>Create Project</Text>
                    <ArrowRight size={20} color={Colors.white} />
                  </>
                )}
              </TouchableOpacity>
            </View>
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
  progressBar: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingHorizontal: 32,
    paddingVertical: 24,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  progressStep: {
    alignItems: "center" as const,
    gap: 8,
  },
  progressStepActive: {},
  progressDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.border,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  progressDotActive: {
    backgroundColor: Colors.primary,
  },
  progressNumber: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.textSecondary,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.textTertiary,
  },
  progressLabelActive: {
    color: Colors.primary,
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.border,
    marginHorizontal: 8,
  },
  progressLineActive: {
    backgroundColor: Colors.primary,
  },
  stepContainer: {
    gap: 20,
  },
  bidSummary: {
    gap: 16,
  },
  bidTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  bidDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textSecondary,
  },
  detailsGrid: {
    flexDirection: "row" as const,
    gap: 12,
  },
  detailCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  infoCard: {
    flexDirection: "row" as const,
    gap: 16,
    backgroundColor: Colors.primary + "10",
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary + "30",
  },
  infoCardContent: {
    flex: 1,
    gap: 8,
  },
  infoCardTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  infoCardText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  featureList: {
    marginTop: 8,
    gap: 4,
  },
  featureItem: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  primaryButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.white,
  },
  secondaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  reviewCard: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 16,
  },
  reviewCardTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  reviewCardSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  phasesList: {
    gap: 12,
  },
  phaseItem: {
    flexDirection: "row" as const,
    gap: 12,
    padding: 12,
    backgroundColor: Colors.background,
    borderRadius: 8,
  },
  phaseNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  phaseNumberText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.white,
  },
  phaseContent: {
    flex: 1,
    gap: 4,
  },
  phaseName: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  phaseTimeline: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  phaseTasks: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  paymentItem: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentMilestone: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  paymentDue: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  paymentAmount: {
    alignItems: "flex-end" as const,
  },
  paymentPercentage: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.primary,
    marginBottom: 2,
  },
  paymentValue: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  termsList: {
    gap: 12,
  },
  termItem: {
    gap: 4,
  },
  termLabel: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  termValue: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: "row" as const,
    gap: 12,
  },
  errorBanner: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    backgroundColor: Colors.error + "10",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.error + "30",
  },
  errorBannerText: {
    flex: 1,
    fontSize: 14,
    color: Colors.error,
  },
  errorContainer: {
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
  },
  errorText: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center" as const,
  },
  notesCard: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  notesLabel: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  notesHelperText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  notesInput: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: Colors.text,
    minHeight: 120,
  },
});
