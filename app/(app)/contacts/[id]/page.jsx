
import Link from "next/link";
import { ArrowLeft, Mail, Phone, Building2, FolderOpen, DollarSign } from "lucide-react";
import { getSession } from "@/lib/session";
import db from "@/lib/db";
import { redirect } from "next/navigation";
import Badge from "@/components/ui/Badge";
import { STATUS_LABELS as PROJECT_STATUS_LABELS, STATUS_COLORS as PROJECT_STATUS_COLORS, formatDate, formatCurrency } from "@/lib/utils";
import ContactEditForm from "./ContactEditForm";

const CONTACT_STATUS_COLORS = {
  lead: "bg-amber-100 text-amber-700",
  active: "bg-green-100 text-green-700",
  archived: "bg-zinc-100 text-zinc-500",
};

const CONTACT_STATUS_LABELS = {
  lead: "Lead",
  active: "Active",
  archived: "Archived",
};

export default async function ContactDetailPage({ params }) {
  const { id } = await params;
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const contact = await db.contact.findFirst({
    where: { id, userId: session.user.id },
    include: {
      projects: {
        include: { invoices: true },
        orderBy: { updatedAt: "desc" },
      },
    },
  });

  if (!contact) redirect("/contacts");

  const totalRevenue = contact.projects
    .flatMap((p) => p.invoices)
    .filter((inv) => inv.status === "paid")
    .reduce((s, inv) => s + inv.total, 0);

  return (
    <div>
      <Link href="/contacts" className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900">
        <ArrowLeft className="h-4 w-4" />
        All contacts
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Contact info & edit */}
        <div className="space-y-5 lg:col-span-1">
          <div className="rounded border border-zinc-200 bg-white p-6">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 text-lg font-bold text-white">
                  {contact.name[0].toUpperCase()}
                </div>
                <h1 className="text-xl font-bold text-zinc-900">{contact.name}</h1>
                {contact.company && (
                  <p className="flex items-center gap-1.5 text-sm text-zinc-500">
                    <Building2 className="h-3.5 w-3.5" /> {contact.company}
                  </p>
                )}
              </div>
              <Badge className={CONTACT_STATUS_COLORS[contact.status]}>
                {CONTACT_STATUS_LABELS[contact.status]}
              </Badge>
            </div>

            <div className="space-y-2 border-t border-zinc-100 pt-4">
              {contact.email && (
                <a href={`mailto:${contact.email}`} className="flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900">
                  <Mail className="h-4 w-4 shrink-0 text-zinc-400" />
                  {contact.email}
                </a>
              )}
              {contact.phone && (
                <a href={`tel:${contact.phone}`} className="flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900">
                  <Phone className="h-4 w-4 shrink-0 text-zinc-400" />
                  {contact.phone}
                </a>
              )}
            </div>

            {contact.notes && (
              <div className="mt-4 rounded bg-zinc-50 p-3 text-sm text-zinc-600">
                {contact.notes}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded border border-zinc-200 bg-white p-4 text-center">
              <FolderOpen className="mx-auto mb-1 h-4 w-4 text-zinc-400" />
              <p className="text-2xl font-bold text-zinc-900">{contact.projects.length}</p>
              <p className="text-xs text-zinc-500">Projects</p>
            </div>
            <div className="rounded border border-zinc-200 bg-white p-4 text-center">
              <DollarSign className="mx-auto mb-1 h-4 w-4 text-zinc-400" />
              <p className="text-2xl font-bold text-zinc-900">{formatCurrency(totalRevenue)}</p>
              <p className="text-xs text-zinc-500">Revenue</p>
            </div>
          </div>

          {/* Edit form */}
          <ContactEditForm contact={contact} />
        </div>

        {/* Right: Projects */}
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-zinc-900">Projects</h2>
            <Link
              href={`/projects/new?contactId=${contact.id}&clientName=${encodeURIComponent(contact.name)}&clientEmail=${encodeURIComponent(contact.email || "")}`}
              className="inline-flex items-center gap-1.5 rounded border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
            >
              New project
            </Link>
          </div>

          {contact.projects.length === 0 ? (
            <div className="rounded border border-dashed border-zinc-200 bg-white px-6 py-12 text-center">
              <p className="text-sm text-zinc-400">No projects yet for this contact.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {contact.projects.map((project) => {
                const unpaid = project.invoices.filter((i) => i.status !== "paid" && i.status !== "cancelled").reduce((s, i) => s + i.total, 0);
                return (
                  <div key={project.id} className="rounded border border-zinc-200 bg-white p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <Link href={`/projects/${project.id}`} className="font-medium text-zinc-900 hover:underline">
                            {project.title}
                          </Link>
                          <Badge className={PROJECT_STATUS_COLORS[project.status]}>
                            {PROJECT_STATUS_LABELS[project.status]}
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs text-zinc-400">{formatDate(project.updatedAt)}</p>
                      </div>
                      {unpaid > 0 && (
                        <span className="text-sm font-medium text-red-600">{formatCurrency(unpaid)} unpaid</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
