import { Suspense } from "react";
import { getSession } from "@/lib/session";
import db from "@/lib/db";
import { redirect } from "next/navigation";
import ContactsTable from "./ContactsTable";
import { getTenantFilter } from "@/lib/tenant";

const PAGE_SIZE = 10;
const VALID_STATUS = new Set(["lead", "active", "archived"]);

export default async function ContactsPage({ searchParams }) {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const params = await searchParams;
  const filter = await getTenantFilter(session);
  const query = typeof params?.q === "string" ? params.q.trim() : "";
  const status = typeof params?.status === "string" && VALID_STATUS.has(params.status)
    ? params.status
    : "all";
  const requestedPage = Number.parseInt(typeof params?.page === "string" ? params.page : "1", 10);
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const where = {
    ...filter,
    ...(query && {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
        { company: { contains: query, mode: "insensitive" } },
        { phone: { contains: query, mode: "insensitive" } },
      ],
    }),
    ...(status !== "all" ? { status } : {}),
  };

  const [totalCount, allCount, leadCount, activeCount, archivedCount] = await Promise.all([
    db.contact.count({ where }),
    db.contact.count({ where: filter }),
    db.contact.count({ where: { ...filter, status: "lead" } }),
    db.contact.count({ where: { ...filter, status: "active" } }),
    db.contact.count({ where: { ...filter, status: "archived" } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const contacts = await db.contact.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    include: { _count: { select: { projects: true } } },
  });

  return (
    <Suspense fallback={null}>
      <ContactsTable
        contacts={contacts}
        counts={{
          all: allCount,
          lead: leadCount,
          active: activeCount,
          archived: archivedCount,
        }}
        currentPage={currentPage}
        pageSize={PAGE_SIZE}
        query={query}
        status={status}
        totalCount={totalCount}
        totalPages={totalPages}
      />
    </Suspense>
  );
}
