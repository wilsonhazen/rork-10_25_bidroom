import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import Colors from "@/constants/colors";
import {
  Sparkles,
  Building2,
  MapPin,
  Briefcase,
  FileText,
  Shield,
  CheckCircle,
  ChevronRight,
  Clock,
} from "lucide-react-native";
import { TRADES } from "@/constants/trades";

const ONBOARDING_STEPS = [
  { id: "profile", title: "Complete Profile", icon: Building2 },
  { id: "expertise", title: "Your Expertise", icon: Briefcase },
  { id: "verification", title: "Verification", icon: Shield },
] as const;

type OnboardingStep = typeof ONBOARDING_STEPS[number]["id"];

interface ProfileData {
  bio: string;
  location: string;
  yearsExperience: string;
  trades: string[];
  specialties: string[];
  insuranceAmount: string;
  licenseNumber: string;
  serviceArea: string;
}

export default function OnboardingScreen() {
  const { user, updateUser } = useAuth();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("profile");
  const [isLoading, setIsLoading] = useState(false);
  
  const [profileData, setProfileData] = useState<ProfileData>({
    bio: "",
    location: "",
    yearsExperience: "",
    trades: [],
    specialties: [],
    insuranceAmount: "",
    licenseNumber: "",
    serviceArea: "",
  });

  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    generateSmartSuggestions();
  }, [currentStep, profileData, user?.role]);

  const generateSmartSuggestions = () => {
    const newSuggestions: string[] = [];

    if (currentStep === "profile") {
      if (!profileData.bio) {
        newSuggestions.push(
          user?.role === "GC"
            ? "Add a bio highlighting your project management experience"
            : "Describe your expertise and what makes you stand out"
        );
      }
      
      if (!profileData.location) {
        newSuggestions.push("Add your location to help clients find you");
      }

      if (!profileData.yearsExperience) {
        newSuggestions.push("Years of experience builds trust with potential clients");
      }
    }

    if (currentStep === "expertise") {
      if (profileData.trades.length === 0) {
        newSuggestions.push("Select your primary trade to get relevant job opportunities");
      } else if (profileData.trades.length === 1) {
        newSuggestions.push("Consider adding related trades to expand opportunities");
      }

      if (profileData.specialties.length === 0) {
        newSuggestions.push("Adding specialties helps you stand out in specific niches");
      }

      if (!profileData.serviceArea) {
        newSuggestions.push("Define your service area to match with nearby projects");
      }
    }

    if (currentStep === "verification") {
      if (!profileData.licenseNumber) {
        newSuggestions.push("Adding a license number increases trust by 60%");
      }
      
      if (!profileData.insuranceAmount) {
        newSuggestions.push("Verified insurance coverage can increase your bids by 40%");
      }

      if (user?.role === "Subcontractor" || user?.role === "Trade Specialist") {
        newSuggestions.push("Complete verification to access premium job postings");
      }
    }

    setSuggestions(newSuggestions);
  };

  const getRoleSuggestions = () => {
    const role = user?.role;
    
    if (role === "GC") {
      return [
        "Highlight your project management credentials",
        "Mention notable projects you've completed",
        "Include team size and capabilities",
      ];
    }
    
    if (role === "Subcontractor" || role === "Trade Specialist") {
      return [
        "Showcase your specialized skills",
        "List certifications and training",
        "Mention equipment and tools you own",
      ];
    }
    
    if (role === "Project Manager") {
      return [
        "Detail your project coordination experience",
        "Include software tools you're proficient in",
        "Mention your team management style",
      ];
    }

    return [
      "Be specific about your experience",
      "Mention your availability",
      "Highlight your reliability",
    ];
  };

  const getTradesSuggestions = () => {
    const role = user?.role;
    
    if (role === "GC") {
      return ["General Contractor", "Project Management", "Construction Management"];
    }
    
    if (profileData.trades.includes("Electrical")) {
      return ["Low Voltage", "Solar Installation", "Generator Installation"];
    }
    
    if (profileData.trades.includes("Plumbing")) {
      return ["Gas Lines", "Water Heaters", "Drain Cleaning"];
    }
    
    if (profileData.trades.includes("HVAC")) {
      return ["Duct Work", "Air Quality", "Refrigeration"];
    }

    return ["High-end Finishes", "Custom Work", "Emergency Service"];
  };

  const handleNext = async () => {
    const stepIndex = ONBOARDING_STEPS.findIndex(s => s.id === currentStep);
    
    if (stepIndex < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(ONBOARDING_STEPS[stepIndex + 1].id);
    } else {
      await handleComplete();
    }
  };

  const handleSkip = () => {
    router.replace("/(tabs)");
  };

  const handleComplete = async () => {
    setIsLoading(true);
    
    try {
      await updateUser({
        ...user,
        ...profileData,
      } as any);

      Alert.alert(
        "Profile Complete!",
        "Your profile has been set up. You can always update it later in settings.",
        [{ text: "Get Started", onPress: () => router.replace("/(tabs)") }]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to save profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderProgressBar = () => {
    const stepIndex = ONBOARDING_STEPS.findIndex(s => s.id === currentStep);
    const progress = ((stepIndex + 1) / ONBOARDING_STEPS.length) * 100;

    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          Step {stepIndex + 1} of {ONBOARDING_STEPS.length}
        </Text>
      </View>
    );
  };

  const renderSuggestions = () => {
    if (suggestions.length === 0) return null;

    return (
      <View style={styles.suggestionsCard}>
        <View style={styles.suggestionsHeader}>
          <Sparkles size={18} color={Colors.primary} />
          <Text style={styles.suggestionsTitle}>Smart Suggestions</Text>
        </View>
        {suggestions.map((suggestion, index) => (
          <View key={index} style={styles.suggestionItem}>
            <CheckCircle size={14} color={Colors.success} />
            <Text style={styles.suggestionText}>{suggestion}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderProfileStep = () => (
    <View style={styles.stepContent}>
      <View style={styles.stepHeader}>
        <Building2 size={32} color={Colors.primary} />
        <Text style={styles.stepTitle}>Complete Your Profile</Text>
        <Text style={styles.stepSubtitle}>
          Help others get to know you and your business
        </Text>
      </View>

      {renderSuggestions()}

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Professional Bio</Text>
          <Text style={styles.hint}>
            {getRoleSuggestions()[0]}
          </Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder={`Tell others about your ${user?.role === "GC" ? "company and experience" : "skills and expertise"}...`}
            placeholderTextColor={Colors.textTertiary}
            value={profileData.bio}
            onChangeText={(text) => setProfileData({ ...profileData, bio: text })}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Location</Text>
          <View style={styles.inputWithIcon}>
            <MapPin size={18} color={Colors.textSecondary} />
            <TextInput
              style={[styles.input, styles.inputWithIconText]}
              placeholder="City, State"
              placeholderTextColor={Colors.textTertiary}
              value={profileData.location}
              onChangeText={(text) => setProfileData({ ...profileData, location: text })}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Years of Experience</Text>
          <View style={styles.inputWithIcon}>
            <Clock size={18} color={Colors.textSecondary} />
            <TextInput
              style={[styles.input, styles.inputWithIconText]}
              placeholder="e.g., 5, 10, 15+"
              placeholderTextColor={Colors.textTertiary}
              value={profileData.yearsExperience}
              onChangeText={(text) => setProfileData({ ...profileData, yearsExperience: text })}
              keyboardType="number-pad"
            />
          </View>
        </View>
      </View>
    </View>
  );

  const renderExpertiseStep = () => (
    <View style={styles.stepContent}>
      <View style={styles.stepHeader}>
        <Briefcase size={32} color={Colors.primary} />
        <Text style={styles.stepTitle}>Your Expertise</Text>
        <Text style={styles.stepSubtitle}>
          Select your trades and specialties to get matched with relevant work
        </Text>
      </View>

      {renderSuggestions()}

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Primary Trade(s)</Text>
          <Text style={styles.hint}>Select all that apply</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.chipsContainer}
          >
            {TRADES.slice(1, 20).map((trade) => {
              const isSelected = profileData.trades.includes(trade);
              return (
                <TouchableOpacity
                  key={trade}
                  style={[
                    styles.chip,
                    isSelected && styles.chipSelected,
                  ]}
                  onPress={() => {
                    if (isSelected) {
                      setProfileData({
                        ...profileData,
                        trades: profileData.trades.filter(t => t !== trade),
                      });
                    } else {
                      setProfileData({
                        ...profileData,
                        trades: [...profileData.trades, trade],
                      });
                    }
                  }}
                >
                  <Text style={[
                    styles.chipText,
                    isSelected && styles.chipTextSelected,
                  ]}>
                    {trade}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Specialties</Text>
          <Text style={styles.hint}>
            What makes you unique? Add custom specialties
          </Text>
          <View style={styles.suggestedChips}>
            {getTradesSuggestions().map((specialty) => {
              const isSelected = profileData.specialties.includes(specialty);
              return (
                <TouchableOpacity
                  key={specialty}
                  style={[
                    styles.chip,
                    isSelected && styles.chipSelected,
                  ]}
                  onPress={() => {
                    if (isSelected) {
                      setProfileData({
                        ...profileData,
                        specialties: profileData.specialties.filter(s => s !== specialty),
                      });
                    } else {
                      setProfileData({
                        ...profileData,
                        specialties: [...profileData.specialties, specialty],
                      });
                    }
                  }}
                >
                  <Text style={[
                    styles.chipText,
                    isSelected && styles.chipTextSelected,
                  ]}>
                    {specialty}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Service Area</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Within 50 miles of Denver, CO"
            placeholderTextColor={Colors.textTertiary}
            value={profileData.serviceArea}
            onChangeText={(text) => setProfileData({ ...profileData, serviceArea: text })}
          />
        </View>
      </View>
    </View>
  );

  const renderVerificationStep = () => (
    <View style={styles.stepContent}>
      <View style={styles.stepHeader}>
        <Shield size={32} color={Colors.primary} />
        <Text style={styles.stepTitle}>Build Trust</Text>
        <Text style={styles.stepSubtitle}>
          Verification increases your chances of winning bids
        </Text>
      </View>

      {renderSuggestions()}

      <View style={styles.trustStats}>
        <View style={styles.trustStat}>
          <Text style={styles.trustStatValue}>60%</Text>
          <Text style={styles.trustStatLabel}>Higher Trust</Text>
        </View>
        <View style={styles.trustStat}>
          <Text style={styles.trustStatValue}>40%</Text>
          <Text style={styles.trustStatLabel}>More Bids</Text>
        </View>
        <View style={styles.trustStat}>
          <Text style={styles.trustStatValue}>3x</Text>
          <Text style={styles.trustStatLabel}>More Callbacks</Text>
        </View>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>License Number (Optional)</Text>
          <View style={styles.inputWithIcon}>
            <FileText size={18} color={Colors.textSecondary} />
            <TextInput
              style={[styles.input, styles.inputWithIconText]}
              placeholder="Enter your license number"
              placeholderTextColor={Colors.textTertiary}
              value={profileData.licenseNumber}
              onChangeText={(text) => setProfileData({ ...profileData, licenseNumber: text })}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Insurance Coverage (Optional)</Text>
          <View style={styles.inputWithIcon}>
            <Shield size={18} color={Colors.textSecondary} />
            <TextInput
              style={[styles.input, styles.inputWithIconText]}
              placeholder="e.g., $1M General Liability"
              placeholderTextColor={Colors.textTertiary}
              value={profileData.insuranceAmount}
              onChangeText={(text) => setProfileData({ ...profileData, insuranceAmount: text })}
            />
          </View>
        </View>

        <View style={styles.verificationInfo}>
          <Text style={styles.verificationInfoText}>
            You can upload verification documents later in your profile settings.
            Verified accounts get priority in search results!
          </Text>
        </View>
      </View>
    </View>
  );

  const renderStep = () => {
    switch (currentStep) {
      case "profile":
        return renderProfileStep();
      case "expertise":
        return renderExpertiseStep();
      case "verification":
        return renderVerificationStep();
      default:
        return null;
    }
  };

  const stepIndex = ONBOARDING_STEPS.findIndex(s => s.id === currentStep);
  const isLastStep = stepIndex === ONBOARDING_STEPS.length - 1;

  return (
    <View style={styles.container}>
      {renderProgressBar()}
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderStep()}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          disabled={isLoading}
        >
          <Text style={styles.skipButtonText}>Skip for now</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.surface} />
          ) : (
            <>
              <Text style={styles.nextButtonText}>
                {isLastStep ? "Complete" : "Next"}
              </Text>
              <ChevronRight size={20} color={Colors.surface} />
            </>
          )}
        </TouchableOpacity>
      </View>
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
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  progressContainer: {
    padding: 16,
    paddingTop: 60,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: "600" as const,
    textAlign: "center",
  },
  stepContent: {
    gap: 24,
  },
  stepHeader: {
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.text,
    textAlign: "center",
  },
  stepSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  suggestionsCard: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.primary + "20",
  },
  suggestionsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  suggestionsTitle: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.primary,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  suggestionText: {
    flex: 1,
    fontSize: 13,
    color: Colors.text,
    lineHeight: 18,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  hint: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: -4,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: Colors.text,
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  inputWithIconText: {
    flex: 1,
    borderWidth: 0,
    padding: 16,
    paddingLeft: 0,
  },
  chipsContainer: {
    flexDirection: "row",
    gap: 8,
  },
  suggestedChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  chipTextSelected: {
    color: Colors.surface,
  },
  trustStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  trustStat: {
    alignItems: "center",
    gap: 4,
  },
  trustStatValue: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.primary,
  },
  trustStatLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: "600" as const,
  },
  verificationInfo: {
    backgroundColor: Colors.info + "15",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.info + "30",
  },
  verificationInfoText: {
    fontSize: 13,
    color: Colors.text,
    lineHeight: 20,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    gap: 12,
    padding: 24,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  skipButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  nextButton: {
    flex: 2,
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.surface,
  },
});
