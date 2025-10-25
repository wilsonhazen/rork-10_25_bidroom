# Bidroom Construction Platform - Technical Requirements

## Table of Contents
1. [Technology Stack](#technology-stack)
2. [Architecture Overview](#architecture-overview)
3. [Backend Integration](#backend-integration)
4. [Database Schema](#database-schema)
5. [API Specifications](#api-specifications)
6. [Authentication Implementation](#authentication-implementation)
7. [File Upload Architecture](#file-upload-architecture)
8. [Real-Time Features](#real-time-features)
9. [Security Requirements](#security-requirements)
10. [Testing Strategy](#testing-strategy)
11. [Performance Requirements](#performance-requirements)
12. [Deployment Architecture](#deployment-architecture)
13. [Development Roadmap](#development-roadmap)

---

## 1. Technology Stack

### Frontend (Mobile & Web)
- **React Native** 0.79.1
- **React** 19.0.0
- **Expo SDK** 53 (latest)
- **Expo Router** v5 (file-based routing)
- **TypeScript** 5.8.3 (strict mode)
- **React Query** v5 (TanStack Query)
- **AsyncStorage** for local persistence
- **Lucide React Native** for icons
- **React Native Gesture Handler**
- **React Native Safe Area Context**
- **React Native SVG**

### State Management
- **@nkzw/create-context-hook** for context providers
- **React Query** for server state
- **AsyncStorage** for persistence
- **useState** for local state

### Backend Options (Choose One)

#### Option A: Supabase (Recommended)
- **Database**: PostgreSQL with full SQL support
- **Auth**: Built-in with social providers
- **Real-time**: WebSocket subscriptions
- **Storage**: Built-in with CDN
- **Functions**: Edge Functions for custom logic
- **Security**: Row Level Security (RLS)

#### Option B: Firebase
- **Database**: Firestore (NoSQL)
- **Auth**: Firebase Authentication
- **Real-time**: Firestore real-time updates
- **Storage**: Firebase Storage
- **Functions**: Cloud Functions
- **Notifications**: Firebase Cloud Messaging

#### Option C: Custom Backend
- **Framework**: Node.js with Express
- **Database**: PostgreSQL
- **Auth**: JWT tokens with Passport.js
- **Real-time**: Socket.io or WebSockets
- **Storage**: AWS S3 or similar
- **Hosting**: AWS, DigitalOcean, or Railway

---

## 2. Architecture Overview

### File Structure
```
├── app/                           # Expo Router pages
│   ├── (tabs)/                   # Tab navigation
│   │   ├── _layout.tsx          # Tab navigator config
│   │   ├── index.tsx            # Home/Dashboard
│   │   ├── jobs.tsx             # Jobs listing
│   │   ├── contractors.tsx      # Contractors directory
│   │   ├── bids.tsx             # Bids management
│   │   ├── schedule.tsx         # Appointments
│   │   └── profile.tsx          # User profile
│   ├── _layout.tsx              # Root layout
│   ├── login.tsx                # Login screen
│   ├── register.tsx             # Registration
│   ├── job-details.tsx          # Job detail view
│   ├── bid-details.tsx          # Bid detail view
│   ├── appointment-details.tsx  # Appointment detail
│   ├── contractor-profile.tsx   # Contractor profile
│   ├── messages.tsx             # Messaging
│   ├── notifications.tsx        # Notifications
│   └── settings.tsx             # App settings
│
├── contexts/                     # Global state
│   ├── AuthContext.tsx          # Authentication
│   ├── JobsContext.tsx          # Jobs & applications
│   ├── AppointmentsContext.tsx  # Appointments
│   └── BidsContext.tsx          # Bids (to be created)
│
├── components/                   # Reusable components
│   ├── VerificationModal.tsx    # Verification UI
│   └── TrustSuggestions.tsx     # Trust indicators
│
├── services/                     # API services (to be created)
│   ├── api/
│   │   ├── auth.ts             # Auth endpoints
│   │   ├── jobs.ts             # Jobs endpoints
│   │   ├── appointments.ts     # Appointment endpoints
│   │   ├── bids.ts             # Bids endpoints
│   │   ├── messages.ts         # Messaging endpoints
│   │   └── notifications.ts    # Notification endpoints
│   ├── realtime.ts             # Real-time subscriptions
│   └── upload.ts               # File upload utilities
│
├── constants/                    # App constants
│   ├── colors.ts               # Color scheme
│   ├── trades.ts               # Trade types
│   └── roles.ts                # User roles
│
├── types/                        # TypeScript definitions
│   └── index.ts                # All type definitions
│
├── utils/                        # Utility functions
│   ├── validation.ts           # Input validation
│   └── trust.ts                # Trust score calculations
│
├── hooks/                        # Custom hooks
│   └── useSocialAuth.ts        # Social auth hooks
│
└── mocks/                        # Mock data (to be removed)
    ├── data.ts
    ├── jobs-data.ts
    └── test-users.ts
```

### Navigation Structure

**Root Stack:**
- Login (outside tabs)
- Register (outside tabs)
- Onboarding (outside tabs)
- Main App (tabs)

**Tab Navigation:**
1. Home - Dashboard with stats
2. Jobs - Jobs listing
3. Contractors - Directory
4. Bids - Bid management
5. Schedule - Appointments
6. Profile - User profile

**Modal/Detail Screens:**
- Job Details
- Bid Details
- Appointment Details
- Contractor Profile
- Messages
- Notifications
- Settings
- Edit Profile
- Privacy, Help, Terms

---

## 3. Backend Integration

### 3.1 API Service Layer

Create modular API clients in `services/api/`:

```typescript
// services/api/auth.ts
export const authApi = {
  login: async (email: string, password: string) => {...},
  register: async (userData: RegisterData) => {...},
  logout: async () => {...},
  refreshToken: async (refreshToken: string) => {...},
  getCurrentUser: async () => {...},
  updateProfile: async (data: ProfileUpdate) => {...},
  socialLogin: async (provider: string, token: string) => {...}
}

// services/api/jobs.ts
export const jobsApi = {
  fetchJobs: async (filters?: JobFilters) => {...},
  fetchJobById: async (id: string) => {...},
  createJob: async (data: JobCreate) => {...},
  updateJob: async (id: string, data: JobUpdate) => {...},
  deleteJob: async (id: string) => {...},
  applyToJob: async (jobId: string, application: Application) => {...},
  updateApplication: async (id: string, data: ApplicationUpdate) => {...}
}

// services/api/appointments.ts
export const appointmentsApi = {
  fetchAppointments: async () => {...},
  createAppointment: async (data: AppointmentCreate) => {...},
  updateAppointment: async (id: string, data: AppointmentUpdate) => {...},
  cancelAppointment: async (id: string) => {...}
}

// services/api/bids.ts
export const bidsApi = {
  fetchBids: async () => {...},
  createBid: async (data: BidCreate) => {...},
  updateBid: async (id: string, data: BidUpdate) => {...},
  submitBid: async (bidId: string, submission: BidSubmission) => {...}
}
```

### 3.2 React Query Integration

Replace AsyncStorage with React Query in contexts:

```typescript
// Example: Updated JobsContext
export const [JobsContext, useJobs] = createContextHook(() => {
  const queryClient = useQueryClient();

  const jobsQuery = useQuery({
    queryKey: ['jobs'],
    queryFn: jobsApi.fetchJobs,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  });

  const createJobMutation = useMutation({
    mutationFn: jobsApi.createJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    }
  });

  return {
    jobs: jobsQuery.data || [],
    isLoading: jobsQuery.isLoading,
    createJob: createJobMutation.mutate,
    refetch: jobsQuery.refetch
  };
});
```

### 3.3 Environment Configuration

```typescript
// config/env.ts
export const config = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000',
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  googleAuthClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
  appleAuthClientId: process.env.EXPO_PUBLIC_APPLE_CLIENT_ID,
  environment: process.env.EXPO_PUBLIC_ENVIRONMENT || 'development'
};
```

---

## 4. Database Schema

### PostgreSQL Schema (Supabase Recommended)

#### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password_hash VARCHAR(255),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL,
  company_name VARCHAR(255),
  bio TEXT,
  avatar_url TEXT,
  location VARCHAR(255),
  verification_status VARCHAR(50) DEFAULT 'unverified',
  trust_score INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

#### Jobs Table
```sql
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(255) NOT NULL,
  trade_type VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'open',
  budget_min DECIMAL(12, 2),
  budget_max DECIMAL(12, 2),
  start_date DATE,
  end_date DATE,
  project_manager_id UUID NOT NULL REFERENCES users(id),
  requirements JSONB DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_trade_type ON jobs(trade_type);
```

#### Job Applications Table
```sql
CREATE TABLE job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  contractor_id UUID NOT NULL REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'pending',
  cover_letter TEXT,
  proposed_rate DECIMAL(10, 2),
  availability_start DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(job_id, contractor_id)
);
```

#### Appointments Table
```sql
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'scheduled',
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  location VARCHAR(255),
  organizer_id UUID NOT NULL REFERENCES users(id),
  attendee_id UUID NOT NULL REFERENCES users(id),
  job_id UUID REFERENCES jobs(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Messages Table
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL,
  sender_id UUID NOT NULL REFERENCES users(id),
  receiver_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
```

#### Notifications Table
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
```

### Row Level Security (Supabase)

```sql
-- Users can view all profiles
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all profiles" ON users
  FOR SELECT USING (true);

-- Users can update own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Jobs are visible to all when open
CREATE POLICY "Anyone can view open jobs" ON jobs
  FOR SELECT USING (status = 'open' OR project_manager_id = auth.uid());

-- Only PMs can create jobs
CREATE POLICY "PMs can create jobs" ON jobs
  FOR INSERT WITH CHECK (project_manager_id = auth.uid());
```

---

## 5. API Specifications

### Authentication Endpoints

#### POST /auth/register
**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "general_contractor",
  "companyName": "Doe Construction"
}
```

#### POST /auth/login
**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "user": {...},
  "session": {
    "accessToken": "jwt-token",
    "refreshToken": "refresh-token",
    "expiresIn": 3600
  }
}
```

### Jobs Endpoints

#### GET /jobs
**Query Parameters:**
- `status`: open, in_progress, completed
- `tradeType`: Filter by trade
- `page`: Page number
- `limit`: Items per page

#### POST /jobs
**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "title": "Kitchen Remodel",
  "description": "Complete renovation...",
  "location": "San Francisco, CA",
  "tradeType": "General",
  "budgetMin": 50000,
  "budgetMax": 75000
}
```

---

## 6. Authentication Implementation

### JWT Token Strategy

**Access Token:**
- Expires in: 1 hour
- Contains: userId, email, role
- Stored in: Memory (Context)

**Refresh Token:**
- Expires in: 30 days
- Stored in: expo-secure-store (mobile), localStorage (web)
- Used to: Obtain new access token

### Token Refresh Implementation

```typescript
// services/api/client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: config.apiUrl,
  timeout: 30000
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = await getRefreshToken();
      const response = await axios.post('/auth/refresh', { refreshToken });
      await saveTokens(response.data.accessToken, response.data.refreshToken);
      originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
      return apiClient(originalRequest);
    }
    return Promise.reject(error);
  }
);
```

### Social Authentication

```typescript
// Google Sign In
import * as Google from 'expo-auth-session/providers/google';

export function useGoogleAuth() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: config.googleAuthClientId,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      handleGoogleAuth(response.authentication);
    }
  }, [response]);

  return { signInWithGoogle: () => promptAsync() };
}
```

---

## 7. File Upload Architecture

### Image Upload Implementation

```typescript
// services/upload.ts
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

export const uploadImage = async (uri: string): Promise<string> => {
  // 1. Compress image
  const compressed = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1920 } }],
    { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
  );

  // 2. Create FormData
  const formData = new FormData();
  formData.append('image', {
    uri: compressed.uri,
    name: 'image.jpg',
    type: 'image/jpeg'
  });

  // 3. Upload
  const response = await apiClient.post('/upload/image', formData);
  return response.data.url;
};
```

### Storage Structure (Supabase)
```
storage/
├── avatars/{userId}.jpg
├── job-images/{jobId}/image-1.jpg
├── documents/{userId}/resume.pdf
└── portfolios/{contractorId}/project-1.jpg
```

---

## 8. Real-Time Features

### Supabase Realtime Setup

```typescript
// services/realtime.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);

export const subscribeToMessages = (
  conversationId: string,
  callback: (message: Message) => void
) => {
  const subscription = supabase
    .channel(`messages:${conversationId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `conversation_id=eq.${conversationId}`,
    }, (payload) => {
      callback(payload.new as Message);
    })
    .subscribe();

  return () => subscription.unsubscribe();
};
```

### React Query Integration

```typescript
export const [MessagesContext, useMessages] = createContextHook(() => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = subscribeToMessages('*', (newMessage) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    });
    return unsubscribe;
  }, []);

  return {...};
});
```

---

## 9. Security Requirements

### Security Checklist

**Authentication:**
- [ ] JWT with refresh tokens
- [ ] bcrypt password hashing (12+ rounds)
- [ ] Rate limiting (5 attempts per 15 min)
- [ ] Account lockout after failures
- [ ] Email verification

**Authorization:**
- [ ] Role-based access control
- [ ] Permission verification on endpoints
- [ ] Row Level Security (RLS)
- [ ] Resource ownership validation

**Data Protection:**
- [ ] HTTPS only
- [ ] Secure storage (expo-secure-store)
- [ ] Input sanitization
- [ ] SQL injection prevention
- [ ] File upload validation

**API Security:**
- [ ] Rate limiting (100 req/min)
- [ ] Request validation
- [ ] CORS configuration
- [ ] Security headers
- [ ] Audit logging

---

## 10. Testing Strategy

### Test Coverage Goals
- **Unit Tests**: 80% coverage
- **Integration Tests**: Key flows
- **E2E Tests**: Critical paths

### Key Test Scenarios

**Authentication:**
- [ ] Registration with valid data
- [ ] Login with valid credentials
- [ ] Token refresh on 401
- [ ] Social auth flows
- [ ] Logout clears data

**Job Management:**
- [ ] Create job as PM
- [ ] Apply to job as contractor
- [ ] Accept/reject applications
- [ ] Update job status

**Real-time:**
- [ ] Receive new messages
- [ ] Receive notifications
- [ ] Update unread counts

---

## 11. Performance Requirements

### Performance Targets
- **Initial Load**: < 3 seconds
- **Time to Interactive**: < 5 seconds
- **API Response**: < 500ms (95th percentile)
- **Image Load**: < 2 seconds
- **Scroll FPS**: 60 FPS
- **Bundle Size**: < 10 MB

### Optimization Strategies

```typescript
// List Optimization
<FlatList
  data={jobs}
  renderItem={renderJob}
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={5}
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
/>
```

---

## 12. Deployment Architecture

### Infrastructure
```
Mobile Apps (iOS/Android) → API Gateway → Backend
                         ↓
                    Web App (Vercel/Netlify)
                         ↓
                    Database (PostgreSQL)
                         ↓
                    Storage (S3/Supabase)
```

### Environment Configuration

**Development:**
- Local/dev backend
- Development database
- No analytics

**Staging:**
- Staging backend
- Staging database
- Test analytics

**Production:**
- Production backend
- Production database
- Full monitoring

### EAS Build Configuration

```json
// eas.json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_ENVIRONMENT": "production"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com"
      }
    }
  }
}
```

---

## 13. Construction Management System Implementation

### 13.1 Construction Management Workflow Architecture

The construction management system follows a state machine pattern with automated transitions:

```typescript
// Project state flow
type ProjectState = 
  | 'bid_accepted'        // Initial state
  | 'contract_generation' // AI generating contract
  | 'contract_review'     // Owner reviewing
  | 'escrow_funding'      // Awaiting escrow deposit
  | 'team_assembly'       // Sub-bidding phase
  | 'active'              // Construction in progress
  | 'dispute'             // Dispute filed
  | 'final_inspection'    // Punch list phase
  | 'completed'           // All done
  | 'cancelled';          // Terminated

// Milestone state flow
type MilestoneState =
  | 'not_started'
  | 'in_progress'
  | 'pending_review'      // Submitted, awaiting owner
  | 'ai_reviewing'        // AI analyzing proof
  | 'owner_reviewing'     // Owner reviewing
  | 'approved'            // Payment released
  | 'needs_revision'      // Rejected with feedback
  | 'disputed';           // Formal dispute filed
```

### 13.2 AI Integration Requirements

#### AI Contract Generation
```typescript
// services/ai/contract-generation.ts
import { generateObject } from '@rork/toolkit-sdk';
import { z } from 'zod';

const ContractSchema = z.object({
  scopeOfWork: z.object({
    phases: z.array(z.object({
      name: z.string(),
      description: z.string(),
      tasks: z.array(z.string()),
      deliverables: z.array(z.string()),
      duration: z.number(),
    })),
    materials: z.array(z.object({
      item: z.string(),
      specification: z.string(),
      quantity: z.string(),
      suppliedBy: z.enum(['owner', 'contractor']),
    })),
    exclusions: z.array(z.string()),
  }),
  paymentSchedule: z.object({
    milestones: z.array(z.object({
      name: z.string(),
      percentage: z.number(),
      criteria: z.array(z.string()),
    })),
  }),
  legalTerms: z.object({
    warranties: z.array(z.string()),
    insuranceRequirements: z.array(z.string()),
    terminationClauses: z.array(z.string()),
    disputeResolution: z.string(),
    applicableLaws: z.string(),
  }),
});

export async function generateContract(bid: Bid): Promise<Contract> {
  const contract = await generateObject({
    messages: [{
      role: 'user',
      content: `Generate a construction contract based on this bid:
        Trade: ${bid.tradeType}
        Scope: ${bid.description}
        Budget: ${bid.amount}
        Timeline: ${bid.timeline}
        Location: ${bid.location}
        
        Include:
        - Detailed scope of work in CSI format
        - Payment milestones (20-30% tranches)
        - State-specific legal terms for ${bid.state}
        - Standard AIA contract clauses
        - Non-performance clauses
        - Warranty provisions`
    }],
    schema: ContractSchema,
  });

  return contract;
}
```

#### AI Progress Monitoring
```typescript
// services/ai/progress-monitoring.ts
import { generateObject, generateText } from '@rork/toolkit-sdk';

const ProgressAnalysisSchema = z.object({
  workQuality: z.enum(['excellent', 'good', 'acceptable', 'poor']),
  completionStatus: z.number().min(0).max(100),
  issuesDetected: z.array(z.object({
    type: z.enum(['quality', 'safety', 'incomplete', 'incorrect']),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    description: z.string(),
    location: z.string().optional(),
  })),
  recommendations: z.array(z.string()),
  complianceCheck: z.object({
    meetsSpecifications: z.boolean(),
    safetyCompliant: z.boolean(),
    onSchedule: z.boolean(),
  }),
});

export async function analyzeProgressPhotos(
  photos: string[],  // base64 images
  milestone: Milestone,
  scope: ScopeOfWork
): Promise<ProgressAnalysis> {
  const analysis = await generateObject({
    messages: [{
      role: 'user',
      content: [
        { 
          type: 'text', 
          text: `Analyze these construction progress photos for milestone: ${milestone.name}
            
            Required work: ${milestone.description}
            Acceptance criteria: ${milestone.acceptanceCriteria.join(', ')}
            Specifications: ${JSON.stringify(scope.specifications)}
            
            Evaluate:
            1. Work quality and craftsmanship
            2. Completion percentage
            3. Safety compliance (PPE, hazards)
            4. Specification compliance
            5. Any issues or concerns`
        },
        ...photos.map(photo => ({ type: 'image', image: photo })),
      ]
    }],
    schema: ProgressAnalysisSchema,
  });

  return analysis;
}

export async function detectDelays(
  project: Project,
  milestones: Milestone[],
  updates: ProgressUpdate[]
): Promise<DelayAlert[]> {
  const alerts: DelayAlert[] = [];

  // Check missing updates
  const lastUpdate = updates[0]?.createdAt;
  if (lastUpdate && Date.now() - lastUpdate > 24 * 60 * 60 * 1000) {
    alerts.push({
      type: 'missing_update',
      severity: 'medium',
      message: 'No progress update posted in 24 hours',
    });
  }

  // Check overdue milestones
  for (const milestone of milestones) {
    if (
      milestone.status === 'in_progress' &&
      new Date(milestone.dueDate) < new Date()
    ) {
      const daysOverdue = Math.floor(
        (Date.now() - new Date(milestone.dueDate).getTime()) / (24 * 60 * 60 * 1000)
      );
      alerts.push({
        type: 'milestone_overdue',
        severity: daysOverdue > 5 ? 'high' : 'medium',
        message: `Milestone "${milestone.name}" is ${daysOverdue} days overdue`,
        milestoneId: milestone.id,
      });
    }
  }

  return alerts;
}
```

#### Auto-Generated Timeline
```typescript
// services/ai/timeline-generation.ts
export async function generateProjectTimeline(
  scope: ScopeOfWork,
  startDate: Date
): Promise<Timeline> {
  const TimelineSchema = z.object({
    phases: z.array(z.object({
      name: z.string(),
      startDay: z.number(),
      durationDays: z.number(),
      milestones: z.array(z.object({
        name: z.string(),
        dayOffset: z.number(),
        paymentPercentage: z.number(),
        dependencies: z.array(z.string()),
        deliverables: z.array(z.string()),
      })),
    })),
    criticalPath: z.array(z.string()),
    totalDuration: z.number(),
  });

  const timeline = await generateObject({
    messages: [{
      role: 'user',
      content: `Generate a construction project timeline:
        
        Scope: ${JSON.stringify(scope.phases)}
        Start Date: ${startDate}
        
        Create:
        - Phases with realistic durations
        - Milestones with payment percentages (20-30% each)
        - Task dependencies
        - Critical path calculation
        - Account for inspections and approvals`
    }],
    schema: TimelineSchema,
  });

  return timeline;
}
```

---

### 13.3 Database Schema for Construction Management

#### Projects Table (Enhanced)
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bid_id UUID NOT NULL REFERENCES bids(id),
  job_id UUID REFERENCES jobs(id),
  owner_id UUID NOT NULL REFERENCES users(id),
  contractor_id UUID NOT NULL REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'setup',
  start_date DATE,
  end_date DATE,
  actual_start_date DATE,
  actual_end_date DATE,
  total_amount DECIMAL(12, 2) NOT NULL,
  paid_amount DECIMAL(12, 2) DEFAULT 0,
  escrow_balance DECIMAL(12, 2) DEFAULT 0,
  completion_percentage INTEGER DEFAULT 0,
  ai_monitoring_enabled BOOLEAN DEFAULT true,
  daily_updates_required BOOLEAN DEFAULT true,
  last_update_at TIMESTAMP WITH TIME ZONE,
  contract_generated_at TIMESTAMP WITH TIME ZONE,
  contract_signed_at TIMESTAMP WITH TIME ZONE,
  escrow_funded_at TIMESTAMP WITH TIME ZONE,
  work_started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_owner ON projects(owner_id);
CREATE INDEX idx_projects_contractor ON projects(contractor_id);
```

#### Scope of Work Table
```sql
CREATE TABLE project_scope (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  version INTEGER DEFAULT 1,
  work_breakdown JSONB NOT NULL,
  materials JSONB,
  requirements JSONB,
  exclusions TEXT[],
  approved_by_owner BOOLEAN DEFAULT false,
  approved_by_contractor BOOLEAN DEFAULT false,
  owner_signature TEXT,
  contractor_signature TEXT,
  owner_signed_at TIMESTAMP WITH TIME ZONE,
  contractor_signed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### AI Contract Generation Table
```sql
CREATE TABLE ai_generated_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  bid_id UUID NOT NULL REFERENCES bids(id),
  generated_contract JSONB NOT NULL,
  generation_time_ms INTEGER,
  ai_model_version VARCHAR(50),
  owner_edits JSONB,
  contractor_edits JSONB,
  final_contract JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

#### Contracts Table
```sql
CREATE TABLE project_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  scope_id UUID REFERENCES project_scope(id),
  contract_type VARCHAR(50) NOT NULL,
  terms JSONB NOT NULL,
  payment_schedule JSONB NOT NULL,
  warranty_terms JSONB,
  dispute_resolution JSONB,
  insurance_requirements JSONB,
  owner_signed BOOLEAN DEFAULT false,
  contractor_signed BOOLEAN DEFAULT false,
  owner_signature TEXT,
  contractor_signature TEXT,
  owner_signed_at TIMESTAMP WITH TIME ZONE,
  contractor_signed_at TIMESTAMP WITH TIME ZONE,
  fully_executed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Milestones Table
```sql
CREATE TABLE project_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  payment_amount DECIMAL(12, 2) NOT NULL,
  deliverables TEXT[],
  acceptance_criteria TEXT[],
  status VARCHAR(50) DEFAULT 'not_started',
  order_number INTEGER NOT NULL,
  depends_on UUID REFERENCES project_milestones(id),
  submitted_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES users(id),
  rejection_reason TEXT,
  revision_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_milestones_project ON project_milestones(project_id);
CREATE INDEX idx_milestones_status ON project_milestones(status);
```

#### AI Progress Analysis Table
```sql
CREATE TABLE ai_progress_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id UUID NOT NULL REFERENCES project_milestones(id),
  progress_update_id UUID REFERENCES progress_updates(id),
  analysis_result JSONB NOT NULL,
  work_quality VARCHAR(50),
  completion_percentage INTEGER,
  issues_detected JSONB,
  recommendations TEXT[],
  compliance_check JSONB,
  analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ai_analysis_milestone ON ai_progress_analysis(milestone_id);

#### Progress Updates Table (Enhanced)
```sql
CREATE TABLE progress_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES project_milestones(id),
  contractor_id UUID NOT NULL REFERENCES users(id),
  update_type VARCHAR(50) DEFAULT 'daily',
  work_completed TEXT,
  work_planned TEXT,
  issues TEXT,
  hours_worked DECIMAL(5, 2),
  crew_members INTEGER,
  photos TEXT[],
  videos TEXT[],
  gps_location JSONB,
  weather_conditions VARCHAR(100),
  ai_analyzed BOOLEAN DEFAULT false,
  ai_analysis_id UUID REFERENCES ai_progress_analysis(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_progress_updates_project ON progress_updates(project_id);
```

#### Payments & Escrow Table
```sql
CREATE TABLE project_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES project_milestones(id),
  payment_type VARCHAR(50) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  payment_method VARCHAR(50),
  transaction_id VARCHAR(255),
  paid_by UUID REFERENCES users(id),
  paid_to UUID REFERENCES users(id),
  escrow_held BOOLEAN DEFAULT false,
  released_at TIMESTAMP WITH TIME ZONE,
  invoice_url TEXT,
  receipt_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_payments_project ON project_payments(project_id);
```

#### Change Orders Table
```sql
CREATE TABLE change_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  scope_id UUID REFERENCES project_scope(id),
  requested_by UUID NOT NULL REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  reason TEXT,
  cost_impact DECIMAL(12, 2),
  timeline_impact INTEGER,
  documentation JSONB,
  status VARCHAR(50) DEFAULT 'pending',
  approved_by_owner BOOLEAN DEFAULT false,
  approved_by_contractor BOOLEAN DEFAULT false,
  owner_signature TEXT,
  contractor_signature TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE
);
```

#### Timeline & Alerts Table
```sql
CREATE TABLE project_timelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  ai_generated BOOLEAN DEFAULT true,
  phases JSONB NOT NULL,
  critical_path JSONB,
  total_duration_days INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE project_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID REFERENCES users(id),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_alerts_project ON project_alerts(project_id);
CREATE INDEX idx_alerts_severity ON project_alerts(severity);

#### Disputes Table (Enhanced)
```sql
CREATE TABLE disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES project_milestones(id),
  filed_by UUID NOT NULL REFERENCES users(id),
  dispute_type VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  evidence JSONB,
  amount_disputed DECIMAL(12, 2),
  desired_resolution TEXT,
  status VARCHAR(50) DEFAULT 'filed',
  resolution_stage VARCHAR(50) DEFAULT 'internal',
  chat_logs JSONB,
  flagged_clauses TEXT[],
  auto_generated_demand_letter TEXT,
  admin_assigned UUID REFERENCES users(id),
  resolution TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_disputes_project ON disputes(project_id);
CREATE INDEX idx_disputes_status ON disputes(status);
```

#### Approvals Table
```sql
CREATE TABLE milestone_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id UUID NOT NULL REFERENCES project_milestones(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES users(id),
  decision VARCHAR(50) NOT NULL,
  comments TEXT,
  issues_found TEXT[],
  photos TEXT[],
  reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Project Documents Table
```sql
CREATE TABLE project_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  uploaded_by UUID NOT NULL REFERENCES users(id),
  milestone_id UUID REFERENCES project_milestones(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

#### Sub-Contractor Bids Table
```sql
CREATE TABLE sub_contractor_bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  trade_type VARCHAR(100) NOT NULL,
  scope_description TEXT NOT NULL,
  bidder_id UUID NOT NULL REFERENCES users(id),
  bid_amount DECIMAL(12, 2) NOT NULL,
  timeline_days INTEGER,
  proposal TEXT,
  qualifications JSONB,
  status VARCHAR(50) DEFAULT 'submitted',
  selected BOOLEAN DEFAULT false,
  selected_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sub_bids_project ON sub_contractor_bids(project_id);

#### Role Assignments Table
```sql
CREATE TABLE project_role_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  role VARCHAR(50) NOT NULL,
  permissions JSONB NOT NULL,
  assigned_by UUID REFERENCES users(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

CREATE INDEX idx_role_assignments_project ON project_role_assignments(project_id);

---

### 13.4 API Endpoints for Construction Management

#### Project Endpoints
```typescript
// POST /projects - Create project from accepted bid
// GET /projects - Get all projects for user
// GET /projects/:id - Get project details
// PATCH /projects/:id - Update project
// DELETE /projects/:id - Cancel project

// Scope of Work
// POST /projects/:id/scope - Create scope of work
// GET /projects/:id/scope - Get current scope
// PATCH /projects/:id/scope/:scopeId - Update scope
// POST /projects/:id/scope/:scopeId/sign - Sign scope

// Contracts
// POST /projects/:id/contracts - Create contract
// GET /projects/:id/contracts/:contractId - Get contract
// POST /projects/:id/contracts/:contractId/sign - Sign contract

// Milestones
// POST /projects/:id/milestones - Create milestone
// GET /projects/:id/milestones - Get all milestones
// PATCH /projects/:id/milestones/:milestoneId - Update milestone
// POST /projects/:id/milestones/:milestoneId/submit - Submit for review
// POST /projects/:id/milestones/:milestoneId/approve - Approve milestone
// POST /projects/:id/milestones/:milestoneId/reject - Reject milestone

// Progress Updates
// POST /projects/:id/updates - Create progress update
// GET /projects/:id/updates - Get all updates
// GET /projects/:id/updates/:updateId - Get specific update

// Payments
// POST /projects/:id/payments/deposit - Deposit to escrow
// GET /projects/:id/payments - Get payment history
// POST /projects/:id/payments/:paymentId/release - Release payment

// Change Orders
// POST /projects/:id/change-orders - Create change order
// GET /projects/:id/change-orders - Get all change orders
// POST /projects/:id/change-orders/:orderId/approve - Approve change order
// POST /projects/:id/change-orders/:orderId/reject - Reject change order

// Disputes
// POST /projects/:id/disputes - File dispute
// GET /projects/:id/disputes - Get all disputes
// POST /projects/:id/disputes/:disputeId/respond - Respond to dispute
// PATCH /projects/:id/disputes/:disputeId - Update dispute status

// Completion
// POST /projects/:id/complete - Mark project complete
// POST /projects/:id/punch-list - Create punch list
// POST /projects/:id/final-approval - Final approval
```

---

### 13.3 Context/State Management

#### ProjectsContext
```typescript
// contexts/ProjectsContext.tsx
export const [ProjectsContext, useProjects] = createContextHook(() => {
  const queryClient = useQueryClient();

  const projectsQuery = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.fetchProjects,
  });

  const createProjectMutation = useMutation({
    mutationFn: projectsApi.createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  return {
    projects: projectsQuery.data || [],
    isLoading: projectsQuery.isLoading,
    createProject: createProjectMutation.mutate,
  };
});

// Custom hooks for filtered data
export function useActiveProjects() {
  const { projects } = useProjects();
  return useMemo(
    () => projects.filter(p => p.status === 'active'),
    [projects]
  );
}
```

---

### 13.4 Payment Integration

#### Stripe Integration
```typescript
// services/payments/stripe.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const createEscrowPaymentIntent = async (
  projectId: string,
  amount: number
) => {
  return await stripe.paymentIntents.create({
    amount: amount * 100,
    currency: 'usd',
    metadata: {
      projectId,
      type: 'escrow_deposit',
    },
    transfer_group: projectId,
  });
};

export const releaseMilestonePayment = async (
  milestoneId: string,
  contractorStripeAccountId: string,
  amount: number
) => {
  return await stripe.transfers.create({
    amount: amount * 100,
    currency: 'usd',
    destination: contractorStripeAccountId,
    metadata: { milestoneId },
  });
};
```

#### Alternative: Payment Provider Agnostic
```typescript
// services/payments/interface.ts
export interface PaymentProvider {
  createEscrow(projectId: string, amount: number): Promise<PaymentIntent>;
  releasePayment(milestoneId: string, amount: number): Promise<Transfer>;
  refund(paymentId: string, amount: number): Promise<Refund>;
  holdFunds(disputeId: string, amount: number): Promise<Hold>;
}

// Support multiple providers: Stripe, PayPal, Square, etc.
```

---

### 13.5 E-Signature Integration

#### DocuSign Integration
```typescript
// services/signatures/docusign.ts
import docusign from 'docusign-esign';

export const sendForSignature = async (
  documentData: {
    projectId: string;
    documentType: 'scope' | 'contract';
    ownerEmail: string;
    contractorEmail: string;
    documentUrl: string;
  }
) => {
  const envelope = {
    emailSubject: `Sign ${documentData.documentType} for project`,
    documents: [{
      documentBase64: await fetchDocumentBase64(documentData.documentUrl),
      name: `${documentData.documentType}.pdf`,
      fileExtension: 'pdf',
    }],
    recipients: {
      signers: [
        {
          email: documentData.ownerEmail,
          name: 'Owner',
          recipientId: '1',
          routingOrder: '1',
        },
        {
          email: documentData.contractorEmail,
          name: 'Contractor',
          recipientId: '2',
          routingOrder: '2',
        },
      ],
    },
  };

  return await docusignApi.createEnvelope(envelope);
};
```

---

### 13.6 File Storage Structure

```
storage/
├── projects/
│   ├── {projectId}/
│   │   ├── scope/
│   │   │   ├── v1.pdf
│   │   │   ├── v2.pdf
│   │   ├── contracts/
│   │   │   ├── contract.pdf
│   │   │   ├── signed-contract.pdf
│   │   ├── milestones/
│   │   │   ├── {milestoneId}/
│   │   │   │   ├── proof/
│   │   │   │   │   ├── photo-1.jpg
│   │   │   │   │   ├── photo-2.jpg
│   │   │   │   ├── documents/
│   │   │   │   │   ├── invoice.pdf
│   │   ├── progress/
│   │   │   ├── {date}/
│   │   │   │   ├── update-photos/
│   │   │   │   │   ��── 1.jpg
│   │   │   │   ├── videos/
│   │   ├── change-orders/
│   │   │   ├── {changeOrderId}/
│   │   │   │   ├── documentation.pdf
│   │   ├── disputes/
│   │   │   ├── {disputeId}/
│   │   │   │   ├── evidence/
│   │   ├── completion/
│   │   │   ├── final-photos/
│   │   │   ├── warranties/
│   │   │   ├── certificates/
```

---

### 13.7 Real-Time Updates

```typescript
// services/realtime-projects.ts
export const subscribeToProject = (
  projectId: string,
  callbacks: {
    onMilestoneUpdate: (milestone: Milestone) => void;
    onProgressUpdate: (update: ProgressUpdate) => void;
    onPaymentUpdate: (payment: Payment) => void;
    onDisputeUpdate: (dispute: Dispute) => void;
  }
) => {
  const subscription = supabase
    .channel(`project:${projectId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'project_milestones',
      filter: `project_id=eq.${projectId}`,
    }, (payload) => {
      callbacks.onMilestoneUpdate(payload.new as Milestone);
    })
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'progress_updates',
      filter: `project_id=eq.${projectId}`,
    }, (payload) => {
      callbacks.onProgressUpdate(payload.new as ProgressUpdate);
    })
    .subscribe();

  return () => subscription.unsubscribe();
};
```

---

### 13.8 Notification Rules

```typescript
// Project notification triggers
const projectNotifications = {
  // To Owner
  'milestone.submitted': {
    recipient: 'owner',
    title: 'Milestone Ready for Review',
    priority: 'high',
  },
  'progress.updated': {
    recipient: 'owner',
    title: 'Progress Update Posted',
    priority: 'normal',
  },
  'change_order.requested': {
    recipient: 'owner',
    title: 'Change Order Requested',
    priority: 'high',
  },
  
  // To Contractor
  'milestone.approved': {
    recipient: 'contractor',
    title: 'Milestone Approved',
    priority: 'high',
  },
  'milestone.rejected': {
    recipient: 'contractor',
    title: 'Milestone Needs Revision',
    priority: 'high',
  },
  'payment.released': {
    recipient: 'contractor',
    title: 'Payment Released',
    priority: 'high',
  },
  
  // To Both
  'dispute.filed': {
    recipient: 'both',
    title: 'Dispute Filed',
    priority: 'critical',
  },
  'change_order.approved': {
    recipient: 'both',
    title: 'Change Order Approved',
    priority: 'high',
  },
};
```

---

### 13.9 Security & Permissions

#### Row Level Security Policies
```sql
-- Projects: Users can only see their own projects
CREATE POLICY "Users can view own projects" ON projects
  FOR SELECT USING (
    owner_id = auth.uid() OR contractor_id = auth.uid()
  );

-- Milestones: Read if part of project
CREATE POLICY "Project participants can view milestones" ON project_milestones
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE owner_id = auth.uid() OR contractor_id = auth.uid()
    )
  );

-- Contractor can update milestones
CREATE POLICY "Contractor can update milestones" ON project_milestones
  FOR UPDATE USING (
    project_id IN (
      SELECT id FROM projects WHERE contractor_id = auth.uid()
    )
  );

-- Owner can approve/reject
CREATE POLICY "Owner can approve milestones" ON milestone_approvals
  FOR INSERT WITH CHECK (
    milestone_id IN (
      SELECT m.id FROM project_milestones m
      JOIN projects p ON m.project_id = p.id
      WHERE p.owner_id = auth.uid()
    )
  );
```

---

### 13.10 Admin Dashboard Requirements

#### Project Management (Admin)
- View all active projects
- Monitor project health (on-time, at-risk, delayed)
- View escrow balances
- Manage disputes:
  - Assign to admin mediator
  - Review evidence
  - Make decisions
  - Track resolution progress
- Payment oversight:
  - View all transactions
  - Manual payment release (if needed)
  - Refund processing
  - Hold/freeze payments
- Change order approval (if policy requires)
- Force project completion/cancellation
- Generate reports:
  - Projects by status
  - Payment analytics
  - Dispute resolution metrics
  - Average project duration
  - Milestone approval rates

---

## 14. Development Roadmap

### Phase 1: Backend Setup
- [ ] Choose backend technology
- [ ] Set up database schema (including project management tables)
- [ ] Configure authentication
- [ ] Implement RLS policies
- [ ] Create API endpoints (jobs, bids, appointments)
- [ ] Set up file storage
- [ ] Test all endpoints

### Phase 2: Frontend Integration
- [ ] Create API service layer
- [ ] Migrate AuthContext
- [ ] Migrate JobsContext
- [ ] Migrate AppointmentsContext
- [ ] Create BidsContext
- [ ] Implement token refresh
- [ ] Remove mock data
- [ ] Test all flows

### Phase 3: Advanced Features
- [ ] Social authentication
- [ ] Image upload
- [ ] Document upload
- [ ] Real-time messaging
- [ ] Real-time notifications
- [ ] Push notifications

### Phase 4: Project Management System
- [ ] Database schema for projects, milestones, payments
- [ ] Project creation from accepted bids
- [ ] Scope of work management
- [ ] Contract generation and signing
- [ ] Milestone management
- [ ] Progress tracking
- [ ] Photo/video uploads
- [ ] Approval/rejection workflow
- [ ] Change order system

### Phase 5: Payment & Escrow
- [ ] Choose payment provider (Stripe recommended)
- [ ] Set up payment processing
- [ ] Implement escrow system
- [ ] Milestone-based payment release
- [ ] Invoice generation
- [ ] Receipt generation
- [ ] Payment notifications
- [ ] Refund processing

### Phase 6: Dispute Resolution
- [ ] Dispute filing system
- [ ] Evidence upload
- [ ] Communication threads for disputes
- [ ] Admin mediation dashboard
- [ ] Resolution workflow
- [ ] Payment holds during disputes
- [ ] Resolution notifications

### Phase 7: E-Signatures & Legal
- [ ] Choose e-signature provider (DocuSign/HelloSign)
- [ ] Contract template system
- [ ] Digital signature integration
- [ ] Document version control
- [ ] Signed document storage
- [ ] Lien waiver generation
- [ ] Compliance documentation

### Phase 8: Production Ready
- [ ] Fix all bugs
- [ ] Error tracking (Sentry)
- [ ] Analytics setup
- [ ] Performance optimization
- [ ] Documentation
- [ ] Device testing
- [ ] Security audit
- [ ] Payment gateway testing

### Phase 9: Deployment
- [ ] Configure EAS builds
- [ ] Build iOS and Android
- [ ] App Store listing
- [ ] Google Play listing
- [ ] Submit for review
- [ ] Deploy web app
- [ ] Monitoring setup
- [ ] Payment provider production setup

---

## Development Commands

```bash
# Start development
bun run start

# Start web preview
bun run start-web

# Run linter
bun run lint

# Build for production
eas build --platform all --profile production

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

---

This technical requirements document provides the complete technical specification for implementing and deploying the Bidroom Construction Platform. Use in conjunction with the Functional Requirements document for full project scope.
