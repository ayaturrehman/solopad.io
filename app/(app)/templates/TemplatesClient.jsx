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
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── System / Gallery Templates ──────────────────────────────────────────────

const GALLERY = [
  // Invoices
  {
    id: "sys-invoice-1",
    type: "invoice",
    name: "Simple Invoice",
    description: "Clean single-item invoice for project work.",
    content: {
      lineItems: [{ description: "Project work", quantity: 1, rate: 0, amount: 0 }],
      notes: "Payment due within 30 days.",
    },
  },
  {
    id: "sys-invoice-2",
    type: "invoice",
    name: "Web Design Package",
    description: "Standard web design with discovery, design, and development phases.",
    content: {
      lineItems: [
        { description: "Discovery & Strategy", quantity: 1, rate: 500, amount: 500 },
        { description: "UI/UX Design", quantity: 1, rate: 1500, amount: 1500 },
        { description: "Development", quantity: 1, rate: 2000, amount: 2000 },
      ],
      notes: "50% deposit required to begin. Remaining balance due on delivery.",
    },
  },
  {
    id: "sys-invoice-3",
    type: "invoice",
    name: "Monthly Retainer",
    description: "Monthly recurring services invoice.",
    content: {
      lineItems: [
        { description: "Monthly retainer — content & social", quantity: 1, rate: 800, amount: 800 },
      ],
      notes: "Billed monthly. Cancel with 30 days notice.",
    },
  },
  {
    id: "sys-invoice-4",
    type: "invoice",
    name: "Consulting Day Rate",
    description: "Per-day consulting billing.",
    content: {
      lineItems: [{ description: "Consulting (day rate)", quantity: 1, rate: 1200, amount: 1200 }],
    },
  },
  // Proposals
  {
    id: "sys-proposal-1",
    type: "proposal",
    name: "Project Proposal",
    description: "Full project scope and deliverables.",
    content:
      "This proposal outlines the project scope, objectives, timeline, and deliverables. It includes a breakdown of phases, estimated hours, and pricing. Designed to give your client a clear picture of what to expect from start to finish.",
  },
  {
    id: "sys-proposal-2",
    type: "proposal",
    name: "Brand Identity Proposal",
    description: "Logo, brand guidelines, and assets.",
    content:
      "A proposal covering logo design, brand colour palette, typography, and brand guidelines document. Includes revision rounds and final file delivery in all required formats.",
  },
  {
    id: "sys-proposal-3",
    type: "proposal",
    name: "Content Strategy Proposal",
    description: "Content audit, strategy, and execution plan.",
    content:
      "Covers content audit, audience analysis, editorial calendar, and a 90-day content execution plan. Includes SEO recommendations and KPIs to measure content performance.",
  },
  // Contracts
  {
    id: "sys-contract-1",
    type: "contract",
    name: "Freelance Services Agreement",
    description: "Standard freelance contract covering scope, payment, and IP.",
    content:
      "A standard freelance services agreement covering scope of work, payment terms, intellectual property transfer, revision limits, and termination clauses. Suitable for most project engagements.",
  },
  {
    id: "sys-contract-2",
    type: "contract",
    name: "NDA Template",
    description: "Non-disclosure agreement for client projects.",
    content:
      "A mutual non-disclosure agreement preventing both parties from sharing confidential information discussed during the engagement. Includes duration, exceptions, and governing law clauses.",
  },
  {
    id: "sys-contract-3",
    type: "contract",
    name: "Website Development Contract",
    description: "Full web development contract with hosting and maintenance terms.",
    content:
      "Covers project scope, payment milestones, browser/device compatibility, launch checklist, post-launch support period, and ongoing maintenance terms. Includes content delivery responsibilities.",
  },
  // Questionnaires
  {
    id: "sys-questionnaire-1",
    type: "questionnaire",
    name: "Client Onboarding",
    description: "Questions to kick off a new project.",
    content:
      "What are your main goals for this project? Who is your target audience? What does success look like in 6 months? Are there any existing brand guidelines? What is your preferred communication method and cadence?",
  },
  {
    id: "sys-questionnaire-2",
    type: "questionnaire",
    name: "Brand Discovery",
    description: "Brand goals, values, and audience deep-dive.",
    content:
      "Describe your brand in three words. Who are your top competitors? What sets you apart? Describe your ideal customer. What tone of voice should your brand have — formal, playful, bold, minimal?",
  },
  {
    id: "sys-questionnaire-3",
    type: "questionnaire",
    name: "Project Brief",
    description: "Scope, timeline, and budget questions.",
    content:
      "What is the project deliverable? When do you need it completed? What is your budget range? Have you worked with a freelancer before? Are there any technical constraints or platform requirements?",
  },
];

