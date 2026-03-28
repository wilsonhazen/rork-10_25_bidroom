import { User } from "@/contexts/AuthContext";

export const TEST_USERS: User[] = [
  {
    id: "test-admin-001",
    name: "Admin Manager",
    email: "admin@bidroom.io",
    role: "Admin",
    company: "Bidroom Platform",
    phone: "(555) 000-0001",
    avatar: undefined,
  },
  {
    id: "test-gc-001",
    name: "John Builder",
    email: "gc@bidroom.io",
    role: "GC",
    company: "Builder Constructions Inc",
    phone: "(555) 000-0002",
    avatar: undefined,
  },
  {
    id: "test-pm-001",
    name: "Sarah Manager",
    email: "pm@bidroom.io",
    role: "Project Manager",
    company: "ProManage Solutions",
    phone: "(555) 000-0003",
    avatar: undefined,
  },
  {
    id: "test-sub-001",
    name: "Mike Contractor",
    email: "sub@bidroom.io",
    role: "Subcontractor",
    company: "Mike's Contracting Services",
    phone: "(555) 000-0004",
    avatar: undefined,
  },
  {
    id: "test-trade-001",
    name: "Lisa Specialist",
    email: "trade@bidroom.io",
    role: "Trade Specialist",
    company: "Elite Trade Services",
    phone: "(555) 000-0005",
    avatar: undefined,
  },
  {
    id: "test-viewer-001",
    name: "Bob Observer",
    email: "viewer@bidroom.io",
    role: "Viewer",
    company: "Viewer Access Co",
    phone: "(555) 000-0006",
    avatar: undefined,
  },
];

export const TEST_CREDENTIALS = {
  admin: { email: "admin@bidroom.io", password: "admin123" },
  gc: { email: "gc@bidroom.io", password: "gc123" },
  pm: { email: "pm@bidroom.io", password: "pm123" },
  sub: { email: "sub@bidroom.io", password: "sub123" },
  trade: { email: "trade@bidroom.io", password: "trade123" },
  viewer: { email: "viewer@bidroom.io", password: "viewer123" },
};
