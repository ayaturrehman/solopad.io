"use client";

import { useState } from "react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input, { selectClassName } from "@/components/ui/Input";
import {
  PERMISSION_GROUPS,
  TEAM_ROLES,
  canManageTeam,
  getDefaultPermissionsForRole,
} from "@/lib/team";
import { ShieldCheck, UserPlus, ChevronDown, ChevronUp, Trash2, Users } from "lucide-react";

const emptyInviteForm = {
  name: "",
  email: "",
  role: "collaborator",
  permissions: getDefaultPermissionsForRole("collaborator"),
};

function PermissionEditor({ permissions, onChange, disabled }) {
  return (
    <div className="space-y-3">
      {PERMISSION_GROUPS.map((group) => {
        const groupPerms = group.permissions.map((p) => p.id);
        const allChecked = groupPerms.every((id) => permissions.includes(id));
        const someChecked = groupPerms.some((id) => permissions.includes(id));

        return (
          <div key={group.label} className="rounded border border-zinc-200 bg-white">
            <div className="flex items-center gap-2 border-b border-zinc-100 px-3 py-2">
              <input
                type="checkbox"
                checked={allChecked}
                ref={(el) => { if (el) el.indeterminate = someChecked && !allChecked; }}
                disabled={disabled}
                onChange={() => {
                  if (allChecked) {
                    onChange(permissions.filter((p) => !groupPerms.includes(p)));
                  } else {
                    onChange([...new Set([...permissions, ...groupPerms])]);
                  }
                }}
                className="h-3.5 w-3.5 rounded border-zinc-300 accent-zinc-900"
              />
              <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                {group.label}
              </span>
            </div>
            <div className="px-3 py-2 space-y-1.5">
              {group.permissions.map((perm) => (
                <label key={perm.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={permissions.includes(perm.id)}
                    disabled={disabled}
                    onChange={() => {
                      onChange(
                        permissions.includes(perm.id)
                          ? permissions.filter((p) => p !== perm.id)
                          : [...permissions, perm.id]
                      );
                    }}
                    className="h-3.5 w-3.5 rounded border-zinc-300 accent-zinc-900"
                  />
                  <span className="text-sm text-zinc-700">{perm.label}</span>
                </label>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MemberRow({ member, teamEnabled, canManage, onUpdate, onRemove }) {
  const [expanded, setExpanded] = useState(false);
  const [role, setRole] = useState(member.role);
  const [permissions, setPermissions] = useState(member.permissions ?? []);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);

  const isOwner = member.role === "owner";
  const roleInfo = TEAM_ROLES.find((r) => r.id === member.role);
  const changed = role !== member.role || JSON.stringify(permissions.sort()) !== JSON.stringify((member.permissions ?? []).sort());

  async function save() {
    setSaving(true);
    const res = await fetch(`/api/settings/team/${member.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, permissions }),
    });
    if (res.ok) {
      const data = await res.json();
      onUpdate(data.member);
    }
    setSaving(false);
  }

  async function remove() {
    if (!confirm(`Remove ${member.name} from the team?`)) return;
    setRemoving(true);
    const res = await fetch(`/api/settings/team/${member.id}`, { method: "DELETE" });
    if (res.ok) onRemove(member.id);
    setRemoving(false);
  }

  return (
    <div className="border-b border-zinc-100 last:border-0">
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-zinc-50 transition-colors"
        onClick={() => !isOwner && setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-600">
            {member.name?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-900">{member.name}</p>
            <p className="text-xs text-zinc-500">{member.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${roleInfo?.color || "bg-zinc-100 text-zinc-600"}`}>
            {member.role}
          </span>
          <span className={`rounded-full px-2.5 py-1 text-xs capitalize ${member.status === "active" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
            {member.status}
          </span>
          {!isOwner && (
            expanded
              ? <ChevronUp className="h-4 w-4 text-zinc-400" />
              : <ChevronDown className="h-4 w-4 text-zinc-400" />
          )}
        </div>
      </div>

      {expanded && !isOwner && (
        <div className="border-t border-zinc-100 bg-zinc-50 px-4 py-4 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-700">Role</label>
            <select
              value={role}
              disabled={!canManage}
              onChange={(e) => {
                const newRole = e.target.value;
                setRole(newRole);
                setPermissions(getDefaultPermissionsForRole(newRole));
              }}
              className={selectClassName + " max-w-[240px]"}
            >
              {TEAM_ROLES.filter((r) => r.id !== "owner").map((r) => (
                <option key={r.id} value={r.id}>{r.label} — {r.description}</option>
              ))}
            </select>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-zinc-700">Custom permissions</p>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              <PermissionEditor
                permissions={permissions}
                onChange={setPermissions}
                disabled={!canManage}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={remove}
              disabled={!canManage || removing}
              className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {removing ? "Removing..." : "Remove from team"}
            </button>
            {changed && (
              <Button size="sm" onClick={save} loading={saving} disabled={!canManage}>
                Save changes
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TeamClient({ plan, userRole, members: initialMembers, canManage }) {
  const teamEnabled = canManageTeam(plan);
  const [members, setMembers] = useState(initialMembers);
  const [inviteForm, setInviteForm] = useState(emptyInviteForm);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [showPermissions, setShowPermissions] = useState(false);

  function updateRole(role) {
    setInviteForm((prev) => ({
      ...prev,
      role,
      permissions: getDefaultPermissionsForRole(role),
    }));
  }

  async function inviteMember(e) {
    e.preventDefault();
    setInviteLoading(true);
    setInviteError("");

    const response = await fetch("/api/settings/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(inviteForm),
    });

    const data = await response.json();
    if (!response.ok) {
      setInviteError(data.error || "Could not send invite.");
      setInviteLoading(false);
      return;
    }

    setMembers((prev) => [data.member, ...prev]);
    setInviteForm(emptyInviteForm);
    setShowPermissions(false);
    setInviteLoading(false);
  }

  function handleMemberUpdate(updated) {
    setMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  }

  function handleMemberRemove(id) {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  }

  return (
    <div className="space-y-6">
      {/* Role Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-zinc-500" />
            <h2 className="font-semibold text-zinc-900">Roles</h2>
          </div>
          <p className="mt-0.5 text-xs text-zinc-400">
            Each role has default permissions. You can customise permissions per member.
          </p>
        </CardHeader>
        <CardBody>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {TEAM_ROLES.map((role) => (
              <div key={role.id} className="rounded border border-zinc-200 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${role.color}`}>
                    {role.label}
                  </span>
                </div>
                <p className="text-xs text-zinc-500">{role.description}</p>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-zinc-500" />
            <h2 className="font-semibold text-zinc-900">Team Members</h2>
          </div>
          <p className="mt-0.5 text-xs text-zinc-400">
            {members.length} member{members.length !== 1 ? "s" : ""}. Click a member to edit their role and permissions.
          </p>
        </CardHeader>
        <CardBody className="p-0">
          {!teamEnabled && (
            <div className="rounded border border-amber-200 bg-amber-50 px-4 py-3 mx-6 mt-5 text-sm text-amber-700">
              Upgrade to the Solo plan to invite teammates and assign tasks.
            </div>
          )}

          <div className="divide-y divide-zinc-100">
            {members.length === 0 && (
              <p className="px-6 py-8 text-sm text-zinc-500 text-center">No team members yet. Invite your first teammate below.</p>
            )}
            {members.map((member) => (
              <MemberRow
                key={member.id}
                member={member}
                teamEnabled={teamEnabled}
                canManage={canManage}
                onUpdate={handleMemberUpdate}
                onRemove={handleMemberRemove}
              />
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Invite Form */}
      {canManage && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-zinc-500" />
              <h2 className="font-semibold text-zinc-900">Invite Teammate</h2>
            </div>
          </CardHeader>
          <CardBody>
            <form onSubmit={inviteMember} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Full name"
                  value={inviteForm.name}
                  disabled={!teamEnabled}
                  onChange={(e) => setInviteForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Jamie Brooks"
                />
                <Input
                  label="Email"
                  type="email"
                  value={inviteForm.email}
                  disabled={!teamEnabled}
                  onChange={(e) => setInviteForm((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="jamie@example.com"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-700">Role</label>
                <select
                  value={inviteForm.role}
                  disabled={!teamEnabled}
                  onChange={(e) => updateRole(e.target.value)}
                  className={selectClassName + " max-w-[320px]"}
                >
                  {TEAM_ROLES.filter((r) => r.id !== "owner").map((r) => (
                    <option key={r.id} value={r.id}>{r.label}</option>
                  ))}
                </select>
                {inviteForm.role && (
                  <p className="mt-1 text-xs text-zinc-500">
                    {TEAM_ROLES.find((r) => r.id === inviteForm.role)?.description}
                  </p>
                )}
              </div>

              {/* Expandable permissions */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowPermissions(!showPermissions)}
                  className="flex items-center gap-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900"
                >
                  {showPermissions ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  {showPermissions ? "Hide" : "Customise"} permissions ({inviteForm.permissions.length} selected)
                </button>

                {showPermissions && (
                  <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    <PermissionEditor
                      permissions={inviteForm.permissions}
                      onChange={(perms) => setInviteForm((prev) => ({ ...prev, permissions: perms }))}
                      disabled={!teamEnabled}
                    />
                  </div>
                )}
              </div>

              {inviteError && <p className="text-sm text-red-600">{inviteError}</p>}
              <Button type="submit" size="sm" loading={inviteLoading} disabled={!teamEnabled}>
                Send invite
              </Button>
            </form>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
