# Template System - Developer Guide

## Overview

The Template System is a comprehensive framework for managing large-scale construction projects (specifically house builds) through a structured, phase-based bidding and management system. 

**Critical Feature**: When owners select phases from a template and create bid groups, **each group becomes an independent job posting** that contractors can bid on separately. This allows specialized contractors to bid only on their trade-specific work while enabling general contractors to bid on multiple phases.

Key capabilities:
- Select specific phases from pre-built templates (20 phases for house build)
- Create flexible bid groups (single phase or multiple related phases)
- **Each bid group = separate job posting**
- Contractors see and bid on individual groups only
- Multiple contractors work on different phases
- All phases managed under parent project
- Market pricing for owners (contractors don't see this)
- Auto-matching qualified contractors to opportunities
- Real-time cost tracking and variance analysis

## Table of Contents

1. [Architecture](#architecture)
2. [Data Models](#data-models)
3. [Context Providers](#context-providers)
4. [User Flows](#user-flows)
5. [Template Structure](#template-structure)
6. [Automation Systems](#automation-systems)
7. [Implementation Details](#implementation-details)
8. [Extending the System](#extending-the-system)
9. [Testing & Debugging](#testing--debugging)

---

## Architecture

### High-Level System Design

```
┌─────────────────────────────────────────────────────────────┐
│                      App Root (_layout.tsx)                  │
├─────────────────────────────────────────────────────────────┤
│                    React Query Provider                      │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                  Context Providers                     │  │
│  │  - TemplatesProvider                                   │  │
│  │  - MarketPricingProvider                               │  │
│  │  - ContractorBidTemplatesProvider                      │  │
│  │  - AutoMatchingProvider                                │  │
│  │  - CostTrackingProvider                                │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                         UI Screens                           │
│  - template-selection.tsx                                    │
│  - template-bid-setup.tsx                                    │
│  - (tabs)/bids.tsx                                          │
│  - project-dashboard.tsx                                     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Data & State Layer                        │
│  - AsyncStorage (persistence)                                │
│  - In-memory state (real-time updates)                       │
│  - Mock data (development/demo)                              │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **State Management**: `@nkzw/create-context-hook` for context-based state
- **Storage**: `@react-native-async-storage/async-storage` for persistence
- **Navigation**: Expo Router (file-based routing)
- **Type Safety**: TypeScript with strict type checking
- **UI**: React Native with StyleSheet API

---

## Data Models

### Core Types (types/index.ts)

#### ProjectTemplate

Defines the structure of a complete project template (e.g., "Complete House Build").

```typescript
interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  estimatedDuration: string;
  phases: TemplatePhase[];
  totalEstimatedCost: { min: number; max: number };
  createdAt: string;
}
```

**Key Points:**
- Templates are immutable master references
- One template can contain 10-20+ phases
- Cost estimates are ranges (min/max) to account for variation

#### TemplatePhase

Represents a single phase of work within a template (e.g., "Foundation & Concrete Work").

```typescript
interface TemplatePhase {
  id: string;
  name: string;
  description: string;
  estimatedDuration: string;
  order: number;
  trades: string[];
  tasks: string[];
  deliverables: string[];
  dependencies: string[];
  estimatedCost: { min: number; max: number };
}
```

**Key Points:**
- `order` determines sequential position in project timeline
- `dependencies` is an array of phase IDs that must complete first
- `trades` lists all contractor types needed (e.g., ["Plumbing", "Electrical"])
- Dependency validation prevents selecting phases without prerequisites

#### TemplateBasedProject

A user's customized instance created from a template.

```typescript
interface TemplateBasedProject {
  id: string;
  ownerId: string;
  templateId: string;
  selectedPhases: string[];
  customizations?: {
    phaseId: string;
    modifications: string;
  }[];
  planDocuments?: {
    name: string;
    url: string;
    type: string;
  }[];
  planUrl?: string;
  additionalNotes?: string;
  createdAt: string;
}
```

**Key Points:**
- References original template via `templateId`
- `selectedPhases` is a subset of template's phases
- Allows phase-specific customizations
- Links to external plan documents

#### MarketPricing

Regional pricing intelligence for phases.

```typescript
interface MarketPricing {
  phaseId: string;
  region: string;
  averageCost: { min: number; max: number };
  lastUpdated: string;
  dataPoints: number;
  trend: "increasing" | "stable" | "decreasing";
}
```

**Use Cases:**
- Show owners realistic budget expectations
- Help contractors price competitively
- Display market trends for planning

#### ContractorBidTemplate

Saved bid templates for contractors to reuse.

```typescript
interface ContractorBidTemplate {
  id: string;
  contractorId: string;
  phaseName: string;
  trade: string;
  baseRate: number;
  unit: "fixed" | "per_sqft" | "per_hour" | "per_day";
  includedItems: string[];
  excludedItems: string[];
  warranty: string;
  leadTime: string;
  notes?: string;
  createdAt: string;
}
```

**Benefits:**
- Contractors bid faster with pre-filled data
- Consistent pricing across similar work
- Supports multiple pricing models (fixed, per sqft, etc.)

#### CostTracking

Real-time budget monitoring and variance analysis.

```typescript
interface CostTracking {
  projectId: string;
  phaseId: string;
  estimated: number;
  actual: number;
  variance: number;
  variancePercentage: number;
  status: "under" | "on_track" | "over";
  milestones: PhaseMilestone[];
}
```

**Calculation Logic:**
```typescript
variance = actual - estimated
variancePercentage = (variance / estimated) * 100

status = 
  if variancePercentage < -5%: "under"
  if variancePercentage > 10%: "over"
  else: "on_track"
```

#### AutoMatchNotification

Automated contractor opportunity alerts.

```typescript
interface AutoMatchNotification {
  id: string;
  contractorId: string;
  projectId: string;
  phaseIds: string[];
  matchScore: number;          // 0-100
  matchReasons: string[];
  sentAt: string;
  viewed: boolean;
  responded: boolean;
}
```

**Match Score Algorithm:**
```typescript
score = 0
if trade matches: score += 40
if rating >= 4.5: score += 20
if rating >= 4.0: score += 15
if rating >= 3.5: score += 10
if completedProjects >= 100: score += 20
if completedProjects >= 50: score += 15
if completedProjects >= 25: score += 10
if completedProjects >= 10: score += 5
random factor: score += 0-20

total = min(100, score)
```

---

## Context Providers

All contexts use the `@nkzw/create-context-hook` pattern for type safety and clean APIs.

### TemplatesContext

**File:** `contexts/TemplatesContext.tsx`

**Purpose:** Manages project templates and template-based projects.

**State:**
```typescript
{
  templates: ProjectTemplate[];
  templateProjects: TemplateBasedProject[];
  isLoading: boolean;
}
```

**Key Functions:**

```typescript
getTemplateById(templateId: string): ProjectTemplate | undefined
```
Retrieves a specific template by ID.

```typescript
calculateSelectedPhaseCost(
  template: ProjectTemplate, 
  selectedPhases: string[]
): { min: number; max: number }
```
Sums up cost estimates for selected phases.

```typescript
validatePhaseSelection(
  template: ProjectTemplate, 
  selectedPhases: string[]
): { valid: boolean; errors: string[] }
```
Checks if all dependencies are met for selected phases.

**Example Usage:**
```typescript
const { templates, validatePhaseSelection } = useTemplates();
const template = templates[0];
const validation = validatePhaseSelection(template, ["phase-005", "phase-010"]);

if (!validation.valid) {
  alert(`Missing dependencies: ${validation.errors.join(", ")}`);
}
```

### MarketPricingContext

**File:** `contexts/MarketPricingContext.tsx`

**Purpose:** Provides market-rate pricing intelligence.

**Key Functions:**

```typescript
getPricingForPhase(phaseId: string, region?: string): MarketPricing | undefined
```
Retrieves current market pricing for a phase.

```typescript
calculateBundleDiscount(phaseCount: number): number
```
Returns discount percentage based on phase count:
- 3+ phases: 5%
- 5+ phases: 10%
- 10+ phases: 15%

**Integration Example:**
```typescript
const { getPricingForPhase, calculateBundleDiscount } = useMarketPricing();
const pricing = getPricingForPhase("phase-002");
const discount = calculateBundleDiscount(selectedPhases.length);

const estimatedCost = pricing.averageCost.max * (1 - discount);
```

### AutoMatchingContext

**File:** `contexts/AutoMatchingContext.tsx`

**Purpose:** Intelligent contractor-to-project matching.

**Key Functions:**

```typescript
calculateMatchScore(
  contractorTrades: string[],
  phaseRequiredTrades: string[],
  contractorRating: number,
  completedProjects: number
): number
```

```typescript
qualifyContractor(
  contractor: any,
  phase: TemplatePhase
): ContractorQualification
```
Returns detailed qualification report with requirements checklist.

```typescript
createMatchNotification(
  contractorId: string,
  projectId: string,
  phaseIds: string[],
  matchScore: number,
  matchReasons: string[]
): Promise<AutoMatchNotification>
```

**Workflow Example:**
```typescript
// When owner posts bid
const qualifiedContractors = contractors.filter(c => {
  const qual = qualifyContractor(c, phase);
  return qual.qualified && qual.score >= 60;
});

// Send notifications
for (const contractor of qualifiedContractors) {
  await createMatchNotification(
    contractor.id,
    projectId,
    [phase.id],
    contractor.matchScore,
    ["Trade match", "High rating", "Verified insurance"]
  );
}
```

### CostTrackingContext

**File:** `contexts/CostTrackingContext.tsx`

**Purpose:** Budget monitoring and milestone tracking.

**Key Functions:**

```typescript
initializePhaseTracking(
  projectId: string,
  phaseId: string,
  estimated: number,
  milestones: Omit<PhaseMilestone, "id" | "completed" | "completedAt" | "paidAt">[]
): Promise<CostTracking>
```

```typescript
updateActualCost(
  projectId: string,
  phaseId: string,
  actual: number
): Promise<void>
```
Automatically calculates variance and updates status.

```typescript
completeMilestone(
  projectId: string,
  phaseId: string,
  milestoneId: string
): Promise<void>
```

```typescript
getProjectTotals(projectId: string): {
  totalEstimated: number;
  totalActual: number;
  totalVariance: number;
  phasesOverBudget: number;
  phasesUnderBudget: number;
  phasesOnTrack: number;
}
```

### ContractorBidTemplatesContext

**File:** `contexts/ContractorBidTemplatesContext.tsx`

**Purpose:** Manage reusable bid templates for contractors.

**Key Functions:**

```typescript
createTemplate(
  templateData: Omit<ContractorBidTemplate, "id" | "createdAt" | "contractorId">
): Promise<ContractorBidTemplate | null>
```

```typescript
getTemplateForPhase(phaseName: string): ContractorBidTemplate | undefined
```
Auto-fill bid form with saved template data.

```typescript
calculateEstimate(template: ContractorBidTemplate, quantity: number = 1): number
```
Handles different pricing units (fixed, per sqft, etc.).

---

## User Flows

### Flow 1: Owner Creates Template-Based Project

```
1. Owner navigates to project creation
   ↓
2. Selects "Use Template" option
   ↓
3. Lands on /template-selection
   - Views HOUSE_BUILD_TEMPLATE details
   - Sees 20 phases with cost estimates
   - Market pricing displayed per phase (for owner reference only)
   ↓
4. Selects desired phases (checkboxes)
   - System validates dependencies in real-time
   - Displays estimated total cost
   ↓
5. Optionally adds plan URL and notes
   ↓
6. Taps "Continue to Bid Setup"
   - Dependency validation runs
   - Auto-selects missing dependencies if needed
   ↓
7. Lands on /template-bid-setup
   - Creates bid groups (one or more phases per group)
   - **CRITICAL**: Each group becomes a SEPARATE job posting
   - Example: "Foundation + Framing" = 1 job, "Plumbing" = 1 job
   - Sets budget and due date per group
   - Can group related phases or keep separate
   ↓
8. Taps "Post X Bids"
   - Creates separate job posting for each group
   - Triggers auto-matching algorithm per job
   - Sends notifications to qualified contractors
   - Contractors see ONLY jobs matching their trade
   ↓
9. Redirects to /(tabs)/bids
   - View posted job listings (one per bid group)
   - Track contractor responses per job
   - Review bids per job separately
```

### Flow 2: Contractor Receives Auto-Match Notification

```
1. Owner posts job with phases from template
   ↓
2. System runs auto-matching algorithm
   - Calculates match scores for all contractors
   - Filters by qualification requirements
   - Matches contractors to THEIR trade-specific jobs only
   ↓
3. Qualified contractors receive notification
   - Notification for jobs matching their trade
   - Includes match score and reasons
   - Shows phase details and requirements
   - NO template pricing visible to contractors
   ↓
4. Contractor views notification
   - Reviews job posting details
   - Sees scope, deliverables, timeline
   - Cannot see owner's budget estimate
   ↓
5. Contractor uses saved template to bid (optional)
   - getTemplateForPhase("Foundation & Concrete Work")
   - Pre-fills bid form with saved rates
   - Adjusts pricing for specific project
   ↓
6. Submits bid with their own pricing
   - Owner receives bid with contractor details
   - Owner compares to market rates (backend)
   - Owner makes award decision
```

**Example Scenario:**
- Owner posts "Plumbing" job from template
- Auto-matching identifies 10 plumbers
- Only those 10 plumbers get notified
- Electricians, framers, etc. don't see this job
- Each plumber bids independently
- Owner reviews all plumbing bids separately

### Flow 3: Budget Tracking Through Completion

```
1. Owner awards contract to contractor
   ↓
2. System initializes cost tracking
   - initializePhaseTracking(projectId, phaseId, estimatedCost, milestones)
   - Creates payment milestone schedule (20/30/30/20)
   ↓
3. Contractor completes milestone 1 (20% - Initial Deposit)
   - Uploads progress photos
   - Marks milestone complete
   ↓
4. Owner reviews and approves
   - completeMilestone(projectId, phaseId, milestoneId)
   - System releases payment
   - markMilestonePaid(projectId, phaseId, milestoneId)
   ↓
5. Process repeats for milestones 2-4
   ↓
6. System tracks actual vs. estimated costs
   - updateActualCost(projectId, phaseId, actualAmount)
   - Calculates variance percentage
   - Alerts if status changes to "over"
   ↓
7. Phase completes
   - Final payment released
   - Project dashboard updates
   - Owner can review next phase
```

---

## Template Structure

### House Build Template (mocks/house-build-template.ts)

**20 Phases Included:**

1. **Pre-Construction & Site Preparation** (2-4 weeks, $15K-$30K)
2. **Foundation & Concrete Work** (3-4 weeks, $40K-$80K)
3. **Rough Framing** (4-6 weeks, $60K-$120K)
4. **Roofing** (1-2 weeks, $15K-$35K)
5. **Exterior Windows & Doors** (1-2 weeks, $25K-$50K)
6. **Rough Plumbing** (2-3 weeks, $30K-$60K)
7. **Rough Electrical** (2-3 weeks, $35K-$70K)
8. **HVAC Installation** (2-3 weeks, $25K-$50K)
9. **Insulation** (1-2 weeks, $8K-$15K)
10. **Drywall** (3-4 weeks, $30K-$55K)
11. **Interior Trim & Millwork** (2-3 weeks, $20K-$40K)
12. **Interior Painting** (2-3 weeks, $15K-$30K)
13. **Flooring Installation** (2-3 weeks, $35K-$70K)
14. **Kitchen Installation** (2-3 weeks, $40K-$100K)
15. **Bathroom Installation** (2-4 weeks, $35K-$80K)
16. **Finish Electrical & Plumbing** (1-2 weeks, $10K-$20K)
17. **Exterior Siding & Finishes** (3-4 weeks, $40K-$80K)
18. **Hardscape & Driveway** (2-3 weeks, $25K-$50K)
19. **Landscaping & Irrigation** (2-3 weeks, $20K-$45K)
20. **Final Inspections & Closeout** (2-3 weeks, $10K-$20K)

**Total Range:** $533,000 - $1,100,000

### Dependency Management

Each phase has a `dependencies` array that references prerequisite phases.

**Example:**
```typescript
{
  id: "phase-010",
  name: "Drywall",
  dependencies: ["phase-009"], // Requires Insulation
  // ...
}
```

**Validation Logic:**
```typescript
function validatePhaseSelection(template, selectedPhases) {
  const errors = [];
  
  selectedPhases.forEach(phaseId => {
    const phase = template.phases.find(p => p.id === phaseId);
    
    phase.dependencies.forEach(depId => {
      if (!selectedPhases.includes(depId)) {
        const depPhase = template.phases.find(p => p.id === depId);
        errors.push(`${phase.name} requires ${depPhase.name}`);
      }
    });
  });

  return { valid: errors.length === 0, errors };
}
```

### Adding New Templates

To add a new template:

1. **Define the template** in `mocks/`:
```typescript
export const KITCHEN_REMODEL_TEMPLATE: ProjectTemplate = {
  id: "template-kitchen-remodel-001",
  name: "Kitchen Remodel",
  category: "residential",
  phases: [
    // Define phases...
  ],
  // ...
};
```

2. **Add to PROJECT_TEMPLATES array:**
```typescript
export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  HOUSE_BUILD_TEMPLATE,
  KITCHEN_REMODEL_TEMPLATE,
];
```

3. **Update UI** to display multiple templates:
```typescript
// In template-selection.tsx
const templates = useTemplates().templates;
// Map over templates to show selection list
```

---

## Automation Systems

### 1. Market Pricing Updates

**Current Implementation:** Mock data with random trends

**Production Implementation:**
```typescript
// In MarketPricingContext
useEffect(() => {
  const fetchMarketPricing = async () => {
    // Call external API
    const response = await fetch('https://api.example.com/market-pricing');
    const data = await response.json();
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setMarketPricing(data);
  };
  
  // Initial load
  fetchMarketPricing();
  
  // Refresh weekly
  const interval = setInterval(fetchMarketPricing, 7 * 24 * 60 * 60 * 1000);
  return () => clearInterval(interval);
}, []);
```

### 2. Contractor Auto-Matching

**Trigger:** When owner posts a bid with phases

**Implementation Location:** Should be called after bid creation

```typescript
// In template-bid-setup.tsx, after posting bids
import { useAutoMatching } from '@/contexts/AutoMatchingContext';

const { calculateMatchScore, qualifyContractor, createMatchNotification } = useAutoMatching();

// After bid posted
for (const contractor of allContractors) {
  const qualification = qualifyContractor(contractor, phase);
  
  if (qualification.qualified) {
    const matchScore = calculateMatchScore(
      contractor.trades,
      phase.trades,
      contractor.rating,
      contractor.completedProjects
    );
    
    await createMatchNotification(
      contractor.id,
      projectId,
      [phase.id],
      matchScore,
      qualification.reasons
    );
  }
}
```

### 3. Payment Schedule Automation

**Trigger:** When contract is awarded

```typescript
const { generatePaymentSchedule, initializePhaseTracking } = useCostTracking();

// After awarding contract
const milestones = generatePaymentSchedule(contractAmount, 4);
await initializePhaseTracking(projectId, phaseId, contractAmount, milestones);
```

---

## Implementation Details

### Routing Configuration

Templates use standard Expo Router navigation:

```
app/
  template-selection.tsx       → /template-selection
  template-bid-setup.tsx       → /template-bid-setup
```

**Navigation Example:**
```typescript
import { useRouter } from 'expo-router';

const router = useRouter();

// Navigate to template selection
router.push('/template-selection');

// Navigate with params
router.push({
  pathname: '/template-bid-setup',
  params: {
    templateId: template.id,
    selectedPhases: JSON.stringify(selectedPhaseIds),
    planUrl,
    additionalNotes,
  },
});
```

### State Persistence

All contexts use AsyncStorage for persistence:

```typescript
// Save
await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));

// Load
const stored = await AsyncStorage.getItem(STORAGE_KEY);
const data = stored ? JSON.parse(stored) : defaultValue;
```

**Storage Keys:**
- `template_projects` - TemplateBasedProject[]
- `market_pricing` - MarketPricing[]
- `contractor_bid_templates` - ContractorBidTemplate[]
- `auto_match_notifications` - AutoMatchNotification[]
- `cost_tracking` - CostTracking[]

### Error Handling

All async operations include try-catch blocks:

```typescript
const loadData = async () => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    setData(stored ? JSON.parse(stored) : []);
  } catch (error) {
    console.error("Failed to load data:", error);
    // Fallback to empty or mock data
    setData([]);
  } finally {
    setIsLoading(false);
  }
};
```

### Performance Optimization

**useMemo for Expensive Calculations:**
```typescript
const filteredPhases = useMemo(() => {
  return template.phases.filter(p => selectedPhases.includes(p.id));
}, [template.phases, selectedPhases]);
```

**useCallback for Stable Function References:**
```typescript
const validateSelection = useCallback((phases: string[]) => {
  // Validation logic
}, [template]);
```

---

## Extending the System

### Adding New Phase Properties

1. **Update Type Definition:**
```typescript
// types/index.ts
interface TemplatePhase {
  // ... existing properties
  requiredPermits?: string[];
  safetyRequirements?: string[];
}
```

2. **Update Template Data:**
```typescript
// mocks/house-build-template.ts
{
  id: "phase-002",
  name: "Foundation & Concrete Work",
  requiredPermits: ["Building Permit", "Excavation Permit"],
  safetyRequirements: ["OSHA compliance", "Protective equipment"],
  // ...
}
```

3. **Update UI:**
```typescript
// template-selection.tsx
{phase.requiredPermits && (
  <View style={styles.permitsSection}>
    <Text>Required Permits:</Text>
    {phase.requiredPermits.map(permit => (
      <Text key={permit}>• {permit}</Text>
    ))}
  </View>
)}
```

### Adding Custom Calculations

Example: Volume-based pricing

```typescript
// In MarketPricingContext
const calculateVolumetricPrice = useCallback((
  phaseId: string,
  squareFootage: number,
  stories: number
): number => {
  const basePricing = getPricingForPhase(phaseId);
  const baseRate = (basePricing.averageCost.min + basePricing.averageCost.max) / 2;
  
  // Adjust for size
  const sizeMultiplier = squareFootage / 2000; // Normalized to 2000 sqft
  
  // Adjust for complexity
  const complexityMultiplier = stories > 1 ? 1.2 : 1.0;
  
  return baseRate * sizeMultiplier * complexityMultiplier;
}, [getPricingForPhase]);
```

### Adding Backend Integration

Replace mock data with API calls:

```typescript
// contexts/TemplatesContext.tsx
import { useQuery, useMutation } from '@tanstack/react-query';

export const [TemplatesProvider, useTemplates] = createContextHook(() => {
  // Fetch templates from API
  const templatesQuery = useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const response = await fetch('https://api.example.com/templates');
      return response.json();
    },
  });
  
  // Create template project
  const createProjectMutation = useMutation({
    mutationFn: async (projectData: TemplateBasedProject) => {
      const response = await fetch('https://api.example.com/template-projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData),
      });
      return response.json();
    },
  });
  
  return {
    templates: templatesQuery.data || [],
    isLoading: templatesQuery.isLoading,
    createTemplateProject: createProjectMutation.mutateAsync,
  };
});
```

---

## Testing & Debugging

### Console Logging

All contexts include extensive console logging:

```typescript
console.log("Loading template projects from storage");
console.log("Created new template project:", projectData.id);
console.error("Failed to save template projects:", error);
```

### Debugging Auto-Matching

Log match scores and qualification details:

```typescript
const qualification = qualifyContractor(contractor, phase);
console.log(`Contractor ${contractor.id} qualification:`, {
  qualified: qualification.qualified,
  score: qualification.score,
  requirements: qualification.requirements,
});
```

### Validating Dependencies

Test dependency validation with edge cases:

```typescript
// Select phases with circular dependencies
const selectedPhases = ["phase-010", "phase-005"];
const validation = validatePhaseSelection(template, selectedPhases);
console.log("Validation result:", validation);
```

### Testing Payment Milestones

Verify milestone calculations:

```typescript
const milestones = generatePaymentSchedule(100000, 4);
const total = milestones.reduce((sum, m) => sum + m.amount, 0);
console.assert(total === 100000, "Milestone amounts must equal total");
```

### Mock Data Verification

Ensure mock data integrity:

```typescript
// Verify all dependencies exist
template.phases.forEach(phase => {
  phase.dependencies.forEach(depId => {
    const exists = template.phases.some(p => p.id === depId);
    console.assert(exists, `Dependency ${depId} not found for ${phase.name}`);
  });
});
```

---

## Common Patterns

### Context Hook Pattern

All contexts follow this structure:

```typescript
import createContextHook from '@nkzw/create-context-hook';

