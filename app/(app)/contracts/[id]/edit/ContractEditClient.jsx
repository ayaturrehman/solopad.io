"use client";

import ContractBuilderClient from "../../new/ContractBuilderClient";

export default function ContractEditClient({ contract, projects }) {
  return <ContractBuilderClient initialContract={contract} projects={projects} mode="edit" />;
}
