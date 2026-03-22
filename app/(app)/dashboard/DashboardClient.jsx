"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ChevronRight, Plus,
  CheckSquare, Briefcase, UserPlus, FileText, FileSignature, Clock3,
} from "lucide-react";
import { STATUS_LABELS, STATUS_COLORS, formatDate, formatCurrency, cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { StatCard, StatCardGrid } from "@/components/shared/StatCard";

/* ─── helpers ─────────────────────────────────────────────────────────────── */

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

const QUICK_ACTIONS = [
  { href: "/contacts/new", label: "Contact",    Icon: UserPlus },
  { href: "/projects/new", label: "Project",    Icon: Briefcase },
  { href: "/proposals/new", label: "Proposal",  Icon: FileText },
  { href: "/contracts",    label: "Contract",   Icon: FileSignature },
  { href: "/tasks",        label: "Task",        Icon: CheckSquare },
  { href: "/time-tracker", label: "Time entry", Icon: Clock3 },
];

/* ─── Task donut ───────────────────────────────────────────────────────────── */
function TaskDonut({ open, done }) {
  const total = open + done;
  const r = 30, cx = 40, cy = 40, stroke = 8;
  const circ = 2 * Math.PI * r;
  const doneFrac = total === 0 ? 0 : done / total;
  const dashArr = `${doneFrac * circ} ${circ}`;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <div className="flex items-center gap-5">
      <div className="relative" style={{ width: 80, height: 80 }}>
        <svg width="80" height="80">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f4f4f5" strokeWidth={stroke} />
          <circle
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke="#22c55e"
            strokeWidth={stroke}
            strokeDasharray={dashArr}
            strokeDashoffset={circ / 4}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.8s cubic-bezier(0.22,1,0.36,1)" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-zinc-900 leading-none">{pct}%</span>
          <span className="text-[10px] text-zinc-400">done</span>
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-xs text-zinc-600">{done} completed</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-zinc-200" />
          <span className="text-xs text-zinc-600">{open} open</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Project status bars ──────────────────────────────────────────────────── */
function ProjectStatusBars({ statusCounts }) {
  const items = [
    { key: "not_started", label: "Not started", color: "bg-zinc-300" },
    { key: "in_progress", label: "In progress", color: "bg-blue-500" },
    { key: "in_review",   label: "In review",   color: "bg-amber-400" },
    { key: "complete",    label: "Complete",     color: "bg-green-500" },
  ];
  const total = Object.values(statusCounts).reduce((s, v) => s + v, 0) || 1;

  return (
    <div className="space-y-2.5">
      {items.map(({ key, label, color }) => {
        const count = statusCounts[key] || 0;
        const pct = (count / total) * 100;
        return (
          <div key={key}>
            <div className="mb-1 flex justify-between">
              <span className="text-xs text-zinc-500">{label}</span>
              <span className="text-xs font-medium text-zinc-700">{count}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
              <div
                className={cn("h-full rounded-full transition-all", color)}
                style={{
                  width: `${pct}%`,
                  transition: "width 0.8s cubic-bezier(0.22,1,0.36,1)",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Main component ───────────────────────────────────────────────────────── */
export default function DashboardClient({
  greeting, firstName, dateLabel,
  kpis,
  activeProjects, openTasks, contacts, proposals, contracts,
  proposalStatus, contractStatus,
  currency, now,
  taskOpen, taskDone,
  statusCounts,
}) {
  return (
    <div className="space-y-5 px-4 py-4 md:px-6">

      {/* Greeting */}
      <div className="dash-fade-in flex items-center justify-between" style={delay(0)}>
        <div>
          <p className="text-2xl tracking-tight text-zinc-900">{greeting}, {firstName}</p>
          <p className="mt-1 text-sm text-zinc-400">{dateLabel}</p>
        </div>
      </div>

      {/* KPI cards */}
      <StatCardGrid>
        {kpis.map((item, i) => (
          <StatCard key={item.label} label={item.label} value={item.value} note={item.note} delay={80 + i * 60} />
        ))}
      </StatCardGrid>

      {/* Charts row */}
      <div className="grid gap-4 sm:grid-cols-2" style={delay(360)}>
        <Card className="dash-fade-up px-4 py-4" style={delay(340)}>
          <p className="mb-4 text-sm font-semibold text-zinc-900">Tasks</p>
          <TaskDonut open={taskOpen} done={taskDone} />
        </Card>
        <Card className="dash-fade-up px-4 py-4" style={delay(380)}>
          <p className="mb-4 text-sm font-semibold text-zinc-900">Project Status</p>
          <ProjectStatusBars statusCounts={statusCounts} />
        </Card>
      </div>

      {/* Main panels */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[220px_minmax(0,1.2fr)_minmax(0,0.9fr)_minmax(0,0.9fr)]">

        {/* Quick actions */}
        <Card className="dash-fade-up px-4 py-4" style={delay(420)}>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold text-zinc-900">Create new</p>
          </div>
          <div className="space-y-2">
            {QUICK_ACTIONS.map(({ href, label, Icon }, i) => (
              <Link
                key={label}
                href={href}
                className="dash-fade-up flex items-center justify-between rounded border border-zinc-200 px-4 py-3 text-sm text-zinc-700 transition-colors hover:bg-zinc-50"
                style={delay(460 + i * 35)}
              >
                <span className="inline-flex items-center gap-2">
                  <Icon className="h-4 w-4 text-zinc-400" />
                  {label}
                </span>
                <Plus className="h-3.5 w-3.5 text-zinc-400" />
              </Link>
            ))}
          </div>
        </Card>

        {/* Projects */}
        <Card className="dash-fade-up px-4 py-4" style={delay(440)}>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-zinc-900">Projects</p>
              <p className="mt-1 text-xs text-zinc-400">Current work with status and nearest due date</p>
            </div>
            <Link href="/projects" className="text-xs text-zinc-400 transition-colors hover:text-zinc-700">View all</Link>
          </div>
          {activeProjects.length === 0 ? (
            <p className="py-10 text-center text-sm text-zinc-400">No active projects yet.</p>
          ) : (
            <div className="divide-y divide-zinc-100">
              {activeProjects.map((project, i) => {
                const dueDate = project.endDate ? new Date(project.endDate) : null;
                const overdue = dueDate && dueDate < new Date(now) && project.status !== "complete";
                return (
                  <div key={project.id} className="dash-fade-up flex items-center justify-between gap-3 py-3" style={delay(480 + i * 40)}>
                    <div className="min-w-0">
                      <Link href={`/projects/${project.id}`} className="block truncate text-sm font-medium text-zinc-900 hover:underline">
                        {project.title}
                      </Link>
                      <p className="mt-0.5 text-xs text-zinc-400">{project.contact?.name || "—"}</p>
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
        </Card>

        {/* Tasks */}
        <Card className="dash-fade-up px-4 py-4" style={delay(460)}>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-zinc-900">Tasks</p>
              <p className="mt-1 text-xs text-zinc-400">What needs attention today</p>
            </div>
            <Link href="/tasks" className="text-xs text-zinc-400 transition-colors hover:text-zinc-700">View all</Link>
          </div>
          {openTasks.length === 0 ? (
            <p className="py-10 text-center text-sm text-zinc-400">All clear. No open tasks.</p>
          ) : (
            <div className="divide-y divide-zinc-100">
              {openTasks.slice(0, 4).map((task, i) => {
                const overdue = task.dueDate && new Date(task.dueDate) < new Date(now);
                return (
                  <div key={task.id} className="dash-fade-up flex items-start justify-between gap-3 py-3" style={delay(500 + i * 40)}>
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
        </Card>

        {/* Contacts */}
        <Card className="dash-fade-up px-4 py-4" style={delay(480)}>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-zinc-900">Contacts</p>
              <p className="mt-1 text-xs text-zinc-400">Recently added contacts</p>
            </div>
            <Link href="/contacts" className="text-xs text-zinc-400 transition-colors hover:text-zinc-700">View all</Link>
          </div>
          {contacts.length === 0 ? (
            <p className="py-10 text-center text-sm text-zinc-400">No contacts yet.</p>
          ) : (
            <div className="divide-y divide-zinc-100">
              {contacts.map((contact, i) => (
                <div key={contact.id} className="dash-fade-up flex items-center gap-3 py-3" style={delay(520 + i * 30)}>
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
        </Card>
      </div>

      {/* Documents */}
      <Card className="dash-fade-up px-4 py-4" style={delay(560)}>
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
                    style={delay(580 + i * 40)}
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
                    style={delay(580 + i * 40)}
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
      </Card>
    </div>
  );
}
