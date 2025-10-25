import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from "react-native";
import {
  MapPin,
  DollarSign,
  Briefcase,
  Calendar,
  CheckCircle,
  XCircle,
  MessageCircle,
  User,
  Building,
  Phone,
  X,
  UserPlus,
  Clock,
  AlertCircle,
  Trash2,
  Send,
} from "lucide-react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { useJobs } from "@/contexts/JobsContext";
import { useAppointments } from "@/contexts/AppointmentsContext";
import { JobApplication } from "@/types";
import { TEST_USERS } from "@/mocks/test-users";

export default function JobDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user, hasPermission } = useAuth();
  
  const jobId = Array.isArray(id) ? id[0] : id;
  console.log('Job Details Screen - Raw ID:', id, 'Processed ID:', jobId, 'Type:', typeof jobId);
  
  const {
    getJobById,
    getApplicationsByJobId,
    applyToJob,
    updateApplicationStatus,
    sendMessage,
    deleteJob,
  } = useJobs();
  
  const jobs = useJobs().jobs;

  const { requestEstimate, createAppointment } = useAppointments();

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showRequestEstimateModal, setShowRequestEstimateModal] = useState(false);
  const [showBookAppointmentModal, setShowBookAppointmentModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'applicants'>('details');

  const job = getJobById(jobId as string);
  const applications = getApplicationsByJobId(jobId as string);
  
  console.log('Job Details - Found job:', job ? job.title : 'NOT FOUND', 'All jobs count:', jobs?.length);
  const canManage = hasPermission("canManageApplications");
  const isJobPoster = user?.id === job?.postedBy;
  const hasApplied = applications.some((app) => app.applicantId === user?.id);
  const userApplication = applications.find((app) => app.applicantId === user?.id);
  const canApply = !isJobPoster && job?.status === "open" && !hasApplied;
  const canViewApplyButton = user?.role === "GC" || user?.role === "Subcontractor" || user?.role === "Trade Specialist";

  if (!job) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: "Job Details",
            headerShown: true,
          }}
        />
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Job not found</Text>
        </View>
      </View>
    );
  }

  const urgencyColors = {
    low: Colors.success,
    medium: Colors.warning,
    high: Colors.secondary,
    urgent: Colors.error,
  };

  const handleDeleteJob = () => {
    if (!job) return;
    deleteJob(job.id);
    router.back();
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: job.title,
          headerShown: true,
          headerStyle: {
            backgroundColor: Colors.surface,
          },
          headerTintColor: Colors.text,
          headerShadowVisible: false,
          headerRight: () => isJobPoster ? (
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => setShowInviteModal(true)}
              >
                <UserPlus size={20} color={Colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={handleDeleteJob}
              >
                <Trash2 size={20} color={Colors.error} />
              </TouchableOpacity>
            </View>
          ) : null,
        }}
      />

      {(isJobPoster || canManage) && (
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'details' && styles.tabActive]}
            onPress={() => setActiveTab('details')}
          >
            <Text style={[styles.tabText, activeTab === 'details' && styles.tabTextActive]}>
              Details
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'applicants' && styles.tabActive]}
            onPress={() => setActiveTab('applicants')}
          >
            <Text style={[styles.tabText, activeTab === 'applicants' && styles.tabTextActive]}>
              Applicants ({applications.length})
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'details' && (
          <>
            <View style={styles.header}>
              <View style={styles.titleContainer}>
                <Text style={styles.title}>{job.title}</Text>
                <View
                  style={[
                    styles.urgencyBadge,
                    { backgroundColor: urgencyColors[job.urgency] },
                  ]}
                >
                  <Text style={styles.urgencyText}>
                    {job.urgency.toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text style={styles.company}>{job.postedByCompany}</Text>
              <Text style={styles.postedBy}>Posted by {job.postedByName}</Text>
              <Text style={styles.postedDate}>
                Posted on {new Date(job.createdAt).toLocaleDateString()}
              </Text>
            </View>

            <View style={styles.detailsGrid}>
              <View style={styles.detailCard}>
                <Briefcase size={20} color={Colors.primary} />
                <Text style={styles.detailLabel}>Trade</Text>
                <Text style={styles.detailValue}>{job.trade}</Text>
              </View>

              <View style={styles.detailCard}>
                <MapPin size={20} color={Colors.primary} />
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={styles.detailValue}>{job.location}</Text>
              </View>

              <View style={styles.detailCard}>
                <Calendar size={20} color={Colors.primary} />
                <Text style={styles.detailLabel}>Start Date</Text>
                <Text style={styles.detailValue}>
                  {new Date(job.startDate).toLocaleDateString()}
                </Text>
              </View>

              {job.payRate && (
                <View style={styles.detailCard}>
                  <DollarSign size={20} color={Colors.primary} />
                  <Text style={styles.detailLabel}>Pay Rate</Text>
                  <Text style={styles.detailValue}>{job.payRate}</Text>
                </View>
              )}

              <View style={styles.detailCard}>
                <User size={20} color={Colors.primary} />
                <Text style={styles.detailLabel}>Applicants</Text>
                <Text style={styles.detailValue}>{applications.length}</Text>
              </View>

              <View style={styles.detailCard}>
                <Clock size={20} color={Colors.primary} />
                <Text style={styles.detailLabel}>Status</Text>
                <Text style={styles.detailValue}>
                  {job.status.replace('_', ' ').toUpperCase()}
                </Text>
              </View>
            </View>

            {job.budget && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Budget</Text>
                <Text style={styles.budget}>{job.budget}</Text>
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{job.description}</Text>
            </View>

            {job.requirements.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Requirements</Text>
                {job.requirements.map((req, index) => (
                  <View key={index} style={styles.requirementItem}>
                    <View style={styles.requirementBullet} />
                    <Text style={styles.requirementText}>{req}</Text>
                  </View>
                ))}
              </View>
            )}

            {job.status === "open" && !isJobPoster && (
              <View style={styles.section}>
                <TouchableOpacity
                  style={styles.bookAppointmentCard}
                  onPress={() => setShowBookAppointmentModal(true)}
                >
                  <Calendar size={32} color={Colors.primary} />
                  <View style={styles.bookAppointmentContent}>
                    <Text style={styles.bookAppointmentTitle}>Book Estimate Appointment</Text>
                    <Text style={styles.bookAppointmentText}>
                      Schedule a site visit to discuss this job and get an estimate
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}

            {(isJobPoster || canManage) && (
              <View style={styles.section}>
                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={[styles.actionCard, { backgroundColor: Colors.primary }]}
                    onPress={() => setShowInviteModal(true)}
                  >
                    <UserPlus size={24} color={Colors.white} />
                    <Text style={styles.actionCardText}>Invite Users</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionCard, { backgroundColor: Colors.secondary }]}
                    onPress={() => setActiveTab('applicants')}
                  >
                    <User size={24} color={Colors.white} />
                    <Text style={styles.actionCardText}>View Applicants</Text>
                    <Text style={styles.actionCardCount}>{applications.length}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </>
        )}

        {activeTab === 'applicants' && (
          <View style={styles.applicantsContainer}>
            {applications.length === 0 ? (
              <View style={styles.emptyApplicants}>
                <AlertCircle size={48} color={Colors.textTertiary} />
                <Text style={styles.emptyApplicantsTitle}>No Applications Yet</Text>
                <Text style={styles.emptyApplicantsText}>
                  No one has applied to this job yet. Invite contractors to apply.
                </Text>
                <TouchableOpacity
                  style={styles.inviteButton}
                  onPress={() => setShowInviteModal(true)}
                >
                  <UserPlus size={20} color={Colors.white} />
                  <Text style={styles.inviteButtonText}>Invite Contractors</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.applicantsList}>
                <View style={styles.applicantsHeader}>
                  <Text style={styles.applicantsTitle}>All Applicants</Text>
                  <View style={styles.statusCounts}>
                    <View style={styles.statusCount}>
                      <View style={[styles.statusDot, { backgroundColor: Colors.warning }]} />
                      <Text style={styles.statusCountText}>
                        {applications.filter(a => a.status === 'pending').length} Pending
                      </Text>
                    </View>
                    <View style={styles.statusCount}>
                      <View style={[styles.statusDot, { backgroundColor: Colors.success }]} />
                      <Text style={styles.statusCountText}>
                        {applications.filter(a => a.status === 'accepted').length} Accepted
                      </Text>
                    </View>
                    <View style={styles.statusCount}>
                      <View style={[styles.statusDot, { backgroundColor: Colors.error }]} />
                      <Text style={styles.statusCountText}>
                        {applications.filter(a => a.status === 'rejected').length} Declined
                      </Text>
                    </View>
                  </View>
                </View>
                {applications.map((application) => (
                  <ApplicationCard
                    key={application.id}
                    application={application}
                    onAccept={() =>
                      updateApplicationStatus(
                        application.id,
                        "accepted",
                        "Application accepted"
                      )
                    }
                    onReject={() =>
                      updateApplicationStatus(
                        application.id,
                        "rejected",
                        "Application declined"
                      )
                    }
                    onMessage={() => {
                      router.push({ 
                        pathname: "/messages", 
                        params: { userId: application.applicantId } 
                      } as any);
                    }}
                  />
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {canApply && canViewApplyButton && (
        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => setShowApplyModal(true)}
            >
              <Text style={styles.applyButtonText}>Apply Now</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.bookAppointmentButtonFooter}
              onPress={() => setShowBookAppointmentModal(true)}
            >
              <Calendar size={18} color={Colors.primary} />
              <Text style={styles.bookAppointmentButtonText}>Book Estimate</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {hasApplied && !isJobPoster && (
        <View style={styles.footer}>
          <View style={styles.appliedSection}>
            <View style={styles.appliedBanner}>
              <CheckCircle size={20} color={Colors.success} />
              <Text style={styles.appliedText}>You have applied to this job</Text>
            </View>
            <TouchableOpacity
              style={styles.requestEstimateButton}
              onPress={() => setShowRequestEstimateModal(true)}
            >
              <Calendar size={18} color={Colors.white} />
              <Text style={styles.requestEstimateText}>Request Estimate</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ApplyModal
        visible={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        onSubmit={async (applicationData) => {
          await applyToJob(job.id, applicationData);
          setShowApplyModal(false);
        }}
      />

      <MessageModal
        visible={showMessageModal}
        onClose={() => {
          setShowMessageModal(false);
          setSelectedApplication(null);
        }}
        onSend={async (message) => {
          if (selectedApplication && user) {
            await sendMessage(
              job.id,
              selectedApplication.applicantId,
              message,
              selectedApplication.id
            );
            setShowMessageModal(false);
            setSelectedApplication(null);
          }
        }}
        recipientName={selectedApplication?.applicantName || ""}
      />

      <RequestEstimateModal
        visible={showRequestEstimateModal}
        onClose={() => setShowRequestEstimateModal(false)}
        onSubmit={async (data) => {
          if (!user || !userApplication) return;
          await requestEstimate({
            jobId: job.id,
            applicationId: userApplication.id,
            requestedFrom: job.postedBy,
            requestedFromName: job.postedByName,
            location: data.location,
            description: data.description,
            preferredDate: data.preferredDate,
            preferredTime: data.preferredTime,
          });
          setShowRequestEstimateModal(false);
        }}
        jobTitle={job.title}
        defaultLocation={job.location}
      />

      <InviteModal
        visible={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        jobTitle={job.title}
        existingApplicants={applications.map(a => a.applicantId)}
      />

      <BookAppointmentModal
        visible={showBookAppointmentModal}
        onClose={() => setShowBookAppointmentModal(false)}
        onSubmit={async (data) => {
          if (!user) return;
          await createAppointment({
            title: `Estimate for ${job.title}`,
            contractorId: job.postedBy,
            contractorName: job.postedByName,
            contractorCompany: job.postedByCompany,
            date: data.date,
            time: data.time,
            type: "estimate",
            location: data.location,
            notes: data.notes,
            jobId: job.id,
          });
          setShowBookAppointmentModal(false);
        }}
        jobTitle={job.title}
        defaultLocation={job.location}
        jobPoster={job.postedByName}
      />
    </View>
  );
}

function ApplicationCard({
  application,
  onAccept,
  onReject,
  onMessage,
}: {
  application: JobApplication;
  onAccept: () => void;
  onReject: () => void;
  onMessage: () => void;
}) {
  const statusColors = {
    pending: Colors.warning,
    accepted: Colors.success,
    rejected: Colors.error,
    withdrawn: Colors.textTertiary,
  };

  const statusText = {
    pending: "Pending",
    accepted: "Accepted",
    rejected: "Declined",
    withdrawn: "Withdrawn",
  };

  return (
    <View style={styles.applicationCard}>
      <View style={styles.applicantHeader}>
        <View style={styles.applicantInfo}>
          <View style={styles.applicantRow}>
            <User size={16} color={Colors.textSecondary} />
            <Text style={styles.applicantName}>{application.applicantName}</Text>
          </View>
          <View style={styles.applicantRow}>
            <Building size={16} color={Colors.textSecondary} />
            <Text style={styles.applicantDetail}>
              {application.applicantCompany}
            </Text>
          </View>
          <View style={styles.applicantRow}>
            <Phone size={16} color={Colors.textSecondary} />
            <Text style={styles.applicantDetail}>
              {application.applicantPhone}
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusColors[application.status] },
          ]}
        >
          <Text style={styles.statusText}>{statusText[application.status]}</Text>
        </View>
      </View>

      <Text style={styles.coverLetterLabel}>Cover Letter:</Text>
      <Text style={styles.coverLetterText}>{application.coverLetter}</Text>

      {application.proposedRate && (
        <View style={styles.proposedRateContainer}>
          <DollarSign size={16} color={Colors.primary} />
          <Text style={styles.proposedRateText}>
            Proposed Rate: {application.proposedRate}
          </Text>
        </View>
      )}

      <View style={styles.applicationMeta}>
        <Text style={styles.applicationDate}>
          Applied {new Date(application.appliedAt).toLocaleDateString()}
        </Text>
        <Text style={styles.availableFrom}>
          Available from{" "}
          {new Date(application.availableFrom).toLocaleDateString()}
        </Text>
      </View>

      {application.status === "pending" && (
        <View style={styles.applicationActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={onAccept}
          >
            <CheckCircle size={18} color={Colors.white} />
            <Text style={styles.actionButtonText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={onReject}
          >
            <XCircle size={18} color={Colors.white} />
            <Text style={styles.actionButtonText}>Decline</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.messageButton]}
            onPress={onMessage}
          >
            <MessageCircle size={18} color={Colors.white} />
            <Text style={styles.actionButtonText}>Message</Text>
          </TouchableOpacity>
        </View>
      )}

      {application.status !== "pending" && (
        <TouchableOpacity
          style={[styles.actionButton, styles.messageButton, { marginTop: 12 }]}
          onPress={onMessage}
        >
          <MessageCircle size={18} color={Colors.white} />
          <Text style={styles.actionButtonText}>Send Message</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function ApplyModal({
  visible,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}) {
  const [formData, setFormData] = useState({
    coverLetter: "",
    proposedRate: "",
    availableFrom: new Date().toISOString().split("T")[0],
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!formData.coverLetter) return;

    setSubmitting(true);
    try {
      await onSubmit(formData);
      setFormData({
        coverLetter: "",
        proposedRate: "",
        availableFrom: new Date().toISOString().split("T")[0],
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Apply to Job</Text>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.modalContent}
          contentContainerStyle={styles.modalContentInner}
        >
          <View style={styles.formGroup}>
            <Text style={styles.label}>Cover Letter *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Tell them why you're a great fit for this job..."
              value={formData.coverLetter}
              onChangeText={(text) =>
                setFormData({ ...formData, coverLetter: text })
              }
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              placeholderTextColor={Colors.textTertiary}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Proposed Rate (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., $50/hour or $5,000 total"
              value={formData.proposedRate}
              onChangeText={(text) =>
                setFormData({ ...formData, proposedRate: text })
              }
              placeholderTextColor={Colors.textTertiary}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Available From</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={formData.availableFrom}
              onChangeText={(text) =>
                setFormData({ ...formData, availableFrom: text })
              }
              placeholderTextColor={Colors.textTertiary}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              submitting && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={submitting || !formData.coverLetter}
          >
            <Text style={styles.submitButtonText}>
              {submitting ? "Submitting..." : "Submit Application"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}

function MessageModal({
  visible,
  onClose,
  onSend,
  recipientName,
}: {
  visible: boolean;
  onClose: () => void;
  onSend: (message: string) => Promise<void>;
  recipientName: string;
}) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;

    setSending(true);
    try {
      await onSend(message);
      setMessage("");
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Message {recipientName}</Text>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.messageModalContent}>
          <TextInput
            style={[styles.input, styles.messageTextArea]}
            placeholder="Type your message..."
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={8}
            textAlignVertical="top"
            placeholderTextColor={Colors.textTertiary}
            autoFocus
          />

          <TouchableOpacity
            style={[styles.submitButton, sending && styles.submitButtonDisabled]}
            onPress={handleSend}
            disabled={sending || !message.trim()}
          >
            <MessageCircle size={20} color={Colors.white} />
            <Text style={styles.submitButtonText}>
              {sending ? "Sending..." : "Send Message"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function RequestEstimateModal({
  visible,
  onClose,
  onSubmit,
  jobTitle,
  defaultLocation,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  jobTitle: string;
  defaultLocation: string;
}) {
  const [formData, setFormData] = useState({
    location: defaultLocation,
    description: "",
    preferredDate: "",
    preferredTime: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!formData.location || !formData.description) return;

    setSubmitting(true);
    try {
      await onSubmit(formData);
      setFormData({
        location: defaultLocation,
        description: "",
        preferredDate: "",
        preferredTime: "",
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
          <View style={styles.estimateJobInfo}>
            <Text style={styles.estimateJobLabel}>For Job:</Text>
            <Text style={styles.estimateJobTitle}>{jobTitle}</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Location *</Text>
            <TextInput
              style={styles.input}
              placeholder="Site location for estimate"
              value={formData.location}
              onChangeText={(text) =>
                setFormData({ ...formData, location: text })
              }
              placeholderTextColor={Colors.textTertiary}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe what needs to be estimated..."
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

          <View style={styles.formGroup}>
            <Text style={styles.label}>Preferred Date (Optional)</Text>
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

          <View style={styles.formGroup}>
            <Text style={styles.label}>Preferred Time (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 10:00 AM"
              value={formData.preferredTime}
              onChangeText={(text) =>
                setFormData({ ...formData, preferredTime: text })
              }
              placeholderTextColor={Colors.textTertiary}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              submitting && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={submitting || !formData.location || !formData.description}
          >
            <Calendar size={20} color={Colors.white} />
            <Text style={styles.submitButtonText}>
              {submitting ? "Requesting..." : "Send Request"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}

function BookAppointmentModal({
  visible,
  onClose,
  onSubmit,
  jobTitle,
  defaultLocation,
  jobPoster,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  jobTitle: string;
  defaultLocation: string;
  jobPoster: string;
}) {
  const [formData, setFormData] = useState({
    location: defaultLocation,
    date: "",
    time: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!formData.location || !formData.date || !formData.time) return;

    setSubmitting(true);
    try {
      await onSubmit(formData);
      setFormData({
        location: defaultLocation,
        date: "",
        time: "",
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
          <Text style={styles.modalTitle}>Book Estimate Appointment</Text>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.modalContent}
          contentContainerStyle={styles.modalContentInner}
        >
          <View style={styles.estimateJobInfo}>
            <Text style={styles.estimateJobLabel}>For Job:</Text>
            <Text style={styles.estimateJobTitle}>{jobTitle}</Text>
            <Text style={styles.estimateJobSubtitle}>Meeting with: {jobPoster}</Text>
          </View>

          <View style={styles.infoCard}>
            <Calendar size={20} color={Colors.primary} />
            <Text style={styles.infoCardText}>
              Book an appointment to visit the site and provide an estimate. The job poster will be notified.
            </Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Location *</Text>
            <TextInput
              style={styles.input}
              placeholder="Site location for estimate"
              value={formData.location}
              onChangeText={(text) =>
                setFormData({ ...formData, location: text })
              }
              placeholderTextColor={Colors.textTertiary}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Date *</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={formData.date}
              onChangeText={(text) =>
                setFormData({ ...formData, date: text })
              }
              placeholderTextColor={Colors.textTertiary}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Time *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 10:00 AM"
              value={formData.time}
              onChangeText={(text) =>
                setFormData({ ...formData, time: text })
              }
              placeholderTextColor={Colors.textTertiary}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Notes (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Any specific details or questions..."
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
            disabled={submitting || !formData.location || !formData.date || !formData.time}
          >
            <Calendar size={20} color={Colors.white} />
            <Text style={styles.submitButtonText}>
              {submitting ? "Booking..." : "Book Appointment"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}

function InviteModal({
  visible,
  onClose,
  jobTitle,
  existingApplicants,
}: {
  visible: boolean;
  onClose: () => void;
  jobTitle: string;
  existingApplicants: string[];
}) {
  const { user } = useAuth();
  const { addNotification } = useJobs();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const availableUsers = TEST_USERS.filter(
    (u) =>
      u.id !== user?.id &&
      !existingApplicants.includes(u.id) &&
      (u.role === "Subcontractor" || u.role === "Trade Specialist") &&
      (searchQuery === "" ||
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.company.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const toggleUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSendInvites = async () => {
    if (selectedUsers.length === 0 || !user) return;

    setSending(true);
    try {
      for (const userId of selectedUsers) {
        const invitedUser = TEST_USERS.find((u) => u.id === userId);
        if (invitedUser) {
          await addNotification({
            id: `notif-${Date.now()}-${userId}`,
            userId: userId,
            jobId: "",
            type: "new_job",
            title: "Job Invitation",
            message: `${user.name} invited you to apply for ${jobTitle}`,
            read: false,
            createdAt: new Date().toISOString(),
            data: { invitedBy: user.name },
          });
        }
      }
      setSelectedUsers([]);
      setSearchQuery("");
      onClose();
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Invite Users to Apply</Text>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.inviteModalContent}>
          <View style={styles.inviteJobInfo}>
            <Text style={styles.inviteJobLabel}>For Job:</Text>
            <Text style={styles.inviteJobTitle}>{jobTitle}</Text>
          </View>

          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search contractors..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={Colors.textTertiary}
            />
          </View>

          {selectedUsers.length > 0 && (
            <View style={styles.selectedCount}>
              <Text style={styles.selectedCountText}>
                {selectedUsers.length} user{selectedUsers.length > 1 ? "s" : ""} selected
              </Text>
            </View>
          )}

          <ScrollView style={styles.usersList}>
            {availableUsers.length === 0 ? (
              <View style={styles.emptyInviteList}>
                <AlertCircle size={48} color={Colors.textTertiary} />
                <Text style={styles.emptyInviteText}>
                  {searchQuery
                    ? "No contractors found matching your search"
                    : "No available contractors to invite"}
                </Text>
              </View>
            ) : (
              availableUsers.map((inviteUser) => (
                <TouchableOpacity
                  key={inviteUser.id}
                  style={[
                    styles.userCard,
                    selectedUsers.includes(inviteUser.id) && styles.userCardSelected,
                  ]}
                  onPress={() => toggleUser(inviteUser.id)}
                >
                  <View style={styles.userCardInfo}>
                    <Text style={styles.userCardName}>{inviteUser.name}</Text>
                    <Text style={styles.userCardCompany}>{inviteUser.company}</Text>
                    <Text style={styles.userCardRole}>{inviteUser.role}</Text>
                  </View>
                  {selectedUsers.includes(inviteUser.id) && (
                    <CheckCircle size={24} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              ))
            )}
          </ScrollView>

          <TouchableOpacity
            style={[
              styles.sendInvitesButton,
              (sending || selectedUsers.length === 0) &&
                styles.sendInvitesButtonDisabled,
            ]}
            onPress={handleSendInvites}
            disabled={sending || selectedUsers.length === 0}
          >
            <Send size={20} color={Colors.white} />
            <Text style={styles.sendInvitesButtonText}>
              {sending
                ? "Sending..."
                : `Send ${selectedUsers.length > 0 ? selectedUsers.length : ""} Invite${selectedUsers.length !== 1 ? "s" : ""}`}
            </Text>
          </TouchableOpacity>
        </View>
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.text,
    marginRight: 12,
  },
  urgencyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  urgencyText: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: Colors.white,
  },
  company: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  postedBy: {
    fontSize: 14,
    color: Colors.textTertiary,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 16,
    gap: 12,
  },
  detailCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
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
    marginBottom: 12,
  },
  budget: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.primary,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: Colors.textSecondary,
  },
  requirementItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  requirementBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginTop: 7,
    marginRight: 12,
  },
  requirementText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 24,
    color: Colors.text,
  },
  applicationCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  applicantHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  applicantInfo: {
    flex: 1,
    gap: 6,
  },
  applicantRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  applicantName: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  applicantDetail: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: Colors.white,
  },
  coverLetterLabel: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  coverLetterText: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.text,
    marginBottom: 12,
  },
  proposedRateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  proposedRateText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
  applicationMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  applicationDate: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  availableFrom: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  applicationActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  acceptButton: {
    backgroundColor: Colors.success,
  },
  rejectButton: {
    backgroundColor: Colors.error,
  },
  messageButton: {
    backgroundColor: Colors.primary,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    padding: 16,
  },
  applyButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.white,
  },
  appliedSection: {
    gap: 12,
  },
  appliedBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
  },
  appliedText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.success,
  },
  requestEstimateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
  },
  requestEstimateText: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.white,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  messageModalContent: {
    flex: 1,
    padding: 16,
    justifyContent: "space-between",
  },
  formGroup: {
    marginBottom: 20,
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
  messageTextArea: {
    minHeight: 200,
    paddingTop: 12,
  },
  estimateJobInfo: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  estimateJobLabel: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginBottom: 4,
  },
  estimateJobTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.white,
  },
  headerActions: {
    flexDirection: "row" as const,
    gap: 8,
    marginRight: 8,
  },
  headerButton: {
    padding: 8,
  },
  tabBar: {
    flexDirection: "row" as const,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center" as const,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.primary,
    fontWeight: "700" as const,
  },
  postedDate: {
    fontSize: 13,
    color: Colors.textTertiary,
    marginTop: 4,
  },
  actionsRow: {
    flexDirection: "row" as const,
    gap: 12,
  },
  actionCard: {
    flex: 1,
    alignItems: "center" as const,
    padding: 20,
    borderRadius: 12,
    gap: 8,
  },
  actionCardText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.white,
  },
  actionCardCount: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.white,
  },
  applicantsContainer: {
    padding: 16,
  },
  emptyApplicants: {
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingVertical: 60,
    gap: 16,
  },
  emptyApplicantsTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  emptyApplicantsText: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center" as const,
    maxWidth: 280,
  },
  inviteButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  inviteButtonText: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.white,
  },
  applicantsList: {
    gap: 12,
  },
  applicantsHeader: {
    marginBottom: 20,
  },
  applicantsTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 16,
  },
  statusCounts: {
    flexDirection: "row" as const,
    gap: 16,
    flexWrap: "wrap" as const,
  },
  statusCount: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusCountText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: "600" as const,
  },
  inviteModalContent: {
    flex: 1,
    padding: 16,
  },
  inviteJobInfo: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inviteJobLabel: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginBottom: 4,
  },
  inviteJobTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedCount: {
    backgroundColor: Colors.primary + "20",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  selectedCountText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.primary,
    textAlign: "center" as const,
  },
  usersList: {
    flex: 1,
    marginBottom: 16,
  },
  emptyInviteList: {
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingVertical: 60,
    gap: 16,
  },
  emptyInviteText: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center" as const,
    maxWidth: 280,
  },
  userCard: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  userCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + "10",
  },
  userCardInfo: {
    flex: 1,
    gap: 4,
  },
  userCardName: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  userCardCompany: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  userCardRole: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  sendInvitesButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
  },
  sendInvitesButtonDisabled: {
    opacity: 0.5,
  },
  sendInvitesButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.white,
  },
  bookAppointmentCard: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: Colors.primary + "10",
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: Colors.primary + "30",
    gap: 16,
  },
  bookAppointmentContent: {
    flex: 1,
  },
  bookAppointmentTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  bookAppointmentText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  footerRow: {
    flexDirection: "row" as const,
    gap: 12,
  },
  bookAppointmentButtonFooter: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 8,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
  },
  bookAppointmentButtonText: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.primary,
  },
  infoCard: {
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
    gap: 12,
    backgroundColor: Colors.primary + "10",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.primary + "30",
  },
  infoCardText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  estimateJobSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
});
