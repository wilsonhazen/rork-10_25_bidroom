import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { TrendingUp, Eye, Clock, Target, Award } from "lucide-react-native";

interface AnalyticsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string;
  color: string;
}

const AnalyticsCard: React.FC<AnalyticsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  color,
}) => {
  return (
    <View style={[styles.card, { borderLeftColor: color }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: color + "15" }]}>
          {icon}
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardValue}>{value}</Text>
          {subtitle && <Text style={styles.cardSubtitle}>{subtitle}</Text>}
          {trend && (
            <View style={styles.trendContainer}>
              <TrendingUp size={14} color="#10b981" />
              <Text style={styles.trendText}>{trend}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

interface AnalyticsDashboardProps {
  profileViews: number;
  profileViewsTrend?: string;
  responseRate: number;
  averageResponseTime: number;
  conversionRate: number;
  completionScore: number;
  suggestions?: string[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  profileViews,
  profileViewsTrend,
  responseRate,
  averageResponseTime,
  conversionRate,
  completionScore,
  suggestions = [],
}) => {
  const formatResponseTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Analytics Overview</Text>
        <Text style={styles.subtitle}>Track your profile performance</Text>
      </View>

      <View style={styles.grid}>
        <AnalyticsCard
          title="Profile Views"
          value={profileViews.toString()}
          subtitle="Total views"
          trend={profileViewsTrend}
          icon={<Eye size={24} color="#3b82f6" />}
          color="#3b82f6"
        />

        <AnalyticsCard
          title="Response Rate"
          value={`${responseRate}%`}
          subtitle="Of all leads"
          icon={<Target size={24} color="#10b981" />}
          color="#10b981"
        />

        <AnalyticsCard
          title="Avg Response Time"
          value={formatResponseTime(averageResponseTime)}
          subtitle="To leads"
          icon={<Clock size={24} color="#f59e0b" />}
          color="#f59e0b"
        />

        <AnalyticsCard
          title="Conversion Rate"
          value={`${conversionRate}%`}
          subtitle="Lead to project"
          icon={<TrendingUp size={24} color="#8b5cf6" />}
          color="#8b5cf6"
        />

        <AnalyticsCard
          title="Profile Completion"
          value={`${completionScore}%`}
          subtitle="Complete your profile"
          icon={<Award size={24} color="#ec4899" />}
          color="#ec4899"
        />
      </View>

      {suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsTitle}>Improve Your Profile</Text>
          {suggestions.map((suggestion, index) => (
            <View key={index} style={styles.suggestionItem}>
              <View style={styles.suggestionBullet} />
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Tips for Better Performance</Text>
        <Text style={styles.infoText}>
          • Respond to leads within 1 hour for better engagement{"\n"}
          • Keep your profile up to date with recent projects{"\n"}
          • Add certifications to build trust{"\n"}
          • Maintain 80%+ response rate for top ranking
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  title: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#111827",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  grid: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 4,
    fontWeight: "500" as const,
  },
  cardValue: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: "#111827",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#9ca3af",
  },
  trendContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  trendText: {
    fontSize: 12,
    color: "#10b981",
    fontWeight: "600" as const,
  },
  suggestionsContainer: {
    margin: 16,
    marginTop: 8,
    backgroundColor: "#fffbeb",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#fcd34d",
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#92400e",
    marginBottom: 12,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  suggestionBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#f59e0b",
    marginTop: 6,
    marginRight: 10,
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    color: "#78350f",
    lineHeight: 20,
  },
  infoContainer: {
    margin: 16,
    marginTop: 8,
    backgroundColor: "#eff6ff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#93c5fd",
    marginBottom: 32,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#1e40af",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#1e3a8a",
    lineHeight: 22,
  },
});
