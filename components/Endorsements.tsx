import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Users, Quote } from "lucide-react-native";
import Colors from "@/constants/colors";
import { Endorsement } from "@/types";

interface EndorsementsProps {
  endorsements: Endorsement[];
}

const relationshipLabels: Record<string, string> = {
  client: "Client",
  colleague: "Colleague",
  supervisor: "Supervisor",
  subcontractor: "Subcontractor",
};

export default function Endorsements({ endorsements }: EndorsementsProps) {
  if (!endorsements || endorsements.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Users size={20} color={Colors.primary} />
        <Text style={styles.title}>Endorsements</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{endorsements.length}</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {endorsements.map((endorsement) => (
          <View key={endorsement.id} style={styles.endorsementCard}>
            <View style={styles.quoteIcon}>
              <Quote size={16} color={Colors.primary} />
            </View>

            <Text style={styles.skill}>{endorsement.skill}</Text>
            <Text style={styles.comment} numberOfLines={4}>
              {endorsement.comment}
            </Text>

            <View style={styles.footer}>
              <View style={styles.authorInfo}>
                <Text style={styles.authorName}>{endorsement.fromName}</Text>
                <Text style={styles.authorCompany}>
                  {endorsement.fromCompany}
                </Text>
              </View>
              <View style={styles.relationshipBadge}>
                <Text style={styles.relationshipText}>
                  {relationshipLabels[endorsement.relationship] ||
                    endorsement.relationship}
                </Text>
              </View>
            </View>

            <Text style={styles.date}>
              {new Date(endorsement.date).toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              })}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  badge: {
    backgroundColor: Colors.primary + "20",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: Colors.primary,
  },
  scrollContent: {
    gap: 12,
    paddingRight: 20,
  },
  endorsementCard: {
    width: 280,
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quoteIcon: {
    marginBottom: 8,
  },
  skill: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 8,
  },
  comment: {
    fontSize: 13,
    lineHeight: 18,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "flex-start" as const,
    marginBottom: 8,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  authorCompany: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  relationshipBadge: {
    backgroundColor: Colors.info + "15",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  relationshipText: {
    fontSize: 10,
    fontWeight: "600" as const,
    color: Colors.info,
  },
  date: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
});