export const [ProviderName, useHookName] = createContextHook(() => {
  // State
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load from storage
  useEffect(() => {
    loadData();
  }, []);
  
  // Functions
  const someFunction = useCallback(() => {
    // Implementation
  }, [dependencies]);
  
  // Return API
  return useMemo(() => ({
    data,
    isLoading,
    someFunction,
  }), [data, isLoading, someFunction]);
});
```

### Parameterized Navigation

```typescript
// Passing complex data via params
router.push({
  pathname: '/screen-name',
  params: {
    simpleValue: 'string',
    complexValue: JSON.stringify(arrayOrObject),
  },
});

// Receiving params
const { simpleValue, complexValue } = useLocalSearchParams();
const parsed = JSON.parse(complexValue as string);
```

### Conditional Rendering Based on State

```typescript
if (isLoading) {
  return <LoadingSpinner />;
}

if (!template) {
  return <ErrorMessage text="Template not found" />;
}

return <MainContent />;
```

---

## Best Practices

1. **Type Safety First**: Always define TypeScript interfaces before implementation
2. **Immutable State**: Use spread operators to create new objects/arrays
3. **Error Boundaries**: Wrap screens in error boundaries for production
4. **Loading States**: Always show loading indicators during async operations
5. **User Feedback**: Use Alert.alert() for important notifications
6. **Dependency Arrays**: Keep useCallback/useMemo dependencies minimal and correct
7. **Storage Sync**: Save to AsyncStorage after every state change
8. **Validation**: Validate user input before navigation or submission
9. **Console Logs**: Include descriptive logs for debugging
10. **Documentation**: Update this guide when adding new features

---

## Future Enhancements

### Planned Features

1. **Multi-Template Selection**: Allow mixing phases from different templates
2. **Custom Phase Builder**: Let users create custom phases
3. **Phase Duration Tracking**: Add start/end dates and progress percentage
4. **Document Management**: Upload and attach files to phases
5. **Change Order System**: Track scope changes and cost adjustments
6. **Weather Delays**: Factor in weather-related timeline adjustments
7. **Material Tracking**: Link to material suppliers and pricing
8. **Subcontractor Management**: Multi-tier contractor assignments
9. **Inspection Checklists**: Built-in quality control workflows
10. **Analytics Dashboard**: Visualizations for cost trends and efficiency

### Integration Opportunities

- **Accounting**: QuickBooks, Xero for payment tracking
- **Payments**: Stripe, Square for automated escrow/payments
- **Materials**: Home Depot, Lowe's for real-time pricing
- **Permits**: City permit systems for status tracking
- **Insurance**: Real-time verification APIs
- **Contracts**: DocuSign for digital signatures
- **Communication**: Twilio for SMS notifications

---

## Support & Resources

### Key Files Reference

- **Types**: `types/index.ts` (lines 600-733)
- **Templates**: `mocks/house-build-template.ts`
- **Contexts**: `contexts/Templates*.tsx`
- **Screens**: `app/template-*.tsx`
- **Features Doc**: `TEMPLATE_AUTOMATION_FEATURES.md`

### Debugging Tips

**Issue: Phases not showing**
- Check that template is loaded: `console.log(templates)`
- Verify selectedPhases state: `console.log(selectedPhases)`

**Issue: Dependencies not validating**
- Log validation result: `console.log(validatePhaseSelection(...))`
- Check dependency IDs match phase IDs

**Issue: Cost calculations wrong**
- Verify phase cost estimates: `console.log(phase.estimatedCost)`
- Check calculation logic in context

**Issue: AsyncStorage not persisting**
- Verify storage key is consistent
- Check for JSON parse errors
- Test with AsyncStorage.clear() to reset

---

## Contributing

When adding new features to the template system:

1. Update type definitions in `types/index.ts`
2. Create or update relevant context provider
3. Add UI screens with proper navigation
4. Include loading and error states
5. Add console logging for debugging
6. Update this developer guide
7. Test with mock data before API integration
8. Document any breaking changes

---

## Version History

**v1.0** - Initial template system implementation
- 20-phase house build template
- Phase selection and dependency validation
- Bid group creation and posting
- Basic market pricing

**v1.1** - Automation features
- Auto-matching contractors
- Contractor bid templates
- Cost tracking and milestones
- Payment schedule generation

**v2.0** - (Planned) Backend integration
- Real API endpoints
- Database persistence
- Real-time notifications
- Advanced analytics

---

## Contact

For questions about the template system implementation, refer to:
- This developer guide
- `TEMPLATE_AUTOMATION_FEATURES.md` for business logic
- `FUNCTIONAL_REQUIREMENTS.md` for overall app features
- `TECHNICAL_REQUIREMENTS.md` for architecture decisions
