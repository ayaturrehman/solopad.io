
import { getSession } from "@/lib/session";
import db from "@/lib/db";
import { redirect } from "next/navigation";
import ContractBuilderClient from "./ContractBuilderClient";

export default async function NewContractPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const projects = await db.project.findMany({
    where: { userId: session.user.id, archived: false },
    select: { id: true, title: true, contact: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  return <ContractBuilderClient projects={projects} />;
}
