"use client";

import { useState } from "react";
import { ArrowLeft, Bot, Copy, FileText, LayoutTemplate } from "lucide-react";
import TemplateGallery from "@/components/templates/TemplateGallery";
import ProposalBuilderClient from "./ProposalBuilderClient";

function PickerCard({ icon: Icon, title, description, onClick, accent = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex flex-col items-start gap-3 rounded-2xl border p-6 text-left transition-all duration-150 hover:shadow-md ${
        accent
          ? "border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-800"
          : "border-zinc-200 bg-white hover:border-zinc-400"
      }`}
    >
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
        accent ? "bg-white/10" : "bg-zinc-100 group-hover:bg-zinc-200"
      } transition-colors`}>
        <Icon className={`h-5 w-5 ${accent ? "text-white" : "text-zinc-700"}`} />
      </div>
      <div>
        <div className={`text-sm font-semibold ${accent ? "text-white" : "text-zinc-900"}`}>{title}</div>
        <div className={`mt-0.5 text-xs leading-relaxed ${accent ? "text-zinc-400" : "text-zinc-500"}`}>{description}</div>
      </div>
    </button>
  );
}

export default function ProposalStartPicker({ projects, user, defaultTemplate, recentProposals }) {
  const [mode, setMode] = useState("pick"); // "pick" | "blank" | "builder"
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [initialProposal, setInitialProposal] = useState(null);
  const [briefOpen, setBriefOpen] = useState(false);

  function handleTemplateSelect(template) {
    const content = template.content || {};
    setInitialProposal({
      title: content.title || template.name,
      intro: content.intro || "",
      sections: content.sections || [],
      pricing: content.pricing || [],
      currency: content.currency || user?.currency || "USD",
      validUntil: content.validDays
        ? new Date(Date.now() + content.validDays * 86400000).toISOString().split("T")[0]
        : "",
      clientName: "",
      clientEmail: "",
      projectId: "",
    });
    setMode("builder");
  }

  function handleDuplicate(proposal) {
    setInitialProposal({
      title: `${proposal.title} (copy)`,
      intro: proposal.intro || "",
      sections: proposal.sections,
      pricing: proposal.pricing,
      currency: proposal.currency || "USD",
      validUntil: "",
      clientName: proposal.clientName || "",
      clientEmail: proposal.clientEmail || "",
      projectId: proposal.projectId || "",
    });
    setMode("builder");
  }

  if (mode === "blank" || mode === "builder") {
    return (
      <div>
        {mode === "builder" && (
          <div className="px-4 pt-3 md:px-6">
            <button
              type="button"
              onClick={() => { setMode("pick"); setInitialProposal(null); }}
              className="mb-2 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Change starting point
            </button>
          </div>
        )}
        <ProposalBuilderClient
          projects={projects}
          user={user}
          defaultTemplate={defaultTemplate}
          initialProposal={mode === "builder" ? initialProposal : null}
          forceAIBrief={briefOpen}
        />
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-2xl px-4 py-10 md:px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-xl font-bold text-zinc-900">New Proposal</h1>
          <p className="mt-1 text-sm text-zinc-500">Choose how you'd like to start</p>
        </div>

        {/* 3 options */}
        <div className="grid gap-3 sm:grid-cols-3">
          <PickerCard
            icon={FileText}
            title="Start blank"
            description="Open the editor and write your own proposal from scratch."
            onClick={() => setMode("blank")}
          />
          <PickerCard
            icon={LayoutTemplate}
            title="Use a template"
            description="Pick a pre-written starting point and customize it."
            onClick={() => setGalleryOpen(true)}
            accent
          />
          <PickerCard
            icon={Bot}
            title="AI draft"
            description="Describe your project and let AI write the first draft."
            onClick={() => { setMode("blank"); setBriefOpen(true); }}
          />
        </div>

        {/* Recent proposals */}
        {recentProposals?.length > 0 && (
          <div className="mt-10">
            <div className="mb-3 flex items-center gap-2">
              <Copy className="h-4 w-4 text-zinc-400" />
              <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Duplicate a recent proposal</span>
            </div>
            <div className="space-y-2">
              {recentProposals.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleDuplicate(p)}
                  className="flex w-full items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 text-left transition-colors hover:border-zinc-400 hover:bg-zinc-50"
                >
                  <div>
                    <div className="text-sm font-medium text-zinc-900">{p.title}</div>
                    {p.clientName && <div className="text-xs text-zinc-500">{p.clientName}</div>}
                  </div>
                  <span className="text-xs text-zinc-400">Duplicate →</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <TemplateGallery
        open={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        type="proposal"
        onSelect={handleTemplateSelect}
      />
    </>
  );
}
