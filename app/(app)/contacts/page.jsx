import { Suspense } from "react";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";
import db from "@/lib/db";
import { redirect } from "next/navigation";
import ContactsTable from "./ContactsTable";
import { getTenantFilter } from "@/lib/tenant";

export const revalidate = 30;

const DEFAULT_PAGE_SIZE = 10;
const VALID_PAGE_SIZES = new Set([10, 25, 50]);
const VALID_STATUS = new Set(["lead", "active", "archived"]);
const VALID_SORT_FIELDS = new Set(["name", "company", "source", "value", "createdAt", "status"]);
const VALID_SORT_DIRECTIONS = new Set(["asc", "desc"]);

export default async function ContactsPage({ searchParams }) {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const params = await searchParams;
  const filter = await getTenantFilter(session);
  const query = typeof params?.q === "string" ? params.q.trim() : "";
  const status = typeof params?.status === "string" && VALID_STATUS.has(params.status)
    ? params.status
    : "all";
  const sortBy = typeof params?.sortBy === "string" && VALID_SORT_FIELDS.has(params.sortBy)
    ? params.sortBy
    : null;
  const sortDir = typeof params?.sortDir === "string" && VALID_SORT_DIRECTIONS.has(params.sortDir)
    ? params.sortDir
    : "asc";

  // Page size: URL param > cookie > default
  // Cookie is set by the client when user changes page size, so server always matches
  const cookieStore = await cookies();
  const cookiePageSize = Number.parseInt(cookieStore.get("contacts-pageSize")?.value || "", 10);
  const fallbackPageSize = VALID_PAGE_SIZES.has(cookiePageSize) ? cookiePageSize : DEFAULT_PAGE_SIZE;
  const requestedPageSize = Number.parseInt(typeof params?.pageSize === "string" ? params.pageSize : `${fallbackPageSize}`, 10);
  const pageSize = VALID_PAGE_SIZES.has(requestedPageSize) ? requestedPageSize : fallbackPageSize;
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
        { website: { contains: query, mode: "insensitive" } },
        { source: { contains: query, mode: "insensitive" } },
        { companyCity: { contains: query, mode: "insensitive" } },
      ],
    }),
    ...(status !== "all" ? { status } : {}),
  };

  const orderBy = sortBy
    ? [
      { [sortBy]: sortDir },
      { updatedAt: "desc" },
    ]
    : [{ updatedAt: "desc" }];

  // Run ALL 3 queries in parallel (was 2 sequential batches → 1 parallel batch)
  const [totalCount, statusGroups, contacts] = await Promise.all([
    db.contact.count({ where }),
    db.contact.groupBy({ by: ["status"], where: filter, _count: { _all: true } }),
    db.contact.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { _count: { select: { projects: true } } },
    }),
  ]);

  const allCount = statusGroups.reduce((s, g) => s + g._count._all, 0);
  const leadCount = statusGroups.find((g) => g.status === "lead")?._count._all ?? 0;
  const activeCount = statusGroups.find((g) => g.status === "active")?._count._all ?? 0;
  const archivedCount = statusGroups.find((g) => g.status === "archived")?._count._all ?? 0;

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(page, totalPages);

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
        pageSize={pageSize}
        query={query}
        status={status}
        sortBy={sortBy}
        sortDir={sortDir}
        totalCount={totalCount}
        totalPages={totalPages}
      />
    </Suspense>
  );
}
