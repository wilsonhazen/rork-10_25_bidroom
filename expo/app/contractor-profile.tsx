import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import {
  MapPin,
  Phone,
  Mail,
  Star,
  BadgeCheck,
  Calendar,
  Award,
  Briefcase,
  Clock,
  X,
  Shield,
  CheckCircle,
  TrendingUp,
  Heart,
  Share2,
  Flag,
  Video,
} from "lucide-react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import Colors from "@/constants/colors";
import { mockContractors } from "@/mocks/data";
import { useAuth } from "@/contexts/AuthContext";
import { useAppointments } from "@/contexts/AppointmentsContext";
import { useSavedContractors } from "@/contexts/SavedContractorsContext";
import { useVideoConsultations } from "@/contexts/VideoConsultationsContext";
import { Share, Platform } from "react-native";
import TrustSuggestions from "@/components/TrustSuggestions";
import VerificationBadge from "@/components/VerificationBadge";
import ReviewsList from "@/components/ReviewsList";
import PortfolioGallery from "@/components/PortfolioGallery";
import Endorsements from "@/components/Endorsements";
import CertificationsAndAwards from "@/components/CertificationsAndAwards";
import ExperienceTimeline from "@/components/ExperienceTimeline";
import BeforeAfterComparison from "@/components/BeforeAfterComparison";
import { 
  calculateTrustScore, 
  getTrustLevelColor, 
  getTrustLevelLabel
} from "@/utils/trust";
import { Contractor } from "@/types";

