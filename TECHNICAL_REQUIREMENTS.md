# Bidroom Construction Platform - Technical Requirements

## Table of Contents
1. [Technology Stack](#technology-stack)
2. [Architecture Overview](#architecture-overview)
3. [Rork Platform Integration](#rork-platform-integration)
4. [Backend Integration](#backend-integration)
5. [Database Schema](#database-schema)
6. [API Specifications](#api-specifications)
7. [Authentication Implementation](#authentication-implementation)
8. [File Upload Architecture](#file-upload-architecture)
9. [Real-Time Features](#real-time-features)
10. [Security Requirements](#security-requirements)
11. [Testing Strategy](#testing-strategy)
12. [Performance Requirements](#performance-requirements)
13. [Deployment Architecture](#deployment-architecture)
14. [Construction Management System Implementation](#construction-management-system-implementation)
15. [Notification System](#notification-system)
16. [Development Roadmap](#development-roadmap)

---

## 1. Technology Stack

### Frontend (Mobile & Web)
- **React Native** 0.81.5
- **React** 19.1.0
- **Expo SDK** 54.0.20+ (latest)
- **Expo Router** v6.0.13 (file-based routing)
- **TypeScript** 5.9.2 (strict mode)
- **React Query** v5.90.5 (TanStack Query)
- **AsyncStorage** 2.2.0 for local persistence
- **Lucide React Native** 0.475.0 for icons
- **React Native Gesture Handler** 2.28.0
- **React Native Safe Area Context** 5.6.0
- **React Native SVG** 15.12.1
- **Expo Image** 3.0.10
- **Expo Linear Gradient** 15.0.7
- **Expo Blur** 15.0.7
- **Zod** 4.1.12 (schema validation)
- **Bun** (package manager and runtime)

### State Management
- **@nkzw/create-context-hook** 1.1.0 for context providers
- **React Query** for server state management
- **AsyncStorage** for local data persistence
- **useState** for component-level local state
- **Zustand** 5.0.2 (optional, only if already in project code)

### Rork Platform Features (Built-in)
- **@rork/toolkit-sdk**: AI capabilities available globally
  - **AI Chat Agent**: Conversational AI with tool calling
  - **Text Generation**: LLM-powered text generation
  - **Object Generation**: Structured data generation with Zod schemas
  - **Image Generation**: DALL-E 3 image creation
  - **Image Editing**: Gemini 2.5 Flash Image editing
  - **Speech-to-Text**: Audio transcription
- **Platform Integration**: No installation needed, globally available via TypeScript path mapping
- **AI-Powered Features**: Contract generation, progress monitoring, dispute resolution

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
│   │   ├── (home)/              # Home tab with stack
│   │   │   ├── _layout.tsx     # Home stack layout
│   │   │   └── index.tsx       # Home/Dashboard screen
│   │   ├── jobs.tsx             # Jobs listing
│   │   ├── contractors.tsx      # Contractors directory
│   │   ├── bids.tsx             # Bids management
│   │   ├── schedule.tsx         # Appointments
│   │   └── profile.tsx          # User profile
│   ├── _layout.tsx              # Root layout
│   ├── login.tsx                # Login screen
│   ├── register.tsx             # Registration
│   ├── onboarding.tsx           # Onboarding flow
│   ├── job-details.tsx          # Job detail view
│   ├── bid-details.tsx          # Bid detail view
│   ├── appointment-details.tsx  # Appointment detail
│   ├── contractor-profile.tsx   # Contractor profile
│   ├── messages.tsx             # Messaging
│   ├── notifications.tsx        # Notifications
│   ├── settings.tsx             # App settings
│   ├── privacy.tsx              # Privacy settings
│   ├── help.tsx                 # Help & Support
│   ├── terms.tsx                # Terms of Service
│   ├── edit-profile.tsx         # Edit profile
│   ├── project-setup.tsx        # Project setup (new)
│   └── project-dashboard.tsx    # Project dashboard
│
├── contexts/                     # Global state
│   ├── AuthContext.tsx          # Authentication
│   ├── JobsContext.tsx          # Jobs & applications
│   ├── AppointmentsContext.tsx  # Appointments
│   ├── BidsContext.tsx          # Bids management
│   ├── ProjectsContext.tsx      # Projects management
│   └── NotificationsContext.tsx # Notifications
│
├── components/                   # Reusable components
│   ├── VerificationModal.tsx    # Verification UI
│   ├── TrustSuggestions.tsx     # Trust indicators
│   ├── NotificationBell.tsx     # Notification icon
│   ├── SafeImage.tsx            # Safe image component
│   └── dashboards/
│       ├── OwnerDashboard.tsx   # Owner dashboard
│       └── ContractorDashboard.tsx # Contractor dashboard
│
├── services/                     # API services (to be created)
│   ├── api/
│   │   ├── auth.ts             # Auth endpoints
│   │   ├── jobs.ts             # Jobs endpoints
│   │   ├── appointments.ts     # Appointment endpoints
│   │   ├── bids.ts             # Bids endpoints
│   │   ├── messages.ts         # Messaging endpoints
│   │   ├── notifications.ts    # Notification endpoints
│   │   └── projects.ts         # Projects endpoints
│   ├── ai/
│   │   ├── contract-generation.ts    # AI contract generation
│   │   ├── progress-monitoring.ts    # AI progress analysis
│   │   └── timeline-generation.ts    # AI timeline generation
│   ├── payments/
│   │   └── stripe.ts           # Payment processing
│   ├── signatures/
│   │   └── docusign.ts         # E-signature integration
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
│   ├── trust.ts                # Trust score calculations
│   └── dashboard.ts            # Dashboard utilities
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
- Login (outside tabs, modal presentation)
- Register (outside tabs, modal presentation)
- Onboarding (outside tabs, full screen)
- Main App (tabs)
- Project Setup (modal presentation)
- Project Dashboard (full screen)

**Tab Navigation:**
1. Home - Dashboard with stats (nested stack)
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

## 3. Rork Platform Integration

### 3.1 AI Capabilities via @rork/toolkit-sdk

The Rork platform provides built-in AI capabilities that are globally available without installation. These capabilities are accessed via `@rork/toolkit-sdk`, which is automatically available through TypeScript path mapping.

#### Important: DO NOT Install @rork/toolkit-sdk
```typescript
// ❌ NEVER DO THIS - Do not add to package.json or install
npm install @rork/toolkit-sdk

// ✅ CORRECT - Just import and use directly
import { generateText, generateObject } from '@rork/toolkit-sdk';
```

The package is globally available and will NOT appear in:
- package.json dependencies
- bun.lock
- node_modules

This is by design and uses TypeScript path mapping configured in the Rork environment.

### 3.2 AI Text Generation

```typescript
import { generateText } from '@rork/toolkit-sdk';

// Simple text generation
const summary = await generateText("Summarize this project scope...");

// With message history
const response = await generateText({
  messages: [
    { role: 'user', content: 'What are the key milestones?' },
    { role: 'assistant', content: 'The project has 5 milestones...' },
    { role: 'user', content: 'Explain the first one' }
  ]
});
```

### 3.3 AI Structured Object Generation

```typescript
import { generateObject } from '@rork/toolkit-sdk';
import { z } from 'zod';

const ContractSchema = z.object({
  scopeOfWork: z.object({
    phases: z.array(z.object({
      name: z.string(),
      description: z.string(),
      duration: z.number()
    }))
  }),
  paymentSchedule: z.object({
    milestones: z.array(z.object({
      name: z.string(),
      percentage: z.number()
    }))
  })
});

const contract = await generateObject({
  messages: [{
    role: 'user',
    content: `Generate contract for ${project.description}`
  }],
  schema: ContractSchema
});
```

### 3.4 AI Chat Agent with Tools

```typescript
import { createRorkTool, useRorkAgent } from '@rork/toolkit-sdk';

const { messages, sendMessage, addToolResult } = useRorkAgent({
  tools: {
    addTodo: createRorkTool({
      description: "Add a project milestone",
      zodSchema: z.object({
        title: z.string(),
        dueDate: z.string(),
        payment: z.number()
      }),
      execute(input) {
        // Automatically executed when AI calls this tool
        addMilestone(input);
      }
    })
  }
});

// Send message
await sendMessage("Add a milestone for foundation completion");

// Render messages
messages.map(m => (
  <View key={m.id}>
    {m.parts.map((part, i) => {
      if (part.type === 'text') {
        return <Text>{part.text}</Text>;
      }
      if (part.type === 'tool') {
        return <Text>Calling {part.toolName}...</Text>;
      }
    })}
  </View>
));
```

### 3.5 AI Image Generation

```typescript
// Uses DALL-E 3
const response = await fetch('https://toolkit.rork.com/images/generate/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: "Professional construction site photo",
    size: "1024x1024" // or "1024x1792" or "1792x1024"
  })
});

const { image } = await response.json();
// image.base64Data - base64 encoded image
// image.mimeType - image MIME type
```

### 3.6 AI Image Editing

```typescript
// Uses Gemini 2.5 Flash Image
const response = await fetch('https://toolkit.rork.com/images/edit/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: "Add safety equipment highlights",
    images: [{ type: 'image', image: base64Image }],
    aspectRatio: "16:9" // optional, defaults to "16:9"
  })
});

const { image } = await response.json();
```

### 3.7 Speech-to-Text

```typescript
// Audio transcription
const formData = new FormData();
formData.append('audio', {
  uri: recording.getURI(),
  name: 'recording.m4a',
  type: 'audio/m4a'
});

const response = await fetch('https://toolkit.rork.com/stt/transcribe/', {
  method: 'POST',
  body: formData
});

const { text, language } = await response.json();
```

### 3.8 Project Assets

Assets uploaded by users can be referenced and used:

```typescript
// If user mentions @asset_name, access it at:
const assetUrl = `https://rork.app/pa/${projectId}/asset_name`;

// Use with Expo Image
<Image 
  source={{ uri: assetUrl }} 
  style={{ width: 300, height: 200 }}
/>
```

---

## 4. Backend Integration

### 4.1 API Service Layer

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

// services/api/projects.ts
export const projectsApi = {
  fetchProjects: async () => {...},
  createProject: async (data: ProjectCreate) => {...},
  updateProject: async (id: string, data: ProjectUpdate) => {...},
  fetchMilestones: async (projectId: string) => {...},
  submitMilestone: async (milestoneId: string, proof: MilestoneProof) => {...},
  approveMilestone: async (milestoneId: string) => {...},
  rejectMilestone: async (milestoneId: string, reason: string) => {...}
}
```

### 4.2 React Query Integration

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

### 4.3 Environment Configuration

```typescript
// config/env.ts
export const config = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000',
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  googleAuthClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
  appleAuthClientId: process.env.EXPO_PUBLIC_APPLE_CLIENT_ID,
  stripePublishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  environment: process.env.EXPO_PUBLIC_ENVIRONMENT || 'development'
};
```

---

## 5. Database Schema

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
  type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  priority VARCHAR(20) DEFAULT 'normal',
  read BOOLEAN DEFAULT false,
  action_url TEXT,
  job_id UUID REFERENCES jobs(id),
  application_id UUID REFERENCES job_applications(id),
  appointment_id UUID REFERENCES appointments(id),
  bid_id UUID REFERENCES bids(id),
  project_id UUID REFERENCES projects(id),
  milestone_id UUID REFERENCES project_milestones(id),
  dispute_id UUID REFERENCES disputes(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_priority ON notifications(priority);
CREATE INDEX idx_notifications_read ON notifications(user_id, read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
```

### Construction Management Tables

#### Projects Table
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

#### AI Generated Contracts Table
```sql
CREATE TABLE ai_generated_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  bid_id UUID NOT NULL REFERENCES bids(id),
  owner_notes TEXT,
  generated_contract JSONB NOT NULL,
  california_law_provisions JSONB NOT NULL,
  generation_time_ms INTEGER,
  ai_model_version VARCHAR(50),
  owner_edits JSONB,
  contractor_edits JSONB,
  final_contract JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Project Milestones Table
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
```

#### Progress Updates Table
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

#### Disputes Table
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

-- Project participants can view projects
CREATE POLICY "Users can view own projects" ON projects
  FOR SELECT USING (
    owner_id = auth.uid() OR contractor_id = auth.uid()
  );
```

---

## 6. API Specifications

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

### Project Endpoints

```typescript
// POST /projects - Create project from accepted bid
// GET /projects - Get all projects for user
// GET /projects/:id - Get project details
// PATCH /projects/:id - Update project

// Milestones
// POST /projects/:id/milestones - Create milestone
// GET /projects/:id/milestones - Get all milestones
// POST /projects/:id/milestones/:milestoneId/submit - Submit for review
// POST /projects/:id/milestones/:milestoneId/approve - Approve milestone
// POST /projects/:id/milestones/:milestoneId/reject - Reject milestone

// Progress Updates
// POST /projects/:id/updates - Create progress update
// GET /projects/:id/updates - Get all updates

// Disputes
// POST /projects/:id/disputes - File dispute
// GET /projects/:id/disputes - Get all disputes
```

---

## 7. Authentication Implementation

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

## 8. File Upload Architecture

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
├── portfolios/{contractorId}/project-1.jpg
└── projects/
    └── {projectId}/
        ├── progress/{date}/photo-1.jpg
        ├── milestones/{milestoneId}/proof-1.jpg
        └── contracts/contract-signed.pdf
```

---

## 9. Real-Time Features

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

---

## 10. Security Requirements

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

## 11. Testing Strategy

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

**Project Management:**
- [ ] Create project from bid
- [ ] Submit milestone with proof
- [ ] Approve/reject milestone
- [ ] Payment release on approval

---

## 12. Performance Requirements

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

## 13. Deployment Architecture

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

---

## 14. Construction Management System Implementation

### 14.1 AI Contract Generation

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
  californiaProvisions: z.object({
    licensingRequirements: z.array(z.string()),
    mechanicsLienWarning: z.string(),
    insuranceRequirements: z.array(z.string()),
    paymentTerms: z.object({
      schedule: z.array(z.object({
        milestone: z.string(),
        percentage: z.number()
      })),
      retainage: z.number()
    })
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

export async function generateContract(
  bid: Bid, 
  ownerNotes: string
): Promise<Contract> {
  const contract = await generateObject({
    messages: [{
      role: 'user',
      content: `Generate a California-compliant construction contract based on:
        
        BID DETAILS:
        - Trade: ${bid.tradeType}
        - Scope: ${bid.description}
        - Budget: $${bid.amount.toLocaleString()}
        - Timeline: ${bid.timeline} days
        - Location: ${bid.location}, California
        
        OWNER NOTES:
        ${ownerNotes}
        
        REQUIREMENTS:
        1. Detailed scope of work in CSI format
        2. Payment milestones (20-30% tranches with retainage)
        3. California Contractors State License Law provisions:
           - License number requirements
           - Mechanics lien warning (per CA Civil Code § 8118)
           - Payment terms per CA Business & Professions Code § 7159
           - Required insurance (workers' comp, liability)
           - Right to cancel notice (3-day for home improvement)
        4. Owner protections:
           - Lien release requirements before payments
           - Performance guarantees
           - 1-year workmanship warranty
        5. Contractor protections:
           - Payment timeline guarantees
           - Scope change procedures
           - Suspension rights for non-payment
        6. Standard AIA contract clauses
        7. Dispute resolution (arbitration per CA law)
        8. Force majeure provisions`
    }],
    schema: ContractSchema,
  });

  return contract;
}
```

### 14.2 AI Progress Monitoring

```typescript
// services/ai/progress-monitoring.ts
import { generateObject } from '@rork/toolkit-sdk';

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
```

### 14.3 Payment Integration

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

---

## 15. Notification System

### 15.1 Notification Types

The application supports 55+ notification types across all features:

#### Job & Application Notifications
- **new_job**: New job posted matching user's trade/location
- **new_application**: New application received for a job
- **application_accepted**: Application was accepted
- **application_rejected**: Application was rejected
- **job_updated**: Job details were modified
- **job_cancelled**: Job was cancelled by poster

#### Project Management Notifications
- **project_created**: New project created from accepted bid
- **milestone_submitted**: Contractor submitted milestone for review
- **milestone_approved**: Owner approved milestone completion
- **milestone_rejected**: Owner rejected milestone (needs revision)
- **milestone_payment_released**: Payment released for approved milestone
- **contract_ready**: Contract generated and ready for review
- **contract_signed**: All parties signed the contract
- **progress_update_posted**: Daily progress update posted
- **dispute_filed**: New dispute filed

### 15.2 Notification Priorities

**Critical Priority:**
- Payment failures
- Disputes filed
- Contract signing required
- Deadlines missed
- Safety issues

**High Priority:**
- Application accepted/rejected
- Milestone submitted for review
- Escrow deposits
- Deadlines approaching

**Normal Priority:**
- New jobs matching criteria
- New applications
- Progress reports

**Low Priority:**
- Progress updates
- Document uploads (non-critical)
- General system alerts

---

## 16. Development Roadmap

### Phase 1: Backend Setup
- [ ] Choose backend technology (Supabase recommended)
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
- [ ] AI contract generation with California law provisions
- [ ] Milestone management
- [ ] Progress tracking with AI analysis
- [ ] Photo/video uploads
- [ ] Approval/rejection workflow
- [ ] Change order system

### Phase 5: Payment & Escrow
- [ ] Stripe integration
- [ ] Escrow system
- [ ] Milestone-based payment release
- [ ] Invoice generation
- [ ] Payment notifications

### Phase 6: Dispute Resolution
- [ ] Dispute filing system
- [ ] Evidence upload
- [ ] Admin mediation dashboard
- [ ] Resolution workflow

### Phase 7: Production Ready
- [ ] Fix all bugs
- [ ] Error tracking (Sentry)
- [ ] Analytics setup
- [ ] Performance optimization
- [ ] Security audit
- [ ] Device testing

### Phase 8: Deployment
- [ ] Configure EAS builds
- [ ] Build iOS and Android
- [ ] App Store submission
- [ ] Google Play submission
- [ ] Deploy web app
- [ ] Monitoring setup

---

## Development Commands

```bash
# Start development with tunnel (mobile testing)
bun run start

# Start web preview with tunnel
bun run start-web

# Start web preview with debug logs
bun run start-web-dev

# Run linter
bun run lint

# Clear cache and restart
bunx expo start --clear

# Install dependencies
bun install

# Install a new package (use Expo-compatible version)
bun expo install <package-name>

# Build for production (requires EAS CLI setup)
eas build --platform all --profile production

# Submit to stores (requires EAS CLI setup)
eas submit --platform ios
eas submit --platform android
```

---

## Critical Development Notes

### DO NOT Install @rork/toolkit-sdk
The `@rork/toolkit-sdk` is globally available via TypeScript path mapping in the Rork environment. It will NOT appear in package.json, bun.lock, or node_modules. Simply import and use it directly.

### Use Bun as Package Manager
This project uses Bun for package management. Always use `bun install` and `bun expo install` instead of npm or yarn.

### Testing on Mobile Devices
1. Download Rork app (iOS) or Expo Go (Android)
2. Run `bun run start`
3. Scan QR code from development server
4. Test features in real-time

### Web Compatibility
Always test features on web (`bun run start-web`) to ensure cross-platform compatibility. Some native features may need web fallbacks.

### AI Features
Leverage Rork's built-in AI capabilities for:
- Contract generation with legal provisions
- Progress photo analysis
- Timeline generation
- Dispute resolution assistance

---

This technical requirements document provides the complete technical specification for implementing and deploying the Bidroom Construction Platform in Rork. Use in conjunction with the Functional Requirements document for full project scope.
