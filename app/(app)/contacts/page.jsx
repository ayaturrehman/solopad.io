export const dynamic = "force-dynamic";

import Link from "next/link";
import { Plus } from "lucide-react";
import { getSession } from "@/lib/session";
import db from "@/lib/db";
import { redirect } from "next/navigation";
import ContactsTable from "./ContactsTable";

export default async function ContactsPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const contacts = await db.contact.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { projects: true } } },
  });

  const leads = contacts.filter((c) => c.status === "lead");
  const active = contacts.filter((c) => c.status === "active");

  return (
    <div>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Contacts</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {contacts.length} contact{contacts.length !== 1 ? "s" : ""} · {leads.length} leads · {active.length} active
          </p>
        </div>
        {contacts.length > 0 && (
          <Link
            href="/contacts/new"
            className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
          >
            <Plus className="h-4 w-4" />
            Add contact
          </Link>
        )}
      </div>

      {contacts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-200 bg-white px-6 py-16 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100">
            <Plus className="h-5 w-5 text-zinc-400" />
          </div>
          <h3 className="mb-2 font-semibold text-zinc-900">No contacts yet</h3>
          <p className="mb-6 text-sm text-zinc-500">Add your first client or lead to keep track of your relationships.</p>
          <Link
            href="/contacts/new"
            className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
          >
            <Plus className="h-4 w-4" />
            Add first contact
          </Link>
        </div>
      ) : (
        <ContactsTable contacts={contacts} />
      )}
    </div>
  );
}
