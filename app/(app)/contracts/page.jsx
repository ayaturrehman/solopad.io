import { Suspense } from "react";
import { getSession } from "@/lib/session";
import db from "@/lib/db";
import { redirect } from "next/navigation";
import ContractsClient from "./ContractsClient";

export const revalidate = 30;

export default async function ContractsPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const contracts = await db.contract.findMany({
    where: { userId: session.user.id },
    include: { project: { select: { id: true, title: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return <Suspense fallback={null}><ContractsClient contracts={contracts} /></Suspense>;
}
