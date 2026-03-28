import React from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  Clock,
  Milestone,
  Briefcase,
  GraduationCap,
  Award as AwardIcon,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { ExperienceEntry } from "@/types";

interface ExperienceTimelineProps {
  timeline: ExperienceEntry[];
}

const iconMap = {
  milestone: Milestone,
  project: Briefcase,
  certification: GraduationCap,
  award: AwardIcon,
};

const colorMap = {
  milestone: Colors.primary,
  project: Colors.info,
  certification: Colors.success,
  award: Colors.warning,
};

export default function ExperienceTimeline({
  timeline,
}: ExperienceTimelineProps) {
  if (!timeline || timeline.length === 0) {
    return null;
  }

  const sortedTimeline = [...timeline].sort((a, b) =>
    b.year.localeCompare(a.year)
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Clock size={20} color={Colors.primary} />
        <Text style={styles.title}>Experience Timeline</Text>
      </View>

      <View style={styles.timeline}>
        {sortedTimeline.map((entry, index) => {
          const Icon = iconMap[entry.type];
          const color = colorMap[entry.type];
          const isLast = index === sortedTimeline.length - 1;

          return (
            <View key={entry.id} style={styles.timelineItem}>
              <View style={styles.timelineLeft}>
                <Text style={styles.year}>{entry.year}</Text>
              </View>

              <View style={styles.timelineCenter}>
                <View style={[styles.iconContainer, { backgroundColor: color + "20" }]}>
                  <Icon size={16} color={color} />
                </View>
                {!isLast && <View style={styles.line} />}
              </View>

              <View style={styles.timelineRight}>
                <View style={styles.entryCard}>
                  <View style={[styles.typeBadge, { backgroundColor: color + "15" }]}>
                    <Text style={[styles.typeText, { color }]}>
                      {entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}
                    </Text>
                  </View>
                  <Text style={styles.entryTitle}>{entry.title}</Text>
                  <Text style={styles.entryDescription}>
                    {entry.description}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
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
  timeline: {
    paddingLeft: 8,
  },
  timelineItem: {
    flexDirection: "row" as const,
    marginBottom: 0,
  },
  timelineLeft: {
    width: 60,
    paddingTop: 4,
  },
  year: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.primary,
  },
  timelineCenter: {
    alignItems: "center" as const,
    marginHorizontal: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.border,
    marginTop: 4,
  },
  timelineRight: {
    flex: 1,
    paddingBottom: 20,
  },
  entryCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typeBadge: {
    alignSelf: "flex-start" as const,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  typeText: {
    fontSize: 10,
    fontWeight: "700" as const,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  entryTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  entryDescription: {
    fontSize: 13,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
});
