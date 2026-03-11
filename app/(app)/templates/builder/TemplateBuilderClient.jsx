"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft, Save, Eye, EyeOff, Monitor, Smartphone, Plus, Trash2,
  ChevronUp, ChevronDown, Copy, GripVertical, Settings, Layers,
  Type, Image as ImageIcon, Minus, Square, AlignLeft, AlignCenter,
  AlignRight, Bold, Italic, List, Link2, Star, Check, X, Grip,
  Zap, FileText, CornerDownRight, PenLine, Paperclip, Play,
  LayoutTemplate, Text, Lightbulb, Video, Minus as MinusIcon,
  RectangleHorizontal, MousePointerClick, Columns2, Table2,
  CreditCard, Receipt, Milestone, PenSquare, ClipboardList,
  Hash, Mail, Phone, Calendar, ChevronDown as ChevronDownField,
  CheckSquare, SlidersHorizontal, Upload, AlignJustify,
} from "lucide-react";

// Icon map for block types (replaces emoji in BLOCK_DEFS)
const BLOCK_ICON_MAP = {
  cover:         LayoutTemplate,
  richText:      Text,
  callout:       Lightbulb,
  image:         ImageIcon,
  video:         Video,
  divider:       Minus,
  spacer:        RectangleHorizontal,
  button:        MousePointerClick,
  columns:       Columns2,
  table:         Table2,
  pricing:       CreditCard,
  lineItems:     Receipt,
  timeline:      Milestone,
  signature:     PenSquare,
  form:          ClipboardList,
};

// Icon map for form field types
const FIELD_ICON_MAP = {
  text:      Type,
  textarea:  AlignJustify,
  email:     Mail,
  phone:     Phone,
  number:    Hash,
  date:      Calendar,
  dropdown:  ChevronDownField,
  radio:     CheckSquare,
  checkbox:  CheckSquare,
  rating:    Star,
  scale:     SlidersHorizontal,
  file:      Upload,
};

function BlockTypeIcon({ type, size = 14, color }) {
  const Icon = BLOCK_ICON_MAP[type] || FileText;
  return <Icon size={size} color={color} />;
}
import { nanoid } from "nanoid";
import {
  BLOCK_CATEGORIES, BLOCK_DEFS, FORM_FIELD_TYPES, FORM_FIELD_DEFAULTS,
  TEMPLATE_THEMES, MERGE_FIELDS, createBlock, createPage, createFormField,
  createDefaultDocument, parseDocumentContent, serializeDocument, calcLineItemsTotal,
} from "@/lib/template-builder";

// ─── Utilities ───────────────────────────────────────────────────────────────

const fmtCurrency = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(n);

function uid(prefix = "") { return `${prefix}${nanoid(6)}`; }

// ─── Top Bar ─────────────────────────────────────────────────────────────────

