
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
  Pencil,
  FolderOpen,
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/proposals" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900">
          <ArrowLeft className="h-4 w-4" />
          All proposals
        </Link>
        <div className="flex items-center gap-3">
          <Badge className={status.className}>
            <StatusIcon className="mr-1 h-3.5 w-3.5" />
            {status.label}
          </Badge>
          <Link
            href={`/proposals/${id}/edit`}
            className="inline-flex items-center gap-1.5 rounded border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Link>
        </div>
      </div>

      {/* Proposal card */}
      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
        {/* Title + meta row */}
        <div className="flex flex-col gap-6 border-b border-zinc-100 px-8 py-8 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">Proposal</p>
            <h1 className="mt-2 text-3xl font-bold text-zinc-900">{proposal.title}</h1>
            <div className="mt-4 flex flex-wrap gap-5 text-sm text-zinc-500">
              <span className="inline-flex items-center gap-2">
                <User className="h-4 w-4 shrink-0" />
                {proposal.clientName}
              </span>
              {proposal.clientEmail && (
                <span className="inline-flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0" />
                  {proposal.clientEmail}
                </span>
              )}
              <span className="inline-flex items-center gap-2">
                <Calendar className="h-4 w-4 shrink-0" />
                Created {formatDate(proposal.createdAt)}
              </span>
              {proposal.sentAt && (
                <span className="inline-flex items-center gap-2">
                  <Send className="h-4 w-4 shrink-0" />
                  Sent {formatDate(proposal.sentAt)}
                </span>
              )}
            </div>
          </div>

          <div className="shrink-0 rounded-xl border border-zinc-200 bg-zinc-50 px-6 py-5 text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">Total</p>
            <p className="mt-1 text-3xl font-bold text-zinc-900">{formatCurrency(proposal.total, proposal.currency)}</p>
            {proposal.validUntil && (
              <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-zinc-500">
                <Clock className="h-3.5 w-3.5" />
                Valid until {formatDate(proposal.validUntil)}
              </p>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-8">
          {/* Intro */}
          {proposal.intro && (
            <section className="mb-10">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">Introduction</h2>
              <p className="whitespace-pre-wrap text-sm leading-7 text-zinc-600">{proposal.intro}</p>
            </section>
          )}

          {/* Scope */}
          {sections.length > 0 && (
            <section className="mb-10">
              <h2 className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">Scope & Deliverables</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {sections.map((section, index) => (
                  <div key={`${section.heading || "section"}-${index}`} className="rounded-xl border border-zinc-200 p-5">
                    <h3 className="text-sm font-semibold text-zinc-900">{section.heading || `Section ${index + 1}`}</h3>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-zinc-500">{section.body || "No details."}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Pricing + meta side by side */}
          <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
            {/* Pricing table */}
            <section>
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">Pricing breakdown</h2>
              <div className="rounded-xl border border-zinc-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="border-b border-zinc-100 bg-zinc-50">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Description</th>
                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-400">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 bg-white">
                    {pricing.length === 0 ? (
                      <tr>
                        <td colSpan={2} className="px-5 py-4 text-center text-sm text-zinc-400">No pricing added.</td>
                      </tr>
                    ) : (
                      pricing.map((item, index) => (
                        <tr key={`${item.description || "line"}-${index}`}>
                          <td className="px-5 py-3.5 font-medium text-zinc-900">{item.description || `Line item ${index + 1}`}</td>
                          <td className="px-5 py-3.5 text-right font-semibold text-zinc-900">{formatCurrency(item.amount || 0, proposal.currency)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot className="border-t-2 border-zinc-200 bg-zinc-50">
                    <tr>
                      <td className="px-5 py-4 text-sm font-semibold text-zinc-700">Total</td>
                      <td className="px-5 py-4 text-right text-lg font-bold text-zinc-900">{formatCurrency(proposal.total, proposal.currency)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </section>

            {/* Meta panel */}
            <div className="space-y-4">
              {proposal.project && (
                <section className="rounded-xl border border-zinc-200 p-5">
                  <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">Linked project</h2>
                  <Link
                    href={`/projects/${proposal.project.id}`}
                    className="inline-flex items-center gap-2 text-sm font-medium text-zinc-900 hover:text-zinc-600"
                  >
                    <FolderOpen className="h-4 w-4 text-zinc-400" />
                    {proposal.project.title}
                  </Link>
                </section>
              )}

              <section className="rounded-xl border border-zinc-200 p-5">
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">Timeline</h2>
                <div className="space-y-2.5 text-sm text-zinc-600">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Created</span>
                    <span>{formatDate(proposal.createdAt)}</span>
                  </div>
                  {proposal.sentAt && (
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Sent</span>
                      <span>{formatDate(proposal.sentAt)}</span>
                    </div>
                  )}
                  {proposal.acceptedAt && (
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Accepted</span>
                      <span className="font-medium text-green-600">{formatDate(proposal.acceptedAt)}</span>
                    </div>
                  )}
                  {proposal.validUntil && (
                    <div className="flex justify-between border-t border-zinc-100 pt-2.5">
                      <span className="text-zinc-400">Valid until</span>
                      <span>{formatDate(proposal.validUntil)}</span>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