const TABS = [
  { id: "all", label: "All" },
  { id: "invoice", label: "Invoices" },
  { id: "proposal", label: "Proposals" },
  { id: "contract", label: "Contracts" },
  { id: "questionnaire", label: "Questionnaires" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Preview Modal ────────────────────────────────────────────────────────────

function PreviewModal({ template, onClose }) {
  if (!template) return null;

  const isInvoice = template.type === "invoice";
  const content =
    isInvoice && typeof template.content === "object"
      ? template.content
      : typeof template.content === "string"
      ? (() => {
          try {
            return JSON.parse(template.content);
          } catch {
            return template.content;
          }
        })()
      : template.content;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl border border-zinc-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-zinc-100 px-6 py-4">
          <div>
            <TypeBadge type={template.type} />
            <h2 className="text-base font-semibold text-zinc-900">{template.name}</h2>
            {template.description && (
              <p className="mt-0.5 text-xs text-zinc-400">{template.description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="ml-4 mt-0.5 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {isInvoice && content?.lineItems ? (
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Line items
              </p>
              <div className="divide-y divide-zinc-100 rounded-xl border border-zinc-200">
                {content.lineItems.map((item, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-zinc-800">{item.description}</p>
                      <p className="text-xs text-zinc-400">
                        Qty {item.quantity} × ${item.rate.toLocaleString()}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-zinc-900">
                      ${item.amount.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
              {content.notes && (
                <p className="mt-4 rounded-lg bg-zinc-50 px-4 py-3 text-xs text-zinc-500">
                  {content.notes}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm leading-relaxed text-zinc-600">
              {typeof content === "string" ? content : JSON.stringify(content, null, 2)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Template Card ────────────────────────────────────────────────────────────

function TemplateCard({ template, isSaved, onPreview, onUse, onDelete }) {
  return (
    <div className="group relative flex flex-col rounded-xl border border-zinc-200 bg-white p-5 transition-shadow hover:shadow-md">
      {/* Preview area */}
      <div className="mb-4 flex h-28 items-center justify-center rounded-lg border border-zinc-100 bg-zinc-50">
        <TypeIcon type={template.type} className="h-10 w-10 text-zinc-200" />
      </div>

      <TypeBadge type={template.type} />
      <h3 className="text-sm font-semibold text-zinc-900">{template.name}</h3>
      <p className="mt-1 flex-1 text-xs text-zinc-400">{template.description}</p>

      {/* Actions */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => onPreview(template)}
          className="flex-1 rounded-lg border border-zinc-200 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
        >
          Preview
        </button>
        <button
          onClick={() => onUse(template)}
          className="flex-1 rounded-lg bg-zinc-900 py-1.5 text-xs font-medium text-white hover:bg-zinc-700 transition-colors"
        >
          Use template
        </button>
        {isSaved && (
          <button
            onClick={() => onDelete(template.id)}
            className="rounded-lg border border-zinc-200 px-2.5 py-1.5 text-zinc-400 hover:border-red-200 hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TemplatesClient({ savedTemplates }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [myTemplates, setMyTemplates] = useState(savedTemplates);
  const [comingSoonMsg, setComingSoonMsg] = useState("");

  function filterByTab(list) {
    if (activeTab === "all") return list;
    return list.filter((t) => t.type === activeTab);
  }

  function handleUse(template) {
    if (template.type === "invoice") {
      const content =
        typeof template.content === "string" ? template.content : JSON.stringify(template.content);
      try {
        sessionStorage.setItem("invoiceTemplate", content);
      } catch {}
      router.push("/invoices/new");
    } else {
      setComingSoonMsg(`${template.name} — coming soon.`);
      setTimeout(() => setComingSoonMsg(""), 3000);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this saved template?")) return;
    const res = await fetch(`/api/templates/${id}`, { method: "DELETE" });
    if (res.ok) {
      setMyTemplates((prev) => prev.filter((t) => t.id !== id));
    }
  }

  const galleryItems = filterByTab(GALLERY);
  const myItems = filterByTab(
    myTemplates.map((t) => ({
      ...t,
      content: (() => {
        try {
          return JSON.parse(t.content);
        } catch {
          return t.content;
        }
      })(),
    }))
  );

  return (
    <>
      {/* Coming soon banner */}
      {comingSoonMsg && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          <span className="font-medium">{comingSoonMsg}</span>
          <button
            onClick={() => setComingSoonMsg("")}
            className="ml-auto text-amber-400 hover:text-amber-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Tab bar */}
      <div className="mb-8 flex gap-1 rounded-xl border border-zinc-200 bg-zinc-50 p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors",
              activeTab === tab.id
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-700"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Gallery section */}
      <section className="mb-10">
        <h2 className="mb-1 text-sm font-semibold text-zinc-700">Gallery</h2>
        <p className="mb-4 text-xs text-zinc-400">
          Pre-built templates ready to use. Click &quot;Use template&quot; to apply one instantly.
        </p>
        {galleryItems.length === 0 ? (
          <p className="text-sm text-zinc-400">No gallery templates for this type yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {galleryItems.map((t) => (
              <TemplateCard
                key={t.id}
                template={t}
                isSaved={false}
                onPreview={setPreviewTemplate}
                onUse={handleUse}
                onDelete={() => {}}
              />
            ))}
          </div>
        )}
      </section>

      {/* My Templates section */}
      <section>
        <h2 className="mb-1 text-sm font-semibold text-zinc-700">My Templates</h2>
        <p className="mb-4 text-xs text-zinc-400">Templates you have saved for reuse.</p>
        {myItems.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-8 py-10 text-center">
            <p className="text-sm font-medium text-zinc-500">No saved templates yet.</p>
            <p className="mt-1 text-xs text-zinc-400">
              Use a gallery template and save it as your own.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {myItems.map((t) => (
              <TemplateCard
                key={t.id}
                template={t}
                isSaved={true}
                onPreview={setPreviewTemplate}
                onUse={handleUse}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </section>

      {/* Preview modal */}
      {previewTemplate && (
        <PreviewModal template={previewTemplate} onClose={() => setPreviewTemplate(null)} />
      )}
    </>
  );
}
