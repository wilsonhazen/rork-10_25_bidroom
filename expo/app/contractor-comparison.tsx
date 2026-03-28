import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Stack, router } from "expo-router";
import { X, Star, MapPin, Briefcase, DollarSign } from "lucide-react-native";
import { Contractor } from "@/types";
import { PromotionalBadges, getBadgesForContractor } from "@/components/PromotionalBadges";
import { Image } from "react-native";

interface ContractorComparisonProps {
  contractors?: Contractor[];
}

const ComparisonRow: React.FC<{
  label: string;
  values: (string | number | React.ReactNode)[];
}> = ({ label, values }) => {
  return (
    <View style={styles.row}>
      <View style={styles.labelCell}>
        <Text style={styles.labelText}>{label}</Text>
      </View>
      {values.map((value, index) => (
        <View key={index} style={styles.valueCell}>
          {typeof value === "string" || typeof value === "number" ? (
            <Text style={styles.valueText}>{value}</Text>
          ) : (
            value
          )}
        </View>
      ))}
    </View>
  );
};

export default function ContractorComparison() {
  const [selectedContractors, setSelectedContractors] = useState<Contractor[]>([
    {
      id: "1",
      name: "John Smith",
      company: "Smith Construction",
      trade: "General Contractor",
      location: "Austin, TX",
      rating: 4.8,
      reviewCount: 45,
      phone: "555-0101",
      email: "john@smithconstruction.com",
      verified: true,
      completedProjects: 120,
      yearsInBusiness: 15,
      insuranceAmount: "$2M",
      licenseNumber: "TX-123456",
      specialties: ["Residential", "Commercial", "Renovation"],
      trustIndicators: {
        responseTime: 30,
        responseRate: 95,
        onTimeRate: 92,
        repeatClientRate: 78,
        disputeRate: 2,
      },
      featured: true,
    },
    {
      id: "2",
      name: "Sarah Johnson",
      company: "Johnson Electric",
      trade: "Electrician",
      location: "Austin, TX",
      rating: 4.9,
      reviewCount: 67,
      phone: "555-0102",
      email: "sarah@johnsonelectric.com",
      verified: true,
      completedProjects: 200,
      yearsInBusiness: 12,
      insuranceAmount: "$1.5M",
      licenseNumber: "TX-234567",
      specialties: ["Residential", "Industrial", "Solar"],
      trustIndicators: {
        responseTime: 20,
        responseRate: 98,
        onTimeRate: 95,
        repeatClientRate: 85,
        disputeRate: 1,
      },
      topRated: true,
    },
  ]);

  const removeContractor = (id: string) => {
    if (selectedContractors.length <= 2) {
      Alert.alert("Cannot Remove", "You need at least 2 contractors to compare");
      return;
    }
    setSelectedContractors((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Compare Contractors",
          headerStyle: { backgroundColor: "#fff" },
          headerTintColor: "#111827",
        }}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.table}>
          <View style={styles.headerRow}>
            <View style={styles.headerLabelCell}>
              <Text style={styles.headerLabelText}>Compare</Text>
            </View>
            {selectedContractors.map((contractor) => (
              <View key={contractor.id} style={styles.contractorHeader}>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeContractor(contractor.id)}
                >
                  <X size={16} color="#ef4444" />
                </TouchableOpacity>
                <Image
                  source={
                    contractor.avatar
                      ? { uri: contractor.avatar }
                      : require("@/assets/images/icon.png")
                  }
                  style={styles.avatar}
                />
                <Text style={styles.contractorName}>{contractor.name}</Text>
                <Text style={styles.contractorCompany}>{contractor.company}</Text>
                <View style={styles.ratingContainer}>
                  <Star size={14} color="#fbbf24" fill="#fbbf24" />
                  <Text style={styles.rating}>{contractor.rating}</Text>
                  <Text style={styles.reviewCount}>({contractor.reviewCount})</Text>
                </View>
                <View style={styles.badgesContainer}>
                  <PromotionalBadges
                    badges={getBadgesForContractor(contractor)}
                    size="small"
                    showIcon={false}
                  />
                </View>
              </View>
            ))}
          </View>

          <ComparisonRow
            label="Location"
            values={selectedContractors.map((c) => (
              <View key={c.id} style={styles.iconRow}>
                <MapPin size={14} color="#6b7280" />
                <Text style={styles.valueText}>{c.location}</Text>
              </View>
            ))}
          />

          <ComparisonRow
            label="Trade"
            values={selectedContractors.map((c) => c.trade)}
          />

          <ComparisonRow
            label="Experience"
            values={selectedContractors.map((c) => `${c.yearsInBusiness} years`)}
          />

          <ComparisonRow
            label="Completed Projects"
            values={selectedContractors.map((c) => (
              <View key={c.id} style={styles.iconRow}>
                <Briefcase size={14} color="#6b7280" />
                <Text style={styles.valueText}>{c.completedProjects}</Text>
              </View>
            ))}
          />

          <ComparisonRow
            label="Insurance"
            values={selectedContractors.map((c) => (
              <View key={c.id} style={styles.iconRow}>
                <DollarSign size={14} color="#10b981" />
                <Text style={styles.valueText}>{c.insuranceAmount}</Text>
              </View>
            ))}
          />

          <ComparisonRow
            label="License"
            values={selectedContractors.map((c) => c.licenseNumber || "N/A")}
          />

          <ComparisonRow
            label="Response Time"
            values={selectedContractors.map((c) =>
              c.trustIndicators
                ? `${c.trustIndicators.responseTime} min`
                : "N/A"
            )}
          />

          <ComparisonRow
            label="Response Rate"
            values={selectedContractors.map((c) =>
              c.trustIndicators ? `${c.trustIndicators.responseRate}%` : "N/A"
            )}
          />

          <ComparisonRow
            label="On-Time Rate"
            values={selectedContractors.map((c) =>
              c.trustIndicators ? `${c.trustIndicators.onTimeRate}%` : "N/A"
            )}
          />

          <ComparisonRow
            label="Repeat Clients"
            values={selectedContractors.map((c) =>
              c.trustIndicators
                ? `${c.trustIndicators.repeatClientRate}%`
                : "N/A"
            )}
          />

          <ComparisonRow
            label="Specialties"
            values={selectedContractors.map((c) => (
              <View key={c.id} style={styles.specialtiesContainer}>
                {c.specialties?.slice(0, 3).map((specialty, idx) => (
                  <View key={idx} style={styles.specialtyTag}>
                    <Text style={styles.specialtyText}>{specialty}</Text>
                  </View>
                ))}
              </View>
            ))}
          />

          <View style={styles.actionsRow}>
            <View style={styles.labelCell} />
            {selectedContractors.map((contractor) => (
              <View key={contractor.id} style={styles.valueCell}>
                <TouchableOpacity
                  style={styles.contactButton}
                  onPress={() => router.push(`/contractor-profile?id=${contractor.id}`)}
                >
                  <Text style={styles.contactButtonText}>View Profile</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  table: {
    minWidth: 800,
  },
  headerRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 2,
    borderBottomColor: "#e5e7eb",
  },
  headerLabelCell: {
    width: 150,
    padding: 16,
    justifyContent: "center",
    backgroundColor: "#f9fafb",
  },
  headerLabelText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#111827",
  },
  contractorHeader: {
    width: 220,
    padding: 16,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  removeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#fee2e2",
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 8,
  },
  contractorName: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#111827",
    marginBottom: 2,
  },
  contractorCompany: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },
  rating: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#111827",
  },
  reviewCount: {
    fontSize: 13,
    color: "#6b7280",
  },
  badgesContainer: {
    marginTop: 4,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  labelCell: {
    width: 150,
    padding: 16,
    justifyContent: "center",
    backgroundColor: "#f9fafb",
  },
  labelText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#374151",
  },
  valueCell: {
    width: 220,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  valueText: {
    fontSize: 14,
    color: "#111827",
    textAlign: "center",
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  specialtiesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    justifyContent: "center",
  },
  specialtyTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#dbeafe",
    borderRadius: 4,
  },
  specialtyText: {
    fontSize: 11,
    color: "#1e40af",
    fontWeight: "600" as const,
  },
  actionsRow: {
    flexDirection: "row",
    backgroundColor: "#f9fafb",
    paddingVertical: 16,
  },
  contactButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  contactButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#fff",
  },
});
