export const TEAM_PERMISSION_OPTIONS = [
  { id: "invite_members", label: "Invite teammates" },
  { id: "assign_tasks", label: "Assign tasks" },
  { id: "manage_projects", label: "Manage projects" },
];

export const TEAM_ROLE_PRESETS = {
  owner: ["invite_members", "assign_tasks", "manage_projects"],
  admin: ["invite_members", "assign_tasks", "manage_projects"],
  collaborator: ["assign_tasks"],
  contractor: [],
};

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

export function canManageTeam(plan) {
  return plan === "solo" || plan === "pro";
}
