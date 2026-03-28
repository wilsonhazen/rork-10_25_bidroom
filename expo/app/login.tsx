import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { router } from "expo-router";
import { LogIn, Zap } from "lucide-react-native";
import React, { useState } from "react";
import { TEST_CREDENTIALS } from "@/mocks/test-users";
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
} from "react-native";


export default function LoginScreen() {
  const { login, isLoading } = useAuth();
  const { loginWithGoogle, loginWithApple, loginWithGitHub, isLoading: isSocialLoading } = useSocialAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      router.replace("/(tabs)");
    } else {
      Alert.alert("Login Failed", result.error || "Please try again");
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
        >
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <LogIn size={48} color={Colors.primary} />
            </View>
            <Text style={styles.title}>Welcome to Bidroom</Text>
            <Text style={styles.subtitle}>
              Sign in to manage your construction projects
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="your@email.com"
                placeholderTextColor={Colors.textTertiary}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                editable={!isSubmitting}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor={Colors.textTertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
                editable={!isSubmitting}
              />
            </View>

            <TouchableOpacity
              style={[styles.loginButton, isSubmitting && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color={Colors.surface} />
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialButtons}>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={async () => {
                  const result = await loginWithGoogle();
                  if (result.success) {
                    router.replace("/(tabs)");
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
                    router.replace("/(tabs)");
                  }
                }}
                disabled={isSubmitting || isSocialLoading}
              >
                <View style={[styles.socialIcon, { backgroundColor: "#000000" }]}>
                  <Text style={styles.socialIconText}>A</Text>
                </View>
                <Text style={styles.socialButtonText}>Apple</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialButton}
                onPress={async () => {
                  const result = await loginWithGitHub();
                  if (result.success) {
                    router.replace("/(tabs)");
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

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.registerButton}
              onPress={() => router.push("/register" as any)}
              disabled={isSubmitting}
            >
              <Text style={styles.registerButtonText}>Create New Account</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerLabel}>Quick Test Login</Text>
            <Text style={styles.footerHint}>Tap any role to login instantly</Text>
            
            <View style={styles.testUsers}>
              <TouchableOpacity
                style={styles.testUserButton}
                onPress={() => {
                  setEmail(TEST_CREDENTIALS.admin.email);
                  setPassword(TEST_CREDENTIALS.admin.password);
                }}
              >
                <Zap size={16} color={Colors.primary} />
                <Text style={styles.testUserText}>Admin</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.testUserButton}
                onPress={() => {
                  setEmail(TEST_CREDENTIALS.gc.email);
                  setPassword(TEST_CREDENTIALS.gc.password);
                }}
              >
                <Zap size={16} color={Colors.primary} />
                <Text style={styles.testUserText}>GC</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.testUserButton}
                onPress={() => {
                  setEmail(TEST_CREDENTIALS.pm.email);
                  setPassword(TEST_CREDENTIALS.pm.password);
                }}
              >
                <Zap size={16} color={Colors.primary} />
                <Text style={styles.testUserText}>PM</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.testUsers}>
              <TouchableOpacity
                style={styles.testUserButton}
                onPress={() => {
                  setEmail(TEST_CREDENTIALS.sub.email);
                  setPassword(TEST_CREDENTIALS.sub.password);
                }}
              >
                <Zap size={16} color={Colors.primary} />
                <Text style={styles.testUserText}>Sub</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.testUserButton}
                onPress={() => {
                  setEmail(TEST_CREDENTIALS.trade.email);
                  setPassword(TEST_CREDENTIALS.trade.password);
                }}
              >
                <Zap size={16} color={Colors.primary} />
                <Text style={styles.testUserText}>Trade</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.testUserButton}
                onPress={() => {
                  setEmail(TEST_CREDENTIALS.viewer.email);
                  setPassword(TEST_CREDENTIALS.viewer.password);
                }}
              >
                <Zap size={16} color={Colors.primary} />
                <Text style={styles.testUserText}>Viewer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    justifyContent: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
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
  loginButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: "700" as const,
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
    fontSize: 14,
    fontWeight: "600" as const,
  },
  registerButton: {
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  registerButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: "700" as const,
  },
  forgotPassword: {
    alignItems: "center",
    marginTop: 8,
  },
  forgotPasswordText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "600" as const,
  },
  socialButtons: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  socialButton: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    gap: 8,
  },
  socialIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  socialIconText: {
    color: Colors.surface,
    fontSize: 14,
    fontWeight: "700" as const,
  },
  socialButtonText: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: "600" as const,
  },
  footer: {
    marginTop: 32,
    padding: 20,
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    gap: 12,
  },
  footerLabel: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "700" as const,
    textAlign: "center",
  },
  footerHint: {
    color: Colors.textSecondary,
    fontSize: 12,
    textAlign: "center",
  },
  testUsers: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
  },
  testUserButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.surface,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  testUserText: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: "600" as const,
  },
});
