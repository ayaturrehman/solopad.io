"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { selectClassName } from "@/components/ui/Input";
import { Check, ChevronDown, ChevronRight, LayoutTemplate, RefreshCw, Save, X } from "lucide-react";
import ProposalPreview from "@/app/(app)/proposals/[id]/ProposalPreview";
import ContractPreview from "@/app/(app)/contracts/[id]/ContractPreview";

// ── Colour theme presets ─────────────────────────────────────────────────────
const THEMES = [
  { key: "default", label: "Default",  accent: "#18181b", swatch: "#18181b" },
  { key: "ocean",   label: "Ocean",    accent: "#0ea5e9", swatch: "#0ea5e9" },
  { key: "forest",  label: "Forest",   accent: "#059669", swatch: "#059669" },
  { key: "coral",   label: "Coral",    accent: "#e8533a", swatch: "#e8533a" },
  { key: "violet",  label: "Violet",   accent: "#7c3aed", swatch: "#7c3aed" },
  { key: "amber",   label: "Amber",    accent: "#d97706", swatch: "#d97706" },
  { key: "rose",    label: "Rose",     accent: "#e11d48", swatch: "#e11d48" },
  { key: "slate",   label: "Slate",    accent: "#475569", swatch: "#475569" },
];

// ── Sample data ──────────────────────────────────────────────────────────────
const SAMPLE = {
  invoice: {
    number: "INV-2024-042",
    clientName: "Acme Corporation",
    clientEmail: "billing@acmecorp.com",
    date: "March 13, 2026",
    due: "March 27, 2026",
    project: "Brand Redesign",
    items: [
      { desc: "Brand Strategy & Discovery", qty: 1, rate: 1200, amt: 1200 },
      { desc: "Logo Design (3 concepts)", qty: 1, rate: 800, amt: 800 },
      { desc: "Brand Guidelines Document", qty: 1, rate: 600, amt: 600 },
    ],
    subtotal: 2600,
    tax: 260,
    taxRate: 10,
    total: 2860,
  },
  proposal: {
    title: "Website Redesign Proposal",
    clientName: "Globex Inc.",
    clientEmail: "hello@globexinc.com",
    total: 4500,
    currency: "USD",
    createdAt: "2026-03-13",
    validUntil: "2026-04-13",
    intro: "We're excited to present this proposal for a full website redesign. Our goal is to deliver a modern, high-performance site that reflects your brand.",
    sections: [
      { heading: "Discovery & Strategy", body: "UX research, stakeholder interviews, competitor analysis." },
      { heading: "Design", body: "Wireframes, visual design, prototype, 2 revision rounds." },
      { heading: "Development", body: "Next.js implementation, CMS integration, responsive across devices." },
      { heading: "Launch", body: "QA testing, performance optimisation, deployment & handover." },
    ],
    pricing: [
      { description: "Discovery & Strategy", amount: 800 },
      { description: "UX / UI Design", amount: 1500 },
      { description: "Development", amount: 2000 },
      { description: "Deployment & Handover", amount: 200 },
    ],
  },
  contract: {
    title: "Freelance Services Agreement",
    clientName: "Initech Ltd.",
    clientEmail: "legal@initech.com",
    clauses: [
      { heading: "Scope of Work", body: "Freelancer agrees to provide the services outlined in the attached Statement of Work document." },
      { heading: "Payment Terms", body: "Client agrees to pay 50% upfront and 50% upon project completion within 14 days of final invoice." },
      { heading: "Intellectual Property", body: "All work product shall become property of Client upon receipt of full payment." },
      { heading: "Confidentiality", body: "Both parties agree to keep all shared information confidential for a period of 2 years." },
    ],
  },
};

function fmtMoney(n) {
  return `£${Number(n).toFixed(2)}`;
}

// ── Form primitives ──────────────────────────────────────────────────────────
function Field({ label, children, hint }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-medium text-zinc-500 uppercase tracking-wide">{label}</label>}
      {children}
      {hint && <p className="text-xs text-zinc-400">{hint}</p>}
    </div>
  );
}

function inputCls() {
  return "h-9 w-full rounded border border-zinc-200 px-3 text-sm text-zinc-900 bg-white outline-none transition-colors focus:border-zinc-400 placeholder:text-zinc-400";
}

function TextInput({ label, value, onChange, placeholder, hint }) {
  return (
    <Field label={label} hint={hint}>
      <input
        type="text"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputCls()}
      />
    </Field>
  );
}

function TextAreaInput({ label, value, onChange, placeholder, rows = 3 }) {
  return (
    <Field label={label}>
      <textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full rounded border border-zinc-200 px-3 py-2 text-sm text-zinc-900 bg-white outline-none transition-colors focus:border-zinc-400 placeholder:text-zinc-400 resize-none"
      />
    </Field>
  );
}

