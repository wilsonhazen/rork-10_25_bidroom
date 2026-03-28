import Colors from "@/constants/colors";
import { TRADES } from "@/constants/trades";
import { mockContractors } from "@/mocks/data";
import { Contractor } from "@/types";
import { Stack, useRouter } from "expo-router";
import { BadgeCheck, MapPin, Phone, Search, Star, Calendar, X, Shield, CheckCircle2, Filter, MapIcon, ListIcon, Award, TrendingUp } from "lucide-react-native";
import { calculateTrustScore, getTrustLevelColor } from "@/utils/trust";
import React, { useState } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  Alert,
} from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { useAppointments } from "@/contexts/AppointmentsContext";

interface ContractorCardProps {
  contractor: Contractor;
  onPress: () => void;
  onRequestEstimate: () => void;
}

function ContractorCard({ contractor, onPress, onRequestEstimate }: ContractorCardProps) {
  const trustScore = calculateTrustScore(contractor);
  const verifiedCount = contractor.verifications?.filter(v => v.verified).length || 0;

  return (
    <TouchableOpacity style={styles.contractorCard} onPress={onPress}>
      <View style={styles.contractorHeader}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>
            {contractor.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </Text>
        </View>
        <View style={styles.contractorInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.contractorName} numberOfLines={1}>
              {contractor.name}
            </Text>
            {contractor.verified && (
              <BadgeCheck size={16} color={Colors.primary} />
            )}
          </View>
          <Text style={styles.contractorCompany} numberOfLines={1}>
            {contractor.company}
          </Text>
          <View style={styles.ratingRow}>
            <Star size={14} color={Colors.warning} fill={Colors.warning} />
            <Text style={styles.ratingText}>
              {contractor.rating.toFixed(1)} ({contractor.reviewCount})
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.badgesContainer}>
        {contractor.featured && (
          <View style={styles.featuredBadge}>
            <Award size={12} color={Colors.warning} />
            <Text style={styles.featuredBadgeText}>Featured</Text>
          </View>
        )}
        {contractor.topRated && (
          <View style={styles.topRatedBadge}>
            <TrendingUp size={12} color={Colors.success} />
            <Text style={styles.topRatedBadgeText}>Top Rated</Text>
          </View>
        )}
      </View>

      {trustScore.score >= 70 && (
        <View style={[styles.trustBadge, { backgroundColor: getTrustLevelColor(trustScore.level) + "15" }]}>
          <Shield size={14} color={getTrustLevelColor(trustScore.level)} />
          <Text style={[styles.trustBadgeText, { color: getTrustLevelColor(trustScore.level) }]}>
            Trust Score: {trustScore.score}%
          </Text>
          {verifiedCount > 0 && (
            <View style={styles.verificationCountBadge}>
              <CheckCircle2 size={12} color={getTrustLevelColor(trustScore.level)} />
              <Text style={[styles.verificationCountText, { color: getTrustLevelColor(trustScore.level) }]}>
                {verifiedCount} verified
              </Text>
            </View>
          )}
        </View>
      )}
      
      <View style={styles.contractorDetails}>
        <View style={styles.detailRow}>
          <View style={styles.tradeBadge}>
            <Text style={styles.tradeText}>{contractor.trade}</Text>
          </View>
          <Text style={styles.projectsText}>
            {contractor.completedProjects} projects
          </Text>
        </View>
        <View style={styles.locationRow}>
          <MapPin size={14} color={Colors.textSecondary} />
          <Text style={styles.locationText}>{contractor.location}</Text>
        </View>
      </View>

      <View style={styles.contractorActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.actionButtonSecondary]}
        >
          <Phone size={16} color={Colors.primary} />
          <Text style={styles.actionButtonTextSecondary}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={onRequestEstimate}
        >
          <Calendar size={16} color={Colors.white} />
          <Text style={styles.actionButtonText}>Request</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

export default function ContractorsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { createAppointment } = useAppointments();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrade, setSelectedTrade] = useState("All");
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedContractor, setSelectedContractor] = useState<Contractor | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [filters, setFilters] = useState({
    minRating: 0,
    location: "",
    verified: false,
    featured: false,
    topRated: false,
  });

  const filteredContractors = mockContractors.filter((contractor) => {
    const matchesSearch =
      contractor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contractor.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contractor.trade.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTrade = selectedTrade === "All" || contractor.trade === selectedTrade;
    const matchesRating = contractor.rating >= filters.minRating;
    const matchesLocation = !filters.location || contractor.location.toLowerCase().includes(filters.location.toLowerCase());
    const matchesVerified = !filters.verified || contractor.verified;
    const matchesFeatured = !filters.featured || contractor.featured;
    const matchesTopRated = !filters.topRated || contractor.topRated;
    return matchesSearch && matchesTrade && matchesRating && matchesLocation && matchesVerified && matchesFeatured && matchesTopRated;
  });

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "Contractors",
          headerStyle: {
            backgroundColor: Colors.surface,
          },
          headerTitleStyle: {
            color: Colors.text,
            fontWeight: "700" as const,
          },
          headerRight: () => (
            <View style={{ flexDirection: "row" as const, gap: 12, marginRight: 8 }}>
              <TouchableOpacity onPress={() => setViewMode(viewMode === "list" ? "map" : "list")}>
                {viewMode === "list" ? (
                  <MapIcon size={22} color={Colors.primary} />
                ) : (
                  <ListIcon size={22} color={Colors.primary} />
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
                <Filter size={22} color={filters.minRating > 0 || filters.location || filters.verified || filters.featured || filters.topRated ? Colors.primary : Colors.text} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Search size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search contractors..."
            placeholderTextColor={Colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersScroll}
          contentContainerStyle={styles.filtersContent}
        >
          {TRADES.map((trade) => (
            <TouchableOpacity
              key={trade}
              style={[
                styles.filterChip,
                selectedTrade === trade && styles.filterChipActive,
              ]}
              onPress={() => setSelectedTrade(trade)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedTrade === trade && styles.filterChipTextActive,
                ]}
              >
                {trade}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {showFilters && (
          <View style={styles.advancedFilters}>
            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Min Rating:</Text>
              <View style={styles.ratingFilters}>
                {[0, 4, 4.5].map((rating) => (
                  <TouchableOpacity
                    key={rating}
                    style={[
                      styles.ratingFilterChip,
                      filters.minRating === rating && styles.ratingFilterChipActive,
                    ]}
                    onPress={() => setFilters({ ...filters, minRating: rating })}
                  >
                    <Text
                      style={[
                        styles.ratingFilterText,
                        filters.minRating === rating && styles.ratingFilterTextActive,
                      ]}
                    >
                      {rating === 0 ? "All" : `${rating}+`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterRow}>
              <TextInput
                style={styles.locationInput}
                placeholder="Filter by location..."
                placeholderTextColor={Colors.textSecondary}
                value={filters.location}
                onChangeText={(text) => setFilters({ ...filters, location: text })}
              />
            </View>

            <View style={styles.badgeFiltersRow}>
              <TouchableOpacity
                style={[
                  styles.badgeFilterChip,
                  filters.verified && styles.badgeFilterChipActive,
                ]}
                onPress={() => setFilters({ ...filters, verified: !filters.verified })}
              >
                <BadgeCheck size={14} color={filters.verified ? Colors.white : Colors.primary} />
                <Text style={[styles.badgeFilterText, filters.verified && styles.badgeFilterTextActive]}>Verified</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.badgeFilterChip,
                  filters.featured && styles.badgeFilterChipActive,
                ]}
                onPress={() => setFilters({ ...filters, featured: !filters.featured })}
              >
                <Award size={14} color={filters.featured ? Colors.white : Colors.warning} />
                <Text style={[styles.badgeFilterText, filters.featured && styles.badgeFilterTextActive]}>Featured</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.badgeFilterChip,
                  filters.topRated && styles.badgeFilterChipActive,
                ]}
                onPress={() => setFilters({ ...filters, topRated: !filters.topRated })}
              >
                <TrendingUp size={14} color={filters.topRated ? Colors.white : Colors.success} />
                <Text style={[styles.badgeFilterText, filters.topRated && styles.badgeFilterTextActive]}>Top Rated</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {viewMode === "list" ? (
        <FlatList
          data={filteredContractors}
          renderItem={({ item }) => (
            <ContractorCard 
              contractor={item} 
              onPress={() => {
                router.push(`/contractor-profile?id=${item.id}`);
              }} 
              onRequestEstimate={() => {
                setSelectedContractor(item);
                setShowRequestModal(true);
              }}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No contractors found</Text>
            </View>
          }
        />
      ) : (
        <View style={styles.mapContainer}>
          <Text style={styles.mapPlaceholder}>Map View</Text>
          <Text style={styles.mapSubtext}>Interactive map with contractor locations</Text>
          <Text style={styles.mapNote}>Web: Use browser&apos;s geolocation API{"\n"}Mobile: Use react-native-maps</Text>
          <View style={styles.mapContractorsList}>
            <ScrollView contentContainerStyle={styles.mapContractorsContent}>
              {filteredContractors.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.mapContractorCard}
                  onPress={() => router.push(`/contractor-profile?id=${item.id}`)}
                >
                  <View style={styles.mapContractorHeader}>
                    <Text style={styles.mapContractorName}>{item.name}</Text>
                    {item.featured && <Award size={14} color={Colors.warning} />}
                    {item.topRated && <TrendingUp size={14} color={Colors.success} />}
                  </View>
                  <Text style={styles.mapContractorTrade}>{item.trade}</Text>
                  <View style={styles.mapContractorRating}>
                    <Star size={12} color={Colors.warning} fill={Colors.warning} />
                    <Text style={styles.mapContractorRatingText}>{item.rating.toFixed(1)}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      <RequestEstimateModal
        visible={showRequestModal}
        contractor={selectedContractor}
        onClose={() => {
          setShowRequestModal(false);
          setSelectedContractor(null);
        }}
        onSubmit={async (data) => {
          if (!user || !selectedContractor) return;
          
          try {
            await createAppointment({
              title: `Estimate Request - ${data.projectName}`,
              contractorId: selectedContractor.id,
              contractorName: selectedContractor.name,
              contractorCompany: selectedContractor.company,
              date: data.preferredDate,
              time: data.preferredTime,
              type: "estimate",
              location: data.location,
              notes: data.description,
            });
            
            Alert.alert(
              "Success",
              `Estimate request sent to ${selectedContractor.name}`,
              [{ text: "OK" }]
            );
            
            setShowRequestModal(false);
            setSelectedContractor(null);
          } catch (error) {
            console.error("Failed to create appointment:", error);
            Alert.alert("Error", "Failed to send estimate request");
          }
        }}
      />
    </View>
  );
}

function RequestEstimateModal({
  visible,
  contractor,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  contractor: Contractor | null;
  onClose: () => void;
  onSubmit: (data: {
    projectName: string;
    location: string;
    description: string;
    preferredDate: string;
    preferredTime: string;
  }) => Promise<void>;
}) {
  const [formData, setFormData] = useState({
    projectName: "",
    location: "",
    description: "",
    preferredDate: new Date().toISOString().split("T")[0],
    preferredTime: "09:00",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!formData.projectName || !formData.location || !formData.description) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(formData);
      setFormData({
        projectName: "",
        location: "",
        description: "",
        preferredDate: new Date().toISOString().split("T")[0],
        preferredTime: "09:00",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!contractor) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Request Estimate</Text>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.modalContent}
          contentContainerStyle={styles.modalContentInner}
        >
          <View style={styles.modalContractorInfo}>
            <View style={styles.modalContractorHeader}>
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {contractor.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </Text>
              </View>
              <View style={styles.modalContractorText}>
                <Text style={styles.modalContractorName}>{contractor.name}</Text>
                <Text style={styles.modalContractorCompany}>{contractor.company}</Text>
                <Text style={styles.modalContractorTrade}>{contractor.trade}</Text>
              </View>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Project Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Kitchen Remodel"
              value={formData.projectName}
              onChangeText={(text) =>
                setFormData({ ...formData, projectName: text })
              }
              placeholderTextColor={Colors.textTertiary}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Location *</Text>
            <TextInput
              style={styles.input}
              placeholder="Project address or location"
              value={formData.location}
              onChangeText={(text) =>
                setFormData({ ...formData, location: text })
              }
              placeholderTextColor={Colors.textTertiary}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Project Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe the work you need estimated..."
              value={formData.description}
              onChangeText={(text) =>
                setFormData({ ...formData, description: text })
              }
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              placeholderTextColor={Colors.textTertiary}
            />
          </View>

          <View style={styles.formRow}>
            <View style={styles.formGroupHalf}>
              <Text style={styles.label}>Preferred Date</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                value={formData.preferredDate}
                onChangeText={(text) =>
                  setFormData({ ...formData, preferredDate: text })
                }
                placeholderTextColor={Colors.textTertiary}
              />
            </View>

            <View style={styles.formGroupHalf}>
              <Text style={styles.label}>Preferred Time</Text>
              <TextInput
                style={styles.input}
                placeholder="HH:MM"
                value={formData.preferredTime}
                onChangeText={(text) =>
                  setFormData({ ...formData, preferredTime: text })
                }
                placeholderTextColor={Colors.textTertiary}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              submitting && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            <Calendar size={20} color={Colors.white} />
            <Text style={styles.submitButtonText}>
              {submitting ? "Sending..." : "Send Request"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchSection: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchBar: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: Colors.text,
  },
  filtersScroll: {
    marginHorizontal: -16,
  },
  filtersContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: Colors.surface,
  },
  listContent: {
    padding: 16,
  },
  contractorCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  contractorHeader: {
    flexDirection: "row" as const,
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary + "20",
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.primary,
  },
  contractorInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    marginBottom: 4,
  },
  contractorName: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    flex: 1,
  },
  contractorCompany: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: "500" as const,
  },
  contractorDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 8,
  },
  tradeBadge: {
    backgroundColor: Colors.info + "15",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  tradeText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.info,
  },
  projectsText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: "500" as const,
  },
  locationRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
  },
  locationText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  contractorActions: {
    flexDirection: "row" as const,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    gap: 6,
  },
  actionButtonSecondary: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.surface,
  },
  actionButtonTextSecondary: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
  emptyState: {
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.textSecondary,
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
  modalContractorInfo: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalContractorHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  modalContractorText: {
    flex: 1,
  },
  modalContractorName: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  modalContractorCompany: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  modalContractorTrade: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: "600" as const,
  },
  formGroup: {
    marginBottom: 20,
  },
  formRow: {
    flexDirection: "row" as const,
    gap: 12,
    marginBottom: 20,
  },
  formGroupHalf: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textArea: {
    minHeight: 120,
    paddingTop: 12,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center" as const,
    flexDirection: "row" as const,
    justifyContent: "center" as const,
    gap: 8,
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.white,
  },
  trustBadge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  trustBadgeText: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  verificationCountBadge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
    marginLeft: "auto" as const,
  },
  verificationCountText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  badgesContainer: {
    flexDirection: "row" as const,
    gap: 8,
    marginBottom: 12,
  },
  featuredBadge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: Colors.warning + "15",
  },
  featuredBadgeText: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: Colors.warning,
    textTransform: "uppercase" as const,
  },
  topRatedBadge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: Colors.success + "15",
  },
  topRatedBadgeText: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: Colors.success,
    textTransform: "uppercase" as const,
  },
  advancedFilters: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  filterRow: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 8,
  },
  ratingFilters: {
    flexDirection: "row" as const,
    gap: 8,
  },
  ratingFilterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ratingFilterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  ratingFilterText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  ratingFilterTextActive: {
    color: Colors.white,
  },
  locationInput: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  badgeFiltersRow: {
    flexDirection: "row" as const,
    gap: 8,
    flexWrap: "wrap" as const,
  },
  badgeFilterChip: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  badgeFilterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  badgeFilterText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  badgeFilterTextActive: {
    color: Colors.white,
  },
  mapContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    padding: 16,
  },
  mapPlaceholder: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 8,
  },
  mapSubtext: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  mapNote: {
    fontSize: 12,
    color: Colors.textTertiary,
    textAlign: "center" as const,
    marginBottom: 24,
  },
  mapContractorsList: {
    maxHeight: 300,
    width: "100%" as const,
  },
  mapContractorsContent: {
    gap: 12,
  },
  mapContractorCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mapContractorHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    marginBottom: 4,
  },
  mapContractorName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
    flex: 1,
  },
  mapContractorTrade: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  mapContractorRating: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
  },
  mapContractorRatingText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: "500" as const,
  },
});
