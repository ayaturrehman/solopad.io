
import { getSession } from "@/lib/session";
import db from "@/lib/db";
import { redirect } from "next/navigation";
import ContractStartPicker from "./ContractStartPicker";

export default async function NewContractPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const [projects, contacts, recentContracts] = await Promise.all([
    db.project.findMany({
      where: { userId: session.user.id, archived: false },
      select: { id: true, title: true, contact: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    }),
    db.contact.findMany({
      where: { userId: session.user.id },
      select: { id: true, name: true, email: true, company: true },
      orderBy: { name: "asc" },
    }),
    db.contract.findMany({
      where: { userId: session.user.id },
      select: { id: true, title: true, clientName: true, clientEmail: true, projectId: true, clauses: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
  ]);

  return (
    <ContractStartPicker
      projects={projects}
      contacts={contacts}
      recentContracts={recentContracts}
    />
  );
}
