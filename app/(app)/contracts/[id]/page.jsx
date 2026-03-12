import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, FileSignature } from "lucide-react";
import db from "@/lib/db";
import { getSession } from "@/lib/session";
import { cn, formatDate } from "@/lib/utils";

const STATUS_CONFIG = {
  draft: { label: "Draft", color: "bg-zinc-100 text-zinc-600" },
  sent: { label: "Sent", color: "bg-blue-100 text-blue-700" },
  signed: { label: "Signed", color: "bg-green-100 text-green-700" },
};

function parseClauses(rawClauses) {
  if (!rawClauses) return [];

  try {
    const parsed = JSON.parse(rawClauses);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default async function ContractDetailPage({ params }) {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const { id } = await params;
  const contract = await db.contract.findFirst({
    where: { id, userId: session.user.id },
    include: { project: { select: { id: true, title: true } } },
  });

  if (!contract) notFound();

  const status = STATUS_CONFIG[contract.status] ?? STATUS_CONFIG.draft;
  const clauses = parseClauses(contract.clauses);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/contracts" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900">
          <ArrowLeft className="h-4 w-4" />
          Contracts
        </Link>
        <span className="text-zinc-300">/</span>
        <span className="text-sm font-medium text-zinc-900">{contract.title}</span>
      </div>

      <div className="rounded border border-zinc-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded bg-zinc-100 text-zinc-500">
                <FileSignature className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-zinc-900">{contract.title}</h1>
                <p className="text-sm text-zinc-500">
                  {contract.clientName}
                  {contract.clientEmail ? ` · ${contract.clientEmail}` : ""}
                </p>
              </div>
            </div>
            <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", status.color)}>
              {status.label}
            </span>
          </div>

          <div className="grid min-w-[240px] gap-3 text-sm text-zinc-600 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Project</p>
              <p className="mt-1">
                {contract.project ? <Link href={`/projects/${contract.project.id}`} className="text-zinc-900 hover:underline">{contract.project.title}</Link> : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Created</p>
              <p className="mt-1 text-zinc-900">{formatDate(contract.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Sent</p>
              <p className="mt-1 text-zinc-900">{contract.sentAt ? formatDate(contract.sentAt) : "—"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Signed</p>
              <p className="mt-1 text-zinc-900">{contract.signedAt ? formatDate(contract.signedAt) : "—"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Signature name</p>
              <p className="mt-1 text-zinc-900">{contract.signatureName || "—"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded border border-zinc-200 bg-white p-6">
        <div className="mb-5">
          <h2 className="text-sm font-semibold text-zinc-900">Clauses</h2>
          <p className="mt-1 text-sm text-zinc-500">Contract terms and sections saved with this agreement.</p>
        </div>

        {clauses.length === 0 ? (
          <p className="text-sm text-zinc-400">No clauses saved for this contract.</p>
        ) : (
          <div className="space-y-5">
            {clauses.map((clause, index) => (
              <section key={`${contract.id}-${index}`} className="rounded border border-zinc-100 p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Clause {index + 1}</p>
                <h3 className="mt-2 text-base font-semibold text-zinc-900">{clause.heading || `Section ${index + 1}`}</h3>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-600">{clause.body || "—"}</p>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