function Toggle({ label, hint, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm text-zinc-700">{label}</p>
        {hint && <p className="text-xs text-zinc-400">{hint}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative shrink-0 h-5 w-9 rounded-full transition-colors ${checked ? "bg-zinc-900" : "bg-zinc-200"}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-4 w-4 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-4" : "translate-x-0"}`}
        />
      </button>
    </div>
  );
}

function ColorInput({ label, value, onChange }) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-2">
        <div className="relative shrink-0">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
          />
          <div
            className="h-9 w-9 rounded border border-zinc-200"
            style={{ backgroundColor: value }}
          />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputCls()} font-mono`}
          maxLength={7}
        />
      </div>
    </Field>
  );
}

function SegmentedControl({ options, value, onChange }) {
  return (
    <div className="flex rounded border border-zinc-200 bg-zinc-50 p-0.5 gap-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex-1 rounded py-1.5 text-xs font-medium transition-colors ${
            value === opt.value
              ? "bg-white text-zinc-900 shadow-sm border border-zinc-200"
              : "text-zinc-500 hover:text-zinc-700"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ── Accordion ────────────────────────────────────────────────────────────────
function AccordionSection({ title, open, onToggle, children }) {
  return (
    <div className="border-b border-zinc-100">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3.5 text-sm font-semibold text-zinc-800 hover:bg-zinc-50 transition-colors text-left"
      >
        {title}
        {open
          ? <ChevronDown className="h-4 w-4 text-zinc-400" />
          : <ChevronRight className="h-4 w-4 text-zinc-400" />
        }
      </button>
      {open && (
        <div className="px-4 pb-5 flex flex-col gap-4">
          {children}
        </div>
      )}
    </div>
  );
}

// ── Header Style Cards ───────────────────────────────────────────────────────
function HeaderStyleCard({ value, selected, accent, onSelect }) {
  const labels = { classic: "Classic", minimal: "Minimal", bold: "Bold" };

  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={`rounded border overflow-hidden transition-all text-left ${
        selected ? "border-zinc-900 ring-1 ring-zinc-900" : "border-zinc-200 hover:border-zinc-300"
      }`}
    >
      <div className="h-12 bg-white">
        {value === "bold" && (
          <div className="h-full flex items-center px-2.5" style={{ backgroundColor: accent }}>
            <div className="flex-1">
              <div className="w-8 h-1 bg-white opacity-70 rounded mb-1" />
              <div className="w-5 h-0.5 bg-white opacity-40 rounded" />
            </div>
            <div className="w-7 h-1.5 bg-white opacity-80 rounded" />
          </div>
        )}
        {value === "minimal" && (
          <div className="h-full flex flex-col justify-end px-2.5 pb-1.5">
            <div className="w-12 h-1 bg-zinc-600 rounded mx-auto mb-1.5" />
            <div className="w-full h-px" style={{ backgroundColor: accent }} />
          </div>
        )}
        {value === "classic" && (
          <div className="h-full flex justify-between items-center px-2.5 border-b" style={{ borderColor: accent }}>
            <div>
              <div className="w-10 h-1 bg-zinc-700 rounded mb-0.5" />
              <div className="w-7 h-0.5 bg-zinc-300 rounded" />
            </div>
            <div className="w-7 h-1.5 rounded" style={{ backgroundColor: accent }} />
          </div>
        )}
      </div>
      <div className="px-2 py-1.5 flex items-center justify-between bg-white">
        <span className="text-xs font-medium text-zinc-600">{labels[value]}</span>
        {selected && <Check className="h-3 w-3 text-zinc-900" />}
      </div>
    </button>
  );
}

// ── Document Preview ─────────────────────────────────────────────────────────
function DocumentPreview({ template }) {
  const accent = template.accentColor || "#18181b";
  const tableHeaderBg = template.tableHeaderBg || "#18181b";
  const tableHeaderTextColor = template.tableHeaderTextColor || "#ffffff";
  const headerStyle = template.headerStyle || "classic";
  const docType = template.type || "invoice";
  const sample = SAMPLE[docType] || SAMPLE.invoice;

  const fontMap = {
    times: "Georgia, serif",
    courier: "'Courier New', monospace",
    helvetica: "Arial, sans-serif",
  };
  const fontFamily = fontMap[template.fontFamily] || fontMap.helvetica;
  const fontSize = template.fontSize || 10;
  const marginPx = Math.round((template.marginLeft || 0.55) * 60);

  const docLabel = docType === "proposal" ? "Proposal" : docType === "contract" ? "Contract" : "Invoice";

  function renderHeader() {
    const biz = template.businessName;
    const bizAddr = template.businessAddress;
    const bizEmail = template.businessEmail;
    const bizPhone = template.businessPhone;
    const showLogo = template.showLogo && template.logoUrl;

    if (headerStyle === "bold") {
      return (
        <div className="flex justify-between items-end py-5 mb-5" style={{ backgroundColor: accent, paddingLeft: marginPx, paddingRight: marginPx }}>
          <div className="flex-1">
            {showLogo && <Image src={template.logoUrl} alt="" width={0} height={0} sizes="100vw" className="w-7 object-contain mb-1.5" style={{ height: "auto" }} />}
            {biz && <div className="font-bold text-white" style={{ fontSize: fontSize + 4 }}>{biz}</div>}
            {bizAddr && <div className="text-white opacity-60" style={{ fontSize: fontSize - 1 }}>{bizAddr}</div>}
            <div className="font-bold text-white mt-3" style={{ fontSize: fontSize + 6 }}>{sample.title || `#${sample.number}`}</div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-white opacity-50 uppercase tracking-widest" style={{ fontSize: fontSize - 2 }}>{docLabel}</div>
          </div>
        </div>
      );
    }

    if (headerStyle === "minimal") {
      return (
        <div className="mb-5">
          <div className="flex flex-col items-center py-4" style={{ paddingLeft: marginPx, paddingRight: marginPx }}>
            {showLogo && <Image src={template.logoUrl} alt="" width={0} height={0} sizes="100vw" className="w-7 object-contain mb-1" style={{ height: "auto" }} />}
            {biz && <div className="font-bold text-zinc-900" style={{ fontSize: fontSize + 3 }}>{biz}</div>}
          </div>
          <div className="h-px mb-4" style={{ backgroundColor: "#e5e7eb" }} />
          <div className="flex justify-between items-start" style={{ paddingLeft: marginPx, paddingRight: marginPx }}>
            <div>
              <div className="uppercase tracking-widest text-zinc-400 mb-0.5" style={{ fontSize: fontSize - 3, letterSpacing: "0.12em" }}>{docLabel}</div>
              <div className="font-bold text-zinc-900" style={{ fontSize: fontSize + 5 }}>{sample.title || `#${sample.number}`}</div>
              {docType === "invoice" && <div className="text-zinc-400 mt-0.5" style={{ fontSize: fontSize - 1.5 }}>#{sample.number}</div>}
            </div>
            {docType === "invoice" && (
              <div className="text-right">
                <div className="text-zinc-400" style={{ fontSize: fontSize - 1.5 }}>Issued: {sample.date}</div>
                <div className="text-zinc-400" style={{ fontSize: fontSize - 1.5 }}>Due: {sample.due}</div>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Classic — title on the LEFT (below business name), doc label on the RIGHT
    return (
      <div className="flex justify-between items-start pb-4 mb-5 border-b" style={{ borderColor: "#e5e7eb", paddingLeft: marginPx, paddingRight: marginPx, paddingTop: "1.5rem" }}>
        <div>
          {showLogo && <Image src={template.logoUrl} alt="" width={0} height={0} sizes="100vw" className="w-7 object-contain mb-1.5" style={{ height: "auto" }} />}
          {biz && <div className="font-bold text-zinc-900" style={{ fontSize: fontSize + 4 }}>{biz}</div>}
          {bizAddr && <div className="text-zinc-400" style={{ fontSize: fontSize - 1.5 }}>{bizAddr}</div>}
          {bizEmail && <div className="text-zinc-400" style={{ fontSize: fontSize - 1.5 }}>{bizEmail}</div>}
          {bizPhone && <div className="text-zinc-400" style={{ fontSize: fontSize - 1.5 }}>{bizPhone}</div>}
          {/* Proposal/Contract title below business info */}
          {(docType === "proposal" || docType === "contract") && (
            <div className="mt-3">
              <div className="font-bold text-zinc-900" style={{ fontSize: fontSize + 5 }}>{sample.title}</div>
              <div className="text-zinc-400 mt-0.5" style={{ fontSize: fontSize - 1.5 }}>{sample.date || sample.validUntil ? `Valid until ${sample.validUntil}` : ""}</div>
            </div>
          )}
        </div>
        <div className="text-right shrink-0">
          <div className="uppercase tracking-widest mb-1" style={{ color: accent, fontSize: fontSize - 2, letterSpacing: "0.16em" }}>{docLabel}</div>
          {docType === "invoice" && (
            <>
              <div className="font-bold text-zinc-900" style={{ fontSize: fontSize + 4 }}>#{sample.number}</div>
              <div className="text-zinc-400 mt-1" style={{ fontSize: fontSize - 1.5 }}>Issued: {sample.date}</div>
              <div className="text-zinc-400" style={{ fontSize: fontSize - 1.5 }}>Due: {sample.due}</div>
            </>
          )}
        </div>
      </div>
    );
  }

  function renderTable(rows, { showItemNumbers = false, showQtyRate = false, showTaxCol = false } = {}) {
    const thStyle = { color: tableHeaderTextColor, fontSize: fontSize - 3, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" };
    return (
      <div className="overflow-hidden" style={{ marginBottom: 12 }}>
        <div className="flex px-3 py-2" style={{ backgroundColor: tableHeaderBg }}>
          {showItemNumbers && <div className="w-5" style={thStyle}>#</div>}
          <div className="flex-1" style={thStyle}>Description</div>
          {showQtyRate && <div className="w-8 text-right" style={thStyle}>Qty</div>}
          {showQtyRate && <div className="w-14 text-right" style={thStyle}>Rate</div>}
          {showTaxCol && <div className="w-10 text-right" style={thStyle}>Tax</div>}
          <div className="w-16 text-right" style={thStyle}>Amount</div>
        </div>
        {rows.map((item, i) => (
          <div key={i} className={`flex px-3 py-2 border-b border-zinc-100 ${i % 2 === 1 ? "bg-zinc-50" : ""}`}>
            {showItemNumbers && <div className="w-5 text-zinc-300" style={{ fontSize: fontSize - 1 }}>{i + 1}</div>}
            <div className="flex-1 text-zinc-700" style={{ fontSize: fontSize - 1 }}>{item.desc || item.description}</div>
            {showQtyRate && <div className="w-8 text-right text-zinc-500" style={{ fontSize: fontSize - 1 }}>{item.qty ?? 1}</div>}
            {showQtyRate && <div className="w-14 text-right text-zinc-500" style={{ fontSize: fontSize - 1 }}>{fmtMoney(item.rate || item.amt || 0)}</div>}
            {showTaxCol && <div className="w-10 text-right text-zinc-400" style={{ fontSize: fontSize - 1 }}>10%</div>}
            <div className="w-16 text-right font-semibold text-zinc-900" style={{ fontSize: fontSize - 1 }}>{fmtMoney(item.amt || item.amount || 0)}</div>
          </div>
        ))}
        <div className="flex px-3 py-2.5" style={{ backgroundColor: "#f9fafb" }}>
          <div className="flex-1 font-semibold text-zinc-700" style={{ fontSize: fontSize }}>Total</div>
          <div className="w-16 text-right font-bold" style={{ color: accent, fontSize: fontSize }}>{fmtMoney(sample.total)}</div>
        </div>
      </div>
    );
  }

  function renderInvoiceBody() {
    return (
      <div style={{ paddingLeft: marginPx, paddingRight: marginPx }}>
        <div className="flex justify-between mb-5">
          <div>
            <div className="text-zinc-400 uppercase tracking-widest mb-1" style={{ fontSize: fontSize - 3, letterSpacing: "0.12em" }}>Billed To</div>
            <div className="font-bold text-zinc-900" style={{ fontSize: fontSize + 1 }}>{sample.clientName}</div>
            <div className="text-zinc-400" style={{ fontSize: fontSize - 1.5 }}>{sample.clientEmail}</div>
          </div>
          <div className="text-right">
            <div className="text-zinc-400 uppercase tracking-widest mb-1" style={{ fontSize: fontSize - 3, letterSpacing: "0.12em" }}>Details</div>
            <div className="text-zinc-500" style={{ fontSize: fontSize - 1.5 }}>Issued: {sample.date}</div>
            <div className="text-zinc-500" style={{ fontSize: fontSize - 1.5 }}>Due: {sample.due}</div>
          </div>
        </div>
        {renderTable(sample.items.map(i => ({ desc: i.desc, qty: i.qty, rate: i.rate, amt: i.amt })), { showItemNumbers: !!template.showItemNumbers, showQtyRate: true, showTaxCol: !!template.showTaxColumn })}
        {template.showTerms && template.termsText && (
          <div className="mt-3 pt-3 border-t border-zinc-100">
            <div className="text-zinc-400 uppercase tracking-widest mb-1" style={{ fontSize: fontSize - 3 }}>Terms</div>
            <div className="text-zinc-400" style={{ fontSize: fontSize - 2 }}>{template.termsText}</div>
          </div>
        )}
      </div>
    );
  }

  function renderProposalBody() {
    return (
      <div style={{ paddingLeft: marginPx, paddingRight: marginPx }}>
        <div className="mb-5">
          <div className="text-zinc-400 uppercase tracking-widest mb-1" style={{ fontSize: fontSize - 3, letterSpacing: "0.12em" }}>Prepared For</div>
          <div className="font-bold text-zinc-900" style={{ fontSize: fontSize + 2 }}>{sample.clientName}</div>
        </div>

        <div className="mb-4">
          <div className="text-zinc-400 uppercase tracking-widest mb-2" style={{ fontSize: fontSize - 3, letterSpacing: "0.12em" }}>Scope of Work</div>
          <div className="flex flex-col gap-2">
            {sample.sections.slice(0, 3).map((s, i) => (
              <div key={i} className="border-b border-zinc-100 pb-2">
                <div className="font-semibold text-zinc-900" style={{ fontSize: fontSize - 0.5 }}>
                  <span style={{ color: accent, marginRight: 6, fontSize: fontSize - 2 }}>0{i + 1}</span>
                  {s.heading}
                </div>
                <div className="text-zinc-400 mt-0.5" style={{ fontSize: fontSize - 2 }}>{s.body}</div>
              </div>
            ))}
          </div>
        </div>

        {renderTable(sample.pricing.map(p => ({ desc: p.desc, amt: p.amt })), { showItemNumbers: !!template.showItemNumbers })}

        {template.showTerms && template.termsText && (
          <div className="mt-3 pt-3 border-t border-zinc-100">
            <div className="text-zinc-400 uppercase tracking-widest mb-1" style={{ fontSize: fontSize - 3 }}>Terms & Conditions</div>
            <div className="text-zinc-400" style={{ fontSize: fontSize - 2, lineHeight: 1.5 }}>{template.termsText}</div>
          </div>
        )}
        {template.showSignatureBlock !== false && (
          <div className="mt-4 pt-3 border-t border-zinc-200 flex gap-6">
            <div className="flex-1">
              <div className="text-zinc-400 uppercase tracking-widest mb-3" style={{ fontSize: fontSize - 3 }}>Service Provider</div>
              <div className="border-b border-zinc-300 mb-1" />
              {template.businessName && <div className="text-zinc-500" style={{ fontSize: fontSize - 2 }}>{template.businessName}</div>}
              <div className="text-zinc-400" style={{ fontSize: fontSize - 2 }}>Date: _______________</div>
            </div>
            <div className="flex-1">
              <div className="text-zinc-400 uppercase tracking-widest mb-3" style={{ fontSize: fontSize - 3 }}>Client</div>
              <div className="border-b border-zinc-300 mb-1" />
              <div className="text-zinc-500" style={{ fontSize: fontSize - 2 }}>{sample.clientName}</div>
              <div className="text-zinc-400" style={{ fontSize: fontSize - 2 }}>Date: _______________</div>
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderContractBody() {
    return (
      <div style={{ paddingLeft: marginPx, paddingRight: marginPx }}>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-zinc-50 rounded p-2.5">
            <div className="text-zinc-400 uppercase tracking-widest mb-1" style={{ fontSize: fontSize - 3 }}>Service Provider</div>
            <div className="font-semibold text-zinc-900" style={{ fontSize: fontSize }}>{template.businessName || "Your Business"}</div>
            {template.businessEmail && <div className="text-zinc-400" style={{ fontSize: fontSize - 2 }}>{template.businessEmail}</div>}
          </div>
          <div className="bg-zinc-50 rounded p-2.5">
            <div className="text-zinc-400 uppercase tracking-widest mb-1" style={{ fontSize: fontSize - 3 }}>Client</div>
            <div className="font-semibold text-zinc-900" style={{ fontSize: fontSize }}>{sample.clientName}</div>
            <div className="text-zinc-400" style={{ fontSize: fontSize - 2 }}>{sample.clientEmail}</div>
          </div>
        </div>
        <div className="border-t border-zinc-200 pt-3">
          {sample.clauses.slice(0, 3).map((clause, i) => (
            <div key={i} className="mb-3 pl-3 border-l-2" style={{ borderColor: accent }}>
              <div className="font-semibold text-zinc-900 mb-0.5" style={{ fontSize: fontSize }}>{clause.heading}</div>
              <div className="text-zinc-500" style={{ fontSize: fontSize - 1.5, lineHeight: 1.5 }}>{clause.body}</div>
            </div>
          ))}
        </div>
        {template.showTerms && template.termsText && (
          <div className="mt-3 pt-3 border-t border-zinc-100">
            <div className="text-zinc-400 uppercase tracking-widest mb-1" style={{ fontSize: fontSize - 3 }}>Terms & Conditions</div>
            <div className="text-zinc-400" style={{ fontSize: fontSize - 2, lineHeight: 1.5 }}>{template.termsText}</div>
          </div>
        )}
        {template.showSignatureBlock !== false && (
          <div className="mt-4 pt-3 border-t border-zinc-200 flex gap-6">
            <div className="flex-1">
              <div className="text-zinc-400 uppercase tracking-widest mb-3" style={{ fontSize: fontSize - 3 }}>Service Provider</div>
              <div className="border-b border-zinc-300 mb-1" />
              {template.businessName && <div className="text-zinc-500" style={{ fontSize: fontSize - 2 }}>{template.businessName}</div>}
              <div className="text-zinc-400" style={{ fontSize: fontSize - 2 }}>Date: _______________</div>
            </div>
            <div className="flex-1">
              <div className="text-zinc-400 uppercase tracking-widest mb-3" style={{ fontSize: fontSize - 3 }}>Client</div>
              <div className="border-b border-zinc-300 mb-1" />
              <div className="text-zinc-500" style={{ fontSize: fontSize - 2 }}>{sample.clientName}</div>
              <div className="text-zinc-400" style={{ fontSize: fontSize - 2 }}>Date: _______________</div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white shadow-xl" style={{ width: 595, minHeight: 842, fontFamily, fontSize: `${fontSize}px`, color: "#374151", position: "relative" }}>
      {template.showWatermark && (
        <div className="absolute pointer-events-none select-none font-bold text-zinc-900 opacity-[0.04]" style={{ top: "35%", left: "8%", fontSize: 88, transform: "rotate(-30deg)", zIndex: 0 }}>
          DRAFT
        </div>
      )}
      <div className="relative z-10">
        {renderHeader()}
        {docType === "invoice" && renderInvoiceBody()}
        {docType === "proposal" && renderProposalBody()}
        {docType === "contract" && renderContractBody()}
      </div>
      <div className="absolute bottom-4 left-0 right-0 border-t border-zinc-100 pt-2 flex justify-between" style={{ paddingLeft: marginPx, paddingRight: marginPx, fontSize: fontSize - 2 }}>
        <span className="text-zinc-400">{template.footerText || ""}</span>
        {template.showPageNumbers !== false && <span className="text-zinc-400">Page 1 of 1</span>}
      </div>
    </div>
  );
}


// ── Tab navigation for left panel ────────────────────────────────────────────
const EDITOR_TABS = [
  { key: "design", label: "Design" },
  { key: "content", label: "Content" },
  { key: "layout", label: "Layout" },
];

// ── Main Editor ──────────────────────────────────────────────────────────────
export default function TemplateEditor({ initialTemplate }) {
  const router = useRouter();
  const [template, setTemplate] = useState(initialTemplate);
  const [activeTab, setActiveTab] = useState("design");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function set(key, value) {
    setTemplate((prev) => ({ ...prev, [key]: value }));
  }

  function applyTheme(themeKey) {
    const theme = THEMES.find((t) => t.key === themeKey);
    if (!theme) return;
    setTemplate((prev) => ({
      ...prev,
      accentColor: theme.accent,
      tableHeaderBg: theme.accent,
      tableHeaderTextColor: "#ffffff",
    }));
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch(`/api/pdf-templates/${template.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(template),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  }

  const isProposal = template.type === "proposal";
  const isContract = template.type === "contract";
  const docTypeLabel = isProposal ? "Proposal" : isContract ? "Contract" : "Invoice";

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">

      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <div className="shrink-0 border-b border-zinc-200 bg-white px-4 h-14 flex items-center gap-4">

        {/* Back button + template info */}
        <button
          onClick={() => router.push("/settings/pdf-templates")}
          className="inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
        >
          <ChevronRight className="h-4 w-4 rotate-180" />
          <span className="hidden sm:inline">Templates</span>
        </button>

        <div className="h-5 w-px bg-zinc-200" />

        <div className="flex-1 min-w-0 flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-md bg-zinc-100 flex items-center justify-center">
            <LayoutTemplate className="h-3.5 w-3.5 text-zinc-500" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-zinc-900 truncate">{template.name}</div>
            <div className="text-xs text-zinc-400">{docTypeLabel} template</div>
          </div>
        </div>

        {/* Theme swatches */}
        <div className="hidden md:flex items-center gap-1.5 bg-zinc-50 rounded-lg px-3 py-1.5">
          <span className="text-xs text-zinc-400 font-medium mr-1">Theme</span>
          {THEMES.map((theme) => {
            const isActive = template.accentColor === theme.accent;
            return (
              <button
                key={theme.key}
                type="button"
                title={theme.label}
                onClick={() => applyTheme(theme.key)}
                className={`h-5 w-5 rounded-full transition-all hover:scale-110 ${
                  isActive ? "ring-2 ring-zinc-900 ring-offset-2" : "ring-1 ring-zinc-200"
                }`}
                style={{ backgroundColor: theme.swatch }}
              />
            );
          })}
        </div>

        <div className="h-5 w-px bg-zinc-200" />

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-all disabled:opacity-60 ${
            saved
              ? "bg-emerald-600 text-white"
              : "bg-zinc-900 text-white hover:bg-zinc-800 active:scale-[0.97]"
          }`}
        >
          {saved
            ? <><Check className="h-4 w-4" />Saved</>
            : saving
              ? <><RefreshCw className="h-4 w-4 animate-spin" />Saving…</>
              : <><Save className="h-4 w-4" />Save changes</>
          }
        </button>
      </div>

      {/* ── Body: controls + preview ────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left panel: settings ──────────────────────────────────────── */}
        <div className="w-80 shrink-0 border-r border-zinc-200 bg-white flex flex-col overflow-hidden">

          {/* Tab navigation */}
          <div className="shrink-0 border-b border-zinc-200 px-2 pt-2">
            <div className="flex gap-0.5">
              {EDITOR_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 rounded-t-lg px-3 py-2 text-xs font-semibold transition-colors ${
                    activeTab === tab.key
                      ? "bg-zinc-50 text-zinc-900 border-b-2 border-zinc-900"
                      : "text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto">

            {/* ── Design tab ──────────────────────────────────────────── */}
            {activeTab === "design" && (
              <div className="flex flex-col">
                {/* Header Style */}
                <div className="px-4 py-4 border-b border-zinc-100">
                  <Field label="Header Style">
                    <div className="grid grid-cols-3 gap-2">
                      {["classic", "minimal", "bold"].map((s) => (
                        <HeaderStyleCard
                          key={s}
                          value={s}
                          selected={template.headerStyle === s}
                          accent={template.accentColor || "#18181b"}
                          onSelect={(v) => set("headerStyle", v)}
                        />
                      ))}
                    </div>
                  </Field>
                </div>

                {/* Colours */}
                <div className="px-4 py-4 border-b border-zinc-100 flex flex-col gap-4">
                  <label className="text-xs font-semibold text-zinc-800 uppercase tracking-wide">Colours</label>
                  <ColorInput label="Accent Colour" value={template.accentColor || "#18181b"} onChange={(v) => set("accentColor", v)} />
                  <ColorInput label="Table Header Background" value={template.tableHeaderBg || "#18181b"} onChange={(v) => set("tableHeaderBg", v)} />
                  <ColorInput label="Table Header Text" value={template.tableHeaderTextColor || "#ffffff"} onChange={(v) => set("tableHeaderTextColor", v)} />
                </div>

                {/* Font */}
                <div className="px-4 py-4 flex flex-col gap-4">
                  <label className="text-xs font-semibold text-zinc-800 uppercase tracking-wide">Typography</label>
                  <Field label="Font Family">
                    <select
                      value={template.fontFamily || "helvetica"}
                      onChange={(e) => set("fontFamily", e.target.value)}
                      className={selectClassName}
                    >
                      <option value="helvetica">Helvetica (Sans-serif)</option>
                      <option value="times">Times New Roman (Serif)</option>
                      <option value="courier">Courier (Monospace)</option>
                    </select>
                  </Field>
                  <Field label="Base Font Size">
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="8"
                        max="14"
                        step="1"
                        value={template.fontSize || 10}
                        onChange={(e) => set("fontSize", parseInt(e.target.value))}
                        className="flex-1 accent-zinc-900"
                      />
                      <span className="text-sm font-semibold text-zinc-700 tabular-nums w-8 text-right">{template.fontSize || 10}pt</span>
                    </div>
                  </Field>
                </div>
              </div>
            )}

            {/* ── Content tab ─────────────────────────────────────────── */}
            {activeTab === "content" && (
              <div className="flex flex-col">
                {/* Business details */}
                <div className="px-4 py-4 border-b border-zinc-100 flex flex-col gap-4">
                  <label className="text-xs font-semibold text-zinc-800 uppercase tracking-wide">Business Details</label>
                  <Toggle label="Show Logo" checked={!!template.showLogo} onChange={(v) => set("showLogo", v)} />
                  {template.showLogo && (
                    <TextInput label="Logo URL" value={template.logoUrl} onChange={(v) => set("logoUrl", v)} placeholder="https://example.com/logo.png" />
                  )}
                  <TextInput label="Business Name" value={template.businessName} onChange={(v) => set("businessName", v)} placeholder="Acme Studio" />
                  <TextAreaInput label="Business Address" value={template.businessAddress} onChange={(v) => set("businessAddress", v)} placeholder="123 Main St, London, UK" rows={2} />
                  <TextInput label="Business Email" value={template.businessEmail} onChange={(v) => set("businessEmail", v)} placeholder="hello@yourbusiness.com" />
                  <TextInput label="Business Phone" value={template.businessPhone} onChange={(v) => set("businessPhone", v)} placeholder="+1 555 000 0000" />
                </div>

                {/* Footer */}
                <div className="px-4 py-4 border-b border-zinc-100 flex flex-col gap-4">
                  <label className="text-xs font-semibold text-zinc-800 uppercase tracking-wide">Footer</label>
                  <TextInput label="Footer Text" value={template.footerText} onChange={(v) => set("footerText", v)} placeholder="Thank you for your business" />
                  <Toggle label="Show Page Numbers" checked={template.showPageNumbers !== false} onChange={(v) => set("showPageNumbers", v)} />
                </div>

                {/* Terms & extras */}
                <div className="px-4 py-4 flex flex-col gap-4">
                  <label className="text-xs font-semibold text-zinc-800 uppercase tracking-wide">Extras</label>
                  <Toggle label="Show Watermark (DRAFT)" checked={!!template.showWatermark} onChange={(v) => set("showWatermark", v)} />
                  <Toggle label="Show Terms & Conditions" checked={!!template.showTerms} onChange={(v) => set("showTerms", v)} />
                  {template.showTerms && (
                    <TextAreaInput
                      label="Terms Text"
                      value={template.termsText}
                      onChange={(v) => set("termsText", v)}
                      placeholder="Payment is due within 14 days of invoice date..."
                      rows={4}
                    />
                  )}
                  {(isProposal || isContract) && (
                    <Toggle
                      label="Show Signature Block"
                      checked={template.showSignatureBlock !== false}
                      onChange={(v) => set("showSignatureBlock", v)}
                    />
                  )}
                </div>
              </div>
            )}

            {/* ── Layout tab ──────────────────────────────────────────── */}
            {activeTab === "layout" && (
              <div className="flex flex-col">
                {/* Template name */}
                <div className="px-4 py-4 border-b border-zinc-100 flex flex-col gap-4">
                  <label className="text-xs font-semibold text-zinc-800 uppercase tracking-wide">Template</label>
                  <TextInput label="Template Name" value={template.name} onChange={(v) => set("name", v)} />
                </div>

                {/* Page setup */}
                <div className="px-4 py-4 border-b border-zinc-100 flex flex-col gap-4">
                  <label className="text-xs font-semibold text-zinc-800 uppercase tracking-wide">Page Setup</label>
                  <Field label="Paper Size">
                    <SegmentedControl
                      options={[{ value: "A5", label: "A5" }, { value: "A4", label: "A4" }, { value: "Letter", label: "Letter" }]}
                      value={template.paperSize || "A4"}
                      onChange={(v) => set("paperSize", v)}
                    />
                  </Field>
                  <Field label="Orientation">
                    <SegmentedControl
                      options={[{ value: "portrait", label: "Portrait" }, { value: "landscape", label: "Landscape" }]}
                      value={template.orientation || "portrait"}
                      onChange={(v) => set("orientation", v)}
                    />
                  </Field>
                </div>

                {/* Margins */}
                <div className="px-4 py-4 border-b border-zinc-100 flex flex-col gap-4">
                  <label className="text-xs font-semibold text-zinc-800 uppercase tracking-wide">Margins (inches)</label>
                  <div className="grid grid-cols-2 gap-2">
                    {["marginTop", "marginBottom", "marginLeft", "marginRight"].map((key) => (
                      <div key={key} className="flex flex-col gap-1">
                        <label className="text-xs text-zinc-400 capitalize">{key.replace("margin", "")}</label>
                        <input
                          type="number"
                          step="0.05"
                          min="0"
                          max="2"
                          value={template[key] ?? 0.4}
                          onChange={(e) => set(key, parseFloat(e.target.value) || 0)}
                          className="h-9 rounded-lg border border-zinc-200 px-2.5 text-sm text-zinc-900 outline-none focus:border-zinc-400 bg-white tabular-nums"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Table options */}
                <div className="px-4 py-4 flex flex-col gap-4">
                  <label className="text-xs font-semibold text-zinc-800 uppercase tracking-wide">Table</label>
                  <Toggle label="Show Item Numbers" checked={!!template.showItemNumbers} onChange={(v) => set("showItemNumbers", v)} />
                  <Toggle label="Show Tax Column" checked={!!template.showTaxColumn} onChange={(v) => set("showTaxColumn", v)} />
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ── Right panel: live preview ────────────────────────────────── */}
        <div className="flex-1 overflow-auto bg-zinc-100">
          <div className="flex justify-center py-10 px-6 min-h-full">
            {template.type === "proposal" ? (
              <div className="rounded-lg shadow-xl ring-1 ring-zinc-200" style={{ flexShrink: 0 }}>
                <ProposalPreview proposal={SAMPLE.proposal} template={template} noScale />
              </div>
            ) : template.type === "contract" ? (
              <div className="rounded-lg shadow-xl ring-1 ring-zinc-200" style={{ flexShrink: 0 }}>
                <ContractPreview contract={SAMPLE.contract} template={template} noScale />
              </div>
            ) : (
              <div className="rounded-lg shadow-xl ring-1 ring-zinc-200" style={{ flexShrink: 0 }}>
                <DocumentPreview template={template} />
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
