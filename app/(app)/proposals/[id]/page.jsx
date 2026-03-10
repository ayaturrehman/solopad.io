export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  FileText,
  Mail,
  User,
  CheckCircle2,
  Send,
  XCircle,
  Clock,
} from "lucide-react";
import { getSession } from "@/lib/session";
import db from "@/lib/db";
import Badge from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";

const STATUS_CONFIG = {
  draft: { label: "Draft", className: "bg-zinc-100 text-zinc-600", icon: FileText },
  sent: { label: "Sent", className: "bg-blue-100 text-blue-700", icon: Send },
  accepted: { label: "Accepted", className: "bg-green-100 text-green-700", icon: CheckCircle2 },
  declined: { label: "Declined", className: "bg-red-100 text-red-700", icon: XCircle },
};

function parseJsonArray(value) {
  if (!value) return [];
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default async function ProposalDetailPage({ params }) {
  const { id } = await params;
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const proposal = await db.proposal.findFirst({
    where: { id, userId: session.user.id },
    include: { project: { select: { id: true, title: true } } },
  });

  if (!proposal) redirect("/proposals");

  const sections = parseJsonArray(proposal.sections);
  const pricing = parseJsonArray(proposal.pricing);
  const status = STATUS_CONFIG[proposal.status] ?? STATUS_CONFIG.draft;
  const StatusIcon = status.icon;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/proposals" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900">
          <ArrowLeft className="h-4 w-4" />
          All proposals
        </Link>
        <Badge className={status.className}>
          <StatusIcon className="mr-1 h-3.5 w-3.5" />
          {status.label}
        </Badge>
      </div>

      <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 border-b border-zinc-100 pb-8 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">Proposal</p>
            <h1 className="mt-2 text-3xl font-bold text-zinc-900">{proposal.title}</h1>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-zinc-500">
              <span className="inline-flex items-center gap-2">
                <User className="h-4 w-4" />
                {proposal.clientName}
              </span>
              {proposal.clientEmail && (
                <span className="inline-flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {proposal.clientEmail}
                </span>
              )}
              <span className="inline-flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Created {formatDate(proposal.createdAt)}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-5 py-4 text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">Total</p>
            <p className="mt-2 text-3xl font-bold text-zinc-900">{formatCurrency(proposal.total, proposal.currency)}</p>
            {proposal.validUntil && (
              <p className="mt-2 inline-flex items-center gap-1 text-xs text-zinc-500">
                <Clock className="h-3.5 w-3.5" />
                Valid until {formatDate(proposal.validUntil)}
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-6 py-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            {proposal.intro && (
              <section>
                <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-400">Introduction</h2>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-zinc-600">{proposal.intro}</p>
              </section>
            )}

            <section>
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-400">Scope</h2>
              <div className="mt-4 space-y-4">
                {sections.length === 0 && (
                  <p className="text-sm text-zinc-400">No sections added.</p>
                )}
                {sections.map((section, index) => (
                  <div key={`${section.heading || "section"}-${index}`} className="rounded-2xl border border-zinc-200 p-4">
                    <h3 className="text-base font-semibold text-zinc-900">{section.heading || `Section ${index + 1}`}</h3>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-zinc-600">{section.body || "No details."}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-400">Pricing</h2>
              <div className="mt-4 space-y-3">
                {pricing.length === 0 && (
                  <p className="text-sm text-zinc-400">No pricing added.</p>
                )}
                {pricing.map((item, index) => (
                  <div key={`${item.description || "line"}-${index}`} className="flex items-start justify-between gap-4 border-b border-zinc-200 pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="text-sm font-medium text-zinc-900">{item.description || `Line item ${index + 1}`}</p>
                    </div>
                    <p className="text-sm font-semibold text-zinc-900">{formatCurrency(item.amount || 0, proposal.currency)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-zinc-200 pt-4">
                <span className="text-sm font-medium text-zinc-600">Total</span>
                <span className="text-lg font-bold text-zinc-900">{formatCurrency(proposal.total, proposal.currency)}</span>
              </div>
            </section>

            <section className="rounded-2xl border border-zinc-200 p-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-400">Linked project</h2>
              <div className="mt-4">
                {proposal.project ? (
                  <Link href={`/projects/${proposal.project.id}`} className="text-sm font-medium text-zinc-900 underline underline-offset-2 hover:text-zinc-700">
                    {proposal.project.title}
                  </Link>
                ) : (
                  <p className="text-sm text-zinc-400">No project linked.</p>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
