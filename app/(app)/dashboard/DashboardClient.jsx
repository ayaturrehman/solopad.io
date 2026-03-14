"use client";

import Link from "next/link";
import { ChevronRight, Plus, CheckSquare, Briefcase, UserPlus, FileText, FileSignature, Clock3 } from "lucide-react";
import { STATUS_LABELS, STATUS_COLORS, formatDate, formatCurrency, cn } from "@/lib/utils";

function StatusBadge({ className, children }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold", className)}>
      {children}
    </span>
  );
}

function delay(n) {
  return { animationDelay: `${n}ms` };
}

export default function DashboardClient({
  greeting,
  firstName,
  dateLabel,
  kpis,
  quickActions,
  activeProjects,
  openTasks,
  contacts,
  proposals,
  contracts,
  proposalStatus,
  contractStatus,
  currency,
  now,
}) {
  return (
    <div className="space-y-5 px-4 py-4 md:px-6">
      {/* Greeting */}
      <div className="dash-fade-in flex items-center justify-between" style={delay(0)}>
        <div>
          <p className="text-2xl tracking-tight text-zinc-900">
            {greeting}, {firstName}
          </p>
          <p className="mt-1 text-sm text-zinc-400">{dateLabel}</p>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((item, i) => (
          <div
            key={item.label}
            className="dash-fade-up rounded border border-zinc-200 bg-white px-4 py-4 transition-shadow hover:shadow-sm"
            style={delay(80 + i * 60)}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">{item.label}</p>
            <p className="dash-count mt-2 text-2xl md:text-3xl tracking-tight text-zinc-900" style={delay(160 + i * 60)}>
              {item.value}
            </p>
            <p className="mt-1 text-xs text-zinc-400">{item.note}</p>
          </div>
        ))}
      </div>

      {/* Main panels */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[220px_minmax(0,1.2fr)_minmax(0,0.9fr)_minmax(0,0.9fr)]">
        {/* Quick actions */}
        <div
          className="dash-fade-up rounded border border-zinc-200 bg-white px-4 py-4"
          style={delay(320)}
        >
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold text-zinc-900">Create new</p>
          </div>
          <div className="space-y-2">
            {quickActions.map(({ href, label, icon: Icon }, i) => (
              <Link
                key={label}
                href={href}
                className="dash-fade-up flex items-center justify-between rounded border border-zinc-200 px-4 py-3 text-sm text-zinc-700 transition-colors hover:bg-zinc-50"
                style={delay(360 + i * 40)}
              >
                <span className="inline-flex items-center gap-2">
                  <Icon className="h-4 w-4 text-zinc-400" />
                  {label}
                </span>
                <Plus className="h-3.5 w-3.5 text-zinc-400" />
              </Link>
            ))}
          </div>
        </div>

        {/* Projects */}
        <div
          className="dash-fade-up rounded border border-zinc-200 bg-white px-4 py-4"
          style={delay(360)}
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-zinc-900">Projects</p>
              <p className="mt-1 text-xs text-zinc-400">Current work with status and nearest due date</p>
            </div>
            <Link href="/projects" className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors">
              View all
            </Link>
          </div>
          {activeProjects.length === 0 ? (
            <p className="py-10 text-center text-sm text-zinc-400">No active projects yet.</p>
          ) : (
            <div className="divide-y divide-zinc-100">
              {activeProjects.map((project, i) => {
                const dueDate = project.endDate ? new Date(project.endDate) : null;
                const overdue = dueDate && dueDate < new Date(now) && project.status !== "complete";
                return (
                  <div
                    key={project.id}
                    className="dash-fade-up flex items-center justify-between gap-3 py-3"
                    style={delay(400 + i * 40)}
                  >
                    <div className="min-w-0">
                      <Link href={`/projects/${project.id}`} className="block truncate text-sm font-medium text-zinc-900 hover:underline">
                        {project.title}
                      </Link>
                      <p className="mt-0.5 text-xs text-zinc-400">{project.contact?.name || project.clientName}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge className={STATUS_COLORS[project.status]}>{STATUS_LABELS[project.status]}</StatusBadge>
                      <span className={cn("shrink-0 text-[11px] font-medium", overdue ? "text-red-500" : "text-zinc-400")}>
                        {dueDate ? `Due ${formatDate(dueDate)}` : `Updated ${formatDate(project.updatedAt)}`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tasks */}
        <div
          className="dash-fade-up rounded border border-zinc-200 bg-white px-4 py-4"
          style={delay(400)}
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-zinc-900">Tasks</p>
              <p className="mt-1 text-xs text-zinc-400">What needs attention today</p>
            </div>
            <Link href="/tasks" className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors">
              View all
            </Link>
          </div>
          {openTasks.length === 0 ? (
            <p className="py-10 text-center text-sm text-zinc-400">All clear. No open tasks.</p>
          ) : (
            <div className="divide-y divide-zinc-100">
              {openTasks.slice(0, 4).map((task, i) => {
                const overdue = task.dueDate && new Date(task.dueDate) < new Date(now);
                return (
                  <div
                    key={task.id}
                    className="dash-fade-up flex items-start justify-between gap-3 py-3"
                    style={delay(440 + i * 40)}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-zinc-900">{task.title}</p>
                      <p className="mt-0.5 text-xs text-zinc-400">{task.project?.title || "General task"}</p>
                    </div>
                    {task.dueDate ? (
                      <span className={cn("shrink-0 text-[11px] font-medium", overdue ? "text-red-500" : "text-zinc-400")}>
                        {overdue ? "Overdue" : formatDate(task.dueDate)}
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Contacts */}
        <div
          className="dash-fade-up rounded border border-zinc-200 bg-white px-4 py-4"
          style={delay(440)}
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-zinc-900">Contacts</p>
              <p className="mt-1 text-xs text-zinc-400">Recently added contacts</p>
            </div>
            <Link href="/contacts" className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors">
              View all
            </Link>
          </div>
          {contacts.length === 0 ? (
            <p className="py-10 text-center text-sm text-zinc-400">No contacts yet.</p>
          ) : (
            <div className="divide-y divide-zinc-100">
              {contacts.map((contact, i) => (
                <div
                  key={contact.id}
                  className="dash-fade-up flex items-center justify-between gap-3 py-3"
                  style={delay(480 + i * 30)}
                >
                  <div className="min-w-0">
                    <Link href={`/contacts/${contact.id}`} className="block truncate text-sm font-medium text-zinc-900 hover:underline">
                      {contact.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-zinc-400">{contact.company || contact.email || "-"}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Documents */}
      <div
        className="dash-fade-up rounded border border-zinc-200 bg-white px-4 py-4"
        style={delay(520)}
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-zinc-900">Documents</p>
            <p className="mt-1 text-xs text-zinc-400">Recent proposals and contracts</p>
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">Proposals</p>
            {proposals.length === 0 ? (
              <p className="text-xs text-zinc-400">No proposals yet.</p>
            ) : (
              <div className="space-y-2">
                {proposals.map((proposal, i) => (
                  <div
                    key={proposal.id}
                    className="dash-fade-up flex items-center justify-between gap-2 rounded border border-zinc-100 px-3 py-1.5 transition-colors hover:bg-zinc-50"
                    style={delay(560 + i * 40)}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-zinc-900">{proposal.title}</p>
                      <p className="mt-0.5 text-xs text-zinc-400">{proposal.clientName}</p>
                    </div>
                    <StatusBadge className={proposalStatus[proposal.status] || proposalStatus.draft}>
                      {proposal.status}
                    </StatusBadge>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">Contracts</p>
            {contracts.length === 0 ? (
              <p className="text-xs text-zinc-400">No contracts yet.</p>
            ) : (
              <div className="space-y-2">
                {contracts.map((contract, i) => (
                  <div
                    key={contract.id}
                    className="dash-fade-up flex items-center justify-between gap-2 rounded border border-zinc-100 px-3 py-1.5 transition-colors hover:bg-zinc-50"
                    style={delay(560 + i * 40)}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-zinc-900">{contract.title}</p>
                      <p className="mt-0.5 text-xs text-zinc-400">{contract.clientName}</p>
                    </div>
                    <StatusBadge className={contractStatus[contract.status] || contractStatus.draft}>
                      {contract.status}
                    </StatusBadge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <Link href="/proposals" className="mt-4 inline-flex items-center gap-1 text-xs text-zinc-400 transition-colors hover:text-zinc-700">
          Open documents <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
