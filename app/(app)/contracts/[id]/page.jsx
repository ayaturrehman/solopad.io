import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  FileSignature,
  FolderOpen,
  Mail,
  Send,
  XCircle,
} from "lucide-react";
import db from "@/lib/db";
import { getSession } from "@/lib/session";
import { formatDate } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import ContractActions from "./ContractActions";
import ContractPreview from "./ContractPreview";

const STATUS_CONFIG = {
  draft:     { label: "Draft",     className: "bg-zinc-100 text-zinc-600",   icon: FileSignature },
  sent:      { label: "Sent",      className: "bg-blue-100 text-blue-700",   icon: Send },
  signed:    { label: "Signed",    className: "bg-green-100 text-green-700", icon: CheckCircle2 },
  expired:   { label: "Expired",   className: "bg-red-100 text-red-600",     icon: XCircle },
  cancelled: { label: "Cancelled", className: "bg-zinc-100 text-zinc-400",   icon: XCircle },
};

function parseClauses(raw) {
  if (!raw) return [];
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function getTimelineLabel(contract) {
  if (contract.signedAt) return `Signed ${formatDate(contract.signedAt)}`;
  if (contract.sentAt) return `Sent ${formatDate(contract.sentAt)}`;
  return `Created ${formatDate(contract.createdAt)}`;
}

export default async function ContractDetailPage({ params }) {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const { id } = await params;
  const [contract, defaultTemplate] = await Promise.all([
    db.contract.findFirst({
      where: { id, userId: session.user.id },
      include: { project: { select: { id: true, title: true } } },
    }),
    db.pdfTemplate.findFirst({
      where: { userId: session.user.id, type: "contract", isDefault: true },
    }),
  ]);

  if (!contract) notFound();

  const status = STATUS_CONFIG[contract.status] ?? STATUS_CONFIG.draft;
  const StatusIcon = status.icon;
  const clauses = parseClauses(contract.clauses);

  return (
    <div className="px-4 py-4 md:px-6">
      {/* Back */}
      <Link
        href="/contracts"
        className="mb-3 inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-900"
      >
        <ArrowLeft className="h-4 w-4" />
        All contracts
      </Link>

      {/* Page header */}
      <div className="mb-4 flex flex-col gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="truncate text-lg font-semibold leading-tight text-zinc-900">
            {contract.title}
          </h1>
          <Badge className={status.className}>
            <StatusIcon className="mr-1 h-3 w-3" />
            {status.label}
          </Badge>
          <span className="text-sm text-zinc-400">{getTimelineLabel(contract)}</span>
        </div>
        <ContractActions
          contractId={id}
          title={contract.title}
          clientName={contract.clientName}
          clientEmail={contract.clientEmail}
          status={contract.status}
          contract={contract}
        />
      </div>

      {/* Two-column layout */}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px] xl:items-start">

        {/* Main — contract preview */}
        <div className="min-w-0 overflow-hidden rounded border border-zinc-200 bg-white">
          <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-2.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
              Preview
              {defaultTemplate ? <span className="ml-2 font-normal normal-case tracking-normal text-zinc-300">— {defaultTemplate.name}</span> : null}
            </span>
            <Link
              href={`/contracts/${id}/edit`}
              className="text-xs text-zinc-400 transition-colors hover:text-zinc-700"
            >
              Edit contract
            </Link>
          </div>
          <ContractPreview contract={contract} template={defaultTemplate} />
        </div>

        {/* Sidebar */}
        <aside className="space-y-px xl:sticky xl:top-4">
          <div className="overflow-hidden rounded border border-zinc-200 bg-white">

            {/* Client */}
            <section className="space-y-2 px-4 py-3">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">Client</h2>
              <dl className="space-y-1.5 text-sm">
                <div className="flex items-center gap-1.5">
                  <FileSignature className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                  <span className="font-medium text-zinc-900">{contract.clientName}</span>
                </div>
                {contract.clientEmail && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                    <span className="truncate text-zinc-600">{contract.clientEmail}</span>
                  </div>
                )}
              </dl>
            </section>

            <div className="h-px bg-zinc-100" />

            {/* Dates */}
            <section className="space-y-2 px-4 py-3">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">Dates</h2>
              <div className="space-y-1.5 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-zinc-500">Created</span>
                  <span className="text-zinc-900">{formatDate(contract.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-zinc-500">Sent</span>
                  <span className="text-zinc-900">
                    {contract.sentAt
                      ? formatDate(contract.sentAt)
                      : <span className="text-zinc-400">Not sent</span>}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-zinc-500">Signed</span>
                  <span className="text-zinc-900">
                    {contract.signedAt
                      ? <span className="font-medium text-green-700">{formatDate(contract.signedAt)}</span>
                      : <span className="text-zinc-400">Awaiting</span>}
                  </span>
                </div>
              </div>
            </section>

            {/* Linked project */}
            {contract.project && (
              <>
                <div className="h-px bg-zinc-100" />
                <section className="space-y-1.5 px-4 py-3">
                  <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">Project</h2>
                  <Link
                    href={`/projects/${contract.project.id}`}
                    className="inline-flex items-center gap-2 text-sm text-zinc-900 transition-colors hover:text-blue-600"
                  >
                    <FolderOpen className="h-4 w-4 text-zinc-400" />
                    {contract.project.title}
                  </Link>
                </section>
              </>
            )}

            <div className="h-px bg-zinc-100" />
            <section className="px-4 py-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500">Clauses</span>
                <span className="font-medium text-zinc-900">{clauses.length}</span>
              </div>
            </section>

          </div>
        </aside>
      </div>
    </div>
  );
}
