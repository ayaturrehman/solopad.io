import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  FolderOpen,
  Mail,
  Send,
  User,
  XCircle,
} from "lucide-react";
import { getSession } from "@/lib/session";
import db from "@/lib/db";
import Badge from "@/components/ui/Badge";
import ProposalActions from "./ProposalActions";
import ProposalPreview from "./ProposalPreview";
import { formatDate } from "@/lib/utils";

const STATUS_CONFIG = {
  draft: { label: "Draft", className: "bg-zinc-100 text-zinc-700", icon: FileText },
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

function getPreparedBy(proposal) {
  return (
    proposal.business?.name ||
    proposal.user?.companyName ||
    proposal.user?.name ||
    "Solopad"
  );
}

function getTimelineLabel(proposal) {
  if (proposal.acceptedAt) return `Accepted ${formatDate(proposal.acceptedAt)}`;
  if (proposal.sentAt) return `Sent ${formatDate(proposal.sentAt)}`;
  return `Created ${formatDate(proposal.createdAt)}`;
}


export default async function ProposalDetailPage({ params }) {
  const { id } = await params;
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const proposal = await db.proposal.findFirst({
    where: { id, userId: session.user.id },
    include: {
      business: { select: { name: true, logoUrl: true } },
      user: { select: { name: true, email: true, companyName: true, companyLogo: true } },
      project: {
        select: {
          id: true,
          title: true,
          files: {
            orderBy: { createdAt: "desc" },
            take: 6,
            select: {
              id: true,
              name: true,
              path: true,
              sizeBytes: true,
              label: true,
              uploadedBy: true,
              visibleToClient: true,
              createdAt: true,
            },
          },
          comments: {
            orderBy: { createdAt: "desc" },
            take: 4,
            select: {
              id: true,
              authorName: true,
              authorType: true,
              body: true,
              createdAt: true,
            },
          },
          notes: {
            orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
            take: 4,
            select: {
              id: true,
              title: true,
              body: true,
              pinned: true,
              visibleToClient: true,
              updatedAt: true,
            },
          },
        },
      },
    },
  });

  if (!proposal) redirect("/proposals");

  const defaultTemplate = await db.pdfTemplate.findFirst({
    where: { userId: session.user.id, type: "proposal", isDefault: true },
  });

  const status = STATUS_CONFIG[proposal.status] ?? STATUS_CONFIG.draft;
  const StatusIcon = status.icon;
  const preparedBy = getPreparedBy(proposal);

  return (
    <div className="px-4 py-4 md:px-6">
      {/* Back link */}
      <Link
        href="/proposals"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-900 mb-3"
      >
        <ArrowLeft className="h-4 w-4" />
        All proposals
      </Link>

      {/* Page header */}
      <div className="flex flex-col gap-2.5 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-lg font-semibold text-zinc-900 leading-tight truncate">
            {proposal.title}
          </h1>
          <Badge className={status.className}>
            <StatusIcon className="mr-1 h-3 w-3" />
            {status.label}
          </Badge>
          <span className="text-sm text-zinc-400">{getTimelineLabel(proposal)}</span>
        </div>
        <ProposalActions
          proposalId={id}
          title={proposal.title}
          clientName={proposal.clientName}
          clientEmail={proposal.clientEmail}
          status={proposal.status}
          proposal={proposal}
        />
      </div>

      {/* Two-column layout */}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px] xl:items-start">

        {/* Main content — PDF preview */}
        <div className="min-w-0 rounded border border-zinc-200 bg-white overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-100">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
              Preview
              {defaultTemplate ? <span className="ml-2 normal-case font-normal tracking-normal text-zinc-300">— {defaultTemplate.name}</span> : null}
            </span>
            {defaultTemplate ? (
              <Link href={`/settings/pdf-templates/${defaultTemplate.id}/edit`} className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors">
                Edit template
              </Link>
            ) : (
              <Link href="/settings/pdf-templates" className="text-xs text-blue-600 hover:text-blue-700">
                Set up a template →
              </Link>
            )}
          </div>
          <ProposalPreview proposal={proposal} template={defaultTemplate} />
        </div>

        {/* Sidebar */}
        <aside className="xl:sticky xl:top-4 space-y-px">
          <div className="rounded border border-zinc-200 bg-white overflow-hidden">

            {/* Client */}
            <section className="px-4 py-3 space-y-2">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">Client</h2>
              <dl className="space-y-1.5 text-sm">
                <div className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                  <span className="font-medium text-zinc-900">{proposal.clientName}</span>
                </div>
                {proposal.clientEmail ? (
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                    <span className="text-zinc-600 truncate">{proposal.clientEmail}</span>
                  </div>
                ) : null}
                <div className="pt-1.5 border-t border-zinc-100 flex items-center justify-between">
                  <span className="text-zinc-500">Prepared by</span>
                  <span className="text-zinc-900">{preparedBy}</span>
                </div>
              </dl>
            </section>

            <div className="h-px bg-zinc-100" />

            {/* Dates */}
            <section className="px-4 py-3 space-y-2">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">Dates</h2>
              <div className="space-y-1.5 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-zinc-500">Created</span>
                  <span className="text-zinc-900">{formatDate(proposal.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-zinc-500">Sent</span>
                  <span className="text-zinc-900">
                    {proposal.sentAt ? formatDate(proposal.sentAt) : <span className="text-zinc-400">Not sent</span>}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-zinc-500">Valid until</span>
                  <span className="text-zinc-900">
                    {proposal.validUntil ? formatDate(proposal.validUntil) : <span className="text-zinc-400">Not set</span>}
                  </span>
                </div>
                {proposal.acceptedAt ? (
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-zinc-500">Accepted</span>
                    <span className="text-zinc-900">{formatDate(proposal.acceptedAt)}</span>
                  </div>
                ) : null}
              </div>
            </section>

            {/* Linked project */}
            {proposal.project ? (
              <>
                <div className="h-px bg-zinc-100" />
                <section className="px-4 py-3 space-y-1.5">
                  <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">Project</h2>
                  <Link
                    href={`/projects/${proposal.project.id}`}
                    className="inline-flex items-center gap-2 text-sm text-zinc-900 transition-colors hover:text-blue-600"
                  >
                    <FolderOpen className="h-4 w-4 text-zinc-400" />
                    {proposal.project.title}
                  </Link>
                </section>
              </>
            ) : null}

          </div>
        </aside>
      </div>

    </div>
  );
}
