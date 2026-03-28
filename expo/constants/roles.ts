import { UserRole } from "@/types";

export const ROLES: { value: UserRole; label: string; description: string }[] = [
  {
    value: "Admin",
    label: "Admin/Manager",
    description: "Full access to all features and user management",
  },
  {
    value: "GC",
    label: "General Contractor",
    description: "Create bids, manage projects, invite contractors",
  },
  {
    value: "Project Manager",
    label: "Project Manager",
    description: "Manage projects, create bids, view reports",
  },
  {
    value: "Subcontractor",
    label: "Subcontractor",
    description: "Submit bids and manage your projects",
  },
  {
    value: "Trade Specialist",
    label: "Trade Specialist",
    description: "Specialized trade professional",
  },
  {
    value: "Viewer",
    label: "Viewer",
    description: "View-only access to reports and projects",
  },
];
