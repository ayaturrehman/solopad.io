import Link from "next/link";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  FolderOpen,
  Globe,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import db from "@/lib/db";
import { getTenantFilter } from "@/lib/tenant";
import ContactEditForm from "./ContactEditForm";
import Badge from "@/components/ui/Badge";
import {
  STATUS_COLORS as PROJECT_STATUS_COLORS,
  STATUS_LABELS as PROJECT_STATUS_LABELS,
  formatCurrency,
  formatDate,
} from "@/lib/utils";

const CONTACT_STATUS_COLORS = {
  lead: "bg-amber-50 text-amber-700",
  active: "bg-green-50 text-green-700",
  archived: "bg-zinc-100 text-zinc-600",
};

const CONTACT_STATUS_LABELS = {
  lead: "Lead",
  active: "Client",
  archived: "Archived",
};

const TABS = ["overview", "projects", "notes"];

function getTabHref(contactId, tab) {
  return tab === "overview" ? `/contacts/${contactId}` : `/contacts/${contactId}?tab=${tab}`;
}

function getWebsiteHref(website) {
  if (!website) return null;
  return /^https?:\/\//i.test(website) ? website : `https://${website}`;
}

function StatTile({ label, value, note }) {
  return (
    <div className="px-4 py-4 sm:px-5">
      <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-400">{label}</p>
      <p className="mt-2 text-2xl font-medium tracking-tight text-zinc-900">{value}</p>
      <p className="mt-1 text-xs text-zinc-500">{note}</p>
    </div>
  );
}

function QuickAction({ href, icon: Icon, label, external = false }) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className="inline-flex h-9 items-center justify-center gap-2 rounded border border-zinc-200 px-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
    >
      <Icon className="h-4 w-4 text-zinc-400" />
      {label}
    </a>
  );
}

