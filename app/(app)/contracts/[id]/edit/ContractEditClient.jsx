"use client";

import ContractBuilderClient from "../../new/ContractBuilderClient";

export default function ContractEditClient({ contract, projects, contacts }) {
  return <ContractBuilderClient initialContract={contract} projects={projects} contacts={contacts} mode="edit" />;
}
