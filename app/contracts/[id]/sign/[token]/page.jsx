import { notFound } from "next/navigation";
import db from "@/lib/db";
import ContractSigningClient from "./ContractSigningClient";

export default async function ContractSignPage({ params }) {
  const { id, token } = await params;

  const contract = await db.contract.findFirst({
    where: { id, signingToken: token },
    include: {
      user: { select: { name: true, companyName: true, email: true } },
      business: { select: { name: true, logoUrl: true } },
    },
  });

  if (!contract) notFound();

  let clauses = [];
  try {
    clauses = typeof contract.clauses === "string" ? JSON.parse(contract.clauses) : (contract.clauses || []);
  } catch { clauses = []; }

  const preparedBy = contract.business?.name || contract.user?.companyName || contract.user?.name || "SoloPad";

  return (
    <ContractSigningClient
      contractId={id}
      token={token}
      title={contract.title}
      clientName={contract.clientName}
      preparedBy={preparedBy}
      clauses={clauses}
      status={contract.status}
      signedAt={contract.signedAt?.toISOString() || null}
      signatureName={contract.signatureName || null}
    />
  );
}