function Section({ title, description, children, action }) {
  return (
    <section className="border-b border-zinc-200 py-6 first:pt-0 last:border-b-0 last:pb-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-medium text-zinc-900">{title}</h2>
          {description ? <p className="mt-1 text-sm text-zinc-500">{description}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function DetailRow({ label, value, icon: Icon, href, external = false, emptyLabel = "Not added" }) {
  const hasValue = Boolean(value);

  return (
    <div className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
      {Icon ? (
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded bg-zinc-100 text-zinc-500">
          <Icon className="h-4 w-4" />
        </div>
      ) : null}

      <div className="min-w-0 flex-1">
        <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-400">{label}</p>
        {hasValue && href ? (
          <a
            href={href}
            target={external ? "_blank" : undefined}
            rel={external ? "noreferrer" : undefined}
            className="mt-1 block break-words text-sm font-medium text-zinc-900 transition-colors hover:text-blue-700"
          >
            {value}
          </a>
        ) : hasValue ? (
          <p className="mt-1 break-words text-sm text-zinc-900">{value}</p>
        ) : (
          <p className="mt-1 text-sm text-zinc-400">{emptyLabel}</p>
        )}
      </div>
    </div>
  );
}

function MetricRow({ label, value, emptyLabel = "Not set" }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <dt className="text-sm text-zinc-500">{label}</dt>
      <dd className="text-right text-sm font-medium text-zinc-900">{value || emptyLabel}</dd>
    </div>
  );
}

function EmptyState({ title, description, action }) {
  return (
    <div className="border border-dashed border-zinc-200 px-6 py-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100">
        <FolderOpen className="h-5 w-5 text-zinc-400" />
      </div>
      <p className="mt-4 text-sm font-medium text-zinc-700">{title}</p>
      <p className="mt-1 text-sm text-zinc-500">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

function OverviewTab({
  companyAddress,
  contact,
  latestProjectUpdate,
  websiteHref,
}) {
  return (
    <div className="space-y-0">
      <Section title="Reach out">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            {contact.email || contact.phone || websiteHref ? (
              <div className="flex flex-wrap gap-2">
                {contact.email ? (
                  <QuickAction href={`mailto:${contact.email}`} icon={Mail} label="Email" />
                ) : null}
                {contact.phone ? (
                  <QuickAction href={`tel:${contact.phone}`} icon={Phone} label="Call" />
                ) : null}
                {websiteHref ? (
                  <QuickAction href={websiteHref} icon={Globe} label="Visit site" external />
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-zinc-500">No direct contact methods have been added yet.</p>
            )}

            <div className="mt-5 divide-y divide-zinc-100">
              <DetailRow
                label="Email"
                value={contact.email}
                icon={Mail}
                href={contact.email ? `mailto:${contact.email}` : undefined}
              />
              <DetailRow
                label="Phone"
                value={contact.phone}
                icon={Phone}
                href={contact.phone ? `tel:${contact.phone}` : undefined}
              />
              <DetailRow
                label="Website"
                value={contact.website}
                icon={Globe}
                href={websiteHref || undefined}
                external={Boolean(websiteHref)}
              />
              <DetailRow
                label="Company address"
                value={companyAddress}
                icon={MapPin}
              />
            </div>
          </div>

          <div className="border-t border-zinc-200 pt-5 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <dl className="divide-y divide-zinc-100">
              <MetricRow label="Lead source" value={contact.source} />
              <MetricRow
                label="Est. value"
                value={typeof contact.value === "number" ? formatCurrency(contact.value) : null}
              />
              <MetricRow label="Created" value={formatDate(contact.createdAt)} />
              <MetricRow label="Last updated" value={formatDate(contact.updatedAt)} />
              <MetricRow
                label="Latest project touch"
                value={latestProjectUpdate ? formatDate(latestProjectUpdate) : null}
                emptyLabel="No project activity"
              />
            </dl>
          </div>
        </div>
      </Section>

      <Section title="Notes" description="Internal context for future follow-up.">
        {contact.notes ? (
          <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-600">{contact.notes}</p>
        ) : (
          <p className="text-sm text-zinc-500">No internal notes have been added yet.</p>
        )}
      </Section>
    </div>
  );
}

function ProjectsTab({ contact, newProjectHref }) {
  return (
    <Section
      title="Linked projects"
      action={(
        <Link
          href={newProjectHref}
          className="inline-flex h-8 items-center justify-center rounded bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          New project
        </Link>
      )}
    >
      {contact.projects.length === 0 ? (
        <EmptyState
          title="No projects linked yet"
          description="Create the first project for this contact to track work and billing in one place."
          action={(
            <Link
              href={newProjectHref}
              className="inline-flex h-8 items-center justify-center rounded bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Create first project
            </Link>
          )}
        />
      ) : (
        <div className="divide-y divide-zinc-200">
          {contact.projects.map((project) => {
            const paidRevenue = project.invoices
              .filter((invoice) => invoice.status === "paid")
              .reduce((sum, invoice) => sum + invoice.total, 0);
            const unpaid = project.invoices
              .filter((invoice) => invoice.status !== "paid" && invoice.status !== "cancelled")
              .reduce((sum, invoice) => sum + invoice.total, 0);

            return (
              <div key={project.id} className="py-5 first:pt-0 last:pb-0">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        prefetch={false}
                        href={`/projects/${project.id}`}
                        className="text-lg font-medium tracking-tight text-zinc-900 transition-colors hover:text-blue-700"
                      >
                        {project.title}
                      </Link>
                      <Badge className={PROJECT_STATUS_COLORS[project.status]}>
                        {PROJECT_STATUS_LABELS[project.status]}
                      </Badge>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-zinc-500">
                      <span>Updated {formatDate(project.updatedAt)}</span>
                      {project.endDate ? <span>Due {formatDate(project.endDate)}</span> : null}
                      <span>{project.invoices.length} invoices</span>
                    </div>

                    {project.description ? (
                      <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
                        {project.description}
                      </p>
                    ) : null}
                  </div>

                  <div className="shrink-0 text-left lg:min-w-[170px] lg:text-right">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-400">Outstanding</p>
                    <p className="mt-1 text-lg font-medium text-zinc-900">{formatCurrency(unpaid)}</p>
                    <p className="mt-1 text-xs text-zinc-500">Paid {formatCurrency(paidRevenue)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Section>
  );
}

function NotesTab({ notes }) {
  return (
    <Section title="Notes" description="Internal commentary, reminders, and relationship context.">
      {notes ? (
        <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-600">{notes}</p>
      ) : (
        <p className="text-sm text-zinc-500">No notes added for this contact yet.</p>
      )}
    </Section>
  );
}

export default async function ContactDetailPage({ params, searchParams }) {
  const { id } = await params;
  const sp = await searchParams;
  const tab = TABS.includes(sp?.tab) ? sp.tab : "overview";

  const session = await getSession();
  if (!session?.user) redirect("/login");

  const filter = await getTenantFilter(session);

  const contact = await db.contact.findFirst({
    where: { id, ...filter },
    include: {
      projects: {
        // Only load full invoices on the projects tab; overview/notes just need counts
        include: tab === "projects"
          ? { invoices: { select: { id: true, total: true, status: true } } }
          : { invoices: { select: { total: true, status: true } } },
        orderBy: { updatedAt: "desc" },
        take: 50,
      },
    },
  });

  if (!contact) redirect("/contacts");

  const totalRevenue = contact.projects
    .flatMap((project) => project.invoices)
    .filter((invoice) => invoice.status === "paid")
    .reduce((sum, invoice) => sum + invoice.total, 0);

  const totalOutstanding = contact.projects
    .flatMap((project) => project.invoices)
    .filter((invoice) => invoice.status !== "paid" && invoice.status !== "cancelled")
    .reduce((sum, invoice) => sum + invoice.total, 0);

  const companyAddress = [
    contact.companyAddressLine1,
    contact.companyCity,
    contact.companyState,
    contact.companyPostalCode,
    contact.companyCountry,
  ]
    .filter(Boolean)
    .join(", ");

  const websiteHref = getWebsiteHref(contact.website);
  const latestProjectUpdate = contact.projects[0]?.updatedAt || null;
  const newProjectHref = `/projects/new?contactId=${contact.id}&clientName=${encodeURIComponent(contact.name)}&clientEmail=${encodeURIComponent(contact.email || "")}`;

  return (
    <div className="mx-auto space-y-6 px-4 sm:px-5 bg-white py-6">
      <Link
        href="/contacts"
        className="inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-900"
      >
        <ArrowLeft className="h-4 w-4" />
        All contacts
      </Link>

      <div className="">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-lg font-semibold text-white">
                {contact.name.charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-3xl font-medium tracking-tight text-zinc-900">{contact.name}</h1>
                  <Badge className={CONTACT_STATUS_COLORS[contact.status]}>
                    {CONTACT_STATUS_LABELS[contact.status]}
                  </Badge>
                  <Badge className="bg-blue-50 text-blue-700">
                    {contact.entityType === "organization" ? "Organisation" : "Individual"}
                  </Badge>
                </div>

                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-zinc-500">
                  {contact.company ? (
                    <span className="inline-flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-zinc-400" />
                      {contact.company}
                    </span>
                  ) : null}
                  {contact.jobTitle ? (
                    <span className="inline-flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-zinc-400" />
                      {contact.jobTitle}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={newProjectHref}
              className="inline-flex h-9 items-center justify-center rounded bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              New project
            </Link>
            <ContactEditForm
              contact={contact}
              className="flex flex-wrap gap-2"
            />
          </div>
        </div>
      </div>

      <div className="overflow-hidden border-zinc-200 bg-white">
        <div className="grid divide-y divide-zinc-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <StatTile
            label="Projects"
            value={contact.projects.length}
            note={contact.projects.length ? "Linked workspaces" : "No projects yet"}
          />
          <StatTile
            label="Revenue"
            value={formatCurrency(totalRevenue)}
            note={totalRevenue > 0 ? "Collected across paid invoices" : "No paid invoices yet"}
          />
          <StatTile
            label="Outstanding"
            value={formatCurrency(totalOutstanding)}
            note={totalOutstanding > 0 ? "Open invoice balance" : "Nothing outstanding"}
          />
        </div>
      </div>

      <div className="border-b border-zinc-200">
        {[
          { id: "overview", label: "Overview" },
          { id: "projects", label: `Projects${contact.projects.length ? ` (${contact.projects.length})` : ""}` },
          { id: "notes", label: "Notes" },
        ].map((item) => (
          <Link
            key={item.id}
            href={getTabHref(contact.id, item.id)}
            className={`relative mr-8 inline-flex h-12 items-center text-sm font-medium transition-colors ${
              tab === item.id ? "text-blue-600" : "text-zinc-400 hover:text-zinc-700"
            }`}
          >
            <span>{item.label}</span>
            <span
              className={`absolute inset-x-0 bottom-0 h-0.5 transition-opacity ${
                tab === item.id ? "bg-blue-600 opacity-100" : "bg-transparent opacity-0"
              }`}
            />
          </Link>
        ))}
      </div>

      {tab === "overview" && (
        <OverviewTab
          companyAddress={companyAddress}
          contact={contact}
          latestProjectUpdate={latestProjectUpdate}
          websiteHref={websiteHref}
        />
      )}

      {tab === "projects" && (
        <ProjectsTab
          contact={contact}
          newProjectHref={newProjectHref}
        />
      )}

      {tab === "notes" && <NotesTab notes={contact.notes} />}
    </div>
  );
}
