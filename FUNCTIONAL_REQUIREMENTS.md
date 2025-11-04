# Bidroom Construction Platform - Functional Requirements

## Table of Contents
1. [Project Overview](#project-overview)
2. [User Roles & Permissions](#user-roles--permissions)
3. [Core Features](#core-features)
4. [Workflows](#workflows)
5. [Admin Dashboard Requirements](#admin-dashboard-requirements)
6. [Future Enhancements](#future-enhancements)

---

## 1. Project Overview

### About Bidroom
Bidroom is a construction job and contractor management mobile application that connects job posters (Project Managers) with contractors (General Contractors, Subcontractors, and Trade Specialists) for construction projects.

### Current State
The app includes comprehensive construction management features with mock data and is under active development for iOS, Android, and Web platforms. Core features including role-based dashboards, AI-powered contract generation, project management workflows, enhanced contractor profiles, social proof features, advanced search, messaging enhancements, analytics tools, trust & safety features, and marketing tools are implemented.

**Recently Implemented:**
- Verification badges, reviews, and portfolio galleries
- Social proof enhancements (endorsements, certifications, experience timeline, before/after)
- Contractor discovery with advanced filtering and map view
- Save/favorite contractors, share profiles, report content
- Video consultation requests
- Enhanced messaging (real-time chat, file sharing, quote history, templates)
- Analytics dashboard for contractors
- Dispute resolution workflow
- Escrow payment system
- Promotional badges and contractor comparison
- Referral program functionality

### Platforms
- **Mobile**: iOS and Android (React Native)
- **Web**: Progressive Web App
- **Admin**: Web-based dashboard (to be developed)

---

## 2. User Roles & Permissions

### Role Types
1. **Admin** - Full system access and platform management
2. **General Contractor (GC)** - Can create bids, invite contractors, manage projects
3. **Project Manager (PM)** - Can post jobs, manage applications, schedule appointments
4. **Subcontractor** - Can apply to jobs, receive invites, submit bids
5. **Trade Specialist** - Can apply to jobs, showcase portfolio
6. **Viewer** - Read-only access for stakeholders

### Permissions Matrix
| Permission | Admin | GC | PM | Sub | Trade | Viewer |
|-----------|-------|----|----|-----|-------|--------|
| Manage Users | ✓ | - | - | - | - | - |
| Create Bids | ✓ | ✓ | ✓ | - | - | - |
| Post Jobs | ✓ | - | ✓ | - | - | - |
| Apply to Jobs | - | - | - | ✓ | ✓ | - |
| Manage Applications | ✓ | - | ✓ | - | - | - |
| View Reports | ✓ | ✓ | ✓ | - | - | ✓ |
| Schedule Appointments | ✓ | ✓ | ✓ | - | - | - |

---

## 3. Core Features

### 3.1 Authentication System
**User Access:**
- Email/password registration and login
- Social authentication (Google, Apple, Facebook)
- Role selection during registration
- Session persistence
- Password reset functionality
- Account verification via email

**Security:**
- Secure token storage
- JWT authentication with refresh tokens
- Role-based access control
- Two-factor authentication (optional)

---

### 3.2 Jobs & Gigs Management

#### Job Posting (PM/Admin only)
- Create detailed job postings with:
  - Title and description
  - Trade type and specialization
  - Location and service area
  - Start and end dates
  - Budget range (optional)
  - Pay rate (hourly/fixed)
  - Urgency level (low/medium/high/urgent)
  - Requirements list
  - Project images and documents

#### Job Discovery (All Contractors)
- Browse all open jobs
- Search by:
  - Keywords (title, description)
  - Location
  - Trade type
  - Budget range
- Filter by:
  - Trade specialization
  - Urgency level
  - Date posted
  - Status
- View job details including:
  - Full description and requirements
  - Project manager information
  - Application count
  - Company details

#### Job Applications
- Submit application with:
  - Cover letter
  - Proposed rate
  - Available start date
  - Portfolio attachments
- Track application status:
  - Pending
  - Reviewed
  - Accepted
  - Rejected
  - Withdrawn
- Receive notifications on status changes
- Message job posters directly

#### Application Management (PM)
- View all applicants for posted jobs
- Review applicant profiles and credentials
- Accept or reject applications with notes
- Message applicants
- Schedule interviews/estimates
- Track hiring pipeline

---

### 3.3 Contractor Directory

#### Browse Contractors (PM/GC)
- Search by:
  - Name, company name
  - Trade specialization
  - Location
  - Keywords
- Filter by:
  - Trade type
  - Verification status
  - Rating range
  - Completed projects count
- View contractor cards with:
  - Profile photo
  - Company name
  - Trade specialization
  - Rating and review count
  - Verification badge
  - Location

#### Contractor Profile Page
Comprehensive contractor profile view accessible to project managers and owners.

**Header Section:**
- Profile photo or company logo
- Company name
- Primary trade specialization
- Location and service area
- Verification badges (licensed, insured, background checked)
- Overall rating (stars) and review count
- Years in business
- Quick actions (Message, Request Estimate, Invite to Job)

**About Section:**
- Company description/bio
- Mission statement
- Specializations and services offered
- Service area map

**Professional Details:**
- License information:
  - License number(s)
  - License type
  - Expiration date
  - Verification status
- Insurance information:
  - Liability insurance
  - Workers compensation
  - Coverage amounts
  - Verification status
- Certifications:
  - Professional certifications
  - Training credentials
  - Industry affiliations
- Bonding information (if applicable)

**Experience & Credentials:**
- Years of experience
- Completed projects count
- Specializations (detailed list)
- Types of projects (residential, commercial, etc.)
- Team size

**Portfolio:**
- Project photo gallery
- Before/after comparisons
- Project descriptions
- Video walkthroughs (if available)
- Featured projects
- Filter by project type

**Reviews & Ratings:**
- Overall rating breakdown
- Category ratings:
  - Quality of work
  - Communication
  - Timeline adherence
  - Professionalism
  - Value for money
- Recent reviews with:
  - Reviewer name and date
  - Star rating
  - Written review
  - Project photos (if included)
  - Contractor response (if any)
- Filter reviews (all, positive, critical)
- Sort reviews (recent, highest, lowest)

**Trust & Verification:**
- Trust score indicators
- Verification status:
  - Identity verified
  - License verified
  - Insurance verified
  - Background check completed
- Response metrics:
  - Typical response time
  - Response rate
- Performance metrics:
  - Project completion rate
  - On-time completion rate
  - Repeat customer rate

**Pricing & Availability:**
- Hourly rate range (if disclosed)
- Typical project rates
- Current availability
- Booking lead time

**Contact & Actions:**
- Contact information (phone, email, website)
- Business address
- Action buttons:
  - Request Estimate
  - Send Message
  - Invite to Job
  - Invite to Bid
  - Save to Favorites
  - Share Profile
  - Report Profile

**Recent Activity:**
- Recently completed projects
- Recent reviews received
- Platform member since date
- Last active date

#### Request Estimates
- Submit estimate request with:
  - Project name
  - Project location
  - Description of work
  - Preferred date and time
  - Budget expectations
- Track request status
- Receive confirmation
- Schedule estimate appointments

---

### 3.4 Bids Management

#### Bid Creation (GC/PM)
- Create bid requests (RFPs) with:
  - Project title and description
  - Trade requirements
  - Budget range
  - Project timeline
  - Submission deadline
  - Required documentation
  - Invited contractors list

#### Bid Discovery (Contractors)
- View open bid opportunities
- Filter by:
  - Status (open/closed/awarded)
  - Trade type
  - Budget range
  - Deadline
- View bid details:
  - Project requirements
  - Budget information
  - Submission deadline
  - Number of submissions

#### Bid Submissions
- Submit proposal with:
  - Bid amount
  - Timeline estimate
  - Detailed proposal/notes
  - Supporting documents
- Track submission status
- Edit before deadline
- Withdraw submission

#### Bid Management (GC/PM)
- Review all submissions
- Compare bids side-by-side
- View contractor details
- Accept or decline bids
- Award contracts
- Message bidders

---

### 3.5 Appointments & Scheduling

#### Appointment Types
- **Estimates**: Initial project assessment
- **Site Visits**: In-person evaluation
- **Meetings**: Consultations and discussions
- **Inspections**: Progress checks

#### Create Appointments
- Set date and time
- Add location
- Link to jobs or applications
- Assign participants
- Add notes and agenda
- Send invitations

#### Schedule Management
- Calendar view of all appointments
- Filter by:
  - Status (scheduled/confirmed/completed/cancelled)
  - Date range
  - Appointment type
  - Participant
- Group appointments by date
- Quick status updates:
  - Mark as completed
  - Mark as no-show
  - Cancel appointment
  - Reschedule

#### Estimate Request Workflow
1. Contractor requests estimate from job listing
2. PM receives notification
3. PM confirms and schedules appointment
4. Both parties receive confirmation
5. Appointment added to calendars
6. Reminders sent before appointment
7. Status updated after completion

---

### 3.6 Messaging System

#### Conversations
- One-on-one messaging between users
- Job-related conversations
- Application discussions
- Bid negotiations
- Support inquiries

#### Message Features
- Send text messages
- Attach images (future)
- Attach documents (future)
- Read receipts
- Message status (sent/delivered/read)
- Real-time updates
- Push notifications for new messages

#### Conversation Management
- View all conversations
- Search conversations
- Unread message count
- Filter by read/unread
- Archive conversations
- Delete conversations

---

### 3.7 Notifications

#### Notification Types
- **Jobs**: New jobs posted, job updates, job cancelled
- **Applications**: New application received, application status changed
- **Bids**: New bid opportunity, bid awarded, bid declined
- **Appointments**: Appointment scheduled, reminder, completed
- **Messages**: New message received
- **System**: Account updates, verification status, announcements

#### Notification Management
- View all notifications
- Filter by:
  - Read/unread status
  - Notification type
  - Date range
- Mark as read
- Mark all as read
- Delete notifications
- Notification preferences

#### Notification Delivery
- In-app notifications
- Push notifications (mobile)
- Email notifications (optional)
- SMS notifications (optional)

---

### 3.8 User Profile & Settings

#### Profile Information
- Personal details:
  - Name
  - Email
  - Phone number
  - Profile photo
- Company information:
  - Company name
  - Company logo
  - Business address
- Professional details:
  - Role
  - Trade specializations
  - Years of experience
  - Certifications
  - License numbers
  - Insurance information

#### Portfolio (Contractors)
- Upload project photos
- Upload project videos (future)
- Project descriptions
- Before/after comparisons
- Client testimonials

#### Account Settings
- Change password
- Update email
- Notification preferences
- Privacy settings
- Language preferences
- Delete account
- Two-factor authentication
- Data export and deletion (GDPR)

#### Profile Actions
- View profile as others see it
- Share profile link
- Download profile information
- Request verification
- Update verification documents
- Edit profile information

#### Settings Pages
- **General Settings**: Account preferences, notifications
- **Privacy & Security**: Data privacy, security settings, account access
- **Help & Support**: FAQs, contact support, tutorials
- **Terms & Policies**: Terms of Service, Privacy Policy, legal agreements

---

### 3.9 Reviews & Ratings

#### Leave Reviews
- Rate on 1-5 star scale
- Write detailed review
- Add project photos
- Categories:
  - Quality of work
  - Communication
  - Timeline adherence
  - Professionalism
  - Value for money

#### View Reviews
- See all reviews received
- View reviews given
- Filter by rating
- Sort by date
- Respond to reviews

#### Review Verification
- Only verified project participants can review
- One review per project
- Reviews linked to completed jobs
- Admin moderation for inappropriate content

---

## 4. Workflows

### 4.1 Job Posting & Application Flow
1. PM creates job posting with requirements
2. Job appears in open listings
3. Contractors browse and search jobs
4. Contractor views job details
5. Contractor submits application with cover letter and rate
6. PM receives notification
7. PM reviews application and contractor profile
8. PM accepts or rejects application with optional message
9. Contractor receives notification of decision
10. If accepted, PM can schedule estimate or meeting
11. Ongoing communication via messaging

### 4.2 Estimate Request Flow
1. Contractor finds job posting or browses contractor directory
2. Clicks "Request Estimate" or "Book Estimate"
3. Fills out estimate request form:
   - Project description
   - Location
   - Preferred date/time
   - Budget expectations
4. Request submitted to PM/GC
5. PM receives notification and reviews request
6. PM confirms estimate and sets appointment details
7. Both parties receive appointment confirmation
8. Appointment added to both calendars
9. Reminders sent before appointment
10. After appointment, status updated to completed
11. PM can leave notes and follow-up

### 4.3 Contractor Invitation Flow
1. PM posts a job
2. PM opens job details
3. PM clicks "Invite Contractors"
4. PM searches contractor directory by:
   - Trade specialization
   - Location
   - Rating
   - Verification status
5. PM selects contractors to invite
6. PM sends personalized invitation message
7. Selected contractors receive notifications
8. Contractors can view job and apply directly
9. Tracking of invitations sent and responses

### 4.4 Bid Submission Flow
1. GC/PM creates bid request (RFP)
2. Invites specific contractors or posts publicly
3. Contractors receive notifications
4. Contractors review bid requirements
5. Contractors prepare and submit proposals:
   - Bid amount
   - Timeline
   - Detailed proposal
   - Supporting documents
6. GC reviews all submissions
7. GC compares bids and contractor qualifications
8. GC selects winning bid
9. Award notification sent to winner
10. Declined notifications sent to others
11. Contract negotiation begins with winner

---

## 5. Admin Dashboard Requirements

### 5.1 User Management
- View all registered users with filters
- Search users by name, email, company
- View detailed user profiles
- Edit user information
- Change user roles
- Suspend/ban users
- Reactivate accounts
- Delete accounts
- Reset passwords
- Send direct messages
- Impersonate users for support

### 5.2 Verification Management
- Review verification requests:
  - Identity verification
  - License verification
  - Insurance verification
  - Background checks
- View uploaded documents
- Approve or reject requests
- Request additional documentation
- Set expiration dates
- Track verification history
- Send status notifications

### 5.3 Trust Score Management
- View trust indicators:
  - Response time
  - Response rate
  - Completion rate
  - Repeat client rate
  - Dispute rate
- Manual trust score adjustments
- View calculation history
- Flag accounts for review

### 5.4 Job Management
- View all jobs with advanced filters
- Edit job details
- Change job status
- Close or reopen jobs
- Flag inappropriate listings
- Delete jobs
- View job applications
- Override application decisions
- Job analytics and reporting

### 5.5 Bid Management
- View all bids and proposals
- Edit bid information
- Extend deadlines
- Cancel bids
- Flag suspicious bids
- View submissions
- Compare bids
- Generate reports
- Bid analytics

### 5.6 Appointment Management
- Calendar view of all appointments
- Edit appointment details
- Reschedule appointments
- Cancel appointments
- Mark status (completed/no-show)
- Appointment analytics
- No-show tracking

### 5.7 Messaging & Communication
- View all platform messages
- Message moderation
- Delete inappropriate content
- Warn/suspend users for violations
- Export message threads
- Send system notifications
- Create announcements
- Notification campaigns

### 5.8 Review & Rating Management
- View all reviews
- Flag inappropriate reviews
- Hide/remove reviews
- Respond to disputes
- Verify review authenticity
- Rating analytics

### 5.9 Financial Management
- View all transactions
- Payment method management
- Issue refunds
- Track failed payments
- Revenue analytics
- Financial reporting

### 5.10 Content Management
- Edit platform content pages:
  - Terms of Service
  - Privacy Policy
  - Help/FAQ
  - About Us
- Manage trade categories
- Location management
- Resource library

### 5.11 Analytics & Reporting
- Dashboard with key metrics:
  - Total users by role
  - Active users (DAU/MAU)
  - Jobs posted/filled
  - Bids posted/awarded
  - Revenue metrics
- User analytics
- Platform activity tracking
- Custom reports
- Data exports

### 5.12 System Administration
- Platform settings
- Email configuration
- Push notification settings
- API management
- Security settings
- Feature flags
- Maintenance mode

### 5.13 Support & Moderation
- Support ticket system
- Dispute resolution
- Reported content review
- Platform announcements
- User warnings and bans

### 5.14 Audit & Compliance
- Activity logs
- GDPR compliance tools
- Data export/deletion
- Backup management
- Compliance reporting

### 5.15 Marketing & Growth
- Email campaigns
- Promotional codes
- SEO management
- Analytics integration
- Referral programs

---

## 6. Construction Management System

### 6.1 Construction Management Workflow
When a bid is accepted, Bidroom transforms into a comprehensive construction management platform that automates the entire project lifecycle from contract generation to final closeout.

#### Complete Workflow Overview
1. **Project Setup** - AI-assisted contract generation with owner notes and California contractor law provisions
2. **Contract Setup** - Digital signing, legal protections, escrow initialization
3. **Team Assembly** - Sub-bidding, contractor selection, role assignments
4. **Active Construction** - Auto-timeline, daily check-ins, AI monitoring, milestone-based payments
5. **Dispute Resolution** - Chat logging, clause flagging, legal escalation
6. **Project Closeout** - Final inspection, media archiving, analytics

---

### 6.1.1 Detailed Workflow Stages

#### Stage 0: Project Setup (New)
**What Happens:**
- Owner initiates project setup from accepted bid
- System presents project information form:
  - Project details (name, location, dates)
  - Owner can add detailed notes about:
    - Specific requirements or preferences
    - Special considerations
    - Key concerns or priorities
    - Any unique project aspects
- AI analyzes:
  - Accepted bid details
  - Owner's notes
  - Project location (California)
  - Trade type and scope
- AI generates comprehensive contract draft including:
  - Full scope of work breakdown
  - California-specific contractor law provisions:
    - California Contractors State License Law (CSLB)
    - Mechanic's lien rights and waivers
    - Required licensing and permits
    - Payment bond requirements (if applicable)
    - Change order regulations
    - California construction defect law protections
    - Mandatory insurance requirements
    - Right to rescission (if applicable)
    - Dispute resolution per California law
  - Owner protections:
    - Lien release requirements
    - Performance guarantees
    - Warranty provisions
    - Payment milestone protections
  - Contractor protections:
    - Payment terms and timelines
    - Scope change procedures
    - Suspension rights for non-payment
- Contract is fully editable before acceptance
- Owner can review, modify, and request legal review

**User Actions:**
- Owner: Provide project notes to help AI generate appropriate contract
- System: Generate contract with California law provisions and owner/contractor protections
- Owner: Review, edit, and approve contract draft
- Contractor: Review contract before signing

#### Stage 1: Contract Setup & Escrow
**What Happens:**
- Owner receives AI-generated contract with California provisions
- Owner reviews and digitally signs
- System establishes escrow account
- Full project funds deposited to third-party escrow
- Contractor notified of contract execution
- Contractor reviews and digitally signs
- Work authorization issued

**User Actions:**
- Owner: Review AI-generated contract, request modifications, digitally sign
- Contractor: Review final contract, digitally sign to proceed
- System: Auto-populate contract templates, manage signatures, initialize escrow

#### Stage 2: Team Assembly
**What Happens:**
- Project setup creates sub-contractor bid opportunities
- System posts opportunities for specialized trades
- Subs and contractors submit bids with:
  - Proposed pricing
  - Timeline commitments
  - Qualifications and portfolio
- Owner reviews all submissions
- Owner selects contractors for each trade
- App assigns role-based dashboard access:
  - Owner: Full oversight, approval rights
  - General Contractor: Project coordination, all trades visibility
  - Subcontractors: Task-specific access
  - Viewers: Read-only stakeholder access
- Notifications sent to selected contractors
- Individual contracts generated for each sub

**User Actions:**
- General Contractor: Post sub-bid opportunities, review submissions
- Subcontractors: Submit bids, upload credentials
- Owner: Review and approve contractor selections
- System: Create role-based access, generate sub-contracts

#### Stage 3: Active Construction
**What Happens:**
- **Timeline Generation**:
  - AI creates auto-generated project timeline
  - Breaks down into phases and milestones
  - Sets dependencies between tasks
  - Calculates critical path
  - Assigns payment amounts to milestones

- **Daily Check-ins**:
  - Contractors required to post daily updates:
    - Photos of work completed (auto time/GPS stamped)
    - Videos of progress walkthroughs
    - Work notes and crew information
    - Hours logged
    - Materials used
    - Issues or delays encountered
  - Updates visible to owner in real-time
  - Timeline automatically updated based on progress

- **AI Monitoring**:
  - Scans uploaded media for:
    - Work quality issues
    - Safety violations
    - Missing required uploads
    - Timeline delays
    - Budget variances
  - Generates alerts when issues detected:
    - "No update posted in 24 hours"
    - "Milestone overdue by 3 days"
    - "Required inspection not scheduled"
  - Sends fix-it notifications to responsible parties
  - Escalates critical issues to owner

- **Milestone Verification & Payment**:
  - Contractor marks milestone as complete
  - Uploads proof:
    - Before/during/after photos
    - Video walkthrough
    - Material receipts
    - Inspection reports (if required)
  - Milestone enters "Pending Review" status
  - Owner receives notification (email + push)
  - Owner has 3-5 days to respond (configurable)
  - **AI Verification** (optional):
    - AI analyzes photos for completion
    - Compares against scope requirements
    - Flags potential issues for owner review
  - **Owner Verification**:
    - Reviews all documentation
    - Can schedule in-person inspection
    - Decision options:
      - **Approve**: Payment automatically released from escrow
      - **Request Revision**: Lists specific issues to fix
      - **Reject**: Detailed explanation triggers review process
  - Payment released: 20-30% tranche transferred to contractor
  - Contractor receives payment notification
  - Next milestone unlocked

**User Actions:**
- Contractor: Post daily updates, mark milestones complete, upload proof
- Owner: Review progress, approve/reject milestones, schedule inspections
- System: Monitor quality, send alerts, process payments, update timeline

#### Stage 4: Dispute Management
**What Happens:**
- **Dispute Triggers**:
  - Owner rejects milestone multiple times
  - Payment delay beyond agreed terms
  - Scope disagreement
  - Quality concerns
  - Timeline disputes
  - Either party files formal dispute

- **Dispute Process**:
  - System logs all relevant communications:
    - Messages between parties
    - Contract clauses referenced
    - Photos/videos as evidence
    - Milestone approval history
  - AI flags relevant contract clauses automatically
  - Disputed amount frozen in escrow
  - Both parties present evidence in structured format
  - **Internal Resolution** (3-7 days):
    - Parties communicate via in-app chat
    - Try to reach mutual agreement
    - System mediates with contract references
  - **Platform Mediation** (7-14 days):
    - Admin reviews all evidence
    - Makes binding recommendation
    - Parties can accept or appeal once
  - **Legal Escalation**:
    - System generates demand letter with facts
    - Routes to arbitration per contract clause
    - Legal review prompt with case summary
    - Formal arbitration process begins

**User Actions:**
- Owner/Contractor: File dispute, submit evidence, communicate resolution
- System: Log everything, flag clauses, facilitate mediation, generate legal docs
- Admin: Review cases, make mediation decisions, oversee arbitration

#### Stage 5: Project Closeout
**What Happens:**
- **Final Inspection**:
  - Contractor requests final walkthrough
  - Owner schedules final inspection
  - System generates digital punch list
  - Contractor addresses punch list items
  - Owner approves each item
  - All work marked complete

- **Media Archive**:
  - System compiles complete project history:
    - All photos organized by date/milestone
    - All videos in chronological order
    - Daily update logs
    - All documents (contracts, invoices, receipts)
    - Communication history
    - Payment records
  - Searchable archive created
  - Both parties granted permanent access
  - Download package available

- **Final Payment**:
  - Final milestone approved
  - Retainage released (typically 10%)
  - Lien waivers exchanged
  - Final payment processed from escrow
  - Escrow account closed

- **Analytics Dashboard**:
  - System generates project analytics:
    - Actual vs planned timeline
    - Budget vs actual spend
    - Milestone approval rates
    - Change order summary
    - Issue resolution time
  - Performance reviews requested from both parties
  - Project marked "Completed"
  - Data used for contractor trust scores
  - Portfolio addition for contractor

**User Actions:**
- Owner: Final walkthrough, approve completion, leave review
- Contractor: Address punch list, request final payment, leave review
- System: Archive media, process final payment, generate analytics, update trust scores

---

### 6.1.2 Key Automation Features

#### AI Contract Generation
- Input: 
  - Accepted bid details (scope, budget, timeline)
  - Owner's project notes and requirements
  - Location (California)
  - Trade type and specialization
- Output: Complete contract with:
  - CSI-formatted scope of work
  - California-specific legal clauses:
    - Contractors State License Law requirements
    - Mechanic's lien provisions and protections
    - California-specific payment terms
    - Required bonds and insurance
    - Construction defect law protections
    - Mandatory licensing disclosures
  - State-compliant payment milestone schedule
  - Change order procedures per California regulations
  - Dispute resolution process (arbitration/mediation)
  - Owner protections (lien waivers, warranties)
  - Contractor protections (payment security, scope protection)
- Notes Integration: AI incorporates owner's notes throughout contract
- Editing: Fully editable before signing
- Legal Review: Option to send for attorney review
- Templates: California-compliant AIA-standard contracts adapted per trade
- Generation: Real-time AI generation based on inputs

#### AI Progress Monitoring
- **Photo Analysis**: AWS Rekognition or similar
  - Auto-tags: "drywall complete", "painting in progress"
  - Quality checks: Workmanship assessment
  - Safety detection: PPE compliance, hazards
- **Delay Detection**:
  - Compares actual vs planned progress
  - Identifies bottlenecks and dependencies
  - Predicts completion date adjustments
- **Alert System**:
  - Missing updates: "No check-in for 24 hours"
  - Timeline issues: "Milestone 3 days overdue"
  - Quality flags: "Review required for uploaded work"

#### Auto-Generated Timeline
- **Input**: Project scope and milestones
- **Output**: Gantt chart with:
  - Task breakdown structure
  - Dependencies between tasks
  - Critical path calculation
  - Resource allocation
  - Payment schedule aligned to milestones
- **Updates**: Real-time based on progress
- **Views**: Kanban and Gantt views

---

### 6.1.3 Role-Specific Workflows

#### Owner Workflow
1. Review AI-generated contract → Sign digitally
2. Fund escrow account
3. Review sub-contractor bids → Approve selections
4. Monitor daily progress updates
5. Receive milestone completion notifications
6. Review proof → Approve/request revisions
7. Payments auto-release on approval
8. Address disputes if needed
9. Conduct final walkthrough
10. Approve completion → Leave review

#### General Contractor Workflow
1. Review and sign contract
2. Post sub-contractor bid opportunities
3. Review sub bids → Make recommendations
4. Create project timeline with milestones
5. Coordinate all trades
6. Post daily check-ins with photos/videos
7. Mark milestones complete with proof
8. Address owner feedback/revisions
9. Submit change orders when needed
10. Complete punch list → Request final payment

#### Subcontractor Workflow
1. Submit bid for specialized trade work
2. Sign sub-contract if selected
3. Access role-specific dashboard
4. View assigned tasks and timeline
5. Post daily updates for own scope
6. Mark assigned milestones complete
7. Upload proof for own work
8. Coordinate with general contractor
9. Receive payment for completed milestones
10. Complete assigned punch list items

---

### 6.2 AI-Generated Scope of Work

#### Create Scope of Work
- **Link to accepted bid**: Automatically generate from bid details
- **Project details**:
  - Project name and description
  - Start and end dates
  - Work location
  - Access instructions
- **Work breakdown structure**:
  - Phases/milestones
  - Tasks and deliverables
  - Timeline for each phase
  - Dependencies between tasks
- **Materials and specifications**:
  - Material list with specs
  - Brand/quality requirements
  - Owner-supplied vs contractor-supplied
- **Requirements and standards**:
  - Building codes and permits
  - Quality standards
  - Inspection requirements
- **Exclusions**: Clearly defined out-of-scope items
- **Change order process**: How changes will be handled

#### Scope Management Features
- View full scope document
- Request scope changes/amendments
- Track scope change history
- Compare original vs current scope
- Both parties approve scope before work begins
- Digital signatures on scope document
- Download/export scope as PDF

---

### 6.3 Contract & Legal Protections

#### Digital Contract Features
- **Contract generation**:
  - Auto-populate from bid and scope
  - Standard contract templates by trade
  - Customizable terms and conditions
- **Essential contract terms**:
  - Payment schedule and terms
  - Project timeline with milestones
  - Warranty provisions
  - Liability and insurance requirements
  - Dispute resolution process
  - Termination clauses
  - Lien waivers
  - Change order procedures
- **Digital signatures**: E-signature integration for both parties
- **Document management**: Store all project documents
- **Legal review**: Option to have attorney review (third-party service)

#### Owner Protections
- **Contractor verification**: Licensed, insured, bonded status
- **Performance bond** (for large projects)
- **Lien protection**: Conditional and unconditional lien waivers
- **Insurance verification**: Current certificate of insurance
- **Payment tied to milestones**: Funds released upon approval
- **Dispute resolution**: Built-in mediation process
- **Termination rights**: Clear termination for cause provisions
- **Warranty guarantees**: Written warranty on work and materials

#### Contractor Protections
- **Scope protection**: Approved scope prevents scope creep
- **Payment security**: Escrow ensures funds available
- **Timely payment terms**: Automatic payment on milestone approval
- **Change order compensation**: Extra work = additional payment
- **Access guarantees**: Owner must provide site access
- **Owner approval SLA**: Owner must respond within set timeframe
- **Suspension rights**: Stop work if payments not made
- **Documentation**: Photo/video evidence protects against false claims

---

### 6.4 Payment & Escrow System

#### Payment Structure
- **Payment methods**:
  - Credit/debit card
  - ACH bank transfer
  - Wire transfer
- **Payment schedules**:
  - Fixed milestones
  - Percentage-based (e.g., 10% deposit, 40% mid, 50% final)
  - Time-based (weekly/monthly)
  - Completion-based
- **Deposit requirements**: Initial payment to start work
- **Retainage**: Holdback amount (typically 5-10%) until completion

#### Escrow Management
- **Escrow account setup**: Funds held by trusted third party
- **Deposit funds**: Owner deposits project funds into escrow
- **Milestone-based release**:
  - Contractor completes milestone
  - Submits proof of completion
  - Owner reviews and approves
  - System automatically releases payment from escrow
- **Escrow features**:
  - View escrow balance
  - See pending releases
  - Track payment history
  - Automatic distribution
  - Dispute hold (funds frozen during disputes)
- **Escrow fees**: Small percentage fee (1-3%) split or paid by owner
- **Refund process**: If project cancelled, escrow returns to owner

#### Payment Processing
- **Automatic milestone payments**: Released upon approval
- **Payment notifications**: Both parties notified of all transactions
- **Invoice generation**: Auto-generate invoices for milestones
- **Payment receipts**: Automatic receipt generation
- **Transaction history**: Complete payment audit trail
- **Tax documentation**: 1099 generation for contractors

---

### 6.5 Progress Tracking

#### Milestone Management
- **Create milestones**:
  - Milestone name and description
  - Due date
  - Payment amount
  - Deliverables required
  - Acceptance criteria
- **Milestone status**:
  - Not started
  - In progress
  - Pending review
  - Approved
  - Needs revision
  - Rejected
- **Timeline view**: Visual timeline of all milestones
- **Progress percentage**: Overall project completion %
- **Milestone dependencies**: Some milestones depend on others

#### Daily Progress Updates
- **Contractor updates**:
  - Daily work log
  - What was completed today
  - What's planned for tomorrow
  - Any issues or delays
  - Time tracking (hours worked)
  - Crew members on site
- **Photo/video documentation**:
  - Before/during/after photos
  - Video walkthroughs
  - Time-stamped and geo-tagged
  - Organized by date and milestone
- **Update frequency**: Configurable (daily, weekly, or per milestone)
- **Notification to owner**: Owner notified of each update

#### Progress Proof Requirements
- **Photo documentation**: Required for milestone approval
- **Video walkthroughs**: Optional but encouraged
- **Inspection reports**: Third-party inspections if required
- **Material receipts**: Proof of material purchases
- **Subcontractor invoices**: For transparency
- **Permit inspections**: Photos of passed inspections
- **Quality checks**: Before/after shots of key work

---

### 6.6 Approval & Review System

#### Milestone Approval Process
1. **Contractor submits milestone**:
   - Marks milestone as "Pending Review"
   - Uploads required proof (photos, documents)
   - Adds completion notes
2. **Owner receives notification**:
   - Email and push notification
   - Reminder if no response in 48 hours
3. **Owner reviews submission**:
   - Views all documentation
   - Can schedule in-person inspection
   - Has X days to respond (configurable, default 3-5 days)
4. **Owner decision**:
   - **Approve**: Payment released from escrow
   - **Request revision**: Specific issues to fix
   - **Reject**: With detailed explanation (triggers review)
5. **Payment release**: Automatic if approved
6. **Revision cycle**: Contractor fixes, resubmits

#### Approval Features
- **Approval timeline**: Owner must respond within set timeframe
- **Auto-approve option**: Auto-approve if owner doesn't respond (optional)
- **Punch list**: List of minor items to fix before final approval
- **Conditional approval**: Approve with conditions
- **Inspection scheduling**: Schedule site inspection before approval
- **Approval history**: Track all approvals and rejections
- **Comments**: Discussion on each milestone

---

### 6.7 Denial & Revision Management

#### Reasons for Denial
- **Work quality issues**: Doesn't meet agreed standards
- **Incomplete work**: All tasks not finished
- **Wrong materials**: Not as specified in scope
- **Code violations**: Work doesn't pass inspection
- **Timeline issues**: Work not done in agreed timeframe
- **Safety concerns**: Unsafe conditions

#### Denial Process
- **Detailed explanation required**: Owner must specify issues
- **Photo/video evidence**: Document problems
- **Reference to scope**: Show how work deviates from scope
- **Required fixes**: Specific list of what needs correction
- **Timeline for revision**: Deadline to fix issues
- **Communication**: In-app messaging about issues

#### Revision Workflow
1. Owner denies milestone with detailed reasons
2. Contractor receives notification
3. Contractor can:
   - Accept and fix issues
   - Dispute the denial (triggers mediation)
   - Request clarification
4. Contractor completes revisions
5. Resubmits for approval
6. Owner reviews again
7. Repeat until approved or dispute filed

#### Revision Tracking
- **Revision counter**: How many times resubmitted
- **Issue log**: History of all issues and resolutions
- **Time tracking**: How long revisions take
- **Pattern detection**: Flag contractors with high revision rates

---

### 6.8 Dispute Resolution System

#### Dispute Types
- **Payment disputes**: Disagreement on payment amount/release
- **Quality disputes**: Work quality disagreements
- **Scope disputes**: What's in/out of scope
- **Timeline disputes**: Delays and responsibility
- **Damage disputes**: Property damage claims
- **Safety disputes**: Unsafe work practices
- **Contract disputes**: Contract interpretation

#### Dispute Filing
- **File dispute**: Either party can file
- **Required information**:
  - Dispute type and description
  - Evidence (photos, documents, messages)
  - Desired resolution
  - Amount in dispute (if applicable)
- **Automatic payment hold**: Escrow frozen for disputed amount
- **Notification**: Both parties notified immediately
- **Timeline**: Must respond within 5 business days

#### Resolution Process
1. **Internal resolution** (3-7 days):
   - Both parties present their case
   - Share evidence and documentation
   - In-app communication
   - Try to reach agreement
2. **Platform mediation** (7-14 days):
   - If no internal resolution
   - Platform admin reviews case
   - Reviews all evidence
   - Makes binding recommendation
   - Admin decision can be accepted or appealed
3. **Professional mediation** (14-30 days):
   - Third-party mediator (optional)
   - Video conference or in-person
   - Mediator fee split or paid by losing party
   - Mediator makes binding decision
4. **Legal arbitration** (30+ days):
   - Formal arbitration process
   - Legally binding
   - Per contract arbitration clause

#### Dispute Features
- **Evidence upload**: Both parties submit evidence
- **Timeline tracking**: Track dispute progress
- **Communication**: Structured communication about dispute
- **Escrow protection**: Funds held until resolution
- **Resolution options**:
  - Full approval + payment
  - Partial payment
  - No payment + contractor must fix
  - Project termination + refund
  - Split decision
- **Appeal process**: One appeal allowed per party
- **Legal escalation**: Option to take to court (per contract)

#### Dispute Prevention
- **Clear documentation**: Detailed scope and contracts
- **Photo evidence**: Regular photo documentation
- **Communication logs**: All messages saved
- **Approval history**: Clear record of approvals
- **Change orders**: Formal process for changes

---

### 6.9 Change Orders

#### When Change Orders Are Needed
- Additional work requested
- Scope modifications
- Material changes
- Design changes
- Unforeseen conditions (hidden damage, etc.)
- Timeline extensions

#### Change Order Process
1. **Request**: Either party initiates change order
2. **Description**: Detailed description of change
3. **Impact assessment**:
   - Cost impact (+ or - amount)
   - Timeline impact (+ or - days)
   - Material changes
   - Labor changes
4. **Documentation**: Photos, drawings, specifications
5. **Quote**: Contractor provides quote for additional work
6. **Review**: Owner reviews and negotiates
7. **Approval**: Both parties approve and sign
8. **Scope update**: Automatically updates project scope
9. **Payment update**: Adjusts escrow and payment schedule
10. **Timeline update**: Adjusts project end date

#### Change Order Features
- **Change order log**: All changes tracked
- **Version control**: Original vs current scope comparison
- **Cost tracking**: Running total of change orders
- **Approval required**: Both parties must approve
- **Digital signatures**: E-signature on change orders
- **Automatic updates**: Updates scope, timeline, payments

---

### 6.10 Project Completion

#### Final Completion Process
1. **Contractor marks project complete**:
   - All milestones approved
   - Final walkthrough requested
   - Final documentation uploaded
2. **Final inspection**:
   - Schedule final walkthrough
   - Owner reviews all work
   - Create punch list if needed
3. **Punch list completion**:
   - Small items to address
   - Contractor fixes items
   - Owner approves each item
4. **Final approval**:
   - Owner gives final approval
   - Final payment released from escrow
   - Retainage released
5. **Project closeout**:
   - Generate completion certificate
   - Final invoices and receipts
   - Warranty documentation
   - Lien waivers exchanged
   - Project archived

#### Completion Documentation
- **As-built photos**: Final state documentation
- **Warranty documents**: Product and workmanship warranties
- **Permits and inspections**: All passed inspections
- **Material lists**: Final material documentation
- **Manuals**: Equipment manuals and care instructions
- **Maintenance schedule**: Recommended maintenance
- **Lien waivers**: Unconditional final lien waivers
- **Completion certificate**: Official project completion document

#### Post-Completion Features
- **Warranty tracking**: Track warranty periods
- **Warranty claims**: File warranty claims if issues arise
- **Final review**: Both parties review each other
- **Project photos**: Final project gallery
- **Share project**: Portfolio addition for contractor
- **Reference**: Request to use as reference

---

### 6.11 Role-Based Dashboards

#### Owner Dashboard
Comprehensive project management interface for property owners and project managers.

**Overview Section:**
- Active projects count and status
- Pending approvals requiring action
- Recent notifications summary
- Quick action buttons (Post Job, View Bids, etc.)

**Active Projects:**
- Project cards with:
  - Project name and location
  - Current phase and completion %
  - Budget vs actual spending
  - Days remaining
  - Contractor information
  - Status indicators (on track, delayed, issues)
  - Pending approvals badge
- Filter by status, date, trade
- Search projects

**Jobs & Applications:**
- Posted jobs (active, filled, closed)
- Application management:
  - New applications awaiting review
  - Application count per job
  - Applicant details and ratings
  - Accept/reject actions
- Job posting quick action

**Bids & Contracts:**
- Open bid requests
- Received bids awaiting review
- Bid comparison tools
- Contract status tracking
- Award/decline actions

**Milestones & Approvals:**
- Pending milestone approvals
- Milestone review interface:
  - View submitted proof (photos/videos)
  - Inspection scheduling
  - Approve/request revision/reject
- Approval history
- Payment release tracking

**Payments & Financials:**
- Escrow balance overview
- Payment history (released, pending)
- Upcoming payment obligations
- Transaction receipts
- Budget tracking across projects

**Schedule & Appointments:**
- Calendar view of inspections and meetings
- Upcoming appointments
- Estimate requests to review
- Schedule management

**Communication Hub:**
- Unread message count
- Recent conversations
- Quick access to project discussions
- Notification center

**Contractors:**
- Saved contractors
- Favorite contractors
- Contractor search and invite
- Contractor ratings and reviews

**Analytics:**
- Project completion trends
- Spending analytics
- Timeline performance
- Contractor performance metrics

#### Contractor Dashboard
Streamlined workflow interface for general contractors and subcontractors.

**Overview Section:**
- Active projects count
- Today's tasks and priorities
- Pending approvals status
- Earnings summary (pending, received)
- Action items requiring attention

**Active Projects:**
- Project cards showing:
  - Project name and owner
  - Current phase
  - Today's required actions
  - Upcoming milestones
  - Payment status
  - Update status (posted today/overdue)
- One-tap daily update
- Quick access to project details

**Job Opportunities:**
- Available jobs matching trade
- Bid invitations received
- Job search and filtering
- Saved jobs
- Application tracking (pending, accepted, rejected)

**Bids & Proposals:**
- Active bids submitted
- Bid invitations
- Awarded contracts
- Bid status tracking
- Quick bid submission

**Daily Updates:**
- Update reminder/checklist
- Photo/video upload interface
- Work log entry
- Time tracking
- Crew member logging
- Issue reporting

**Milestones & Submissions:**
- Upcoming milestones
- Ready to submit milestones
- Pending review status
- Revision requests
- Milestone proof upload
- Approval tracking

**Payments & Earnings:**
- Expected payments by project
- Payment history
- Pending approvals affecting payment
- Invoice management
- Earnings analytics

**Schedule & Tasks:**
- Today's agenda
- Upcoming appointments
- Estimate requests
- Inspection schedules
- Deadline tracking

**Communication:**
- Unread messages by project
- Owner communications
- Team coordination (if GC)
- Quick message access

**Profile & Portfolio:**
- Profile completion status
- Portfolio management
- Reviews and ratings
- Verification status
- License and insurance updates

**Analytics:**
- Job win rate
- Project completion stats
- Earnings trends
- Response time metrics
- Trust score indicators

#### Dashboard Features (Both Roles):
- Real-time updates
- Push notifications
- Quick actions
- Search functionality
- Filter and sort options
- Customizable views
- Export capabilities
- Mobile-optimized interface
- Offline data access
- Smart reminders

---

### 6.12 Communication During Project

#### Project-Specific Messaging
- **Direct messaging**: Owner ↔ Contractor
- **Milestone discussions**: Comments on each milestone
- **Photo comments**: Discuss specific photos
- **Issue threads**: Dedicated threads for issues
- **Change order discussions**: Negotiate changes
- **File sharing**: Share documents, drawings, specs

#### Notifications & Alerts
- **Daily updates**: Contractor posted update
- **Milestone submitted**: Ready for review
- **Approval needed**: Owner action required
- **Payment released**: Payment processed
- **Change order**: New change order request
- **Dispute filed**: Dispute notification
- **Deadline approaching**: Milestone due soon
- **Overdue**: Milestone or approval overdue

---

### 6.13 Project Analytics & Reporting

#### Project Reports
- **Project summary**: Overview of all project details
- **Financial report**: All payments and expenses
- **Timeline report**: Planned vs actual timeline
- **Change order report**: All changes and impact
- **Issue log**: All disputes and resolutions
- **Payment history**: Complete transaction log
- **Time tracking**: Total hours worked

#### Export Options
- **PDF reports**: All reports as PDF
- **Excel exports**: Financial data for accounting
- **Photo albums**: Download all photos
- **Document package**: All documents in ZIP file

---

## 7. Future Enhancements

### Planned Features
- Push notifications (iOS/Android)
- Email digest notifications
- Calendar integration (Google Calendar, iCal)
- Video portfolio support
- Multi-project management enhancements
- Subcontractor management tools
- Equipment tracking
- Material ordering integration
- Live video estimates
- Automated insurance verification
- Background check automation
- 3D project visualization

### Advanced Integrations
- Background checks integration
- Insurance verification API
- License verification API
- Credit check integration
- Automated contractor matching
- AI-powered job recommendations
- Time tracking with GPS
- Expense tracking
- Equipment rental marketplace
- Supply chain integration
- Accounting software integration

### Emerging Technologies
- Machine learning for fraud detection
- Predictive analytics
- Advanced contractor scoring
- Real-time chat support
- Video call integration
- Multi-language support
- Smart contracts (blockchain)
- IoT integration for progress tracking

---

## Key Differentiators

### For Project Managers
- Fast contractor discovery
- Verified professionals
- Transparent pricing
- Easy communication
- Application management
- Schedule coordination

### For Contractors
- Quality job leads
- Direct client access
- Portfolio showcase
- Professional credibility
- Easy bid submission
- Efficient scheduling

### For the Platform
- Trust and verification system
- Comprehensive review system
- Dispute resolution
- Quality control
- Fair marketplace
- Data-driven insights

---

## Success Metrics

### User Engagement
- Daily/Monthly Active Users
- User retention rate
- Session duration
- Feature adoption rate

### Marketplace Health
- Jobs posted per week
- Application rate
- Job fill rate
- Bid acceptance rate
- Appointment completion rate

### Quality Metrics
- Average rating (contractors and PMs)
- Verification completion rate
- Dispute rate
- Review completion rate

### Business Metrics
- Revenue growth
- Customer acquisition cost
- Lifetime value
- Churn rate
- Platform commission/fees

---

This functional requirements document serves as the comprehensive guide for all features and capabilities of the Bidroom Construction Platform. It should be used in conjunction with the Technical Requirements document for complete project understanding.
