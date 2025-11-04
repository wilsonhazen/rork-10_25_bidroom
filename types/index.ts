export type UserRole = 
  | "Admin"
  | "GC"
  | "Subcontractor"
  | "Trade Specialist"
  | "Project Manager"
  | "Viewer";

export type VerificationType = "identity" | "license" | "insurance" | "background" | "references" | "payment";

export interface Verification {
  type: VerificationType;
  verified: boolean;
  verifiedAt?: string;
  expiresAt?: string;
  documentUrl?: string;
}

export interface TrustIndicators {
  responseTime: number;
  responseRate: number;
  onTimeRate: number;
  repeatClientRate: number;
  disputeRate: number;
}

export interface PortfolioItem {
  id: string;
  projectName: string;
  description: string;
  location: string;
  completedDate: string;
  images: string[];
  budget?: string;
  category: string;
}

export interface Review {
  id: string;
  authorId: string;
  authorName: string;
  authorCompany: string;
  rating: number;
  date: string;
  projectType: string;
  comment: string;
  helpful: number;
  response?: {
    message: string;
    date: string;
  };
}

export interface Endorsement {
  id: string;
  fromId: string;
  fromName: string;
  fromCompany: string;
  skill: string;
  relationship: "client" | "colleague" | "supervisor" | "subcontractor";
  comment: string;
  date: string;
}

export interface Certification {
  id: string;
  name: string;
  issuingOrganization: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  verificationUrl?: string;
}

export interface Award {
  id: string;
  title: string;
  organization: string;
  year: string;
  description: string;
}

export interface ExperienceEntry {
  id: string;
  year: string;
  title: string;
  description: string;
  type: "milestone" | "project" | "certification" | "award";
}

export interface BeforeAfter {
  id: string;
  projectName: string;
  beforeImage: string;
  afterImage: string;
  description: string;
  completionDate: string;
  category: string;
}

