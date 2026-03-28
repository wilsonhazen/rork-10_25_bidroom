import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Award as AwardIcon, GraduationCap, CheckCircle, ExternalLink } from "lucide-react-native";
import Colors from "@/constants/colors";
import { Certification, Award } from "@/types";

interface CertificationsAndAwardsProps {
  certifications?: Certification[];
  awards?: Award[];
}

export default function CertificationsAndAwards({
  certifications,
  awards,
}: CertificationsAndAwardsProps) {
  const hasCertifications = certifications && certifications.length > 0;
  const hasAwards = awards && awards.length > 0;

  if (!hasCertifications && !hasAwards) {
    return null;
  }

  return (
    <View style={styles.container}>
      {hasCertifications && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <GraduationCap size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Certifications</Text>
          </View>

          {certifications.map((cert) => {
            const isExpired = cert.expiryDate
              ? new Date(cert.expiryDate) < new Date()
              : false;

            return (
              <View key={cert.id} style={styles.certCard}>
                <View style={styles.certHeader}>
                  <View style={styles.certInfo}>
                    <Text style={styles.certName}>{cert.name}</Text>
                    <Text style={styles.certOrg}>
                      {cert.issuingOrganization}
                    </Text>
                  </View>
                  {!isExpired && (
                    <View style={styles.verifiedBadge}>
                      <CheckCircle size={16} color={Colors.success} />
                    </View>
                  )}
                </View>

                <View style={styles.certDetails}>
                  <Text style={styles.certDate}>
                    Issued: {new Date(cert.issueDate).toLocaleDateString()}
                  </Text>
                  {cert.expiryDate && (
                    <Text
                      style={[
                        styles.certDate,
                        isExpired && styles.expiredText,
                      ]}
                    >
                      {isExpired ? "Expired" : "Expires"}:{" "}
                      {new Date(cert.expiryDate).toLocaleDateString()}
                    </Text>
                  )}
                </View>

                {cert.credentialId && (
                  <Text style={styles.credentialId}>
                    ID: {cert.credentialId}
                  </Text>
                )}

                {cert.verificationUrl && (
                  <View style={styles.verificationLink}>
                    <ExternalLink size={12} color={Colors.primary} />
                    <Text style={styles.verificationText}>Verify Credential</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}

      {hasAwards && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <AwardIcon size={20} color={Colors.warning} />
            <Text style={styles.sectionTitle}>Awards & Recognition</Text>
          </View>

          {awards.map((award) => (
            <View key={award.id} style={styles.awardCard}>
              <View style={styles.awardHeader}>
                <View style={styles.awardIconContainer}>
                  <AwardIcon size={20} color={Colors.warning} />
                </View>
                <View style={styles.awardInfo}>
                  <Text style={styles.awardTitle}>{award.title}</Text>
                  <Text style={styles.awardOrg}>{award.organization}</Text>
                </View>
                <View style={styles.yearBadge}>
                  <Text style={styles.yearText}>{award.year}</Text>
                </View>
              </View>
              {award.description && (
                <Text style={styles.awardDescription}>
                  {award.description}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  certCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  certHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "flex-start" as const,
  },
  certInfo: {
    flex: 1,
  },
  certName: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  certOrg: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  verifiedBadge: {
    marginLeft: 8,
  },
  certDetails: {
    flexDirection: "row" as const,
    gap: 16,
  },
  certDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  expiredText: {
    color: Colors.error,
  },
  credentialId: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontFamily: "monospace" as const,
  },
  verificationLink: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
    marginTop: 4,
  },
  verificationText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: "600" as const,
  },
  awardCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  awardHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    marginBottom: 8,
  },
  awardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.warning + "20",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  awardInfo: {
    flex: 1,
  },
  awardTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 2,
  },
  awardOrg: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  yearBadge: {
    backgroundColor: Colors.warning + "15",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  yearText: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: Colors.warning,
  },
  awardDescription: {
    fontSize: 13,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
});
