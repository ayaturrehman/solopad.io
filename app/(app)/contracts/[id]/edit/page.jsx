
import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import db from "@/lib/db";
import ContractEditClient from "./ContractEditClient";

export default async function ContractEditPage({ params }) {
  const { id } = await params;
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const [contract, projects, contacts] = await Promise.all([
    db.contract.findFirst({
      where: { id, userId: session.user.id },
      include: { project: { select: { id: true, title: true } } },
    }),
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
  ]);

  if (!contract) notFound();

  return <ContractEditClient contract={contract} projects={projects} contacts={contacts} />;
}