function TrustScoreCard({ contractor }: { contractor: Contractor }) {
  const trustScore = calculateTrustScore(contractor);
  const color = getTrustLevelColor(trustScore.level);

  return (
    <View style={[styles.trustScoreCard, { borderColor: color + "30" }]}>
      <View style={[styles.trustScoreBadge, { backgroundColor: color }]}>
        <Shield size={24} color={Colors.white} />
        <Text style={styles.trustScoreValue}>{trustScore.score}</Text>
      </View>
      <View style={styles.trustScoreInfo}>
        <Text style={styles.trustScoreLabel}>Trust Score</Text>
        <Text style={[styles.trustScoreLevel, { color }]}>
          {getTrustLevelLabel(trustScore.level)}
        </Text>
        <View style={styles.trustScoreBreakdown}>
          <Text style={styles.trustScoreBreakdownText}>
            Verification: {trustScore.verificationScore}% • Performance: {trustScore.performanceScore}%
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function ContractorProfileScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const { createAppointment } = useAppointments();
  const { isSaved, saveContractor, unsaveContractor } = useSavedContractors();
  const { requestConsultation } = useVideoConsultations();
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showVideoConsultModal, setShowVideoConsultModal] = useState(false);

  const contractorId = Array.isArray(id) ? id[0] : id;
  const contractor = mockContractors.find((c) => c.id === contractorId);

  if (!contractor) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: "Contractor Profile",
            headerShown: true,
          }}
        />
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Contractor not found</Text>
        </View>
      </View>
    );
  }



  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Contractor Profile",
          headerShown: true,
          headerStyle: {
            backgroundColor: Colors.surface,
          },
          headerTintColor: Colors.text,
          headerShadowVisible: false,
          headerRight: () => (
            <View style={{ flexDirection: "row" as const, gap: 12, marginRight: 8 }}>
              <TouchableOpacity 
                onPress={() => {
                  if (isSaved(contractor.id)) {
                    unsaveContractor(contractor.id);
                    Alert.alert("Removed", "Contractor removed from favorites");
                  } else {
                    saveContractor(contractor.id);
                    Alert.alert("Saved", "Contractor saved to favorites");
                  }
                }}
              >
                <Heart 
                  size={22} 
                  color={isSaved(contractor.id) ? Colors.error : Colors.text}
                  fill={isSaved(contractor.id) ? Colors.error : "none"}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => {
                  try {
                    if (Platform.OS === "web") {
                      await navigator.share({
                        title: `${contractor.name} - ${contractor.company}`,
                        text: `Check out ${contractor.name} on BuildConnect!`,
                        url: window.location.href,
                      });
                    } else {
                      await Share.share({
                        message: `Check out ${contractor.name} from ${contractor.company} on BuildConnect!`,
                        title: `${contractor.name} - ${contractor.company}`,
                      });
                    }
                  } catch (error) {
                    console.error("Share failed:", error);
                  }
                }}
              >
                <Share2 size={22} color={Colors.text} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowReportModal(true)}>
                <Flag size={22} color={Colors.text} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.trustScoreHeader}>
          <TrustScoreCard contractor={contractor} />
        </View>

        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarText}>
                {contractor.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </Text>
            </View>
            {contractor.verified && (
              <View style={styles.verifiedBadge}>
                <BadgeCheck size={20} color={Colors.white} fill={Colors.primary} />
              </View>
            )}
          </View>

          <Text style={styles.name}>{contractor.name}</Text>
          <Text style={styles.company}>{contractor.company}</Text>

          <View style={styles.ratingContainer}>
            <Star size={20} color={Colors.warning} fill={Colors.warning} />
            <Text style={styles.ratingText}>
              {contractor.rating.toFixed(1)} ({contractor.reviewCount} reviews)
            </Text>
          </View>

          <View style={styles.tradeBadge}>
            <Briefcase size={16} color={Colors.primary} />
            <Text style={styles.tradeText}>{contractor.trade}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.contactItem}>
            <Phone size={18} color={Colors.textSecondary} />
            <Text style={styles.contactText}>{contractor.phone}</Text>
          </View>
          <View style={styles.contactItem}>
            <Mail size={18} color={Colors.textSecondary} />
            <Text style={styles.contactText}>{contractor.email}</Text>
          </View>
          <View style={styles.contactItem}>
            <MapPin size={18} color={Colors.textSecondary} />
            <Text style={styles.contactText}>{contractor.location}</Text>
          </View>
        </View>

        {contractor.verifications && contractor.verifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Verifications</Text>
            <VerificationBadge 
              verifications={contractor.verifications} 
              size="large"
              showDetails
            />
          </View>
        )}

        {contractor.trustIndicators && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trust Indicators</Text>
            <View style={styles.indicatorsGrid}>
              <View style={styles.indicatorCard}>
                <TrendingUp size={20} color={Colors.info} />
                <Text style={styles.indicatorValue}>
                  {contractor.trustIndicators.responseRate}%
                </Text>
                <Text style={styles.indicatorLabel}>Response Rate</Text>
              </View>
              <View style={styles.indicatorCard}>
                <Clock size={20} color={Colors.success} />
                <Text style={styles.indicatorValue}>
                  {contractor.trustIndicators.responseTime}h
                </Text>
                <Text style={styles.indicatorLabel}>Avg Response</Text>
              </View>
              <View style={styles.indicatorCard}>
                <CheckCircle size={20} color={Colors.primary} />
                <Text style={styles.indicatorValue}>
                  {contractor.trustIndicators.onTimeRate}%
                </Text>
                <Text style={styles.indicatorLabel}>On-Time Rate</Text>
              </View>
            </View>
          </View>
        )}

        <TrustSuggestions contractor={contractor} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Award size={24} color={Colors.success} />
              <Text style={styles.statValue}>{contractor.completedProjects}</Text>
              <Text style={styles.statLabel}>Completed Projects</Text>
            </View>
            <View style={styles.statCard}>
              <Star size={24} color={Colors.warning} />
              <Text style={styles.statValue}>{contractor.rating.toFixed(1)}</Text>
              <Text style={styles.statLabel}>Average Rating</Text>
            </View>
            <View style={styles.statCard}>
              <Clock size={24} color={Colors.info} />
              <Text style={styles.statValue}>98%</Text>
              <Text style={styles.statLabel}>On-Time Delivery</Text>
            </View>
          </View>
        </View>

        {contractor.endorsements && contractor.endorsements.length > 0 && (
          <View style={styles.section}>
            <Endorsements endorsements={contractor.endorsements} />
          </View>
        )}

        {(contractor.certifications || contractor.awards) && (
          <View style={styles.section}>
            <CertificationsAndAwards 
              certifications={contractor.certifications}
              awards={contractor.awards}
            />
          </View>
        )}

        {contractor.experienceTimeline && contractor.experienceTimeline.length > 0 && (
          <View style={styles.section}>
            <ExperienceTimeline timeline={contractor.experienceTimeline} />
          </View>
        )}

        {contractor.beforeAfterProjects && contractor.beforeAfterProjects.length > 0 && (
          <View style={styles.section}>
            <BeforeAfterComparison projects={contractor.beforeAfterProjects} />
          </View>
        )}

        {contractor.portfolio && contractor.portfolio.length > 0 && (
          <View style={styles.section}>
            <PortfolioGallery portfolio={contractor.portfolio} />
          </View>
        )}

        {contractor.reviews && contractor.reviews.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reviews & Ratings</Text>
            <ReviewsList 
              reviews={contractor.reviews} 
              averageRating={contractor.rating}
              totalReviews={contractor.reviewCount}
            />
          </View>
        )}

        {contractor.availability && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Availability</Text>
            <Text style={styles.availabilityText}>
              Next Available: {new Date(contractor.availability.nextAvailable || "").toLocaleDateString()}
            </Text>
            <View style={styles.calendarGrid}>
              {contractor.availability.calendar.slice(0, 7).map((day) => (
                <View key={day.date} style={styles.calendarDay}>
                  <Text style={styles.calendarDayName}>
                    {new Date(day.date).toLocaleDateString("en-US", { weekday: "short" })}
                  </Text>
                  <View
                    style={[
                      styles.calendarDayIndicator,
                      day.available
                        ? styles.calendarDayAvailable
                        : styles.calendarDayUnavailable,
                    ]}
                  >
                    <Text
                      style={[
                        styles.calendarDayNumber,
                        day.available
                          ? styles.calendarDayNumberAvailable
                          : styles.calendarDayNumberUnavailable,
                      ]}
                    >
                      {new Date(day.date).getDate()}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.callButton}
          onPress={() => Alert.alert("Call", `Calling ${contractor.phone}`)}
        >
          <Phone size={20} color={Colors.white} />
          <Text style={styles.callButtonText}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.videoButton}
          onPress={() => setShowVideoConsultModal(true)}
        >
          <Video size={20} color={Colors.white} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.requestButton}
          onPress={() => setShowRequestModal(true)}
        >
          <Calendar size={20} color={Colors.white} />
          <Text style={styles.requestButtonText}>Request Estimate</Text>
        </TouchableOpacity>
      </View>

      <RequestEstimateModal
        visible={showRequestModal}
        contractor={contractor}
        onClose={() => setShowRequestModal(false)}
        onSubmit={async (data) => {
          if (!user) return;
          
          try {
            await createAppointment({
              title: `Estimate Request - ${data.projectName}`,
              contractorId: contractor.id,
              contractorName: contractor.name,
              contractorCompany: contractor.company,
              date: data.preferredDate,
              time: data.preferredTime,
              type: "estimate",
              location: data.location,
              notes: data.description,
            });
            
            Alert.alert(
              "Success",
              `Estimate request sent to ${contractor.name}`,
              [{ text: "OK" }]
            );
            
            setShowRequestModal(false);
          } catch (error) {
            console.error("Failed to create appointment:", error);
            Alert.alert("Error", "Failed to send estimate request");
          }
        }}
      />

      <ReportModal
        visible={showReportModal}
        contractor={contractor}
        onClose={() => setShowReportModal(false)}
        onSubmit={async (data) => {
          console.log("Report submitted:", data);
          Alert.alert(
            "Report Submitted",
            "Thank you for your report. We will review it shortly.",
            [{ text: "OK" }]
          );
          setShowReportModal(false);
        }}
      />

      <VideoConsultModal
        visible={showVideoConsultModal}
        contractor={contractor}
        onClose={() => setShowVideoConsultModal(false)}
        onSubmit={async (data) => {
          if (!user) return;
          
          try {
            await requestConsultation({
              contractorId: contractor.id,
              contractorName: contractor.name,
              scheduledDate: data.scheduledDate,
              scheduledTime: data.scheduledTime,
              duration: data.duration,
              topic: data.topic,
              notes: data.notes,
            });
            
            Alert.alert(
              "Request Sent",
              `Video consultation request sent to ${contractor.name}`,
              [{ text: "OK" }]
            );
            
            setShowVideoConsultModal(false);
          } catch (error) {
            console.error("Failed to request consultation:", error);
            Alert.alert("Error", "Failed to send consultation request");
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
  contractor: any;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
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
            <Text style={styles.modalInfoLabel}>Contractor:</Text>
            <Text style={styles.modalInfoValue}>{contractor.name}</Text>
            <Text style={styles.modalInfoCompany}>{contractor.company}</Text>
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

function VideoConsultModal({
  visible,
  contractor,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  contractor: any;
  onClose: () => void;
  onSubmit: (data: {
    scheduledDate: string;
    scheduledTime: string;
    duration: number;
    topic: string;
    notes?: string;
  }) => Promise<void>;
}) {
  const [formData, setFormData] = useState({
    scheduledDate: new Date().toISOString().split("T")[0],
    scheduledTime: "10:00",
    duration: 30,
    topic: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const durations = [
    { value: 15, label: "15 minutes" },
    { value: 30, label: "30 minutes" },
    { value: 45, label: "45 minutes" },
    { value: 60, label: "1 hour" },
  ];

  const handleSubmit = async () => {
    if (!formData.topic.trim()) {
      Alert.alert("Error", "Please enter a consultation topic");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(formData);
      setFormData({
        scheduledDate: new Date().toISOString().split("T")[0],
        scheduledTime: "10:00",
        duration: 30,
        topic: "",
        notes: "",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Request Video Consultation</Text>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.modalContent}
          contentContainerStyle={styles.modalContentInner}
        >
          <View style={styles.modalContractorInfo}>
            <Text style={styles.modalInfoLabel}>Contractor:</Text>
            <Text style={styles.modalInfoValue}>{contractor.name}</Text>
            <Text style={styles.modalInfoCompany}>{contractor.company}</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Topic *</Text>
            <TextInput
              style={styles.input}
              placeholder="What would you like to discuss?"
              value={formData.topic}
              onChangeText={(text) =>
                setFormData({ ...formData, topic: text })
              }
              placeholderTextColor={Colors.textTertiary}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Duration *</Text>
            <View style={styles.durationGrid}>
              {durations.map((d) => (
                <TouchableOpacity
                  key={d.value}
                  style={[
                    styles.durationOption,
                    formData.duration === d.value && styles.durationOptionActive,
                  ]}
                  onPress={() => setFormData({ ...formData, duration: d.value })}
                >
                  <Text
                    style={[
                      styles.durationText,
                      formData.duration === d.value && styles.durationTextActive,
                    ]}
                  >
                    {d.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={styles.formGroupHalf}>
              <Text style={styles.label}>Preferred Date</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                value={formData.scheduledDate}
                onChangeText={(text) =>
                  setFormData({ ...formData, scheduledDate: text })
                }
                placeholderTextColor={Colors.textTertiary}
              />
            </View>

            <View style={styles.formGroupHalf}>
              <Text style={styles.label}>Preferred Time</Text>
              <TextInput
                style={styles.input}
                placeholder="HH:MM"
                value={formData.scheduledTime}
                onChangeText={(text) =>
                  setFormData({ ...formData, scheduledTime: text })
                }
                placeholderTextColor={Colors.textTertiary}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Additional Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Any specific topics or questions to cover..."
              value={formData.notes}
              onChangeText={(text) =>
                setFormData({ ...formData, notes: text })
              }
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor={Colors.textTertiary}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              submitting && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            <Video size={20} color={Colors.white} />
            <Text style={styles.submitButtonText}>
              {submitting ? "Sending..." : "Send Request"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}

function ReportModal({
  visible,
  contractor,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  contractor: any;
  onClose: () => void;
  onSubmit: (data: { reason: string; description: string }) => Promise<void>;
}) {
  const [reason, setReason] = useState("inappropriate");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reasons = [
    { value: "inappropriate", label: "Inappropriate Content" },
    { value: "scam", label: "Suspected Scam" },
    { value: "fake_profile", label: "Fake Profile" },
    { value: "harassment", label: "Harassment" },
    { value: "other", label: "Other" },
  ];

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert("Error", "Please provide a description");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ reason, description });
      setReason("inappropriate");
      setDescription("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Report Contractor</Text>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.modalContent}
          contentContainerStyle={styles.modalContentInner}
        >
          <View style={styles.modalContractorInfo}>
            <Text style={styles.modalInfoLabel}>Reporting:</Text>
            <Text style={styles.modalInfoValue}>{contractor.name}</Text>
            <Text style={styles.modalInfoCompany}>{contractor.company}</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Reason *</Text>
            {reasons.map((r) => (
              <TouchableOpacity
                key={r.value}
                style={[
                  styles.reasonOption,
                  reason === r.value && styles.reasonOptionActive,
                ]}
                onPress={() => setReason(r.value)}
              >
                <View
                  style={[
                    styles.radio,
                    reason === r.value && styles.radioActive,
                  ]}
                >
                  {reason === r.value && <View style={styles.radioDot} />}
                </View>
                <Text
                  style={[
                    styles.reasonText,
                    reason === r.value && styles.reasonTextActive,
                  ]}
                >
                  {r.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Please describe the issue..."  
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={8}
              textAlignVertical="top"
              placeholderTextColor={Colors.textTertiary}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              submitting && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            <Flag size={20} color={Colors.white} />
            <Text style={styles.submitButtonText}>
              {submitting ? "Submitting..." : "Submit Report"}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    backgroundColor: Colors.surface,
    padding: 24,
    alignItems: "center" as const,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatarContainer: {
    position: "relative" as const,
    marginBottom: 16,
  },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary + "20",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: "700" as const,
    color: Colors.primary,
  },
  verifiedBadge: {
    position: "absolute" as const,
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 4,
    borderWidth: 3,
    borderColor: Colors.surface,
  },
  name: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  company: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    marginBottom: 16,
  },
  ratingText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: "600" as const,
  },
  tradeBadge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    backgroundColor: Colors.primary + "15",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tradeText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
  section: {
    backgroundColor: Colors.surface,
    padding: 20,
    marginBottom: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    paddingVertical: 10,
  },
  contactText: {
    fontSize: 15,
    color: Colors.text,
  },
  statsGrid: {
    flexDirection: "row" as const,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    alignItems: "center" as const,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: "center" as const,
  },
  projectCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  projectHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    marginBottom: 8,
  },
  projectName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
    marginRight: 12,
  },
  projectBudget: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.success,
  },
  projectDetails: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    marginTop: 4,
  },
  projectLocation: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  projectDate: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  reviewCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  reviewHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    marginBottom: 12,
  },
  reviewAuthorInfo: {
    flex: 1,
  },
  reviewAuthor: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 2,
  },
  reviewCompany: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  reviewRating: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
  },
  reviewRatingText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.text,
    marginBottom: 8,
  },
  reviewDate: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  footer: {
    position: "absolute" as const,
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row" as const,
    gap: 12,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    padding: 16,
  },
  callButton: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 8,
    backgroundColor: Colors.secondary,
    borderRadius: 12,
    paddingVertical: 16,
  },
  callButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.white,
  },
  videoButton: {
    width: 50,
    height: 50,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: Colors.info,
    borderRadius: 12,
  },
  requestButton: {
    flex: 2,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
  },
  requestButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.white,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    padding: 32,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600" as const,
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
  modalInfoLabel: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginBottom: 4,
  },
  modalInfoValue: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 2,
  },
  modalInfoCompany: {
    fontSize: 14,
    color: Colors.textSecondary,
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
  trustScoreHeader: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  trustScoreCard: {
    flexDirection: "row" as const,
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    gap: 16,
    alignItems: "center" as const,
  },
  trustScoreBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    gap: 4,
  },
  trustScoreValue: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.white,
  },
  trustScoreInfo: {
    flex: 1,
  },
  trustScoreLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  trustScoreLevel: {
    fontSize: 20,
    fontWeight: "700" as const,
    marginBottom: 8,
  },
  trustScoreBreakdown: {
    marginTop: 4,
  },
  trustScoreBreakdownText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  verificationsGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 8,
  },
  verificationItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  verificationItemVerified: {
    backgroundColor: Colors.success + "10",
    borderColor: Colors.success + "30",
  },
  verificationText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: "500" as const,
  },
  verificationTextVerified: {
    color: Colors.success,
    fontWeight: "600" as const,
  },
  indicatorsGrid: {
    flexDirection: "row" as const,
    gap: 12,
  },
  indicatorCard: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 10,
    padding: 14,
    alignItems: "center" as const,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  indicatorValue: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  indicatorLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: "center" as const,
  },
  availabilityText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  calendarGrid: {
    flexDirection: "row" as const,
    gap: 8,
  },
  calendarDay: {
    flex: 1,
    alignItems: "center" as const,
  },
  calendarDayName: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
    fontWeight: "600" as const,
  },
  calendarDayIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    borderWidth: 2,
  },
  calendarDayAvailable: {
    backgroundColor: Colors.success + "15",
    borderColor: Colors.success,
  },
  calendarDayUnavailable: {
    backgroundColor: Colors.border,
    borderColor: Colors.border,
  },
  calendarDayNumber: {
    fontSize: 14,
    fontWeight: "700" as const,
  },
  calendarDayNumberAvailable: {
    color: Colors.success,
  },
  calendarDayNumberUnavailable: {
    color: Colors.textTertiary,
  },
  reasonOption: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    marginBottom: 8,
  },
  reasonOptionActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + "10",
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginRight: 12,
  },
  radioActive: {
    borderColor: Colors.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  reasonText: {
    fontSize: 15,
    color: Colors.text,
  },
  reasonTextActive: {
    fontWeight: "600" as const,
    color: Colors.primary,
  },
  durationGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 8,
  },
  durationOption: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: Colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center" as const,
  },
  durationOptionActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + "10",
  },
  durationText: {
    fontSize: 14,
    color: Colors.text,
  },
  durationTextActive: {
    fontWeight: "600" as const,
    color: Colors.primary,
  },
});
