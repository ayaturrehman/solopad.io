"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Layers3,
  Palette,
  Save,
  SquarePen,
  FilePlus2,
  Trash2,
  CopyPlus,
  WandSparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  TEMPLATE_BLOCK_LIBRARY,
  TEMPLATE_GALLERY,
  TEMPLATE_THEMES,
  createBlock,
  createBuilderDocumentFromTemplate,
  createDefaultBuilderDocument,
  createPage,
  extractProposalDraftFromBuilder,
  serializeBuilderDocument,
} from "@/lib/template-builder";

function Input({ className, ...props }) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400",
        className
      )}
    />
  );
}

function Textarea({ className, ...props }) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400",
        className
      )}
    />
  );
}

function SectionTitle({ icon: Icon, title, helper }) {
  return (
    <div className="mb-3 flex items-start gap-3">
      <div className="rounded-xl bg-zinc-100 p-2 text-zinc-600">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-sm font-semibold text-zinc-900">{title}</p>
        {helper ? <p className="mt-1 text-xs text-zinc-500">{helper}</p> : null}
      </div>
    </div>
  );
}

function CanvasInput({ value, onChange, className, style, placeholder }) {
  return (
    <input
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(
        "w-full rounded-xl border border-transparent bg-transparent px-2 py-1 outline-none transition-colors placeholder:text-zinc-300 focus:border-zinc-200 focus:bg-white/70",
        className
      )}
      style={style}
    />
  );
}

function CanvasTextarea({ value, onChange, className, style, rows = 3, placeholder }) {
  return (
    <textarea
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      className={cn(
        "w-full resize-none rounded-xl border border-transparent bg-transparent px-2 py-1 outline-none transition-colors placeholder:text-zinc-300 focus:border-zinc-200 focus:bg-white/70",
        className
      )}
      style={style}
    />
  );
}

