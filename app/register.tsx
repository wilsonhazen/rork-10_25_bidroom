import Colors from "@/constants/colors";
import { ROLES } from "@/constants/roles";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types";
import { router } from "expo-router";
import { UserPlus, ChevronDown, ShieldCheck } from "lucide-react-native";
import React, { useState, useEffect, useRef } from "react";
import { useSocialAuth } from "@/hooks/useSocialAuth";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
} from "react-native";


export default function RegisterScreen() {
  const { register, isLoading } = useAuth();
  const { loginWithGoogle, loginWithApple, loginWithGitHub, isLoading: isSocialLoading } = useSocialAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<UserRole>("GC");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRolePicker, setShowRolePicker] = useState(false);

  const [honeypot, setHoneypot] = useState("");
  const [verificationAnswer, setVerificationAnswer] = useState("");
  const [showVerification, setShowVerification] = useState(false);
  const [verificationChallenge, setVerificationChallenge] = useState({ num1: 0, num2: 0, answer: 0 });
  
  const startTimeRef = useRef<number>(Date.now());
  const interactionCountRef = useRef<number>(0);

  const selectedRoleInfo = ROLES.find((r) => r.value === role);

  useEffect(() => {
    generateChallenge();
  }, []);

  const generateChallenge = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    setVerificationChallenge({ num1, num2, answer: num1 + num2 });
  };

  const trackInteraction = () => {
    interactionCountRef.current += 1;
  };

  const handleRegister = async () => {
    if (!name || !email || !password || !company || !phone) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    setShowVerification(true);
  };

  const handleVerificationSubmit = async () => {
    if (honeypot) {
      console.warn("Bot detected: honeypot filled");
      Alert.alert("Error", "Verification failed. Please try again.");
      return;
    }

    const timeTaken = (Date.now() - startTimeRef.current) / 1000;
    if (timeTaken < 3) {
      console.warn("Bot detected: too fast submission");
      Alert.alert("Error", "Please take your time to fill out the form.");
      return;
    }

    if (interactionCountRef.current < 5) {
      console.warn("Bot detected: insufficient interactions");
      Alert.alert("Error", "Please interact with the form naturally.");
      return;
    }

    if (parseInt(verificationAnswer) !== verificationChallenge.answer) {
      Alert.alert("Error", "Incorrect answer. Please try again.");
      generateChallenge();
      setVerificationAnswer("");
      return;
    }

    setShowVerification(false);
    setIsSubmitting(true);
    const result = await register({ name, email, password, company, phone, role });
    setIsSubmitting(false);

    if (result.success) {
      router.replace("/onboarding");
    } else {
      Alert.alert("Registration Failed", result.error || "Please try again");
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <UserPlus size={48} color={Colors.primary} />
            </View>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join Bidroom to get started</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                placeholderTextColor={Colors.textTertiary}
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  trackInteraction();
                }}
                autoComplete="name"
                editable={!isSubmitting}
              />
            </View>

            <View style={styles.honeypotContainer}>
              <TextInput
                style={styles.honeypotInput}
                value={honeypot}
                onChangeText={setHoneypot}
                autoComplete="off"
                accessibilityLabel="Do not fill this field"
                testID="honeypot-field"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="your@email.com"
                placeholderTextColor={Colors.textTertiary}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  trackInteraction();
                }}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                editable={!isSubmitting}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Company Name</Text>
              <TextInput
                style={styles.input}
                placeholder="ABC Construction"
                placeholderTextColor={Colors.textTertiary}
                value={company}
                onChangeText={(text) => {
                  setCompany(text);
                  trackInteraction();
                }}
                editable={!isSubmitting}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                placeholder="(555) 123-4567"
                placeholderTextColor={Colors.textTertiary}
                value={phone}
                onChangeText={(text) => {
                  setPhone(text);
                  trackInteraction();
                }}
                keyboardType="phone-pad"
                autoComplete="tel"
                editable={!isSubmitting}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Role</Text>
              <TouchableOpacity
                style={styles.roleSelector}
                onPress={() => {
                  setShowRolePicker(true);
                  trackInteraction();
                }}
                disabled={isSubmitting}
              >
                <View>
                  <Text style={styles.roleSelectorText}>
                    {selectedRoleInfo?.label}
                  </Text>
                  <Text style={styles.roleSelectorDesc}>
                    {selectedRoleInfo?.description}
                  </Text>
                </View>
                <ChevronDown size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Minimum 6 characters"
                placeholderTextColor={Colors.textTertiary}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  trackInteraction();
                }}
                secureTextEntry
                autoComplete="password-new"
                editable={!isSubmitting}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Re-enter password"
                placeholderTextColor={Colors.textTertiary}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  trackInteraction();
                }}
                secureTextEntry
                autoComplete="password-new"
                editable={!isSubmitting}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.registerButton,
                isSubmitting && styles.buttonDisabled,
              ]}
              onPress={handleRegister}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color={Colors.surface} />
              ) : (
                <Text style={styles.registerButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR SIGN UP WITH</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialButtons}>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={async () => {
                  const result = await loginWithGoogle();
                  if (result.success) {
                    router.replace("/onboarding");
                  }
                }}
                disabled={isSubmitting || isSocialLoading}
              >
                <View style={[styles.socialIcon, { backgroundColor: "#DB4437" }]}>
                  <Text style={styles.socialIconText}>G</Text>
                </View>
                <Text style={styles.socialButtonText}>Google</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialButton}
                onPress={async () => {
                  const result = await loginWithApple();
                  if (result.success) {
                    router.replace("/onboarding");
                  }
                }}
                disabled={isSubmitting || isSocialLoading}
              >
                <View style={[styles.socialIcon, { backgroundColor: "#000000" }]}>
                  <Text style={styles.socialIconText}></Text>
                </View>
                <Text style={styles.socialButtonText}>Apple</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialButton}
                onPress={async () => {
                  const result = await loginWithGitHub();
                  if (result.success) {
                    router.replace("/onboarding");
                  }
                }}
                disabled={isSubmitting || isSocialLoading}
              >
                <View style={[styles.socialIcon, { backgroundColor: "#333333" }]}>
                  <Text style={styles.socialIconText}>GH</Text>
                </View>
                <Text style={styles.socialButtonText}>GitHub</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.loginLink}
              onPress={() => router.back()}
              disabled={isSubmitting}
            >
              <Text style={styles.loginLinkText}>
                Already have an account?{" "}
                <Text style={styles.loginLinkTextBold}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={showRolePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRolePicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowRolePicker(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Your Role</Text>
            <ScrollView style={styles.roleList}>
              {ROLES.map((roleOption) => (
                <TouchableOpacity
                  key={roleOption.value}
                  style={[
                    styles.roleOption,
                    role === roleOption.value && styles.roleOptionSelected,
                  ]}
                  onPress={() => {
                    setRole(roleOption.value);
                    setShowRolePicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.roleOptionLabel,
                      role === roleOption.value && styles.roleOptionLabelSelected,
                    ]}
                  >
                    {roleOption.label}
                  </Text>
                  <Text
                    style={[
                      styles.roleOptionDesc,
                      role === roleOption.value && styles.roleOptionDescSelected,
                    ]}
                  >
                    {roleOption.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={showVerification}
        transparent
        animationType="slide"
        onRequestClose={() => setShowVerification(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowVerification(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.verificationModal}>
              <View style={styles.verificationIconContainer}>
                <ShieldCheck size={48} color={Colors.primary} />
              </View>
              <Text style={styles.verificationTitle}>Human Verification</Text>
              <Text style={styles.verificationSubtitle}>
                Please solve this simple math problem to continue
              </Text>

              <View style={styles.challengeContainer}>
                <Text style={styles.challengeText}>
                  {verificationChallenge.num1} + {verificationChallenge.num2} = ?
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Your Answer</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter the answer"
                  placeholderTextColor={Colors.textTertiary}
                  value={verificationAnswer}
                  onChangeText={setVerificationAnswer}
                  keyboardType="number-pad"
                  autoFocus
                />
              </View>

              <TouchableOpacity
                style={styles.verifyButton}
                onPress={handleVerificationSubmit}
              >
                <Text style={styles.verifyButtonText}>Verify & Register</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowVerification(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
    marginTop: 20,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  form: {
    gap: 20,
    marginBottom: 40,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
  },
  roleSelector: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  roleSelectorText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  roleSelectorDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  registerButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: "700" as const,
  },
  loginLink: {
    alignItems: "center",
  },
  loginLinkText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  loginLinkTextBold: {
    color: Colors.primary,
    fontWeight: "700" as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 16,
  },
  roleList: {
    maxHeight: 400,
  },
  roleOption: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  roleOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  roleOptionLabel: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  roleOptionLabelSelected: {
    color: Colors.primary,
  },
  roleOptionDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  roleOptionDescSelected: {
    color: Colors.primary,
  },
  honeypotContainer: {
    position: "absolute",
    left: -9999,
    width: 1,
    height: 1,
    overflow: "hidden",
  },
  honeypotInput: {
    width: 1,
    height: 1,
  },
  verificationModal: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 32,
    margin: 24,
    alignItems: "center",
  },
  verificationIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  verificationTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 8,
    textAlign: "center",
  },
  verificationSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 24,
  },
  challengeContainer: {
    backgroundColor: Colors.primaryLight,
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
    width: "100%",
    alignItems: "center",
  },
  challengeText: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: Colors.primary,
  },
  verifyButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    width: "100%",
    alignItems: "center",
  },
  verifyButtonText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: "700" as const,
  },
  cancelButton: {
    marginTop: 12,
    padding: 12,
  },
  cancelButtonText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: "600" as const,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    color: Colors.textTertiary,
    fontSize: 12,
    fontWeight: "600" as const,
  },
  socialButtons: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    marginBottom: 12,
  },
  socialButton: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    gap: 6,
  },
  socialIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  socialIconText: {
    color: Colors.surface,
    fontSize: 12,
    fontWeight: "700" as const,
  },
  socialButtonText: {
    color: Colors.text,
    fontSize: 11,
    fontWeight: "600" as const,
  },
});
