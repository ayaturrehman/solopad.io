"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ReceiptText,
  FileText,
  FileSignature,
  ClipboardList,
  X,
  Trash2,
  BookmarkPlus,
  SquarePen,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TEMPLATE_GALLERY, createBuilderDocumentFromTemplate, isBuilderDocument, parseTemplateContent } from "@/lib/template-builder";

const TABS = [
  { id: "all", label: "All" },
  { id: "invoice", label: "Invoices" },
  { id: "proposal", label: "Proposals" },
  { id: "contract", label: "Contracts" },
  { id: "questionnaire", label: "Questionnaires" },
];

const TYPE_BADGE = {
  invoice: "bg-blue-100 text-blue-700",
  proposal: "bg-violet-100 text-violet-700",
  contract: "bg-amber-100 text-amber-700",
  questionnaire: "bg-green-100 text-green-700",
};

const TYPE_ICON = {
  invoice: ReceiptText,
  proposal: FileText,
  contract: FileSignature,
  questionnaire: ClipboardList,
};

function TypeIcon({ type, className }) {
  const Icon = TYPE_ICON[type] || FileText;
  return <Icon className={className} />;
}

function TypeBadge({ type }) {
  return (
    <span
      className={cn(
        "mb-2 inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        TYPE_BADGE[type] || "bg-zinc-100 text-zinc-600"
      )}
    >
      {type}
    </span>
  );
}