function TopBar({ name, setName, docType, setDocType, theme, setTheme, preview, setPreview, viewMode, setViewMode, saving, onSave, router }) {
  return (
    <header style={{ height: 56, background: "#fff", borderBottom: "1px solid #E5E7EB", display: "flex", alignItems: "center", gap: 12, padding: "0 16px", zIndex: 50, flexShrink: 0 }}>
      <button onClick={() => router.push("/templates")} style={{ display: "flex", alignItems: "center", gap: 6, color: "#6B7280", background: "none", border: "none", cursor: "pointer", fontSize: 13, padding: "6px 8px", borderRadius: 8 }}>
        <ArrowLeft size={15} /> Templates
      </button>
      <div style={{ width: 1, height: 24, background: "#E5E7EB" }} />

      {/* Editable name */}
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Template name"
        style={{ border: "none", outline: "none", fontSize: 14, fontWeight: 600, color: "#111827", background: "transparent", minWidth: 160, maxWidth: 260 }}
      />

      <div style={{ width: 1, height: 24, background: "#E5E7EB" }} />

      {/* Type */}
      <select value={docType} onChange={e => setDocType(e.target.value)} style={{ border: "1px solid #E5E7EB", borderRadius: 8, padding: "5px 10px", fontSize: 13, color: "#374151", background: "#fff", cursor: "pointer" }}>
        {["proposal", "contract", "questionnaire", "invoice"].map(t => (
          <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
        ))}
      </select>

      {/* Theme dots */}
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        {Object.values(TEMPLATE_THEMES).map(th => (
          <button
            key={th.id}
            title={th.name}
            onClick={() => setTheme(th.id)}
            style={{ width: 20, height: 20, borderRadius: "50%", background: th.accent, border: theme === th.id ? "2.5px solid #111827" : "2px solid #E5E7EB", cursor: "pointer", flexShrink: 0 }}
          />
        ))}
      </div>

      <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
        {/* View mode */}
        <div style={{ display: "flex", border: "1px solid #E5E7EB", borderRadius: 8, overflow: "hidden" }}>
          {[{ m: "desktop", Icon: Monitor }, { m: "mobile", Icon: Smartphone }].map(({ m, Icon }) => (
            <button key={m} onClick={() => setViewMode(m)} style={{ padding: "6px 10px", background: viewMode === m ? "#F3F4F6" : "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}>
              <Icon size={14} color={viewMode === m ? "#111827" : "#9CA3AF"} />
            </button>
          ))}
        </div>

        <button
          onClick={() => setPreview(p => !p)}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: "1px solid #E5E7EB", background: preview ? "#111827" : "#fff", color: preview ? "#fff" : "#374151", fontSize: 13, fontWeight: 500, cursor: "pointer" }}
        >
          {preview ? <EyeOff size={14} /> : <Eye size={14} />}
          {preview ? "Edit" : "Preview"}
        </button>

        <button
          onClick={onSave}
          disabled={saving}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 16px", borderRadius: 8, background: "#111827", color: "#fff", fontSize: 13, fontWeight: 600, border: "none", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}
        >
          <Save size={14} /> {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </header>
  );
}

// ─── Block Library Sidebar ────────────────────────────────────────────────────

function LeftSidebar({ leftTab, setLeftTab, doc, setDoc, activePage, setActivePage, selectedId, setSelectedId, themeObj }) {
  const [openCat, setOpenCat] = useState("layout");

  function addBlock(type) {
    const block = createBlock(type);
    setDoc(d => {
      const pages = d.pages.map((p, i) =>
        i === activePage ? { ...p, blocks: [...p.blocks, block] } : p
      );
      return { ...d, pages };
    });
    setSelectedId(block.id);
  }

  function addPage() {
    const page = createPage(`Page ${doc.pages.length + 1}`);
    setDoc(d => ({ ...d, pages: [...d.pages, page] }));
    setActivePage(doc.pages.length);
  }

  function deletePage(idx) {
    if (doc.pages.length <= 1) return;
    setDoc(d => ({ ...d, pages: d.pages.filter((_, i) => i !== idx) }));
    setActivePage(p => Math.min(p, doc.pages.length - 2));
  }

  function renamePage(idx, title) {
    setDoc(d => ({ ...d, pages: d.pages.map((p, i) => i === idx ? { ...p, title } : p) }));
  }

  return (
    <aside style={{ width: 240, background: "#FAFAFA", borderRight: "1px solid #E5E7EB", display: "flex", flexDirection: "column", overflow: "hidden", flexShrink: 0 }}>
      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #E5E7EB" }}>
        {[{ id: "blocks", label: "Blocks" }, { id: "pages", label: "Pages" }].map(t => (
          <button
            key={t.id}
            onClick={() => setLeftTab(t.id)}
            style={{ flex: 1, padding: "11px 0", fontSize: 12, fontWeight: 600, color: leftTab === t.id ? "#111827" : "#9CA3AF", background: "none", border: "none", borderBottom: leftTab === t.id ? `2px solid ${themeObj.accent}` : "2px solid transparent", cursor: "pointer" }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 12 }}>
        {leftTab === "blocks" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {BLOCK_CATEGORIES.map(cat => (
              <div key={cat.id}>
                <button
                  onClick={() => setOpenCat(openCat === cat.id ? null : cat.id)}
                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 8px", background: "none", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.08em", borderRadius: 6 }}
                >
                  {cat.label}
                  <ChevronDown size={12} style={{ transform: openCat === cat.id ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
                </button>
                {openCat === cat.id && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, paddingBottom: 8 }}>
                    {cat.blocks.map(type => {
                      const def = BLOCK_DEFS[type];
                      return (
                        <button
                          key={type}
                          onClick={() => addBlock(type)}
                          title={def.description}
                          style={{ padding: "10px 8px", background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, transition: "box-shadow .15s, border-color .15s" }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = themeObj.accent; e.currentTarget.style.boxShadow = `0 2px 8px ${themeObj.accent}22`; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.boxShadow = "none"; }}
                        >
                          <BlockTypeIcon type={type} size={16} color="#6B7280" />
                          <span style={{ fontSize: 10, fontWeight: 600, color: "#374151", textAlign: "center", lineHeight: 1.3 }}>{def.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}

            {/* Merge fields */}
            <div style={{ marginTop: 8, padding: "10px 8px", background: "#F0F9FF", borderRadius: 10, border: "1px solid #BAE6FD" }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#0369A1", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Smart Fields</p>
              <p style={{ fontSize: 11, color: "#0369A1", marginBottom: 8, lineHeight: 1.4 }}>Click to copy — paste into any text block</p>
              {MERGE_FIELDS.map(f => (
                <button
                  key={f.tag}
                  onClick={() => navigator.clipboard?.writeText(f.tag)}
                  style={{ display: "block", width: "100%", textAlign: "left", padding: "4px 6px", background: "#fff", border: "1px solid #BAE6FD", borderRadius: 6, fontSize: 11, color: "#0369A1", cursor: "pointer", marginBottom: 3, fontFamily: "monospace" }}
                >
                  {f.tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {leftTab === "pages" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {doc.pages.map((page, idx) => (
              <div
                key={page.id}
                onClick={() => setActivePage(idx)}
                style={{ background: activePage === idx ? themeObj.accentLight : "#fff", border: activePage === idx ? `1.5px solid ${themeObj.accent}` : "1px solid #E5E7EB", borderRadius: 10, padding: "8px 10px", cursor: "pointer" }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase" }}>Page {idx + 1}</span>
                  {doc.pages.length > 1 && (
                    <button onClick={e => { e.stopPropagation(); deletePage(idx); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#EF4444", padding: 2, borderRadius: 4 }}>
                      <Trash2 size={11} />
                    </button>
                  )}
                </div>
                <input
                  value={page.title}
                  onChange={e => renamePage(idx, e.target.value)}
                  onClick={e => e.stopPropagation()}
                  style={{ width: "100%", border: "none", background: "transparent", fontSize: 13, fontWeight: 600, color: "#111827", outline: "none", padding: 0 }}
                />
                <p style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>{page.blocks.length} block{page.blocks.length !== 1 ? "s" : ""}</p>
              </div>
            ))}
            <button
              onClick={addPage}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 12px", background: "#fff", border: "1px dashed #D1D5DB", borderRadius: 10, cursor: "pointer", fontSize: 13, color: "#6B7280", fontWeight: 500 }}
            >
              <Plus size={14} /> Add page
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

// ─── Canvas ──────────────────────────────────────────────────────────────────

function Canvas({ doc, setDoc, activePage, selectedId, setSelectedId, preview, viewMode, themeObj }) {
  const page = doc.pages[activePage];
  const [dragId, setDragId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);

  function moveBlock(id, dir) {
    setDoc(d => {
      const blocks = [...d.pages[activePage].blocks];
      const idx = blocks.findIndex(b => b.id === id);
      const newIdx = dir === "up" ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= blocks.length) return d;
      [blocks[idx], blocks[newIdx]] = [blocks[newIdx], blocks[idx]];
      const pages = d.pages.map((p, i) => i === activePage ? { ...p, blocks } : p);
      return { ...d, pages };
    });
  }

  function duplicateBlock(id) {
    setDoc(d => {
      const blocks = [...d.pages[activePage].blocks];
      const idx = blocks.findIndex(b => b.id === id);
      const clone = { ...JSON.parse(JSON.stringify(blocks[idx])), id: nanoid(8) };
      blocks.splice(idx + 1, 0, clone);
      const pages = d.pages.map((p, i) => i === activePage ? { ...p, blocks } : p);
      return { ...d, pages };
    });
  }

  function deleteBlock(id) {
    setDoc(d => {
      const pages = d.pages.map((p, i) =>
        i === activePage ? { ...p, blocks: p.blocks.filter(b => b.id !== id) } : p
      );
      return { ...d, pages };
    });
    setSelectedId(null);
  }

  function handleDrop(targetId) {
    if (!dragId || dragId === targetId) { setDragId(null); setDragOverId(null); return; }
    setDoc(d => {
      const blocks = [...d.pages[activePage].blocks];
      const fromIdx = blocks.findIndex(b => b.id === dragId);
      const toIdx = blocks.findIndex(b => b.id === targetId);
      const [moved] = blocks.splice(fromIdx, 1);
      blocks.splice(toIdx, 0, moved);
      const pages = d.pages.map((p, i) => i === activePage ? { ...p, blocks } : p);
      return { ...d, pages };
    });
    setDragId(null);
    setDragOverId(null);
  }

  const canvasWidth = viewMode === "mobile" ? 390 : "100%";
  const canvasMaxWidth = viewMode === "mobile" ? 390 : 760;

  return (
    <div
      style={{ flex: 1, overflowY: "auto", background: "#F3F4F6", padding: "32px 24px", display: "flex", justifyContent: "center" }}
      onClick={() => setSelectedId(null)}
    >
      <div style={{ width: canvasWidth, maxWidth: canvasMaxWidth, minHeight: 600, display: "flex", flexDirection: "column", gap: preview ? 24 : 0 }}>
        {preview ? doc.pages.map((previewPage, pageIndex) => (
          <div key={previewPage.id} style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 18, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}>
            {doc.pages.length > 1 && (
              <div style={{ padding: "12px 20px", borderBottom: "1px solid #F3F4F6", background: "#FAFAFA" }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Page {pageIndex + 1}</p>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{previewPage.title}</p>
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {previewPage.blocks.length === 0 ? (
                <div style={{ padding: "48px 32px", textAlign: "center", color: "#9CA3AF", fontSize: 13 }}>This page is empty</div>
              ) : (
                previewPage.blocks.map((block) => (
                  <BlockRenderer key={block.id} block={block} themeObj={themeObj} preview onUpdate={() => {}} />
                ))
              )}
            </div>
          </div>
        )) : (
        <>
        {page?.blocks.length === 0 && (
          <div style={{ border: "2px dashed #D1D5DB", borderRadius: 16, padding: "60px 32px", textAlign: "center", background: "#fff" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}><FileText size={32} color="#D1D5DB" /></div>
            <p style={{ fontSize: 15, fontWeight: 600, color: "#374151", marginBottom: 6 }}>This page is empty</p>
            <p style={{ fontSize: 13, color: "#9CA3AF" }}>Add blocks from the left sidebar to get started</p>
          </div>
        )}
        {page?.blocks.map((block, idx) => {
          function onUpdate(updater) {
            setDoc(d => {
              const pages = d.pages.map((p, i) =>
                i === activePage ? {
                  ...p, blocks: p.blocks.map(b =>
                    b.id === block.id ? { ...b, data: typeof updater === "function" ? updater(b.data) : { ...b.data, ...updater } } : b
                  )
                } : p
              );
              return { ...d, pages };
            });
          }
          return (
            <BlockWrapper
              key={block.id}
              block={block}
              idx={idx}
              total={page.blocks.length}
              selected={selectedId === block.id}
              preview={preview}
              themeObj={themeObj}
              dragId={dragId}
              dragOverId={dragOverId}
              onUpdate={onUpdate}
              onSelect={e => { e.stopPropagation(); setSelectedId(block.id); }}
              onMoveUp={() => moveBlock(block.id, "up")}
              onMoveDown={() => moveBlock(block.id, "down")}
              onDuplicate={() => duplicateBlock(block.id)}
              onDelete={() => deleteBlock(block.id)}
              onDragStart={() => setDragId(block.id)}
              onDragOver={() => setDragOverId(block.id)}
              onDrop={() => handleDrop(block.id)}
              onDragEnd={() => { setDragId(null); setDragOverId(null); }}
            />
          );
        })}
        </>
        )}
      </div>
    </div>
  );
}

function BlockWrapper({ block, idx, total, selected, preview, themeObj, dragId, dragOverId, onUpdate, onSelect, onMoveUp, onMoveDown, onDuplicate, onDelete, onDragStart, onDragOver, onDrop, onDragEnd }) {
  const isDragging = dragId === block.id;
  const isDragOver = dragOverId === block.id && dragId !== block.id;

  return (
    <div
      draggable={!preview}
      onDragStart={e => { e.dataTransfer.effectAllowed = "move"; onDragStart(); }}
      onDragOver={e => { e.preventDefault(); onDragOver(); }}
      onDrop={e => { e.preventDefault(); onDrop(); }}
      onDragEnd={onDragEnd}
      onClick={onSelect}
      style={{
        position: "relative",
        background: "#fff",
        borderRadius: 0,
        border: selected ? `2px solid ${themeObj.accent}` : isDragOver ? `2px dashed ${themeObj.accent}` : "2px solid transparent",
        opacity: isDragging ? 0.4 : 1,
        transition: "border-color .15s",
        cursor: preview ? "default" : "pointer",
      }}
    >
      {/* Block actions — shown on hover/select */}
      {!preview && (
        <div
          style={{
            position: "absolute", top: 6, right: 8, display: "flex", gap: 4, zIndex: 10,
            opacity: selected ? 1 : 0, transition: "opacity .15s",
            background: "#fff", borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,.12)", padding: "3px 4px",
          }}
          className="block-actions"
        >
          {idx > 0 && <ActionBtn icon={<ChevronUp size={12} />} title="Move up" onClick={e => { e.stopPropagation(); onMoveUp(); }} />}
          {idx < total - 1 && <ActionBtn icon={<ChevronDown size={12} />} title="Move down" onClick={e => { e.stopPropagation(); onMoveDown(); }} />}
          <ActionBtn icon={<Copy size={12} />} title="Duplicate" onClick={e => { e.stopPropagation(); onDuplicate(); }} />
          <ActionBtn icon={<Trash2 size={12} />} title="Delete" onClick={e => { e.stopPropagation(); onDelete(); }} color="#EF4444" />
        </div>
      )}

      {/* Drag handle */}
      {!preview && selected && (
        <div style={{ position: "absolute", top: "50%", left: -20, transform: "translateY(-50%)", color: "#D1D5DB", cursor: "grab" }}>
          <GripVertical size={14} />
        </div>
      )}

      <BlockRenderer block={block} themeObj={themeObj} preview={preview} onUpdate={onUpdate} />
    </div>
  );
}

function ActionBtn({ icon, title, onClick, color }) {
  return (
    <button title={title} onClick={onClick} style={{ background: "none", border: "none", cursor: "pointer", padding: "3px 5px", borderRadius: 5, color: color || "#6B7280", display: "flex", alignItems: "center" }}>
      {icon}
    </button>
  );
}

// ─── Block Renderer ───────────────────────────────────────────────────────────

function BlockRenderer({ block, themeObj, preview, onUpdate }) {
  const { type, data } = block;

  switch (type) {
    case "cover": return <CoverBlock data={data} themeObj={themeObj} onUpdate={onUpdate} editable={!preview} />;
    case "richText": return <RichTextBlock data={data} onUpdate={onUpdate} editable={!preview} />;
    case "callout": return <CalloutBlock data={data} onUpdate={onUpdate} editable={!preview} />;
    case "image": return <ImageBlock data={data} />;
    case "video": return <VideoBlock data={data} />;
    case "divider": return <DividerBlock data={data} />;
    case "spacer": return <SpacerBlock data={data} />;
    case "button": return <ButtonBlock data={data} themeObj={themeObj} />;
    case "columns": return <ColumnsBlock data={data} />;
    case "table": return <TableBlock data={data} themeObj={themeObj} />;
    case "pricing": return <PricingBlock data={data} themeObj={themeObj} />;
    case "lineItems": return <LineItemsBlock data={data} themeObj={themeObj} />;
    case "timeline": return <TimelineBlock data={data} themeObj={themeObj} />;
    case "signature": return <SignatureBlock data={data} themeObj={themeObj} />;
    case "form": return <FormBlock data={data} themeObj={themeObj} />;
    default: return <div style={{ padding: 16, color: "#9CA3AF", fontSize: 13 }}>Unknown block: {type}</div>;
  }
}

const inlineEditableStyle = { outline: "none", background: "transparent", border: "none", width: "100%", cursor: "text" };

function CoverBlock({ data, themeObj, onUpdate, editable }) {
  return (
    <div style={{ background: data.background || themeObj.accent, minHeight: data.minHeight || 280, display: "flex", flexDirection: "column", alignItems: data.align === "left" ? "flex-start" : data.align === "right" ? "flex-end" : "center", justifyContent: "center", padding: "48px 48px", textAlign: data.align || "center" }}>
      {data.logoText && <div style={{ fontSize: 13, fontWeight: 800, color: "rgba(255,255,255,.6)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 24 }}>{data.logoText}</div>}
      <h1
        contentEditable={editable}
        suppressContentEditableWarning
        onBlur={editable ? e => onUpdate({ title: e.currentTarget.textContent }) : undefined}
        onClick={e => editable && e.stopPropagation()}
        style={{ ...inlineEditableStyle, fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 900, color: data.textColor || "#fff", lineHeight: 1.1, letterSpacing: "-1px", marginBottom: 16 }}
      >
        {data.title}
      </h1>
      <p
        contentEditable={editable}
        suppressContentEditableWarning
        onBlur={editable ? e => onUpdate({ subtitle: e.currentTarget.textContent }) : undefined}
        onClick={e => editable && e.stopPropagation()}
        style={{ ...inlineEditableStyle, fontSize: 17, color: `${data.textColor || "#fff"}cc`, lineHeight: 1.6, maxWidth: 480 }}
      >
        {data.subtitle || (editable ? "Add subtitle…" : "")}
      </p>
      {data.showDate && <p style={{ fontSize: 12, color: `${data.textColor || "#fff"}88`, marginTop: 28, fontWeight: 600, letterSpacing: 1 }}>{new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>}
    </div>
  );
}

function RichTextBlock({ data, onUpdate, editable }) {
  const textAlign = data.align || "left";
  const paddingMap = { sm: "16px 32px", md: "24px 48px", lg: "40px 48px" };
  return (
    <div
      contentEditable={editable}
      suppressContentEditableWarning
      onInput={editable ? e => onUpdate({ html: e.currentTarget.innerHTML }) : undefined}
      onClick={e => editable && e.stopPropagation()}
      style={{ padding: paddingMap[data.padding] || "24px 48px", textAlign, lineHeight: 1.7, outline: "none", minHeight: editable ? 60 : undefined, cursor: editable ? "text" : "default" }}
      dangerouslySetInnerHTML={{ __html: data.html || (editable ? "<p>Click to edit text…</p>" : "") }}
    />
  );
}

function CalloutBlock({ data, onUpdate, editable }) {
  return (
    <div style={{ margin: "0 48px", padding: "20px 24px", background: data.background || "#FFFBEB", borderLeft: `4px solid ${data.borderColor || "#D97706"}`, borderRadius: 10 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <Lightbulb size={18} color={data.borderColor || "#D97706"} style={{ flexShrink: 0, marginTop: 2 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            contentEditable={editable}
            suppressContentEditableWarning
            onBlur={editable ? e => onUpdate({ title: e.currentTarget.textContent }) : undefined}
            onClick={e => editable && e.stopPropagation()}
            style={{ fontSize: 14, fontWeight: 700, color: data.textColor || "#111827", marginBottom: 4, outline: "none", cursor: editable ? "text" : "default" }}
          >
            {data.title || (editable ? "Callout title…" : "")}
          </p>
          <p
            contentEditable={editable}
            suppressContentEditableWarning
            onBlur={editable ? e => onUpdate({ text: e.currentTarget.textContent }) : undefined}
            onClick={e => editable && e.stopPropagation()}
            style={{ fontSize: 14, color: data.textColor || "#374151", lineHeight: 1.65, outline: "none", cursor: editable ? "text" : "default" }}
          >
            {data.text || (editable ? "Add callout text…" : "")}
          </p>
        </div>
      </div>
    </div>
  );
}

function ImageBlock({ data }) {
  if (!data.src) {
    return (
      <div style={{ margin: "16px 48px", background: "#F9FAFB", border: "2px dashed #E5E7EB", borderRadius: 12, padding: "40px 32px", textAlign: "center" }}>
        <ImageIcon size={28} color="#D1D5DB" style={{ margin: "0 auto 8px" }} />
        <p style={{ fontSize: 13, color: "#9CA3AF" }}>Image URL not set — add it in the properties panel</p>
      </div>
    );
  }
  return (
    <div style={{ padding: "16px 48px", textAlign: data.align || "center" }}>
      <img src={data.src} alt={data.alt || ""} style={{ maxWidth: data.width || "100%", borderRadius: data.rounded ? 12 : 0, display: "inline-block" }} />
      {data.caption && <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 8 }}>{data.caption}</p>}
    </div>
  );
}

function VideoBlock({ data }) {
  function getEmbedUrl(url) {
    if (!url) return null;
    if (url.includes("youtube.com/watch?v=")) return `https://www.youtube.com/embed/${url.split("v=")[1]?.split("&")[0]}`;
    if (url.includes("youtu.be/")) return `https://www.youtube.com/embed/${url.split("youtu.be/")[1]}`;
    if (url.includes("vimeo.com/")) return `https://player.vimeo.com/video/${url.split("vimeo.com/")[1]}`;
    return null;
  }
  const embedUrl = getEmbedUrl(data.url);
  if (!embedUrl) {
    return (
      <div style={{ margin: "16px 48px", background: "#F9FAFB", border: "2px dashed #E5E7EB", borderRadius: 12, padding: "40px 32px", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}><Play size={28} color="#D1D5DB" /></div>
        <p style={{ fontSize: 13, color: "#9CA3AF", marginTop: 8 }}>Paste a YouTube or Vimeo URL in the properties panel</p>
      </div>
    );
  }
  return (
    <div style={{ padding: "16px 48px" }}>
      <div style={{ position: "relative", paddingBottom: "56.25%", borderRadius: 12, overflow: "hidden" }}>
        <iframe src={embedUrl} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }} allowFullScreen />
      </div>
      {data.caption && <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 8, textAlign: "center" }}>{data.caption}</p>}
    </div>
  );
}

function DividerBlock({ data }) {
  return (
    <div style={{ padding: `${data.spacingTop || 24}px 48px ${data.spacingBottom || 24}px` }}>
      <hr style={{ border: "none", borderTop: `1px ${data.style || "solid"} ${data.color || "#E5E7EB"}`, margin: 0 }} />
    </div>
  );
}

function SpacerBlock({ data }) {
  return <div style={{ height: data.height || 48 }} />;
}

function ButtonBlock({ data, themeObj }) {
  const sizeMap = { sm: "10px 20px", md: "12px 28px", lg: "16px 36px" };
  return (
    <div style={{ padding: "16px 48px", textAlign: data.align || "center" }}>
      <button style={{ background: data.variant === "outline" ? "transparent" : themeObj.accent, color: data.variant === "outline" ? themeObj.accent : themeObj.accentText, border: `2px solid ${themeObj.accent}`, borderRadius: 10, padding: sizeMap[data.size] || sizeMap.md, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
        {data.text || "Click Here"}
      </button>
    </div>
  );
}

function ColumnsBlock({ data }) {
  return (
    <div style={{ padding: "24px 48px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: data.gap === "sm" ? 16 : data.gap === "lg" ? 40 : 28 }}>
      {(data.columns || []).map(col => (
        <div key={col.id} style={{ background: "#F9FAFB", borderRadius: 10, padding: "20px 20px" }}>
          {col.title && <h4 style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 8 }}>{col.title}</h4>}
          <p style={{ fontSize: 14, color: "#4B5563", lineHeight: 1.7 }}>{col.content}</p>
        </div>
      ))}
    </div>
  );
}

function TableBlock({ data, themeObj }) {
  return (
    <div style={{ padding: "16px 48px" }}>
      {data.caption && <p style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 8, textAlign: "center" }}>{data.caption}</p>}
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr style={{ background: themeObj.accent }}>
            {(data.headers || []).map((h, i) => (
              <th key={i} style={{ padding: "10px 14px", color: themeObj.accentText, fontWeight: 600, textAlign: "left", fontSize: 13 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(data.rows || []).map((row, ri) => (
            <tr key={ri} style={{ background: ri % 2 === 0 ? "#fff" : "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
              {row.map((cell, ci) => (
                <td key={ci} style={{ padding: "10px 14px", color: "#374151" }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PricingBlock({ data, themeObj }) {
  return (
    <div style={{ padding: "32px 48px" }}>
      {data.title && <h2 style={{ fontSize: 24, fontWeight: 800, color: "#111827", textAlign: "center", marginBottom: 6 }}>{data.title}</h2>}
      {data.subtitle && <p style={{ fontSize: 14, color: "#9CA3AF", textAlign: "center", marginBottom: 28 }}>{data.subtitle}</p>}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(data.packages?.length || 1, 3)}, 1fr)`, gap: 16 }}>
        {(data.packages || []).map(pkg => (
          <div key={pkg.id} style={{ border: pkg.highlighted ? `2px solid ${themeObj.accent}` : "1px solid #E5E7EB", borderRadius: 16, padding: "24px 20px", background: pkg.highlighted ? themeObj.accentLight : "#fff", position: "relative" }}>
            {pkg.highlighted && <div style={{ position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)", background: themeObj.accent, color: themeObj.accentText, fontSize: 10, fontWeight: 700, padding: "3px 12px", borderRadius: 100, whiteSpace: "nowrap" }}>Most Popular</div>}
            <p style={{ fontSize: 12, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>{pkg.name}</p>
            <p style={{ fontSize: 36, fontWeight: 900, color: pkg.highlighted ? themeObj.accent : "#111827", lineHeight: 1, letterSpacing: "-1px", marginBottom: 4 }}>{pkg.price}</p>
            {pkg.period && <p style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 12 }}>{pkg.period}</p>}
            <p style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.5, marginBottom: 16 }}>{pkg.description}</p>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px", display: "flex", flexDirection: "column", gap: 8 }}>
              {(pkg.features || []).map((f, i) => (
                <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "#374151" }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", background: themeObj.accentLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                    <Check size={10} color={themeObj.accent} strokeWidth={3} />
                  </div>
                  {f}
                </li>
              ))}
            </ul>
            <button style={{ width: "100%", background: pkg.highlighted ? themeObj.accent : "transparent", color: pkg.highlighted ? themeObj.accentText : themeObj.accent, border: `2px solid ${themeObj.accent}`, borderRadius: 10, padding: "10px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              {pkg.cta || "Get Started"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function LineItemsBlock({ data, themeObj }) {
  const { subtotal, discountAmt, taxAmt, total } = calcLineItemsTotal(data);
  const fmt = (n) => fmtCurrency(n);
  return (
    <div style={{ padding: "32px 48px" }}>
      {data.title && <h2 style={{ fontSize: 20, fontWeight: 800, color: "#111827", marginBottom: 20 }}>{data.title}</h2>}
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, marginBottom: 16 }}>
        <thead>
          <tr style={{ background: themeObj.accent }}>
            {["Description", "Qty", "Rate", "Total"].map(h => (
              <th key={h} style={{ padding: "10px 14px", color: themeObj.accentText, fontWeight: 600, textAlign: h === "Description" ? "left" : "right", fontSize: 12 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(data.items || []).map((item, i) => (
            <tr key={item.id} style={{ borderBottom: "1px solid #F3F4F6", background: i % 2 === 0 ? "#fff" : "#FAFAFA" }}>
              <td style={{ padding: "12px 14px", color: "#374151" }}>{item.description}</td>
              <td style={{ padding: "12px 14px", color: "#6B7280", textAlign: "right" }}>{item.qty}</td>
              <td style={{ padding: "12px 14px", color: "#6B7280", textAlign: "right" }}>{fmt(item.rate)}</td>
              <td style={{ padding: "12px 14px", color: "#111827", fontWeight: 600, textAlign: "right" }}>{fmt(item.qty * item.rate)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <div style={{ width: 240 }}>
          <Row label="Subtotal" value={fmt(subtotal)} />
          {discountAmt > 0 && <Row label={`Discount${data.discountType === "percent" ? ` (${data.discount}%)` : ""}`} value={`-${fmt(discountAmt)}`} />}
          {taxAmt > 0 && <Row label={`Tax (${data.taxRate}%)`} value={fmt(taxAmt)} />}
          <div style={{ borderTop: `2px solid ${themeObj.accent}`, marginTop: 8, paddingTop: 8, display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: "#111827" }}>Total</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: themeObj.accent }}>{fmt(total)}</span>
          </div>
        </div>
      </div>
      {data.notes && <p style={{ fontSize: 13, color: "#9CA3AF", marginTop: 16, padding: "12px 16px", background: "#F9FAFB", borderRadius: 8, borderLeft: "3px solid #E5E7EB" }}>{data.notes}</p>}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13 }}>
      <span style={{ color: "#6B7280" }}>{label}</span>
      <span style={{ color: "#374151" }}>{value}</span>
    </div>
  );
}

function TimelineBlock({ data, themeObj }) {
  return (
    <div style={{ padding: "32px 48px" }}>
      {data.title && <h2 style={{ fontSize: 20, fontWeight: 800, color: "#111827", marginBottom: 28 }}>{data.title}</h2>}
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {(data.milestones || []).map((m, i) => (
          <div key={m.id} style={{ display: "flex", gap: 20, paddingBottom: i < (data.milestones?.length || 0) - 1 ? 28 : 0 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: themeObj.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: themeObj.accentText }}>{i + 1}</span>
              </div>
              {i < (data.milestones?.length || 0) - 1 && <div style={{ flex: 1, width: 2, background: `${themeObj.accent}30`, marginTop: 4 }} />}
            </div>
            <div style={{ paddingBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: themeObj.accent, textTransform: "uppercase", letterSpacing: "0.08em" }}>{m.phase}</span>
                <span style={{ fontSize: 11, color: "#9CA3AF", background: "#F3F4F6", padding: "2px 8px", borderRadius: 100 }}>{m.date}</span>
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 4 }}>{m.title}</h3>
              <p style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.6 }}>{m.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SignatureBlock({ data, themeObj }) {
  return (
    <div style={{ padding: "32px 48px" }}>
      {data.title && <h2 style={{ fontSize: 18, fontWeight: 800, color: "#111827", marginBottom: 16 }}>{data.title}</h2>}
      {data.agreementText && (
        <div style={{ background: "#F9FAFB", borderLeft: `4px solid ${themeObj.accent}`, borderRadius: 8, padding: "14px 18px", marginBottom: 24 }}>
          <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.7 }}>{data.agreementText}</p>
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {(data.fields || []).map(field => (
          <div key={field.id}>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>
              {field.label}{field.required && <span style={{ color: "#EF4444" }}> *</span>}
            </label>
            {field.type === "signature" ? (
              <div style={{ height: 64, border: `1.5px dashed ${themeObj.accent}`, borderRadius: 10, background: themeObj.accentLight, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <PenLine size={14} color={themeObj.accent} />
                <span style={{ fontSize: 12, color: themeObj.accent }}>Sign here</span>
              </div>
            ) : (
              <div style={{ height: 40, border: "1px solid #E5E7EB", borderRadius: 8, background: "#fff" }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function FormBlock({ data, themeObj }) {
  return (
    <div style={{ padding: "32px 48px" }}>
      {data.title && <h2 style={{ fontSize: 20, fontWeight: 800, color: "#111827", marginBottom: 6 }}>{data.title}</h2>}
      {data.description && <p style={{ fontSize: 14, color: "#6B7280", marginBottom: 24, lineHeight: 1.6 }}>{data.description}</p>}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {(data.fields || []).map(field => (
          <div key={field.id} style={{ gridColumn: field.width === "full" ? "1 / -1" : "auto" }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>
              {field.label}{field.required && <span style={{ color: "#EF4444" }}> *</span>}
            </label>
            {field.type === "textarea" ? (
              <div style={{ height: (field.rows || 3) * 26, border: "1px solid #E5E7EB", borderRadius: 8, background: "#F9FAFB", padding: "10px 12px" }}>
                <span style={{ fontSize: 13, color: "#D1D5DB" }}>{field.placeholder || "Enter text…"}</span>
              </div>
            ) : field.type === "dropdown" ? (
              <div style={{ height: 40, border: "1px solid #E5E7EB", borderRadius: 8, background: "#F9FAFB", padding: "0 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: "#D1D5DB" }}>Select an option</span>
                <span style={{ fontSize: 12, color: "#9CA3AF" }}>▾</span>
              </div>
            ) : field.type === "radio" ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {(field.options || []).map((opt, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", border: "1px solid #E5E7EB", borderRadius: 100, fontSize: 13, color: "#374151", background: "#fff" }}>
                    <div style={{ width: 14, height: 14, borderRadius: "50%", border: `1.5px solid ${themeObj.accent}` }} />
                    {opt}
                  </div>
                ))}
              </div>
            ) : field.type === "checkbox" ? (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <div style={{ width: 18, height: 18, border: `1.5px solid ${themeObj.accent}`, borderRadius: 5, flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: 13, color: "#374151" }}>{field.label}</span>
              </div>
            ) : field.type === "rating" ? (
              <div style={{ display: "flex", gap: 4 }}>
                {[1, 2, 3, 4, 5].map(n => <Star key={n} size={22} color="#E5E7EB" fill="#E5E7EB" />)}
              </div>
            ) : field.type === "file" ? (
              <div style={{ height: 40, border: "1px dashed #D1D5DB", borderRadius: 8, background: "#F9FAFB", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <Paperclip size={13} color="#9CA3AF" />
                <span style={{ fontSize: 13, color: "#9CA3AF" }}>Choose file…</span>
              </div>
            ) : (
              <div style={{ height: 40, border: "1px solid #E5E7EB", borderRadius: 8, background: "#F9FAFB", padding: "0 12px", display: "flex", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "#D1D5DB" }}>{field.placeholder || ""}</span>
              </div>
            )}
          </div>
        ))}
      </div>
      <button style={{ marginTop: 24, background: themeObj.accent, color: themeObj.accentText, border: "none", borderRadius: 10, padding: "11px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
        {data.submitLabel || "Submit"}
      </button>
    </div>
  );
}

// ─── Properties Panel ─────────────────────────────────────────────────────────

function RightSidebar({ doc, setDoc, selectedId, activePage, themeObj }) {
  const page = doc.pages[activePage];
  const block = page?.blocks.find(b => b.id === selectedId);

  function updateData(updater) {
    setDoc(d => {
      const pages = d.pages.map((p, i) =>
        i === activePage ? {
          ...p, blocks: p.blocks.map(b =>
            b.id === selectedId ? { ...b, data: typeof updater === "function" ? updater(b.data) : { ...b.data, ...updater } } : b
          )
        } : p
      );
      return { ...d, pages };
    });
  }

  if (!block) {
    return (
      <aside style={{ width: 280, background: "#FAFAFA", borderLeft: "1px solid #E5E7EB", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em" }}>Properties</p>
        <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: "20px 16px", textAlign: "center" }}>
          <Settings size={20} color="#D1D5DB" style={{ margin: "0 auto 8px" }} />
          <p style={{ fontSize: 13, color: "#9CA3AF" }}>Select a block to edit its properties</p>
        </div>
      </aside>
    );
  }

  return (
    <aside style={{ width: 280, background: "#FAFAFA", borderLeft: "1px solid #E5E7EB", overflowY: "auto", flexShrink: 0 }}>
      <div style={{ padding: "12px 14px", borderBottom: "1px solid #E5E7EB", display: "flex", alignItems: "center", gap: 8 }}>
        <BlockTypeIcon type={block.type} size={14} color="#6B7280" />
        <p style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>{BLOCK_DEFS[block.type]?.label}</p>
      </div>
      <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 14 }}>
        <BlockProperties block={block} updateData={updateData} themeObj={themeObj} />
      </div>
    </aside>
  );
}

function PropGroup({ label, children }) {
  return (
    <div>
      <p style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>{label}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {children}
      </div>
    </div>
  );
}

function PropRow({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{label}</label>}
      {children}
    </div>
  );
}

const inputStyle = { width: "100%", border: "1px solid #E5E7EB", borderRadius: 8, padding: "7px 10px", fontSize: 13, color: "#111827", background: "#fff", outline: "none", boxSizing: "border-box" };
const textareaStyle = { ...inputStyle, minHeight: 72, resize: "vertical", fontFamily: "inherit", lineHeight: 1.5 };

function BlockProperties({ block, updateData, themeObj }) {
  const { type, data } = block;

  switch (type) {
    case "cover": return <CoverProps data={data} updateData={updateData} />;
    case "richText": return <RichTextProps data={data} updateData={updateData} />;
    case "callout": return <CalloutProps data={data} updateData={updateData} />;
    case "image": return <ImageProps data={data} updateData={updateData} />;
    case "video": return <VideoProps data={data} updateData={updateData} />;
    case "divider": return <DividerProps data={data} updateData={updateData} />;
    case "spacer": return <SpacerProps data={data} updateData={updateData} />;
    case "button": return <ButtonProps data={data} updateData={updateData} themeObj={themeObj} />;
    case "columns": return <ColumnsProps data={data} updateData={updateData} />;
    case "table": return <TableProps data={data} updateData={updateData} />;
    case "pricing": return <PricingProps data={data} updateData={updateData} themeObj={themeObj} />;
    case "lineItems": return <LineItemsProps data={data} updateData={updateData} />;
    case "timeline": return <TimelineProps data={data} updateData={updateData} />;
    case "signature": return <SignatureProps data={data} updateData={updateData} />;
    case "form": return <FormProps data={data} updateData={updateData} themeObj={themeObj} />;
    default: return <p style={{ fontSize: 13, color: "#9CA3AF" }}>No properties available</p>;
  }
}

function CoverProps({ data, updateData }) {
  return (
    <>
      <PropGroup label="Content">
        <PropRow label="Title"><input style={inputStyle} value={data.title} onChange={e => updateData({ title: e.target.value })} /></PropRow>
        <PropRow label="Subtitle"><textarea style={textareaStyle} value={data.subtitle} onChange={e => updateData({ subtitle: e.target.value })} /></PropRow>
        <PropRow label="Logo / Brand Name"><input style={inputStyle} value={data.logoText || ""} onChange={e => updateData({ logoText: e.target.value })} placeholder="Leave blank to hide" /></PropRow>
      </PropGroup>
      <PropGroup label="Style">
        <PropRow label="Background Color">
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input type="color" value={data.background} onChange={e => updateData({ background: e.target.value })} style={{ width: 36, height: 36, border: "1px solid #E5E7EB", borderRadius: 8, cursor: "pointer", padding: 2 }} />
            <input style={{ ...inputStyle, flex: 1 }} value={data.background} onChange={e => updateData({ background: e.target.value })} />
          </div>
        </PropRow>
        <PropRow label="Text Color">
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input type="color" value={data.textColor} onChange={e => updateData({ textColor: e.target.value })} style={{ width: 36, height: 36, border: "1px solid #E5E7EB", borderRadius: 8, cursor: "pointer", padding: 2 }} />
            <input style={{ ...inputStyle, flex: 1 }} value={data.textColor} onChange={e => updateData({ textColor: e.target.value })} />
          </div>
        </PropRow>
        <PropRow label="Text Align">
          <div style={{ display: "flex", gap: 4 }}>
            {["left", "center", "right"].map(a => (
              <button key={a} onClick={() => updateData({ align: a })} style={{ flex: 1, padding: "6px", border: `1px solid ${data.align === a ? "#111827" : "#E5E7EB"}`, borderRadius: 8, background: data.align === a ? "#111827" : "#fff", color: data.align === a ? "#fff" : "#6B7280", cursor: "pointer", fontSize: 12 }}>
                {a === "left" ? "Left" : a === "center" ? "Center" : "Right"}
              </button>
            ))}
          </div>
        </PropRow>
        <PropRow label="Min Height (px)">
          <input style={inputStyle} type="number" value={data.minHeight || 280} onChange={e => updateData({ minHeight: Number(e.target.value) })} />
        </PropRow>
        <PropRow>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
            <input type="checkbox" checked={!!data.showDate} onChange={e => updateData({ showDate: e.target.checked })} />
            Show date
          </label>
        </PropRow>
      </PropGroup>
    </>
  );
}

function RichTextProps({ data, updateData }) {
  const [html, setHtml] = useState(data.html || "");
  const editorRef = useRef(null);

  useEffect(() => { setHtml(data.html || ""); }, [data.html]);

  function execCmd(cmd, val = null) {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
    updateData({ html: editorRef.current?.innerHTML || "" });
  }

  function ToolBtn({ cmd, val, title, children }) {
    return (
      <button title={title} onMouseDown={e => { e.preventDefault(); execCmd(cmd, val); }} style={{ padding: "4px 7px", border: "1px solid #E5E7EB", borderRadius: 5, background: "#fff", cursor: "pointer", fontSize: 12, color: "#374151" }}>
        {children}
      </button>
    );
  }

  return (
    <>
      <PropGroup label="Content">
        <div style={{ border: "1px solid #E5E7EB", borderRadius: 10, overflow: "hidden" }}>
          {/* Formatting toolbar */}
          <div style={{ padding: "6px 8px", borderBottom: "1px solid #E5E7EB", display: "flex", flexWrap: "wrap", gap: 4, background: "#F9FAFB" }}>
            <ToolBtn cmd="formatBlock" val="h1" title="Heading 1">H1</ToolBtn>
            <ToolBtn cmd="formatBlock" val="h2" title="Heading 2">H2</ToolBtn>
            <ToolBtn cmd="formatBlock" val="h3" title="Heading 3">H3</ToolBtn>
            <ToolBtn cmd="formatBlock" val="p" title="Paragraph">P</ToolBtn>
            <ToolBtn cmd="bold" title="Bold"><strong>B</strong></ToolBtn>
            <ToolBtn cmd="italic" title="Italic"><em>I</em></ToolBtn>
            <ToolBtn cmd="underline" title="Underline"><u>U</u></ToolBtn>
            <ToolBtn cmd="insertUnorderedList" title="Bullet list">•</ToolBtn>
            <ToolBtn cmd="insertOrderedList" title="Numbered list">1.</ToolBtn>
            <ToolBtn cmd="justifyLeft" title="Left">←</ToolBtn>
            <ToolBtn cmd="justifyCenter" title="Center">↔</ToolBtn>
            <ToolBtn cmd="justifyRight" title="Right">→</ToolBtn>
          </div>
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            dangerouslySetInnerHTML={{ __html: html }}
            onInput={e => updateData({ html: e.currentTarget.innerHTML })}
            style={{ padding: "10px 12px", minHeight: 120, fontSize: 13, outline: "none", lineHeight: 1.7, color: "#111827" }}
          />
        </div>
        <PropRow label="Block Padding">
          <select style={inputStyle} value={data.padding || "md"} onChange={e => updateData({ padding: e.target.value })}>
            <option value="sm">Small</option>
            <option value="md">Medium</option>
            <option value="lg">Large</option>
          </select>
        </PropRow>
      </PropGroup>
    </>
  );
}

function CalloutProps({ data, updateData }) {
  return (
    <>
      <PropGroup label="Content">
        <PropRow label="Icon (emoji)"><input style={inputStyle} value={data.icon || ""} onChange={e => updateData({ icon: e.target.value })} placeholder="💡" /></PropRow>
        <PropRow label="Title"><input style={inputStyle} value={data.title || ""} onChange={e => updateData({ title: e.target.value })} /></PropRow>
        <PropRow label="Text"><textarea style={textareaStyle} value={data.text} onChange={e => updateData({ text: e.target.value })} /></PropRow>
      </PropGroup>
      <PropGroup label="Style">
        <PropRow label="Background"><input type="color" value={data.background} onChange={e => updateData({ background: e.target.value })} style={{ width: "100%", height: 36, border: "1px solid #E5E7EB", borderRadius: 8, cursor: "pointer", padding: 2 }} /></PropRow>
        <PropRow label="Border Color"><input type="color" value={data.borderColor} onChange={e => updateData({ borderColor: e.target.value })} style={{ width: "100%", height: 36, border: "1px solid #E5E7EB", borderRadius: 8, cursor: "pointer", padding: 2 }} /></PropRow>
      </PropGroup>
    </>
  );
}

function ImageProps({ data, updateData }) {
  return (
    <PropGroup label="Image">
      <PropRow label="Image URL"><input style={inputStyle} value={data.src || ""} onChange={e => updateData({ src: e.target.value })} placeholder="https://..." /></PropRow>
      <PropRow label="Caption"><input style={inputStyle} value={data.caption || ""} onChange={e => updateData({ caption: e.target.value })} /></PropRow>
      <PropRow label="Alt Text"><input style={inputStyle} value={data.alt || ""} onChange={e => updateData({ alt: e.target.value })} /></PropRow>
      <PropRow label="Width"><input style={inputStyle} value={data.width || "100%"} onChange={e => updateData({ width: e.target.value })} placeholder="100% or 400px" /></PropRow>
      <PropRow label="Alignment">
        <select style={inputStyle} value={data.align || "center"} onChange={e => updateData({ align: e.target.value })}>
          <option value="left">Left</option><option value="center">Center</option><option value="right">Right</option>
        </select>
      </PropRow>
      <PropRow>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
          <input type="checkbox" checked={!!data.rounded} onChange={e => updateData({ rounded: e.target.checked })} />
          Rounded corners
        </label>
      </PropRow>
    </PropGroup>
  );
}

function VideoProps({ data, updateData }) {
  return (
    <PropGroup label="Video">
      <PropRow label="YouTube or Vimeo URL"><input style={inputStyle} value={data.url || ""} onChange={e => updateData({ url: e.target.value })} placeholder="https://www.youtube.com/watch?v=..." /></PropRow>
      <PropRow label="Caption"><input style={inputStyle} value={data.caption || ""} onChange={e => updateData({ caption: e.target.value })} /></PropRow>
    </PropGroup>
  );
}

function DividerProps({ data, updateData }) {
  return (
    <PropGroup label="Divider">
      <PropRow label="Line Style">
        <select style={inputStyle} value={data.style || "solid"} onChange={e => updateData({ style: e.target.value })}>
          <option value="solid">Solid</option><option value="dashed">Dashed</option><option value="dotted">Dotted</option>
        </select>
      </PropRow>
      <PropRow label="Color"><input type="color" value={data.color || "#E5E7EB"} onChange={e => updateData({ color: e.target.value })} style={{ width: "100%", height: 36, border: "1px solid #E5E7EB", borderRadius: 8, cursor: "pointer", padding: 2 }} /></PropRow>
      <PropRow label="Spacing Top (px)"><input style={inputStyle} type="number" value={data.spacingTop || 24} onChange={e => updateData({ spacingTop: Number(e.target.value) })} /></PropRow>
      <PropRow label="Spacing Bottom (px)"><input style={inputStyle} type="number" value={data.spacingBottom || 24} onChange={e => updateData({ spacingBottom: Number(e.target.value) })} /></PropRow>
    </PropGroup>
  );
}

function SpacerProps({ data, updateData }) {
  return (
    <PropGroup label="Spacer">
      <PropRow label="Height (px)"><input style={inputStyle} type="number" value={data.height || 48} onChange={e => updateData({ height: Number(e.target.value) })} /></PropRow>
    </PropGroup>
  );
}

function ButtonProps({ data, updateData, themeObj }) {
  return (
    <>
      <PropGroup label="Content">
        <PropRow label="Button Text"><input style={inputStyle} value={data.text || ""} onChange={e => updateData({ text: e.target.value })} /></PropRow>
        <PropRow label="Link URL"><input style={inputStyle} value={data.url || ""} onChange={e => updateData({ url: e.target.value })} placeholder="https://..." /></PropRow>
      </PropGroup>
      <PropGroup label="Style">
        <PropRow label="Variant">
          <select style={inputStyle} value={data.variant || "solid"} onChange={e => updateData({ variant: e.target.value })}>
            <option value="solid">Solid</option><option value="outline">Outline</option>
          </select>
        </PropRow>
        <PropRow label="Size">
          <select style={inputStyle} value={data.size || "md"} onChange={e => updateData({ size: e.target.value })}>
            <option value="sm">Small</option><option value="md">Medium</option><option value="lg">Large</option>
          </select>
        </PropRow>
        <PropRow label="Alignment">
          <select style={inputStyle} value={data.align || "center"} onChange={e => updateData({ align: e.target.value })}>
            <option value="left">Left</option><option value="center">Center</option><option value="right">Right</option>
          </select>
        </PropRow>
      </PropGroup>
    </>
  );
}

function ColumnsProps({ data, updateData }) {
  function updateCol(idx, field, val) {
    updateData(d => ({ ...d, columns: d.columns.map((c, i) => i === idx ? { ...c, [field]: val } : c) }));
  }
  return (
    <PropGroup label="Columns">
      <PropRow label="Gap">
        <select style={inputStyle} value={data.gap || "md"} onChange={e => updateData({ gap: e.target.value })}>
          <option value="sm">Small</option><option value="md">Medium</option><option value="lg">Large</option>
        </select>
      </PropRow>
      {(data.columns || []).map((col, i) => (
        <div key={col.id} style={{ border: "1px solid #E5E7EB", borderRadius: 10, padding: "10px 12px" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", marginBottom: 8 }}>Column {i + 1}</p>
          <PropRow label="Title"><input style={inputStyle} value={col.title || ""} onChange={e => updateCol(i, "title", e.target.value)} /></PropRow>
          <PropRow label="Content"><textarea style={{ ...textareaStyle, marginTop: 4 }} value={col.content || ""} onChange={e => updateCol(i, "content", e.target.value)} /></PropRow>
        </div>
      ))}
    </PropGroup>
  );
}

function TableProps({ data, updateData }) {
  function updateHeader(i, val) {
    updateData(d => ({ ...d, headers: d.headers.map((h, hi) => hi === i ? val : h) }));
  }
  function addCol() {
    updateData(d => ({ ...d, headers: [...d.headers, "New Column"], rows: d.rows.map(r => [...r, ""]) }));
  }
  function addRow() {
    updateData(d => ({ ...d, rows: [...d.rows, d.headers.map(() => "")] }));
  }
  function removeRow(ri) {
    updateData(d => ({ ...d, rows: d.rows.filter((_, i) => i !== ri) }));
  }
  function updateCell(ri, ci, val) {
    updateData(d => ({ ...d, rows: d.rows.map((r, i) => i === ri ? r.map((c, j) => j === ci ? val : c) : r) }));
  }
  return (
    <>
      <PropGroup label="Caption">
        <PropRow><input style={inputStyle} value={data.caption || ""} onChange={e => updateData({ caption: e.target.value })} placeholder="Optional caption" /></PropRow>
      </PropGroup>
      <PropGroup label="Headers">
        {(data.headers || []).map((h, i) => (
          <PropRow key={i} label={`Column ${i + 1}`}><input style={inputStyle} value={h} onChange={e => updateHeader(i, e.target.value)} /></PropRow>
        ))}
        <button onClick={addCol} style={{ ...inputStyle, cursor: "pointer", color: "#6B7280", textAlign: "center" }}>+ Add Column</button>
      </PropGroup>
      <PropGroup label="Rows">
        {(data.rows || []).map((row, ri) => (
          <div key={ri} style={{ border: "1px solid #E5E7EB", borderRadius: 8, padding: "8px 10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF" }}>Row {ri + 1}</span>
              <button onClick={() => removeRow(ri)} style={{ background: "none", border: "none", cursor: "pointer", color: "#EF4444" }}><Trash2 size={11} /></button>
            </div>
            {row.map((cell, ci) => (
              <input key={ci} style={{ ...inputStyle, marginBottom: 4 }} value={cell} onChange={e => updateCell(ri, ci, e.target.value)} placeholder={data.headers[ci] || `Cell ${ci + 1}`} />
            ))}
          </div>
        ))}
        <button onClick={addRow} style={{ ...inputStyle, cursor: "pointer", color: "#6B7280", textAlign: "center" }}>+ Add Row</button>
      </PropGroup>
    </>
  );
}

function PricingProps({ data, updateData }) {
  function updatePkg(id, field, val) {
    updateData(d => ({ ...d, packages: d.packages.map(p => p.id === id ? { ...p, [field]: val } : p) }));
  }
  function addPkg() {
    const pkg = { id: uid("pkg-"), name: "New Package", price: "$0", period: "one-time", description: "", features: ["Feature"], highlighted: false, cta: "Get Started" };
    updateData(d => ({ ...d, packages: [...d.packages, pkg] }));
  }
  function removePkg(id) {
    updateData(d => ({ ...d, packages: d.packages.filter(p => p.id !== id) }));
  }
  function addFeature(id) {
    updateData(d => ({ ...d, packages: d.packages.map(p => p.id === id ? { ...p, features: [...p.features, "New feature"] } : p) }));
  }
  function updateFeature(pkgId, fi, val) {
    updateData(d => ({ ...d, packages: d.packages.map(p => p.id === pkgId ? { ...p, features: p.features.map((f, i) => i === fi ? val : f) } : p) }));
  }
  function removeFeature(pkgId, fi) {
    updateData(d => ({ ...d, packages: d.packages.map(p => p.id === pkgId ? { ...p, features: p.features.filter((_, i) => i !== fi) } : p) }));
  }

  return (
    <>
      <PropGroup label="Section">
        <PropRow label="Title"><input style={inputStyle} value={data.title || ""} onChange={e => updateData({ title: e.target.value })} /></PropRow>
        <PropRow label="Subtitle"><input style={inputStyle} value={data.subtitle || ""} onChange={e => updateData({ subtitle: e.target.value })} /></PropRow>
      </PropGroup>
      <PropGroup label="Packages">
        {(data.packages || []).map((pkg, pi) => (
          <div key={pkg.id} style={{ border: "1px solid #E5E7EB", borderRadius: 10, padding: "10px 12px", background: "#fff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>Package {pi + 1}</span>
              <div style={{ display: "flex", gap: 6 }}>
                <label style={{ fontSize: 11, color: "#6B7280", display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
                  <input type="checkbox" checked={!!pkg.highlighted} onChange={e => updatePkg(pkg.id, "highlighted", e.target.checked)} /> Popular
                </label>
                <button onClick={() => removePkg(pkg.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#EF4444" }}><Trash2 size={11} /></button>
              </div>
            </div>
            <PropRow label="Name"><input style={inputStyle} value={pkg.name} onChange={e => updatePkg(pkg.id, "name", e.target.value)} /></PropRow>
            <PropRow label="Price"><input style={{ ...inputStyle, marginTop: 4 }} value={pkg.price} onChange={e => updatePkg(pkg.id, "price", e.target.value)} placeholder="$500" /></PropRow>
            <PropRow label="Period"><input style={{ ...inputStyle, marginTop: 4 }} value={pkg.period} onChange={e => updatePkg(pkg.id, "period", e.target.value)} placeholder="one-time" /></PropRow>
            <PropRow label="Description"><textarea style={{ ...textareaStyle, marginTop: 4, minHeight: 48 }} value={pkg.description} onChange={e => updatePkg(pkg.id, "description", e.target.value)} /></PropRow>
            <PropRow label="Button Text"><input style={{ ...inputStyle, marginTop: 4 }} value={pkg.cta} onChange={e => updatePkg(pkg.id, "cta", e.target.value)} /></PropRow>
            <div style={{ marginTop: 8 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", marginBottom: 4 }}>Features</p>
              {(pkg.features || []).map((f, fi) => (
                <div key={fi} style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                  <input style={{ ...inputStyle, flex: 1 }} value={f} onChange={e => updateFeature(pkg.id, fi, e.target.value)} />
                  <button onClick={() => removeFeature(pkg.id, fi)} style={{ background: "none", border: "1px solid #FCA5A5", borderRadius: 6, cursor: "pointer", color: "#EF4444", padding: "0 6px" }}><X size={10} /></button>
                </div>
              ))}
              <button onClick={() => addFeature(pkg.id)} style={{ fontSize: 12, color: "#6B7280", background: "none", border: "1px dashed #E5E7EB", borderRadius: 6, padding: "4px 8px", cursor: "pointer", width: "100%" }}>+ Add feature</button>
            </div>
          </div>
        ))}
        <button onClick={addPkg} style={{ ...inputStyle, cursor: "pointer", color: "#6B7280", textAlign: "center" }}>+ Add Package</button>
      </PropGroup>
    </>
  );
}

function LineItemsProps({ data, updateData }) {
  function updateItem(id, field, val) {
    updateData(d => {
      const items = d.items.map(it => it.id === id ? { ...it, [field]: field === "qty" || field === "rate" ? Number(val) : val, total: field === "qty" ? Number(val) * it.rate : field === "rate" ? it.qty * Number(val) : it.total } : it);
      return { ...d, items };
    });
  }
  function addItem() {
    updateData(d => ({ ...d, items: [...d.items, { id: uid("li-"), description: "New Item", qty: 1, rate: 0, total: 0 }] }));
  }
  function removeItem(id) {
    updateData(d => ({ ...d, items: d.items.filter(it => it.id !== id) }));
  }

  return (
    <>
      <PropGroup label="Title">
        <PropRow><input style={inputStyle} value={data.title || ""} onChange={e => updateData({ title: e.target.value })} /></PropRow>
      </PropGroup>
      <PropGroup label="Line Items">
        {(data.items || []).map((item) => (
          <div key={item.id} style={{ border: "1px solid #E5E7EB", borderRadius: 10, padding: "10px 12px" }}>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 4 }}>
              <button onClick={() => removeItem(item.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#EF4444" }}><Trash2 size={11} /></button>
            </div>
            <PropRow label="Description"><input style={inputStyle} value={item.description} onChange={e => updateItem(item.id, "description", e.target.value)} /></PropRow>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 4 }}>
              <PropRow label="Qty"><input style={inputStyle} type="number" value={item.qty} onChange={e => updateItem(item.id, "qty", e.target.value)} /></PropRow>
              <PropRow label="Rate ($)"><input style={inputStyle} type="number" value={item.rate} onChange={e => updateItem(item.id, "rate", e.target.value)} /></PropRow>
            </div>
          </div>
        ))}
        <button onClick={addItem} style={{ ...inputStyle, cursor: "pointer", color: "#6B7280", textAlign: "center" }}>+ Add Line Item</button>
      </PropGroup>
      <PropGroup label="Totals">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          <PropRow label="Tax Rate (%)"><input style={inputStyle} type="number" value={data.taxRate || 0} onChange={e => updateData({ taxRate: Number(e.target.value) })} /></PropRow>
          <PropRow label="Discount"><input style={inputStyle} type="number" value={data.discount || 0} onChange={e => updateData({ discount: Number(e.target.value) })} /></PropRow>
        </div>
        <PropRow label="Discount Type">
          <select style={inputStyle} value={data.discountType || "fixed"} onChange={e => updateData({ discountType: e.target.value })}>
            <option value="fixed">Fixed ($)</option><option value="percent">Percent (%)</option>
          </select>
        </PropRow>
        <PropRow label="Notes"><textarea style={textareaStyle} value={data.notes || ""} onChange={e => updateData({ notes: e.target.value })} /></PropRow>
      </PropGroup>
    </>
  );
}

function TimelineProps({ data, updateData }) {
  function updateMs(id, field, val) {
    updateData(d => ({ ...d, milestones: d.milestones.map(m => m.id === id ? { ...m, [field]: val } : m) }));
  }
  function addMs() {
    updateData(d => ({ ...d, milestones: [...d.milestones, { id: uid("ms-"), phase: `Phase ${d.milestones.length + 1}`, title: "New Milestone", date: "Week X", description: "Description here." }] }));
  }
  function removeMs(id) {
    updateData(d => ({ ...d, milestones: d.milestones.filter(m => m.id !== id) }));
  }

  return (
    <>
      <PropGroup label="Title">
        <PropRow><input style={inputStyle} value={data.title || ""} onChange={e => updateData({ title: e.target.value })} /></PropRow>
      </PropGroup>
      <PropGroup label="Milestones">
        {(data.milestones || []).map((m, i) => (
          <div key={m.id} style={{ border: "1px solid #E5E7EB", borderRadius: 10, padding: "10px 12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF" }}>Milestone {i + 1}</span>
              <button onClick={() => removeMs(m.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#EF4444" }}><Trash2 size={11} /></button>
            </div>
            <PropRow label="Phase Label"><input style={inputStyle} value={m.phase} onChange={e => updateMs(m.id, "phase", e.target.value)} /></PropRow>
            <PropRow label="Title"><input style={{ ...inputStyle, marginTop: 4 }} value={m.title} onChange={e => updateMs(m.id, "title", e.target.value)} /></PropRow>
            <PropRow label="Date / Duration"><input style={{ ...inputStyle, marginTop: 4 }} value={m.date} onChange={e => updateMs(m.id, "date", e.target.value)} /></PropRow>
            <PropRow label="Description"><textarea style={{ ...textareaStyle, marginTop: 4, minHeight: 48 }} value={m.description} onChange={e => updateMs(m.id, "description", e.target.value)} /></PropRow>
          </div>
        ))}
        <button onClick={addMs} style={{ ...inputStyle, cursor: "pointer", color: "#6B7280", textAlign: "center" }}>+ Add Milestone</button>
      </PropGroup>
    </>
  );
}

function SignatureProps({ data, updateData }) {
  function updateField(id, field, val) {
    updateData(d => ({ ...d, fields: d.fields.map(f => f.id === id ? { ...f, [field]: val } : f) }));
  }
  function addField() {
    updateData(d => ({ ...d, fields: [...d.fields, { id: uid("sf-"), label: "New Field", type: "text", required: false }] }));
  }
  function removeField(id) {
    updateData(d => ({ ...d, fields: d.fields.filter(f => f.id !== id) }));
  }
  return (
    <>
      <PropGroup label="Content">
        <PropRow label="Title"><input style={inputStyle} value={data.title || ""} onChange={e => updateData({ title: e.target.value })} /></PropRow>
        <PropRow label="Agreement Text"><textarea style={textareaStyle} value={data.agreementText || ""} onChange={e => updateData({ agreementText: e.target.value })} /></PropRow>
      </PropGroup>
      <PropGroup label="Fields">
        {(data.fields || []).map((field, i) => (
          <div key={field.id} style={{ border: "1px solid #E5E7EB", borderRadius: 8, padding: "8px 10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF" }}>Field {i + 1}</span>
              <button onClick={() => removeField(field.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#EF4444" }}><Trash2 size={11} /></button>
            </div>
            <PropRow label="Label"><input style={inputStyle} value={field.label} onChange={e => updateField(field.id, "label", e.target.value)} /></PropRow>
            <PropRow label="Type">
              <select style={{ ...inputStyle, marginTop: 4 }} value={field.type} onChange={e => updateField(field.id, "type", e.target.value)}>
                <option value="text">Text</option>
                <option value="signature">Signature Pad</option>
                <option value="date">Date</option>
                <option value="email">Email</option>
              </select>
            </PropRow>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, marginTop: 6, cursor: "pointer" }}>
              <input type="checkbox" checked={!!field.required} onChange={e => updateField(field.id, "required", e.target.checked)} /> Required
            </label>
          </div>
        ))}
        <button onClick={addField} style={{ ...inputStyle, cursor: "pointer", color: "#6B7280", textAlign: "center" }}>+ Add Field</button>
      </PropGroup>
    </>
  );
}

function FormProps({ data, updateData, themeObj }) {
  function updateField(id, patch) {
    updateData(d => ({ ...d, fields: d.fields.map(f => f.id === id ? { ...f, ...patch } : f) }));
  }
  function addField(type) {
    const defaults = FORM_FIELD_DEFAULTS[type] || {};
    const newField = { id: uid("ff-"), type, label: FORM_FIELD_TYPES.find(t => t.type === type)?.label || "Field", ...defaults };
    updateData(d => ({ ...d, fields: [...d.fields, newField] }));
  }
  function removeField(id) {
    updateData(d => ({ ...d, fields: d.fields.filter(f => f.id !== id) }));
  }
  function moveField(id, dir) {
    updateData(d => {
      const fields = [...d.fields];
      const idx = fields.findIndex(f => f.id === id);
      const newIdx = dir === "up" ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= fields.length) return d;
      [fields[idx], fields[newIdx]] = [fields[newIdx], fields[idx]];
      return { ...d, fields };
    });
  }
  function updateOption(fieldId, optIdx, val) {
    updateData(d => ({ ...d, fields: d.fields.map(f => f.id === fieldId ? { ...f, options: f.options.map((o, i) => i === optIdx ? val : o) } : f) }));
  }
  function addOption(fieldId) {
    updateData(d => ({ ...d, fields: d.fields.map(f => f.id === fieldId ? { ...f, options: [...(f.options || []), "New option"] } : f) }));
  }
  function removeOption(fieldId, optIdx) {
    updateData(d => ({ ...d, fields: d.fields.map(f => f.id === fieldId ? { ...f, options: f.options.filter((_, i) => i !== optIdx) } : f) }));
  }

  const [expandedField, setExpandedField] = useState(null);

  return (
    <>
      <PropGroup label="Form Settings">
        <PropRow label="Title"><input style={inputStyle} value={data.title || ""} onChange={e => updateData({ title: e.target.value })} /></PropRow>
        <PropRow label="Description"><textarea style={{ ...textareaStyle, minHeight: 48 }} value={data.description || ""} onChange={e => updateData({ description: e.target.value })} /></PropRow>
        <PropRow label="Submit Button Label"><input style={inputStyle} value={data.submitLabel || "Submit"} onChange={e => updateData({ submitLabel: e.target.value })} /></PropRow>
      </PropGroup>

      <PropGroup label="Add Field">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
          {FORM_FIELD_TYPES.map(ft => (
            <button
              key={ft.type}
              onClick={() => addField(ft.type)}
              style={{ padding: "6px 8px", background: "#fff", border: "1px solid #E5E7EB", borderRadius: 8, cursor: "pointer", fontSize: 11, fontWeight: 600, color: "#374151", display: "flex", alignItems: "center", gap: 4 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = themeObj.accent; e.currentTarget.style.color = themeObj.accent; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.color = "#374151"; }}
            >
              {(() => { const FI = FIELD_ICON_MAP[ft.type]; return FI ? <FI size={12} /> : null; })()} {ft.label}
            </button>
          ))}
        </div>
      </PropGroup>

      <PropGroup label="Fields">
        {(data.fields || []).length === 0 && (
          <p style={{ fontSize: 12, color: "#9CA3AF", textAlign: "center", padding: "12px 0" }}>No fields yet. Add some above.</p>
        )}
        {(data.fields || []).map((field, i) => (
          <div key={field.id} style={{ border: expandedField === field.id ? `1.5px solid ${themeObj.accent}` : "1px solid #E5E7EB", borderRadius: 10, background: "#fff", overflow: "hidden" }}>
            {/* Field header */}
            <div
              onClick={() => setExpandedField(expandedField === field.id ? null : field.id)}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 10px", cursor: "pointer", background: "#F9FAFB" }}
            >
              {(() => { const FI = FIELD_ICON_MAP[field.type]; return FI ? <FI size={12} /> : <Hash size={12} />; })()}
              <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{field.label}</span>
              {field.required && <span style={{ fontSize: 9, fontWeight: 700, color: "#EF4444", background: "#FEE2E2", borderRadius: 4, padding: "1px 4px" }}>REQ</span>}
              <div style={{ display: "flex", gap: 2 }}>
                {i > 0 && <button onClick={e => { e.stopPropagation(); moveField(field.id, "up"); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", padding: 2 }}><ChevronUp size={11} /></button>}
                {i < (data.fields?.length || 0) - 1 && <button onClick={e => { e.stopPropagation(); moveField(field.id, "down"); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", padding: 2 }}><ChevronDown size={11} /></button>}
                <button onClick={e => { e.stopPropagation(); removeField(field.id); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#EF4444", padding: 2 }}><Trash2 size={11} /></button>
              </div>
            </div>

            {/* Field settings (expanded) */}
            {expandedField === field.id && (
              <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
                <PropRow label="Label"><input style={inputStyle} value={field.label} onChange={e => updateField(field.id, { label: e.target.value })} /></PropRow>
                {(field.type === "text" || field.type === "email" || field.type === "phone" || field.type === "number") && (
                  <PropRow label="Placeholder"><input style={inputStyle} value={field.placeholder || ""} onChange={e => updateField(field.id, { placeholder: e.target.value })} /></PropRow>
                )}
                {field.type === "textarea" && (
                  <>
                    <PropRow label="Placeholder"><input style={inputStyle} value={field.placeholder || ""} onChange={e => updateField(field.id, { placeholder: e.target.value })} /></PropRow>
                    <PropRow label="Rows"><input style={inputStyle} type="number" value={field.rows || 3} onChange={e => updateField(field.id, { rows: Number(e.target.value) })} /></PropRow>
                  </>
                )}
                {(field.type === "dropdown" || field.type === "radio") && (
                  <PropRow label="Options">
                    {(field.options || []).map((opt, oi) => (
                      <div key={oi} style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                        <input style={{ ...inputStyle, flex: 1 }} value={opt} onChange={e => updateOption(field.id, oi, e.target.value)} />
                        <button onClick={() => removeOption(field.id, oi)} style={{ background: "none", border: "1px solid #FCA5A5", borderRadius: 6, cursor: "pointer", color: "#EF4444", padding: "0 6px" }}><X size={10} /></button>
                      </div>
                    ))}
                    <button onClick={() => addOption(field.id)} style={{ fontSize: 11, color: "#6B7280", background: "none", border: "1px dashed #E5E7EB", borderRadius: 6, padding: "4px 8px", cursor: "pointer", width: "100%" }}>+ Add option</button>
                  </PropRow>
                )}
                <PropRow label="Width">
                  <select style={inputStyle} value={field.width || "full"} onChange={e => updateField(field.id, { width: e.target.value })}>
                    <option value="full">Full Width</option>
                    <option value="half">Half Width</option>
                  </select>
                </PropRow>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, cursor: "pointer" }}>
                  <input type="checkbox" checked={!!field.required} onChange={e => updateField(field.id, { required: e.target.checked })} /> Required field
                </label>
              </div>
            )}
          </div>
        ))}
      </PropGroup>
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TemplateBuilderClient({ savedTemplates = [] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get("templateId") || searchParams.get("id");
  const initialType = searchParams.get("type") || "proposal";

  const [doc, setDoc] = useState(() => createDefaultDocument(initialType));
  const [templateName, setTemplateName] = useState("Untitled Template");
  const [docType, setDocType] = useState(initialType);
  const [theme, setTheme] = useState("coral");
  const [activePage, setActivePage] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [leftTab, setLeftTab] = useState("blocks");
  const [preview, setPreview] = useState(false);
  const [viewMode, setViewMode] = useState("desktop");
  const [saving, setSaving] = useState(false);
  const [savedTemplateId, setSavedTemplateId] = useState(templateId || null);
  const [saveState, setSaveState] = useState({ type: "", message: "" });

  const themeObj = TEMPLATE_THEMES[theme] || TEMPLATE_THEMES.coral;

  // Load existing template if id in URL
  useEffect(() => {
    if (!templateId) return;
    const existing = savedTemplates.find(t => t.id === templateId);
    if (!existing) return;
    setTemplateName(existing.name || "Untitled Template");
    setDocType(existing.type || "proposal");
    const parsed = (() => { try { return JSON.parse(existing.content); } catch { return null; } })();
    if (parsed?.version && parsed?.pages) {
      setDoc(parsed);
      if (parsed.theme) setTheme(parsed.theme);
    }
  }, [templateId]);

  async function handleSave() {
    if (!templateName.trim()) {
      setSaveState({ type: "error", message: "Template name is required." });
      return;
    }

    setSaving(true);
    setSaveState({ type: "", message: "" });
    const content = JSON.stringify({ ...doc, theme });

    try {
      if (savedTemplateId) {
        const res = await fetch(`/api/templates/${savedTemplateId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: templateName.trim(), type: docType, content }),
        });
        const data = await res.json();
        if (!res.ok) {
          setSaveState({ type: "error", message: data?.error || `Save failed (${res.status})` });
          return;
        }
        setSaveState({ type: "success", message: "Template saved." });
      } else {
        const res = await fetch("/api/templates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: templateName.trim(), type: docType, content }),
        });
        const data = await res.json();
        if (!res.ok) {
          setSaveState({ type: "error", message: data?.error || `Save failed (${res.status})` });
          return;
        }
        if (data?.id || data?.template?.id) {
          const newId = data?.template?.id || data?.id;
          setSavedTemplateId(newId);
          router.replace(`/templates/builder?templateId=${newId}`, { scroll: false });
        }
        setSaveState({ type: "success", message: "Template saved." });
      }
    } catch (e) {
      console.error("handleSave error:", e);
      setSaveState({ type: "error", message: "Network error — could not save." });
    } finally {
      setSaving(false);
      // auto-clear success after 3s
      setTimeout(() => setSaveState(s => s.type === "success" ? { type: "", message: "" } : s), 3000);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", fontFamily: "inherit" }}>
      <TopBar
        name={templateName} setName={setTemplateName}
        docType={docType} setDocType={setDocType}
        theme={theme} setTheme={setTheme}
        preview={preview} setPreview={setPreview}
        viewMode={viewMode} setViewMode={setViewMode}
        saving={saving} onSave={handleSave}
        router={router}
      />

      {saveState.message && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 9999,
            padding: "10px 18px",
            borderRadius: 10,
            background: saveState.type === "error" ? "#FEF2F2" : "#F0FDF4",
            color: saveState.type === "error" ? "#B91C1C" : "#166534",
            border: `1px solid ${saveState.type === "error" ? "#FECACA" : "#BBF7D0"}`,
            fontSize: 13,
            fontWeight: 600,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            pointerEvents: "none",
          }}
        >
          {saveState.message}
        </div>
      )}

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {!preview && (
          <LeftSidebar
            leftTab={leftTab} setLeftTab={setLeftTab}
            doc={doc} setDoc={setDoc}
            activePage={activePage} setActivePage={setActivePage}
            selectedId={selectedId} setSelectedId={setSelectedId}
            themeObj={themeObj}
          />
        )}

        {/* Page tabs + canvas */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Page tabs */}
          {!preview && (
            <div style={{ background: "#fff", borderBottom: "1px solid #E5E7EB", padding: "0 16px", display: "flex", gap: 4, overflowX: "auto", flexShrink: 0 }}>
              {doc.pages.map((page, idx) => (
                <button
                  key={page.id}
                  onClick={() => { setActivePage(idx); setSelectedId(null); }}
                  style={{ padding: "10px 16px", border: "none", background: "none", borderBottom: activePage === idx ? `2px solid ${themeObj.accent}` : "2px solid transparent", color: activePage === idx ? themeObj.accent : "#6B7280", fontSize: 13, fontWeight: activePage === idx ? 700 : 500, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}
                >
                  {page.title}
                </button>
              ))}
            </div>
          )}

          <Canvas
            doc={doc} setDoc={setDoc}
            activePage={activePage}
            selectedId={selectedId} setSelectedId={setSelectedId}
            preview={preview}
            viewMode={viewMode}
            themeObj={themeObj}
          />
        </div>

        {!preview && (
          <RightSidebar
            doc={doc} setDoc={setDoc}
            selectedId={selectedId}
            activePage={activePage}
            themeObj={themeObj}
          />
        )}
      </div>
    </div>
  );
}
