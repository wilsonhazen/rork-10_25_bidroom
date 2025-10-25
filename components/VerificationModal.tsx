import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Shield, X, CheckCircle } from "lucide-react-native";
import Colors from "@/constants/colors";

interface VerificationModalProps {
  visible: boolean;
  onClose: () => void;
  onVerified: () => void;
  title?: string;
  message?: string;
}

export default function VerificationModal({
  visible,
  onClose,
  onVerified,
  title = "Verify You're Human",
  message = "Please complete the verification to continue",
}: VerificationModalProps) {
  const [code, setCode] = useState("");
  const [challenge, setChallenge] = useState({ num1: 0, num2: 0, answer: 0 });
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (visible) {
      generateChallenge();
      setCode("");
      setError("");
      setIsVerified(false);
    }
  }, [visible]);

  const generateChallenge = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    setChallenge({ num1, num2, answer: num1 + num2 });
  };

  const handleVerify = async () => {
    setError("");
    setIsVerifying(true);

    await new Promise((resolve) => setTimeout(resolve, 800));

    if (parseInt(code) === challenge.answer) {
      setIsVerified(true);
      setIsVerifying(false);
      
      setTimeout(() => {
        onVerified();
        onClose();
      }, 1000);
    } else {
      setError("Incorrect answer. Please try again.");
      setIsVerifying(false);
      generateChallenge();
      setCode("");
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Shield size={32} color={Colors.primary} />
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.message}>{message}</Text>

          {!isVerified ? (
            <>
              <View style={styles.challengeContainer}>
                <View style={styles.challengeBox}>
                  <Text style={styles.challengeQuestion}>
                    What is {challenge.num1} + {challenge.num2}?
                  </Text>
                </View>

                <TextInput
                  style={[styles.input, error && styles.inputError]}
                  placeholder="Enter answer"
                  value={code}
                  onChangeText={setCode}
                  keyboardType="numeric"
                  maxLength={3}
                  autoFocus
                  placeholderTextColor={Colors.textTertiary}
                  editable={!isVerifying}
                />

                {error ? (
                  <Text style={styles.errorText}>{error}</Text>
                ) : null}
              </View>

              <TouchableOpacity
                style={[
                  styles.verifyButton,
                  (isVerifying || !code) && styles.verifyButtonDisabled,
                ]}
                onPress={handleVerify}
                disabled={isVerifying || !code}
              >
                {isVerifying ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <Text style={styles.verifyButtonText}>Verify</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.refreshButton}
                onPress={generateChallenge}
                disabled={isVerifying}
              >
                <Text style={styles.refreshButtonText}>New Challenge</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.successContainer}>
              <CheckCircle size={64} color={Colors.success} />
              <Text style={styles.successText}>Verification Successful!</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center" as const,
    alignItems: "center" as const,
    padding: 16,
  },
  modal: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  header: {
    alignItems: "center" as const,
    marginBottom: 16,
    position: "relative" as const,
  },
  closeButton: {
    position: "absolute" as const,
    right: 0,
    top: 0,
  },
  title: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
    marginTop: 12,
  },
  message: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center" as const,
    marginBottom: 24,
  },
  challengeContainer: {
    marginBottom: 24,
  },
  challengeBox: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  challengeQuestion: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.text,
    textAlign: "center" as const,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    textAlign: "center" as const,
    fontWeight: "600" as const,
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    fontSize: 13,
    color: Colors.error,
    marginTop: 8,
    textAlign: "center" as const,
  },
  verifyButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center" as const,
    marginBottom: 12,
  },
  verifyButtonDisabled: {
    opacity: 0.5,
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.white,
  },
  refreshButton: {
    paddingVertical: 12,
    alignItems: "center" as const,
  },
  refreshButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
  successContainer: {
    alignItems: "center" as const,
    paddingVertical: 32,
  },
  successText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.success,
    marginTop: 16,
  },
});