function PreviewBlock({ block, theme, selected, onSelect, onUpdateBlock, onUpdateBlockItem }) {
  const cardClass = cn(
    "rounded-[28px] border p-6 transition-colors",
    selected ? "border-zinc-900 shadow-sm" : "border-zinc-200 hover:border-zinc-300"
  );

  if (block.type === "cover") {
    return (
      <div onClick={onSelect} className={cn(cardClass, "w-full text-left")} style={{ backgroundColor: theme.surface }}>
        <div
          className={cn(
            "rounded-[24px] px-8 py-12",
            block.align === "left" ? "text-left" : block.align === "right" ? "text-right" : "text-center"
          )}
          style={{
            background: `linear-gradient(135deg, ${theme.accentSoft} 0%, ${theme.surface} 65%)`,
          }}
        >
          <CanvasInput
            value={block.meta}
            onChange={(value) => onUpdateBlock({ meta: value })}
            className={cn(
              "text-xs font-semibold uppercase tracking-[0.22em]",
              block.align === "center" && "text-center",
              block.align === "right" && "text-right"
            )}
            style={{ color: theme.accent }}
            placeholder="Prepared by your studio"
          />
          <CanvasInput
            value={block.title}
            onChange={(value) => onUpdateBlock({ title: value })}
            className={cn(
              "mt-4 text-4xl font-bold tracking-tight",
              block.align === "center" && "text-center",
              block.align === "right" && "text-right"
            )}
            style={{ color: theme.text }}
            placeholder="Document title"
          />
          <CanvasTextarea
            value={block.subtitle}
            onChange={(value) => onUpdateBlock({ subtitle: value })}
            className={cn(
              "mx-auto mt-4 max-w-2xl text-base leading-7",
              block.align === "center" && "text-center",
              block.align === "right" && "text-right"
            )}
            style={{ color: theme.muted }}
            rows={3}
            placeholder="Write an introduction"
          />
        </div>
      </div>
    );
  }

  if (block.type === "callout") {
    return (
      <div onClick={onSelect} className={cn(cardClass, "w-full text-left")} style={{ backgroundColor: theme.surface }}>
        <div className="rounded-2xl border-l-4 px-5 py-4" style={{ borderColor: theme.accent, backgroundColor: theme.accentSoft }}>
          <CanvasInput
            value={block.label}
            onChange={(value) => onUpdateBlock({ label: value })}
            className="text-xs font-semibold uppercase tracking-[0.18em]"
            style={{ color: theme.accent }}
            placeholder="Label"
          />
          <CanvasTextarea
            value={block.body}
            onChange={(value) => onUpdateBlock({ body: value })}
            className="mt-2 text-base leading-7"
            style={{ color: theme.text }}
            rows={3}
            placeholder="Callout text"
          />
        </div>
      </div>
    );
  }

  if (block.type === "pricing") {
    return (
      <div onClick={onSelect} className={cn(cardClass, "w-full text-left")} style={{ backgroundColor: theme.surface }}>
        <CanvasInput
          value={block.heading}
          onChange={(value) => onUpdateBlock({ heading: value })}
          className="text-xl font-semibold"
          style={{ color: theme.text }}
          placeholder="Investment"
        />
        <div className="mt-4 space-y-3">
          {block.items.map((item) => (
            <div key={item.id} className="rounded-2xl border border-zinc-200 px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CanvasInput
                    value={item.label}
                    onChange={(value) => onUpdateBlockItem(item.id, "label", value)}
                    className="text-sm font-semibold"
                    style={{ color: theme.text }}
                    placeholder="Line item"
                  />
                  <CanvasTextarea
                    value={item.note}
                    onChange={(value) => onUpdateBlockItem(item.id, "note", value)}
                    className="mt-1 text-sm"
                    style={{ color: theme.muted }}
                    rows={2}
                    placeholder="Short note"
                  />
                </div>
                <CanvasInput
                  value={item.value}
                  onChange={(value) => onUpdateBlockItem(item.id, "value", value)}
                  className="w-28 text-right text-sm font-semibold"
                  style={{ color: theme.accent }}
                  placeholder="$0"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (block.type === "questions") {
    return (
      <div onClick={onSelect} className={cn(cardClass, "w-full text-left")} style={{ backgroundColor: theme.surface }}>
        <CanvasInput
          value={block.heading}
          onChange={(value) => onUpdateBlock({ heading: value })}
          className="text-xl font-semibold"
          style={{ color: theme.text }}
          placeholder="Questions"
        />
        <div className="mt-4 space-y-3">
          {block.items.map((item, index) => (
            <div key={item.id} className="rounded-2xl border border-zinc-200 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: theme.accent }}>
                Question {index + 1}
              </p>
              <CanvasTextarea
                value={item.prompt}
                onChange={(value) => onUpdateBlockItem(item.id, "prompt", value)}
                className="mt-2 text-sm leading-6"
                style={{ color: theme.text }}
                rows={2}
                placeholder="Question prompt"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (block.type === "signature") {
    return (
      <div onClick={onSelect} className={cn(cardClass, "w-full text-left")} style={{ backgroundColor: theme.surface }}>
        <CanvasInput
          value={block.heading}
          onChange={(value) => onUpdateBlock({ heading: value })}
          className="text-xl font-semibold"
          style={{ color: theme.text }}
          placeholder="Approval"
        />
        <CanvasTextarea
          value={block.body}
          onChange={(value) => onUpdateBlock({ body: value })}
          className="mt-2 text-sm leading-6"
          style={{ color: theme.muted }}
          rows={3}
          placeholder="Explain what signing means"
        />
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-dashed border-zinc-300 px-4 py-6">
            <CanvasInput
              value={block.signerLabel}
              onChange={(value) => onUpdateBlock({ signerLabel: value })}
              className="text-sm font-medium"
              style={{ color: theme.text }}
              placeholder="Client signature"
            />
            <div className="mt-6 h-px bg-zinc-200" />
          </div>
          <div className="rounded-2xl border border-zinc-200 px-4 py-6">
            <p className="text-sm font-medium" style={{ color: theme.text }}>
              Date
            </p>
            <div className="mt-6 h-px bg-zinc-200" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div onClick={onSelect} className={cn(cardClass, "w-full text-left")} style={{ backgroundColor: theme.surface }}>
      <CanvasInput
        value={block.heading}
        onChange={(value) => onUpdateBlock({ heading: value })}
        className="text-2xl font-semibold tracking-tight"
        style={{ color: theme.text }}
        placeholder="Section heading"
      />
      <CanvasTextarea
        value={block.body}
        onChange={(value) => onUpdateBlock({ body: value })}
        className="mt-4 whitespace-pre-wrap text-base leading-7"
        style={{ color: theme.muted }}
        rows={4}
        placeholder="Write your content here"
      />
    </div>
  );
}

function findPage(document, pageId) {
  return document.pages.find((page) => page.id === pageId) || document.pages[0];
}

function findBlock(document, selectedPageId, selectedBlockId) {
  const page = findPage(document, selectedPageId);
  return page?.blocks.find((block) => block.id === selectedBlockId) || page?.blocks[0] || null;
}

export default function TemplateBuilderClient({ savedTemplates }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [documentState, setDocumentState] = useState(null);
  const [templateId, setTemplateId] = useState("");
  const [activePageId, setActivePageId] = useState("");
  const [selectedBlockId, setSelectedBlockId] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const currentTemplateId = searchParams.get("templateId") || "";
    const presetId = searchParams.get("preset") || "";
    const type = searchParams.get("type") || "proposal";

    const sourceTemplate =
      (currentTemplateId && savedTemplates.find((template) => template.id === currentTemplateId)) ||
      (presetId && TEMPLATE_GALLERY.find((template) => template.id === presetId)) ||
      { type, name: createDefaultBuilderDocument(type).name, description: createDefaultBuilderDocument(type).description, content: createDefaultBuilderDocument(type) };

    const nextDocument = createBuilderDocumentFromTemplate(sourceTemplate);
    if (!nextDocument) {
      router.replace("/templates");
      return;
    }

    setDocumentState(nextDocument);
    setTemplateId(currentTemplateId);
    setActivePageId(nextDocument.pages[0]?.id || "");
    setSelectedBlockId(nextDocument.pages[0]?.blocks[0]?.id || "");
  }, [router, savedTemplates, searchParams]);

  function updateDocument(updater) {
    setDocumentState((current) => (current ? updater(current) : current));
  }

  function selectPage(pageId) {
    if (!documentState) return;
    const page = findPage(documentState, pageId);
    setActivePageId(page.id);
    setSelectedBlockId(page.blocks[0]?.id || "");
  }

  function updatePage(pageId, patch) {
    updateDocument((current) => ({
      ...current,
      pages: current.pages.map((page) => (page.id === pageId ? { ...page, ...patch } : page)),
    }));
  }

  function addPage() {
    const page = createPage(`Page ${documentState.pages.length + 1}`);
    updateDocument((current) => ({ ...current, pages: [...current.pages, page] }));
    setActivePageId(page.id);
    setSelectedBlockId(page.blocks[0]?.id || "");
  }

  function duplicatePage(pageId) {
    const page = findPage(documentState, pageId);
    const cloned = {
      ...page,
      id: `${page.id}-copy`,
      title: `${page.title} Copy`,
      blocks: page.blocks.map((block) => ({
        ...block,
        id: `${block.id}-copy`,
        items: Array.isArray(block.items) ? block.items.map((item) => ({ ...item, id: `${item.id}-copy` })) : block.items,
      })),
    };
    updateDocument((current) => ({ ...current, pages: [...current.pages, cloned] }));
  }

  function removePage(pageId) {
    if (documentState.pages.length === 1) return;
    const nextPages = documentState.pages.filter((page) => page.id !== pageId);
    updateDocument((current) => ({ ...current, pages: nextPages }));
    setActivePageId(nextPages[0]?.id || "");
    setSelectedBlockId(nextPages[0]?.blocks[0]?.id || "");
  }

  function addBlock(type) {
    const block = createBlock(type);
    updateDocument((current) => ({
      ...current,
      pages: current.pages.map((page) =>
        page.id === activePageId ? { ...page, blocks: [...page.blocks, block] } : page
      ),
    }));
    setSelectedBlockId(block.id);
  }

  function updateBlock(blockId, patch) {
    updateDocument((current) => ({
      ...current,
      pages: current.pages.map((page) => ({
        ...page,
        blocks: page.blocks.map((block) => (block.id === blockId ? { ...block, ...patch } : block)),
      })),
    }));
  }

  function removeBlock(blockId) {
    const activePage = findPage(documentState, activePageId);
    if (activePage.blocks.length === 1) return;

    const nextBlocks = activePage.blocks.filter((block) => block.id !== blockId);
    updateDocument((current) => ({
      ...current,
      pages: current.pages.map((page) => (page.id === activePageId ? { ...page, blocks: nextBlocks } : page)),
    }));
    setSelectedBlockId(nextBlocks[0]?.id || "");
  }

  function updateBlockItem(blockId, itemId, field, value) {
    const block = findBlock(documentState, activePageId, blockId);
    if (!Array.isArray(block?.items)) return;

    updateBlock(blockId, {
      items: block.items.map((item) => (item.id === itemId ? { ...item, [field]: value } : item)),
    });
  }

  function addBlockItem(blockId) {
    const block = findBlock(documentState, activePageId, blockId);
    if (!block) return;

    const nextItem =
      block.type === "pricing"
        ? { id: `line-${Date.now()}`, label: "New line item", value: "$0", note: "" }
        : { id: `question-${Date.now()}`, prompt: "New question" };

    updateBlock(blockId, { items: [...(block.items || []), nextItem] });
  }

  function removeBlockItem(blockId, itemId) {
    const block = findBlock(documentState, activePageId, blockId);
    if (!Array.isArray(block?.items) || block.items.length === 1) return;
    updateBlock(blockId, { items: block.items.filter((item) => item.id !== itemId) });
  }

  async function saveTemplate() {
    if (!documentState?.name?.trim()) {
      setStatusMessage("Template name is required.");
      return;
    }

    setSaving(true);
    setStatusMessage("");

    const payload = {
      type: documentState.type,
      name: documentState.name.trim(),
      description: documentState.description?.trim() || "",
      content: serializeBuilderDocument(documentState),
    };

    const endpoint = templateId ? `/api/templates/${templateId}` : "/api/templates";
    const method = templateId ? "PATCH" : "POST";

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatusMessage(data.error || "Could not save template.");
        return;
      }

      const savedId = data.template?.id || templateId;
      setTemplateId(savedId);
      setStatusMessage("Template saved.");

      if (!templateId && savedId) {
        router.replace(`/templates/builder?templateId=${savedId}`);
      }
    } catch {
      setStatusMessage("Could not save template.");
    } finally {
      setSaving(false);
    }
  }

  function applyToProposal() {
    if (!documentState || documentState.type !== "proposal") return;
    try {
      sessionStorage.setItem("proposalTemplate", JSON.stringify(extractProposalDraftFromBuilder(documentState)));
      router.push("/proposals/new");
    } catch {
      setStatusMessage("Could not open proposal builder.");
    }
  }

  if (!documentState) {
    return null;
  }

  const activePage = findPage(documentState, activePageId);
  const selectedBlock = findBlock(documentState, activePageId, selectedBlockId);
  const theme = documentState.theme;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/templates" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900">
            <ArrowLeft className="h-4 w-4" />
            Templates
          </Link>
          <span className="text-zinc-300">/</span>
          <span className="text-sm font-medium text-zinc-900">Builder</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {documentState.type === "proposal" && (
            <button
              type="button"
              onClick={applyToProposal}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              <WandSparkles className="h-4 w-4" />
              Use in proposal
            </button>
          )}
          <button
            type="button"
            onClick={saveTemplate}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700 disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save template"}
          </button>
        </div>
      </div>

      {statusMessage ? (
        <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-600">
          {statusMessage}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <div className="rounded-[32px] border border-zinc-200 p-6 shadow-sm" style={{ backgroundColor: theme.canvas }}>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: theme.muted }}>
                Live Preview
              </p>
              <CanvasInput
                value={documentState.name}
                onChange={(value) => updateDocument((current) => ({ ...current, name: value }))}
                className="mt-2 max-w-xl px-0 text-2xl font-bold tracking-tight focus:bg-transparent"
                style={{ color: theme.text }}
                placeholder="Template name"
              />
              <CanvasInput
                value={activePage.title}
                onChange={(value) => updatePage(activePage.id, { title: value })}
                className="mt-1 max-w-sm px-0 text-sm focus:bg-transparent"
                style={{ color: theme.muted }}
                placeholder="Page title"
              />
            </div>
            <div className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]" style={{ backgroundColor: theme.accentSoft, color: theme.accent }}>
              {documentState.type}
            </div>
          </div>

          <div className="mb-5 rounded-2xl border border-dashed border-zinc-200 bg-white/60 px-4 py-3 text-sm text-zinc-500">
            Click directly into any title, paragraph, price, or question below to edit it on the canvas.
          </div>

          <div className="space-y-4">
            {activePage.blocks.map((block) => (
              <PreviewBlock
                key={block.id}
                block={block}
                theme={theme}
                selected={selectedBlock?.id === block.id}
                onSelect={() => setSelectedBlockId(block.id)}
                onUpdateBlock={(patch) => updateBlock(block.id, patch)}
                onUpdateBlockItem={(itemId, field, value) => updateBlockItem(block.id, itemId, field, value)}
              />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm">
            <SectionTitle icon={SquarePen} title="Template setup" helper="Name the template and describe what this document is for." />
            <div className="space-y-3">
              <Input value={documentState.name} onChange={(e) => updateDocument((current) => ({ ...current, name: e.target.value }))} placeholder="Template name" />
              <Textarea
                rows={3}
                value={documentState.description || ""}
                onChange={(e) => updateDocument((current) => ({ ...current, description: e.target.value }))}
                placeholder="Short description"
              />
            </div>
          </div>

          <div className="rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm">
            <SectionTitle icon={Palette} title="Theme" helper="Pick a theme palette for the full document." />
            <div className="grid grid-cols-2 gap-3">
              {TEMPLATE_THEMES.map((themeOption) => (
                <button
                  key={themeOption.id}
                  type="button"
                  onClick={() => updateDocument((current) => ({ ...current, theme: themeOption }))}
                  className={cn(
                    "rounded-2xl border p-3 text-left transition-colors",
                    documentState.theme.id === themeOption.id ? "border-zinc-900" : "border-zinc-200 hover:border-zinc-300"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="h-5 w-5 rounded-full border border-white shadow-sm" style={{ backgroundColor: themeOption.accent }} />
                    <span className="h-5 w-5 rounded-full border border-zinc-200" style={{ backgroundColor: themeOption.surface }} />
                    <span className="h-5 w-5 rounded-full border border-zinc-200" style={{ backgroundColor: themeOption.canvas }} />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-zinc-900">{themeOption.name}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm">
            <SectionTitle icon={Layers3} title="Pages" helper="Build the file page by page, then edit blocks inside each page." />
            <div className="space-y-2">
              {documentState.pages.map((page, index) => (
                <div
                  key={page.id}
                  className={cn(
                    "rounded-2xl border px-3 py-3",
                    activePageId === page.id ? "border-zinc-900 bg-zinc-50" : "border-zinc-200"
                  )}
                >
                  <button type="button" onClick={() => selectPage(page.id)} className="w-full text-left">
                    <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">Page {index + 1}</p>
                    <p className="mt-1 text-sm font-semibold text-zinc-900">{page.title}</p>
                    <p className="mt-1 text-xs text-zinc-500">{page.blocks.length} blocks</p>
                  </button>

                  {activePageId === page.id ? (
                    <div className="mt-3 space-y-2">
                      <Input value={page.title} onChange={(e) => updatePage(page.id, { title: e.target.value })} placeholder="Page title" />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => duplicatePage(page.id)}
                          className="inline-flex items-center gap-1 rounded-xl border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-50"
                        >
                          <CopyPlus className="h-3.5 w-3.5" />
                          Duplicate
                        </button>
                        <button
                          type="button"
                          onClick={() => removePage(page.id)}
                          className="inline-flex items-center gap-1 rounded-xl border border-zinc-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addPage}
              className="mt-3 inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              <FilePlus2 className="h-4 w-4" />
              Add page
            </button>
          </div>

          <div className="rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm">
            <SectionTitle icon={Plus} title="Blocks" helper="Add the content modules that belong on the selected page." />
            <div className="grid grid-cols-2 gap-2">
              {TEMPLATE_BLOCK_LIBRARY.map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => addBlock(item.type)}
                  className="rounded-xl border border-zinc-200 px-3 py-2 text-left text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {selectedBlock ? (
            <div className="rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm">
              <SectionTitle icon={SquarePen} title="Selected block" helper="Content edits now happen directly on the canvas. Use this area for quick structure actions only." />
              <div className="space-y-3">
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">Block type</p>
                  <p className="mt-1 text-sm font-medium text-zinc-900">{selectedBlock.type}</p>
                </div>

                {selectedBlock.type === "cover" ? (
                  <select
                    value={selectedBlock.align || "center"}
                    onChange={(e) => updateBlock(selectedBlock.id, { align: e.target.value })}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400"
                  >
                    <option value="left">Left aligned</option>
                    <option value="center">Centered</option>
                    <option value="right">Right aligned</option>
                  </select>
                ) : null}

                {selectedBlock.type === "pricing" || selectedBlock.type === "questions" ? (
                  <button type="button" onClick={() => addBlockItem(selectedBlock.id)} className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50">
                    <Plus className="h-4 w-4" />
                    {selectedBlock.type === "pricing" ? "Add line item" : "Add question"}
                  </button>
                ) : null}

                {(selectedBlock.type === "pricing" || selectedBlock.type === "questions") && Array.isArray(selectedBlock.items) ? (
                  <div className="space-y-2">
                    {selectedBlock.items.map((item, index) => (
                      <div key={item.id} className="flex items-center justify-between rounded-2xl border border-zinc-200 px-3 py-2 text-sm">
                        <span className="truncate text-zinc-600">
                          {selectedBlock.type === "pricing" ? item.label || `Line ${index + 1}` : item.prompt || `Question ${index + 1}`}
                        </span>
                        <button type="button" onClick={() => removeBlockItem(selectedBlock.id, item.id)} className="text-xs font-medium text-red-600">
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={() => removeBlock(selectedBlock.id)}
                  className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove block
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
