import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from "react-native";
import {
  Shield,
  CheckCircle,
  FileCheck,
  X,
  Calendar,
  Clock,
  AlertCircle,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { Verification, VerificationType } from "@/types";
import { getVerificationLabel } from "@/utils/trust";

interface VerificationBadgeProps {
  verifications: Verification[];
  size?: "small" | "medium" | "large";
  showDetails?: boolean;
}

function getVerificationIcon(type: VerificationType, size: number) {
  switch (type) {
    case "identity":
      return <Shield size={size} color={Colors.success} />;
    case "license":
      return <FileCheck size={size} color={Colors.success} />;
    case "insurance":
      return <Shield size={size} color={Colors.success} />;
    case "background":
      return <CheckCircle size={size} color={Colors.success} />;
    case "references":
      return <CheckCircle size={size} color={Colors.success} />;
    case "payment":
      return <CheckCircle size={size} color={Colors.success} />;
    default:
      return <CheckCircle size={size} color={Colors.success} />;
  }
}

function getVerificationDescription(type: VerificationType): string {
  switch (type) {
    case "identity":
      return "Government-issued ID verified by platform administrators";
    case "license":
      return "Professional license verified and current with state authorities";
    case "insurance":
      return "General liability and workers' compensation insurance verified";
    case "background":
      return "Background check completed, including criminal history";
    case "references":
      return "Professional references contacted and verified";
    case "payment":
      return "Payment method verified and validated";
    default:
      return "Verification completed";
  }
}

function formatDate(dateString?: string): string {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function isExpiringSoon(expiresAt?: string): boolean {
  if (!expiresAt) return false;
  const expiryDate = new Date(expiresAt);
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  return expiryDate <= thirtyDaysFromNow && expiryDate >= new Date();
}

function isExpired(expiresAt?: string): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
}

export default function VerificationBadge({
  verifications,
  size = "medium",
  showDetails = true,
}: VerificationBadgeProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const verifiedCount = verifications.filter((v) => v.verified).length;
  const totalCount = verifications.length;

  const iconSize = size === "small" ? 12 : size === "medium" ? 16 : 20;
  const fontSize = size === "small" ? 11 : size === "medium" ? 13 : 15;

  if (!showDetails) {
    return (
      <View style={[styles.badge, styles[`badge${size}`]]}>
        <CheckCircle size={iconSize} color={Colors.success} />
        <Text style={[styles.badgeText, { fontSize }]}>
          {verifiedCount}/{totalCount} Verified
        </Text>
      </View>
    );
  }

  return (
    <>
      <TouchableOpacity
        style={[styles.badge, styles[`badge${size}`]]}
        onPress={() => setModalVisible(true)}
      >
        <CheckCircle size={iconSize} color={Colors.success} />
        <Text style={[styles.badgeText, { fontSize }]}>
          {verifiedCount}/{totalCount} Verified
        </Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Verification Details</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalContent}
            contentContainerStyle={styles.modalContentInner}
          >
            <View style={styles.summaryCard}>
              <View style={styles.summaryIconContainer}>
                <Shield size={48} color={Colors.primary} />
              </View>
              <View style={styles.summaryText}>
                <Text style={styles.summaryTitle}>
                  {verifiedCount} of {totalCount} Verifications
                </Text>
                <Text style={styles.summarySubtitle}>
                  This contractor has completed {verifiedCount} verification
                  {verifiedCount !== 1 ? "s" : ""}
                </Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Verification Status</Text>

            {verifications.map((verification, index) => {
              const expired = isExpired(verification.expiresAt);
              const expiringSoon = isExpiringSoon(verification.expiresAt);

              return (
                <View
                  key={index}
                  style={[
                    styles.verificationCard,
                    verification.verified && !expired && styles.verificationCardVerified,
                    expired && styles.verificationCardExpired,
                  ]}
                >
                  <View style={styles.verificationHeader}>
                    <View style={styles.verificationIcon}>
                      {verification.verified && !expired ? (
                        getVerificationIcon(verification.type, 24)
                      ) : (
                        <FileCheck size={24} color={Colors.textTertiary} />
                      )}
                    </View>
                    <View style={styles.verificationInfo}>
                      <Text style={styles.verificationName}>
                        {getVerificationLabel(verification.type)}
                      </Text>
                      <Text style={styles.verificationDescription}>
                        {getVerificationDescription(verification.type)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.verificationDetails}>
                    <View style={styles.detailRow}>
                      <View style={styles.detailIcon}>
                        {verification.verified && !expired ? (
                          <CheckCircle size={16} color={Colors.success} />
                        ) : (
                          <Clock size={16} color={Colors.textTertiary} />
                        )}
                      </View>
                      <Text style={styles.detailText}>
                        Status:{" "}
                        <Text
                          style={[
                            styles.detailValue,
                            verification.verified && !expired && styles.detailValueSuccess,
                            expired && styles.detailValueError,
                          ]}
                        >
                          {expired
                            ? "Expired"
                            : verification.verified
                            ? "Verified"
                            : "Pending"}
                        </Text>
                      </Text>
                    </View>

                    {verification.verifiedAt && (
                      <View style={styles.detailRow}>
                        <View style={styles.detailIcon}>
                          <Calendar size={16} color={Colors.textSecondary} />
                        </View>
                        <Text style={styles.detailText}>
                          Verified:{" "}
                          <Text style={styles.detailValue}>
                            {formatDate(verification.verifiedAt)}
                          </Text>
                        </Text>
                      </View>
                    )}

                    {verification.expiresAt && (
                      <View style={styles.detailRow}>
                        <View style={styles.detailIcon}>
                          {expiringSoon || expired ? (
                            <AlertCircle
                              size={16}
                              color={expired ? Colors.error : Colors.warning}
                            />
                          ) : (
                            <Calendar size={16} color={Colors.textSecondary} />
                          )}
                        </View>
                        <Text style={styles.detailText}>
                          Expires:{" "}
                          <Text
                            style={[
                              styles.detailValue,
                              expiringSoon && styles.detailValueWarning,
                              expired && styles.detailValueError,
                            ]}
                          >
                            {formatDate(verification.expiresAt)}
                            {expiringSoon && !expired && " (Expiring Soon)"}
                          </Text>
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}

            <View style={styles.infoBox}>
              <View style={styles.infoIcon}>
                <AlertCircle size={20} color={Colors.info} />
              </View>
              <Text style={styles.infoText}>
                All verifications are conducted by our platform team to ensure
                contractor credibility and protect project owners.
              </Text>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: Colors.success + "15",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 6,
  },
  badgesmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  badgemedium: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
  },
  badgelarge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  badgeText: {
    fontWeight: "600" as const,
    color: Colors.success,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
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
  summaryCard: {
    flexDirection: "row" as const,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 16,
  },
  summaryIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary + "15",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  summaryText: {
    flex: 1,
    justifyContent: "center" as const,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  summarySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 12,
    marginTop: 8,
  },
  verificationCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  verificationCardVerified: {
    borderColor: Colors.success + "30",
    backgroundColor: Colors.success + "05",
  },
  verificationCardExpired: {
    borderColor: Colors.error + "30",
    backgroundColor: Colors.error + "05",
  },
  verificationHeader: {
    flexDirection: "row" as const,
    marginBottom: 12,
    gap: 12,
  },
  verificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: Colors.background,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  verificationInfo: {
    flex: 1,
  },
  verificationName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  verificationDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  verificationDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
  },
  detailIcon: {
    width: 24,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  detailText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  detailValue: {
    fontWeight: "600" as const,
    color: Colors.text,
  },
  detailValueSuccess: {
    color: Colors.success,
  },
  detailValueWarning: {
    color: Colors.warning,
  },
  detailValueError: {
    color: Colors.error,
  },
  infoBox: {
    flexDirection: "row" as const,
    backgroundColor: Colors.info + "10",
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.info + "20",
  },
  infoIcon: {
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});