export interface Contractor {
  id: string;
  name: string;
  company: string;
  trade: string;
  location: string;
  rating: number;
  reviewCount: number;
  avatar?: string | null;
  phone: string;
  email: string;
  verified: boolean;
  completedProjects: number;
  verifications?: Verification[];
  trustIndicators?: TrustIndicators;
  yearsInBusiness?: number;
  insuranceAmount?: string;
  licenseNumber?: string;
  specialties?: string[];
  portfolio?: PortfolioItem[];
  reviews?: Review[];
  endorsements?: Endorsement[];
  certifications?: Certification[];
  awards?: Award[];
  experienceTimeline?: ExperienceEntry[];
  beforeAfterProjects?: BeforeAfter[];
  featured?: boolean;
  topRated?: boolean;
  availability?: {
    calendar: { date: string; available: boolean }[];
    nextAvailable?: string;
  };
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export type BidStatus = "pending" | "submitted" | "awarded" | "declined";

export interface Bid {
  id: string;
  projectName: string;
  description: string;
  dueDate: string;
  status: BidStatus;
  budget?: string;
  contractorCount: number;
  submittedCount: number;
  createdAt: string;
}

export interface BidSubmission {
  id: string;
  bidId: string;
  contractorId: string;
  contractorName: string;
  contractorCompany: string;
  amount: number;
  notes: string;
  submittedAt: string;
  documents: string[];
}

export interface Appointment {
  id: string;
  title: string;
  contractorId?: string;
  contractorName: string;
  contractorCompany: string;
  date: string;
  time: string;
  type: "estimate" | "site_visit" | "meeting";
  location: string;
  status: "scheduled" | "completed" | "cancelled" | "no_show";
  notes?: string;
  jobId?: string;
  applicationId?: string;
  createdBy: string;
  createdByName: string;
  requestedBy?: string;
  confirmedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type JobStatus = "open" | "in_progress" | "completed" | "cancelled";
export type ApplicationStatus = "pending" | "accepted" | "rejected" | "withdrawn";
export type JobUrgency = "low" | "medium" | "high" | "urgent";

export interface Job {
  id: string;
  title: string;
  description: string;
  trade: string;
  location: string;
  startDate: string;
  endDate?: string;
  budget?: string;
  payRate?: string;
  status: JobStatus;
  urgency: JobUrgency;
  postedBy: string;
  postedByName: string;
  postedByCompany: string;
  createdAt: string;
  updatedAt: string;
  requirements: string[];
  applicationsCount: number;
}

export interface JobApplication {
  id: string;
  jobId: string;
  applicantId: string;
  applicantName: string;
  applicantCompany: string;
  applicantRole: UserRole;
  applicantPhone: string;
  applicantEmail: string;
  coverLetter: string;
  proposedRate?: string;
  availableFrom: string;
  status: ApplicationStatus;
  appliedAt: string;
  respondedAt?: string;
  responseNote?: string;
}

export interface JobMessage {
  id: string;
  jobId: string;
  applicationId?: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  message: string;
  sentAt: string;
  read: boolean;
  attachments?: MessageAttachment[];
  quoteId?: string;
  templateId?: string;
}

export interface MessageAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  category: "greeting" | "quote" | "followup" | "availability" | "custom";
  userId: string;
}

export interface Quote {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  jobId?: string;
  title: string;
  description: string;
  lineItems: QuoteLineItem[];
  subtotal: number;
  tax: number;
  total: number;
  validUntil: string;
  status: "draft" | "sent" | "viewed" | "accepted" | "rejected" | "expired";
  createdAt: string;
  updatedAt: string;
}

export interface QuoteLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface JobNotification {
  id: string;
  userId: string;
  jobId: string;
  applicationId?: string;
  appointmentId?: string;
  type: "new_job" | "new_application" | "application_accepted" | "application_rejected" | "new_message" | "job_updated" | "job_cancelled" | "estimate_requested" | "estimate_confirmed" | "estimate_reminder" | "estimate_completed";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: any;
}

export interface EstimateRequest {
  id: string;
  jobId: string;
  applicationId: string;
  requestedBy: string;
  requestedByName: string;
  requestedFrom: string;
  requestedFromName: string;
  preferredDate?: string;
  preferredTime?: string;
  location: string;
  description: string;
  status: "pending" | "confirmed" | "completed" | "cancelled" | "no_show";
  appointmentId?: string;
  createdAt: string;
  updatedAt: string;
}

export type ProjectStatus = "setup" | "active" | "on_hold" | "completed" | "cancelled";
export type MilestoneStatus = "not_started" | "in_progress" | "pending_review" | "approved" | "needs_revision" | "rejected";
export type PaymentType = "deposit" | "milestone" | "final" | "retainage" | "change_order";
export type PaymentStatus = "pending" | "processing" | "completed" | "failed" | "refunded";
export type DisputeType = "payment" | "quality" | "scope" | "timeline" | "damage" | "safety" | "contract";
export type DisputeStatus = "filed" | "under_review" | "in_mediation" | "resolved" | "closed";
export type ChangeOrderStatus = "pending" | "approved" | "rejected" | "implemented";

export interface Project {
  id: string;
  bidId: string;
  jobId?: string;
  ownerId: string;
  ownerName: string;
  contractorId: string;
  contractorName: string;
  title: string;
  description: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  totalAmount: number;
  paidAmount: number;
  escrowBalance: number;
  completionPercentage: number;
  createdAt: string;
  updatedAt: string;
}

export interface ScopeOfWork {
  id: string;
  projectId: string;
  version: number;
  workBreakdown: {
    phases: {
      name: string;
      tasks: string[];
      timeline: string;
      dependencies?: string[];
    }[];
  };
  materials: {
    items: {
      name: string;
      specifications: string;
      quantity?: string;
      supplier: "owner" | "contractor";
    }[];
  };
  requirements: {
    codes: string[];
    permits: string[];
    inspections: string[];
    qualityStandards: string[];
  };
  exclusions: string[];
  approvedByOwner: boolean;
  approvedByContractor: boolean;
  ownerSignature?: string;
  contractorSignature?: string;
  ownerSignedAt?: string;
  contractorSignedAt?: string;
  createdAt: string;
}

export interface ProjectContract {
  id: string;
  projectId: string;
  scopeId?: string;
  contractType: string;
  terms: {
    paymentSchedule: PaymentScheduleItem[];
    timeline: string;
    warranty: string;
    liability: string;
    insurance: string;
  };
  paymentSchedule: PaymentScheduleItem[];
  warrantyTerms: any;
  disputeResolution: any;
  insuranceRequirements: any;
  ownerSigned: boolean;
  contractorSigned: boolean;
  ownerSignature?: string;
  contractorSignature?: string;
  ownerSignedAt?: string;
  contractorSignedAt?: string;
  fullyExecutedAt?: string;
  createdAt: string;
}

export interface PaymentScheduleItem {
  milestone: string;
  percentage: number;
  amount: number;
  dueDate?: string;
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  dueDate: string;
  paymentAmount: number;
  deliverables: string[];
  acceptanceCriteria: string[];
  status: MilestoneStatus;
  orderNumber: number;
  dependsOn?: string;
  submittedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
  revisionCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProgressUpdate {
  id: string;
  projectId: string;
  milestoneId?: string;
  contractorId: string;
  contractorName: string;
  updateType: "daily" | "weekly" | "milestone";
  workCompleted: string;
  workPlanned: string;
  issues?: string;
  hoursWorked?: number;
  crewMembers?: number;
  photos: string[];
  videos?: string[];
  createdAt: string;
}

export interface ProjectPayment {
  id: string;
  projectId: string;
  milestoneId?: string;
  paymentType: PaymentType;
  amount: number;
  status: PaymentStatus;
  paymentMethod?: string;
  transactionId?: string;
  paidBy?: string;
  paidTo?: string;
  escrowHeld: boolean;
  releasedAt?: string;
  invoiceUrl?: string;
  receiptUrl?: string;
  createdAt: string;
}

export interface ChangeOrder {
  id: string;
  projectId: string;
  scopeId?: string;
  requestedBy: string;
  requestedByName: string;
  title: string;
  description: string;
  reason: string;
  costImpact: number;
  timelineImpact: number;
  documentation: any;
  status: ChangeOrderStatus;
  approvedByOwner: boolean;
  approvedByContractor: boolean;
  ownerSignature?: string;
  contractorSignature?: string;
  createdAt: string;
  approvedAt?: string;
}

export interface Dispute {
  id: string;
  projectId: string;
  milestoneId?: string;
  filedBy: string;
  filedByName: string;
  disputeType: DisputeType;
  description: string;
  evidence: {
    photos: string[];
    documents: string[];
    messages: string[];
  };
  amountDisputed?: number;
  desiredResolution: string;
  status: DisputeStatus;
  resolutionStage: "internal" | "platform" | "professional" | "legal";
  adminAssigned?: string;
  resolution?: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface MilestoneApproval {
  id: string;
  milestoneId: string;
  reviewerId: string;
  reviewerName: string;
  decision: "approved" | "needs_revision" | "rejected";
  comments: string;
  issuesFound: string[];
  photos: string[];
  reviewedAt: string;
}

export interface ProjectDocument {
  id: string;
  projectId: string;
  documentType: "contract" | "scope" | "invoice" | "receipt" | "warranty" | "permit" | "inspection" | "other";
  title: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  uploadedByName: string;
  milestoneId?: string;
  createdAt: string;
}

export interface PunchListItem {
  id: string;
  projectId: string;
  description: string;
  location: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "in_progress" | "completed";
  assignedTo?: string;
  photos: string[];
  completedAt?: string;
  createdAt: string;
}

export interface SavedContractor {
  id: string;
  userId: string;
  contractorId: string;
  savedAt: string;
  notes?: string;
}

export interface ContractorReport {
  id: string;
  reportedBy: string;
  reportedByName: string;
  contractorId: string;
  reason: "inappropriate" | "scam" | "fake_profile" | "harassment" | "other";
  description: string;
  evidence?: string[];
  status: "pending" | "under_review" | "resolved" | "dismissed";
  createdAt: string;
}

export interface VideoConsultation {
  id: string;
  requestedBy: string;
  requestedByName: string;
  contractorId: string;
  contractorName: string;
  scheduledDate: string;
  scheduledTime: string;
  duration: number;
  topic: string;
  notes?: string;
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show";
  meetingUrl?: string;
  createdAt: string;
  updatedAt: string;
}
