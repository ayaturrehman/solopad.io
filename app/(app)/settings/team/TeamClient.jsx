"use client";

import { useState } from "react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input, { selectClassName } from "@/components/ui/Input";
import {
  TEAM_PERMISSION_OPTIONS,
  TEAM_ROLE_PRESETS,
  canManageTeam,
  getDefaultPermissionsForRole,
} from "@/lib/team";
import { ShieldCheck, UserPlus } from "lucide-react";

const emptyInviteForm = {
  name: "",
  email: "",
  role: "collaborator",
  permissions: getDefaultPermissionsForRole("collaborator"),
};

export default function TeamClient({ plan, userRole, members: initialMembers }) {
  const teamEnabled = canManageTeam(plan);
  const [members, setMembers] = useState(initialMembers);
  const [inviteForm, setInviteForm] = useState(emptyInviteForm);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState("");

  function togglePermission(permissionId) {
    setInviteForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter((p) => p !== permissionId)
        : [...prev.permissions, permissionId],
    }));
  }

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
    setInviteLoading(false);
  }

  return (
    <div className="space-y-6">
      {/* Roles */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-zinc-500" />
            <h2 className="font-semibold text-zinc-900">Roles & Permissions</h2>
          </div>
          <p className="mt-0.5 text-xs text-zinc-400">
            Solo and Pro plans can invite teammates and assign work.
          </p>
        </CardHeader>
        <CardBody>
          <div className="grid gap-3 md:grid-cols-3">
            {[
              { name: "Owner", desc: "Full workspace control, invites teammates, and assigns tasks." },
              { name: "Collaborator", desc: "Works on delivery and can receive assigned tasks." },
              { name: "Contractor", desc: "Limited access for external helpers and short engagements." },
            ].map((role) => (
              <div key={role.name} className="rounded border border-zinc-200 p-4">
                <p className="text-sm font-medium text-zinc-900">{role.name}</p>
                <p className="mt-1 text-xs text-zinc-500">{role.desc}</p>
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
            <h2 className="font-semibold text-zinc-900">Team Access</h2>
          </div>
          <p className="mt-0.5 text-xs text-zinc-400">Invite teammates, control roles, and manage permissions.</p>
        </CardHeader>
        <CardBody className="space-y-4">
          {!teamEnabled && (
            <div className="rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              Upgrade to the Solo plan to invite teammates and assign tasks.
            </div>
          )}

          {/* Current Members */}
          <div className="rounded border border-zinc-200">
            <div className="border-b border-zinc-200 px-4 py-3">
              <p className="text-sm font-medium text-zinc-900">Team members</p>
            </div>
            <div className="divide-y divide-zinc-100">
              {members.length === 0 && (
                <p className="px-4 py-6 text-sm text-zinc-500">No teammates invited yet.</p>
              )}
              {members.map((member) => (
                <div key={member.id} className="flex flex-col gap-2 px-4 py-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-medium text-zinc-900">{member.name}</p>
                    <p className="text-xs text-zinc-500">{member.email}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs capitalize text-zinc-600">{member.role}</span>
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs capitalize text-blue-700">{member.status}</span>
                    <span className="text-xs text-zinc-500">
                      {(member.permissions ?? []).join(", ").replaceAll("_", " ")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Invite Form */}
          <form onSubmit={inviteMember} className="space-y-4 rounded border border-zinc-200 bg-zinc-50 p-4">
            <div className="flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-zinc-500" />
              <p className="text-sm font-medium text-zinc-900">Invite teammate</p>
            </div>
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
                className={selectClassName}
              >
                <option value="collaborator">Collaborator</option>
                <option value="admin">Admin</option>
                <option value="contractor">Contractor</option>
              </select>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-zinc-700">Permissions</p>
              <div className="grid gap-2 md:grid-cols-3">
                {TEAM_PERMISSION_OPTIONS.map((perm) => (
                  <label key={perm.id} className="flex items-center gap-2 rounded border border-zinc-200 bg-white px-3 py-1.5">
                    <input
                      type="checkbox"
                      checked={inviteForm.permissions.includes(perm.id)}
                      disabled={!teamEnabled}
                      onChange={() => togglePermission(perm.id)}
                      className="h-4 w-4 rounded border-zinc-300 accent-zinc-900"
                    />
                    <span className="text-sm text-zinc-700">{perm.label}</span>
                  </label>
                ))}
              </div>
            </div>
            {inviteError && <p className="text-sm text-red-600">{inviteError}</p>}
            <Button type="submit" size="sm" loading={inviteLoading} disabled={!teamEnabled}>
              Send invite
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

function Users(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
