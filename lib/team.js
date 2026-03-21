import { getPlan } from "./plans";

// ─── Granular Permissions ────────────────────────────────────────────────────

export const PERMISSION_GROUPS = [
  {
    label: "Contacts",
    permissions: [
      { id: "view_contacts", label: "View contacts" },
      { id: "manage_contacts", label: "Create, edit & delete contacts" },
    ],
  },
  {
    label: "Projects",
    permissions: [
      { id: "view_projects", label: "View projects" },
      { id: "manage_projects", label: "Create, edit & delete projects" },
    ],
  },
  {
    label: "Invoices & Finance",
    permissions: [
      { id: "view_invoices", label: "View invoices" },
      { id: "manage_invoices", label: "Create, edit & send invoices" },
      { id: "view_finances", label: "View financial reports & expenses" },
    ],
  },
  {
    label: "Proposals",
    permissions: [
      { id: "view_proposals", label: "View proposals" },
      { id: "manage_proposals", label: "Create, edit & send proposals" },
    ],
  },
  {
    label: "Contracts",
    permissions: [
      { id: "view_contracts", label: "View contracts" },
      { id: "manage_contracts", label: "Create, edit & send contracts" },
    ],
  },
  {
    label: "Tasks",
    permissions: [
      { id: "view_tasks", label: "View tasks" },
      { id: "manage_tasks", label: "Create, edit & delete tasks" },
      { id: "assign_tasks", label: "Assign tasks to team members" },
    ],
  },
  {
    label: "Time Tracking",
    permissions: [
      { id: "view_time", label: "View time entries & reports" },
      { id: "manage_time", label: "Log & edit time entries" },
    ],
  },
  {
    label: "Administration",
    permissions: [
      { id: "manage_team", label: "Invite & manage team members" },
      { id: "manage_settings", label: "Edit business settings" },
      { id: "manage_billing", label: "Manage plan & billing" },
    ],
  },
];

// Flat list for quick lookups
export const ALL_PERMISSIONS = PERMISSION_GROUPS.flatMap((g) =>
  g.permissions.map((p) => p.id)
);

// Legacy compat — still used by the team settings UI
export const TEAM_PERMISSION_OPTIONS = PERMISSION_GROUPS.flatMap((g) => g.permissions);

// ─── Role Presets ────────────────────────────────────────────────────────────

export const TEAM_ROLES = [
  {
    id: "owner",
    label: "Owner",
    description: "Full workspace control. All permissions granted implicitly.",
    color: "bg-violet-100 text-violet-700",
  },
  {
    id: "admin",
    label: "Admin",
    description: "Full access except billing. Can manage team and settings.",
    color: "bg-blue-100 text-blue-700",
  },
  {
    id: "collaborator",
    label: "Collaborator",
    description: "Can view most data, manage tasks, and log time.",
    color: "bg-zinc-100 text-zinc-700",
  },
  {
    id: "contractor",
    label: "Contractor",
    description: "Limited access. Can view and manage assigned tasks and log time.",
    color: "bg-amber-100 text-amber-700",
  },
];

export const TEAM_ROLE_PRESETS = {
  owner: ALL_PERMISSIONS, // Owners bypass checks anyway, but useful for display
  admin: ALL_PERMISSIONS.filter((p) => p !== "manage_billing"),
  collaborator: [
    "view_contacts",
    "view_projects",
    "view_invoices",
    "view_proposals",
    "view_contracts",
    "view_tasks",
    "manage_tasks",
    "assign_tasks",
    "view_time",
    "manage_time",
  ],
  contractor: [
    "view_tasks",
    "view_time",
    "manage_time",
  ],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function parsePermissions(value) {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function serializePermissions(values) {
  return [...new Set(values)].join(",");
}

export function getDefaultPermissionsForRole(role) {
  return TEAM_ROLE_PRESETS[role] ?? [];
}

/**
 * Check if a user object has a specific permission.
 * Owners always have all permissions.
 * The user object should have `teamRole` and `permissions` fields (from JWT).
 */
export function hasPermission(user, permission) {
  if (!user) return false;
  // Owners always have all permissions
  if (user.role === "owner" || user.teamRole === "owner") return true;
  const permissions = parsePermissions(user.permissions);
  return permissions.includes(permission);
}

export function canManageTeam(plan) {
  const currentPlan = getPlan(plan).id;
  return currentPlan === "solo" || currentPlan === "pro";
}
