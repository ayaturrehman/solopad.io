"use client";

import ProposalBuilderClient from "../../new/ProposalBuilderClient";

export default function ProposalEditClient({ proposal, projects, defaultTemplate }) {
  return (
    <ProposalBuilderClient
      projects={projects}
      initialProposal={proposal}
      defaultTemplate={defaultTemplate}
      mode="edit"
    />
  );
}
