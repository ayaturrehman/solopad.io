"use client";

import { useState } from "react";
import { ArrowLeft, Bot, Copy, FileSignature, LayoutTemplate } from "lucide-react";
import TemplateGallery from "@/components/templates/TemplateGallery";
import ContractBuilderClient from "./ContractBuilderClient";

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

export default function ContractStartPicker({ projects, contacts, recentContracts }) {
  const [mode, setMode] = useState("pick");
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [initialContract, setInitialContract] = useState(null);
  const [briefOpen, setBriefOpen] = useState(false);

  function handleTemplateSelect(template) {
    const content = template.content || {};
    setInitialContract({
      title: content.title || template.name,
      clauses: content.clauses || [],
      clientName: "",
      clientEmail: "",
      projectId: "",
    });
    setMode("builder");
  }

  function handleDuplicate(contract) {
    setInitialContract({
      title: `${contract.title} (copy)`,
      clauses: contract.clauses,
      clientName: contract.clientName || "",
      clientEmail: contract.clientEmail || "",
      projectId: contract.projectId || "",
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
              onClick={() => { setMode("pick"); setInitialContract(null); }}
              className="mb-2 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Change starting point
            </button>
          </div>
        )}
        <ContractBuilderClient
          projects={projects}
          contacts={contacts}
          initialContract={mode === "builder" ? initialContract : null}
          forceAIBrief={briefOpen}
        />
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-2xl px-4 py-10 md:px-6">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-zinc-900">New Contract</h1>
          <p className="mt-1 text-sm text-zinc-500">Choose how you'd like to start</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <PickerCard
            icon={FileSignature}
            title="Start blank"
            description="Open the editor and write your own contract from scratch."
            onClick={() => setMode("blank")}
          />
          <PickerCard
            icon={LayoutTemplate}
            title="Use a template"
            description="Pick from pre-written contract templates and customize."
            onClick={() => setGalleryOpen(true)}
            accent
          />
          <PickerCard
            icon={Bot}
            title="AI draft"
            description="Describe your engagement and let AI draft the contract."
            onClick={() => { setMode("blank"); setBriefOpen(true); }}
          />
        </div>

        {recentContracts?.length > 0 && (
          <div className="mt-10">
            <div className="mb-3 flex items-center gap-2">
              <Copy className="h-4 w-4 text-zinc-400" />
              <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Duplicate a recent contract</span>
            </div>
            <div className="space-y-2">
              {recentContracts.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleDuplicate(c)}
                  className="flex w-full items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 text-left transition-colors hover:border-zinc-400 hover:bg-zinc-50"
                >
                  <div>
                    <div className="text-sm font-medium text-zinc-900">{c.title}</div>
                    {c.clientName && <div className="text-xs text-zinc-500">{c.clientName}</div>}
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
        type="contract"
        onSelect={handleTemplateSelect}
      />
    </>
  );
}
