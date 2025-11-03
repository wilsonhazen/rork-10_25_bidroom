# Bidroom Construction Platform - Developer Roadmap

> **Last Updated**: January 2025  
> **Project Status**: Active Development - Backend Integration Phase

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Current Implementation Status](#current-implementation-status)
3. [Technology Stack](#technology-stack)
4. [Development Phases](#development-phases)
5. [Getting Started](#getting-started)
6. [Architecture Overview](#architecture-overview)
7. [Database Schema Summary](#database-schema-summary)
8. [API Endpoints Reference](#api-endpoints-reference)
9. [Testing Requirements](#testing-requirements)
10. [Deployment Guide](#deployment-guide)

---

## 🎯 Project Overview

**Bidroom** is a comprehensive construction management platform that handles the complete project lifecycle:
- Job posting and contractor discovery
- Bidding and contractor selection
- AI-powered contract generation with California law compliance
- Project execution with milestone-based payments
- Real-time progress tracking with photo/video documentation
- Escrow management and automated payments
- Dispute resolution system
- Project completion and closeout

### Platforms
- **Mobile**: iOS & Android (React Native)
- **Web**: Progressive Web App
- **Admin**: Web-based dashboard (planned)

---

## ✅ Current Implementation Status

### Fully Implemented (Mock Data)
✅ Authentication system with role-based access  
✅ Job posting and application management  
✅ Contractor directory and profiles  
✅ Bid creation and submission  
✅ Appointment scheduling  
✅ Messaging system  
✅ Notification center (55+ notification types)  
✅ Role-based dashboards (Owner & Contractor)  
✅ Project setup UI with AI contract generation  
✅ California contractor law specifications  

### Partially Implemented
🔶 Backend connection (mock data, needs real API)  
🔶 File uploads (UI ready, needs storage)  
🔶 Real-time features (polling, needs WebSockets)  
🔶 Payment system (UI ready, needs Stripe integration)  

### Not Yet Implemented
❌ Backend infrastructure  
❌ Database setup  
❌ API endpoints  
❌ File storage  
❌ Push notifications  
❌ E-signature integration  
❌ Payment processing  
❌ Admin dashboard  

---

## 🛠️ Technology Stack

### Frontend (Current)
```json
{
  "react-native": "0.81.5",
  "react": "19.1.0",
  "expo": "54.0.20",
  "expo-router": "6.0.13",
  "typescript": "5.9.2",
  "@tanstack/react-query": "5.90.5",
  "@nkzw/create-context-hook": "1.1.0",
  "lucide-react-native": "0.475.0"
}
```

### Backend (To Be Decided)

**Option A: Supabase (Recommended)**
- ✅ PostgreSQL with full SQL
- ✅ Built-in authentication
- ✅ Real-time subscriptions
- ✅ File storage with CDN
- ✅ Row Level Security
- ✅ Edge Functions

**Option B: Firebase**
- Firestore NoSQL database
- Firebase Authentication
- Real-time updates
- Cloud Storage
- Cloud Functions
- Cloud Messaging

**Option C: Custom Backend**
- Node.js + Express
- PostgreSQL
- JWT auth with Passport
- Socket.io for real-time
- AWS S3 for storage

---

## 📅 Development Phases

### **Phase 1: Backend Infrastructure** (4-6 weeks)

**Priority: CRITICAL**

#### Tasks
1. **Choose Backend Platform**
   - Evaluate: Supabase vs Firebase vs Custom
   - Consider: Cost, scalability, features needed
   - **Recommendation**: Supabase for full SQL + real-time

2. **Database Implementation**
   - Create 30+ tables (see schema below)
   - Implement Row Level Security policies
   - Set up indexes for performance
   - Create database migrations

3. **API Endpoints**
   Create REST APIs for:
   - Authentication (register, login, social, refresh)
   - Jobs (CRUD, search, apply)
   - Contractors (profiles, search, verification)
   - Bids (CRUD, submissions, awards)
   - Appointments (scheduling, updates)
   - Messages (conversations, real-time)
   - Notifications (create, read, delete)
   - Projects (full construction management)
   - Milestones (submit, approve, reject)
   - Payments (deposit, release, refund)
   - Disputes (file, respond, resolve)

4. **File Storage**
   - Configure storage buckets
   - Implement upload endpoints
   - Add image compression
   - Set up CDN
   - Define access policies

5. **Testing**
   - Unit tests for all endpoints
   - Integration tests for workflows
   - Load testing for performance
   - Security testing

#### Deliverables
- [ ] Functional backend with all endpoints
- [ ] Database with complete schema
- [ ] File storage configured
- [ ] API documentation
- [ ] Postman/Insomnia collection
- [ ] Test coverage report

---

### **Phase 2: Frontend Integration** (3-4 weeks)

**Priority: HIGH**

#### Tasks
1. **API Service Layer**
   Create organized API clients in `services/api/`:
   ```typescript
   services/api/
   ├── auth.ts          // Authentication
   ├── jobs.ts          // Jobs & applications
   ├── contractors.ts   // Contractor directory
   ├── bids.ts          // Bidding
   ├── appointments.ts  // Scheduling
   ├── messages.ts      // Messaging
   ├── notifications.ts // Notifications
   ├── projects.ts      // Project management
   ├── milestones.ts    // Milestones
   ├── payments.ts      // Payments
   └── uploads.ts       // File uploads
   ```

2. **Context Migration**
   Migrate all contexts from AsyncStorage to React Query:
   - ✅ Already using React Query pattern
   - Update to call real APIs instead of mock data
   - Implement proper error handling
   - Add retry logic
   - Handle loading states

3. **Authentication Flow**
   - JWT token management
   - Refresh token rotation
   - Social auth integration
   - Secure token storage
   - Auto-logout on 401

4. **File Upload**
   - Image picker integration
   - Image compression
   - Video upload (future)
   - Document upload
   - Upload progress tracking

5. **Remove Mock Data**
   Delete all files in `mocks/` folder after verification

#### Deliverables
- [ ] Connected app with real data
- [ ] Working authentication
- [ ] File upload functionality
- [ ] Error handling system
- [ ] Loading states throughout
- [ ] Mock data removed

---

### **Phase 3: Real-Time Features** (2-3 weeks)

**Priority: MEDIUM**

#### Tasks
1. **Real-Time Messaging**
   - WebSocket connection setup
   - Message delivery
   - Read receipts
   - Typing indicators
   - Online presence

2. **Real-Time Notifications**
   - Live notification delivery
   - Badge count updates
   - Sound/vibration
   - Deep linking

3. **Project Updates**
   - Live milestone status changes
   - Payment notifications
   - Progress update alerts

#### Deliverables
- [ ] Real-time messaging working
- [ ] Live notifications
- [ ] Presence indicators
- [ ] Optimized for battery life

---

### **Phase 4: AI Features** (4-6 weeks)

**Priority: HIGH** (Competitive advantage)

#### Tasks
1. **AI Contract Generation**
   ```typescript
   // Location: services/ai/contract-generation.ts
   - Integrate @rork/toolkit-sdk
   - Process bid details + owner notes
   - Generate California-compliant contracts
   - Include CSLB provisions
   - Mechanic's lien warnings
   - Insurance requirements
   - Payment schedules
   - Editable templates
   ```

2. **AI Progress Monitoring**
   ```typescript
   // Location: services/ai/progress-monitoring.ts
   - Photo analysis for work quality
   - Safety compliance detection
   - Completion percentage estimation
   - Issue flagging
   ```

3. **AI Timeline Generation**
   ```typescript
   // Location: services/ai/timeline-generation.ts
   - Auto-generate project schedules
   - Calculate milestone dates
   - Identify dependencies
   - Determine critical path
   ```

4. **AI Delay Detection**
   - Monitor progress updates
   - Detect missing check-ins
   - Identify overdue milestones
   - Predict completion dates
   - Generate alerts

#### Deliverables
- [ ] AI contract generation live
- [ ] Progress photo analysis
- [ ] Timeline auto-generation
- [ ] Delay detection alerts
- [ ] California law compliance verified

---

### **Phase 5: Payment & Escrow** (4-6 weeks)

**Priority: CRITICAL**

#### Tasks
1. **Payment Provider Integration**
   - Set up Stripe account
   - Implement Stripe Connect for contractors
   - Configure webhook endpoints
   - Test payment flows

2. **Escrow System**
   ```typescript
   // Core flows:
   - Deposit funds to project escrow
   - Hold funds during construction
   - Release on milestone approval
   - Partial releases (20-30% tranches)
   - Full refund on cancellation
   - Hold during disputes
   ```

3. **Payment Automation**
   - Milestone approval triggers payment
   - Automatic payment release
   - Email/SMS confirmations
   - Payment receipts

4. **Financial Features**
   - Invoice generation
   - Receipt generation
   - Payment history
   - Tax documentation (1099)
   - Payment analytics

#### Deliverables
- [ ] Stripe integration complete
- [ ] Escrow system working
- [ ] Automated milestone payments
- [ ] Invoice/receipt generation
- [ ] Payment tested in sandbox

---

### **Phase 6: E-Signatures** (2-3 weeks)

**Priority: MEDIUM**

#### Tasks
1. **E-Signature Provider**
   - Choose: DocuSign, HelloSign, or PandaDoc
   - Set up account
   - Integrate API

2. **Signing Workflow**
   - Generate PDF contracts
   - Send for signature
   - Track signature status
   - Store signed documents
   - Email notifications

3. **Document Types**
   - Project contracts
   - Scope of work
   - Change orders
   - Lien waivers
   - Completion certificates

#### Deliverables
- [ ] E-signature integration
- [ ] Contract signing workflow
- [ ] Document management
- [ ] Signature tracking

---

### **Phase 7: Dispute Resolution** (2-3 weeks)

**Priority: MEDIUM**

#### Tasks
1. **Dispute Filing**
   - Dispute form
   - Evidence upload
   - Amount calculation
   - Automatic payment hold

2. **Admin Mediation**
   - Admin dashboard for disputes
   - Evidence review interface
   - Decision workflow
   - Resolution options

3. **Legal Escalation**
   - Auto-generate demand letters
   - Arbitration routing
   - Legal documentation

#### Deliverables
- [ ] Complete dispute system
- [ ] Admin mediation tools
- [ ] Payment hold mechanism
- [ ] Legal escalation flow

---

### **Phase 8: Push Notifications** (2 weeks)

**Priority: MEDIUM**

#### Tasks
1. Configure Expo Push Notifications
2. Set up notification server
3. Implement for all notification types
4. Add notification preferences
5. Badge count management
6. Deep linking from notifications

#### Deliverables
- [ ] Push notifications on iOS
- [ ] Push notifications on Android
- [ ] Notification preferences
- [ ] Deep linking working

---

### **Phase 9: Admin Dashboard** (4-6 weeks)

**Priority: LOW** (Can launch without this)

#### Features
- User management
- Verification management
- Project oversight
- Dispute mediation
- Payment oversight
- Platform analytics
- Content management

---

### **Phase 10: Testing & QA** (3-4 weeks)

**Priority: CRITICAL** (Before production)

#### Testing Types
1. **Unit Tests** (80% coverage goal)
2. **Integration Tests** (key workflows)
3. **E2E Tests** (critical paths)
4. **Security Audit**
5. **Performance Testing**
6. **Device Testing** (iOS/Android/Web)
7. **User Acceptance Testing**

---

### **Phase 11: Production Deployment** (2-3 weeks)

**Priority: CRITICAL**

#### Tasks
1. Production environment setup
2. Error tracking (Sentry)
3. Analytics (Mixpanel/Amplitude)
4. Build production apps
5. App Store preparation
6. Google Play preparation
7. Submission
8. Web deployment
9. Monitoring setup

---

## 🏁 Getting Started for New Developers

### Prerequisites
```bash
# Install Node.js (v18+)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# Install Bun
curl -fsSL https://bun.sh/install | bash

# Install Expo CLI (optional, for advanced features)
npm install -g @expo/cli
```

### Clone and Setup
```bash
# Clone repository
git clone <repository-url>
cd bidroom

# Install dependencies
bun install

# Start development server
bun run start

# Open on different platforms
# Press 'i' for iOS simulator
# Press 'a' for Android emulator
# Press 'w' for web browser
# Scan QR code for physical device
```

### Project Commands
```bash
# Development
bun run start          # Start dev server
bun run start-web      # Web-only mode
bun run lint           # Run linter

# Testing (to be added)
bun run test           # Run tests
bun run test:watch     # Watch mode
bun run test:coverage  # Coverage report

# Building
eas build --platform ios --profile production
eas build --platform android --profile production
eas build --platform all --profile production
```

---

## 🗄️ Database Schema Summary

### Core Tables (30+)
```
users                      - User accounts
jobs                       - Job postings
job_applications           - Applications
appointments               - Scheduling
messages                   - Messaging
notifications              - Notifications
bids                       - Bid management
projects                   - Construction projects
project_scope              - Scope of work
ai_generated_contracts     - AI contracts
project_contracts          - Legal contracts
project_milestones         - Payment milestones
progress_updates           - Daily progress
ai_progress_analysis       - AI analysis
project_payments           - Payments
project_timelines          - Schedules
project_alerts             - Alerts
change_orders              - Change requests
disputes                   - Disputes
milestone_approvals        - Approvals
project_documents          - Documents
sub_contractor_bids        - Sub-bids
project_role_assignments   - Permissions
```

**Full schema in**: `TECHNICAL_REQUIREMENTS.md` (Section 4)

---

## 🔌 API Endpoints Reference

### Authentication
```
POST   /auth/register
POST   /auth/login
POST   /auth/logout
POST   /auth/refresh
POST   /auth/social-login
GET    /auth/me
PATCH  /auth/profile
```

### Jobs
```
GET    /jobs
POST   /jobs
GET    /jobs/:id
PATCH  /jobs/:id
DELETE /jobs/:id
POST   /jobs/:id/apply
GET    /jobs/:id/applications
PATCH  /applications/:id
```

### Projects
```
POST   /projects
GET    /projects
GET    /projects/:id
PATCH  /projects/:id
DELETE /projects/:id

POST   /projects/:id/milestones
POST   /projects/:id/milestones/:mid/submit
POST   /projects/:id/milestones/:mid/approve
POST   /projects/:id/milestones/:mid/reject

POST   /projects/:id/payments/deposit
POST   /projects/:id/payments/:pid/release

POST   /projects/:id/disputes
PATCH  /projects/:id/disputes/:did
```

**Full API specs in**: `TECHNICAL_REQUIREMENTS.md` (Section 5)

---

## 🧪 Testing Requirements

### Unit Tests (80% coverage)
```typescript
// Example test structure
describe('JobsContext', () => {
  it('should fetch jobs', async () => {
    // Test implementation
  });
  
  it('should create job', async () => {
    // Test implementation
  });
});
```

### Integration Tests
- Authentication flow
- Job posting → Application → Approval
- Bid submission → Award → Project creation
- Milestone submission → Approval → Payment

### E2E Tests
- Complete user journey (PM)
- Complete user journey (Contractor)
- Payment flow
- Dispute resolution

---

## 🚀 Deployment Guide

### iOS App Store
```bash
# Configure EAS
eas build:configure

# Build for iOS
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

### Google Play Store
```bash
# Build for Android
eas build --platform android --profile production

# Submit to Google Play
eas submit --platform android
```

### Web Deployment
```bash
# Build web app
eas build --platform web

# Deploy to Vercel
vercel deploy

# Or deploy to Netlify
netlify deploy --prod
```

---

## 📊 Success Metrics

### Technical Metrics
- **Initial Load**: < 3s
- **API Response**: < 500ms (p95)
- **Error Rate**: < 1%
- **Uptime**: 99.9%
- **Test Coverage**: > 80%

### Business Metrics
- **DAU/MAU** ratio
- **Jobs posted** per week
- **Application rate**
- **Bid acceptance rate**
- **Project completion rate**
- **Average project value**
- **Revenue per user**

---

## 📚 Additional Resources

- **Functional Requirements**: `FUNCTIONAL_REQUIREMENTS.md`
- **Technical Requirements**: `TECHNICAL_REQUIREMENTS.md`
- **Expo Documentation**: https://docs.expo.dev/
- **React Native Docs**: https://reactnative.dev/
- **React Query Docs**: https://tanstack.com/query/latest
- **Supabase Docs**: https://supabase.com/docs
- **Stripe Connect**: https://stripe.com/docs/connect

---

## 🤝 Team & Support

### Roles Needed
- **Backend Developer**: Database, APIs, authentication
- **Mobile Developer**: React Native, UI/UX
- **DevOps Engineer**: Deployment, monitoring, CI/CD
- **QA Engineer**: Testing, automation
- **Product Manager**: Requirements, roadmap, priorities

### Contact
For questions or support, contact the development team lead.

---

**Last Updated**: January 2025  
**Next Review**: End of Phase 1 (Backend completion)