function PreviewModal({ template, onClose }) {
  if (!template) return null;

  const parsed = parseTemplateContent(template.content);
  const builderDoc = createBuilderDocumentFromTemplate(template);
  const previewBlocks = isBuilderDocument(parsed) ? builderDoc.pages.slice(0, 2) : [];
  const isInvoice = template.type === "invoice";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="relative w-full max-w-3xl rounded-3xl border border-zinc-200 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between border-b border-zinc-100 px-6 py-4">
          <div>
            <TypeBadge type={template.type} />
            <h2 className="text-lg font-semibold text-zinc-900">{template.name}</h2>
            {template.description ? <p className="mt-1 text-sm text-zinc-500">{template.description}</p> : null}
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto px-6 py-5">
          {isInvoice && parsed?.lineItems ? (
            <div className="rounded-2xl border border-zinc-200">
              {parsed.lineItems.map((item, index) => (
                <div key={`${item.description}-${index}`} className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 last:border-b-0">
                  <div>
                    <p className="text-sm font-medium text-zinc-900">{item.description}</p>
                    <p className="text-xs text-zinc-500">Qty {item.quantity} × ${item.rate}</p>
                  </div>
                  <p className="text-sm font-semibold text-zinc-900">${item.amount}</p>
                </div>
              ))}
            </div>
          ) : isBuilderDocument(parsed) ? (
            <div className="space-y-4">
              {previewBlocks.map((page) => (
                <div key={page.id} className="rounded-3xl border border-zinc-200 bg-zinc-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">{page.title}</p>
                  <div className="mt-3 space-y-3">
                    {page.blocks.slice(0, 3).map((block) => (
                      <div key={block.id} className="rounded-2xl border border-zinc-200 bg-white p-4">
                        <p className="text-sm font-semibold text-zinc-900">
                          {block.title || block.heading || block.label || block.signerLabel || "Content block"}
                        </p>
                        <p className="mt-2 text-sm text-zinc-500">
                          {block.subtitle || block.body || block.items?.[0]?.prompt || block.items?.[0]?.label || "Structured template block"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm leading-7 text-zinc-600">
              {typeof parsed === "string" ? parsed : JSON.stringify(parsed, null, 2)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function TemplateCard({ template, isSaved, onPreview, onUse, onDelete, onSave, onCustomize }) {
  const parsed = parseTemplateContent(template.content);
  const hasBuilder = template.type !== "invoice" && isBuilderDocument(parsed);

  return (
    <div className="group relative flex flex-col rounded-2xl border border-zinc-200 bg-white p-5 transition-shadow hover:shadow-md">
      <div className="mb-4 flex h-32 items-center justify-center rounded-xl border border-zinc-100 bg-zinc-50">
        {hasBuilder ? (
          <div className="w-full max-w-[180px] space-y-2 rounded-xl border border-zinc-200 bg-white p-3">
            <div className="h-3 w-20 rounded-full bg-zinc-200" />
            <div className="space-y-1">
              <div className="h-2 rounded-full bg-zinc-100" />
              <div className="h-2 rounded-full bg-zinc-100" />
              <div className="h-2 w-2/3 rounded-full bg-zinc-100" />
            </div>
          </div>
        ) : (
          <TypeIcon type={template.type} className="h-10 w-10 text-zinc-200" />
        )}
      </div>

      <TypeBadge type={template.type} />
      <h3 className="text-sm font-semibold text-zinc-900">{template.name}</h3>
      <p className="mt-1 flex-1 text-xs leading-5 text-zinc-400">{template.description}</p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          onClick={() => onPreview(template)}
          className="rounded-lg border border-zinc-200 py-2 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50"
        >
          Preview
        </button>
        <button
          onClick={() => onUse(template)}
          className="rounded-lg bg-zinc-900 py-2 text-xs font-medium text-white transition-colors hover:bg-zinc-700"
        >
          {template.type === "invoice" ? "Use template" : "Customize"}
        </button>
      </div>

      {template.type !== "invoice" ? (
        <button
          onClick={() => onCustomize(template)}
          className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-lg border border-zinc-200 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-50"
        >
          <SquarePen className="h-3.5 w-3.5" />
          Open builder
        </button>
      ) : null}

      <div className="mt-2 flex gap-2">
        {!isSaved ? (
          <button
            onClick={() => onSave(template)}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-zinc-200 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-50"
          >
            <BookmarkPlus className="h-3.5 w-3.5" />
            Save to my templates
          </button>
        ) : (
          <button
            onClick={() => onDelete(template.id)}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-zinc-200 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        )}
      </div>
    </div>
  );
}

export default function TemplatesClient({ savedTemplates }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [myTemplates, setMyTemplates] = useState(savedTemplates);
  const [banner, setBanner] = useState("");

  function filterByTab(list) {
    if (activeTab === "all") return list;
    return list.filter((template) => template.type === activeTab);
  }

  function createProposalDraft(template) {
    const content = parseTemplateContent(template.content);

    if (content && typeof content === "object" && !Array.isArray(content) && !isBuilderDocument(content)) {
      return {
        title: template.name,
        intro: content.intro || template.description || "",
        sections: Array.isArray(content.sections) && content.sections.length
          ? content.sections
          : [{ heading: "Project Overview", body: typeof content.body === "string" ? content.body : "" }],
        pricing: Array.isArray(content.pricing) && content.pricing.length ? content.pricing : [{ description: "", amount: "" }],
        currency: content.currency || "USD",
      };
    }

    return null;
  }

  function handleUse(template) {
    if (template.type === "invoice") {
      const content = typeof template.content === "string" ? template.content : JSON.stringify(template.content);
      try {
        sessionStorage.setItem("invoiceTemplate", content);
      } catch {}
      router.push("/invoices/new");
      return;
    }

    if (template.type === "proposal") {
      const proposalDraft = createProposalDraft(template);
      if (proposalDraft) {
        try {
          sessionStorage.setItem("proposalTemplate", JSON.stringify(proposalDraft));
        } catch {}
        router.push("/proposals/new");
        return;
      }
    }

    handleCustomize(template);
  }

  function handleCustomize(template) {
    if (template.id.startsWith("sys-")) {
      router.push(`/templates/builder?preset=${template.id}`);
      return;
    }

    router.push(`/templates/builder?templateId=${template.id}`);
  }

  async function handleSaveTemplate(template) {
    const payload = {
      type: template.type,
      name: template.name,
      description: template.description,
      content: typeof template.content === "string" ? template.content : JSON.stringify(template.content),
    };

    const res = await fetch("/api/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      setBanner(data.error || "Could not save template.");
      setTimeout(() => setBanner(""), 3000);
      return;
    }

    setMyTemplates((prev) => [data.template, ...prev]);
    setBanner(`${template.name} saved to My Templates.`);
    setTimeout(() => setBanner(""), 3000);
  }

  async function handleDelete(id) {
    if (!confirm("Delete this saved template?")) return;
    const res = await fetch(`/api/templates/${id}`, { method: "DELETE" });
    if (res.ok) {
      setMyTemplates((prev) => prev.filter((template) => template.id !== id));
    }
  }

  const galleryItems = filterByTab(TEMPLATE_GALLERY);
  const myItems = filterByTab(myTemplates.map((template) => ({ ...template, content: parseTemplateContent(template.content) })));

  return (
    <>
      {banner ? (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          <span className="font-medium">{banner}</span>
          <button onClick={() => setBanner("")} className="ml-auto text-amber-400 hover:text-amber-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">Build reusable documents, not just text snippets</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Open the builder to customize pages, theme, structured blocks, signature sections, and questionnaire flows.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => router.push("/templates/builder?type=proposal")}
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700"
          >
            <Plus className="h-4 w-4" />
            New template
          </button>
          <button
            type="button"
            onClick={() => router.push("/templates/builder?type=contract")}
            className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            New contract
          </button>
          <button
            type="button"
            onClick={() => router.push("/templates/builder?type=questionnaire")}
            className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            New questionnaire
          </button>
        </div>
      </div>

      <div className="mb-8 flex gap-1 rounded-xl border border-zinc-200 bg-zinc-50 p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors",
              activeTab === tab.id ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <section className="mb-10">
        <h2 className="mb-1 text-sm font-semibold text-zinc-700">Gallery</h2>
        <p className="mb-4 text-xs text-zinc-400">
          Start from a ready-made structure, then open the builder to make it yours.
        </p>
        {galleryItems.length === 0 ? (
          <p className="text-sm text-zinc-400">No gallery templates for this type yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {galleryItems.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                isSaved={false}
                onPreview={setPreviewTemplate}
                onUse={handleUse}
                onSave={handleSaveTemplate}
                onDelete={() => {}}
                onCustomize={handleCustomize}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-1 text-sm font-semibold text-zinc-700">My Templates</h2>
        <p className="mb-4 text-xs text-zinc-400">Saved templates you can reopen, refine, and reuse.</p>
        {myItems.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-8 py-10 text-center">
            <p className="text-sm font-medium text-zinc-500">No saved templates yet.</p>
            <p className="mt-1 text-xs text-zinc-400">Open any gallery template in the builder and save your own version.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {myItems.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                isSaved={true}
                onPreview={setPreviewTemplate}
                onUse={handleUse}
                onSave={() => {}}
                onDelete={handleDelete}
                onCustomize={handleCustomize}
              />
            ))}
          </div>
        )}
      </section>

      {previewTemplate ? <PreviewModal template={previewTemplate} onClose={() => setPreviewTemplate(null)} /> : null}
    </>
  );
}
