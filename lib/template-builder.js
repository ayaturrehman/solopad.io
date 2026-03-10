import { nanoid } from "nanoid";

// ─── Themes ──────────────────────────────────────────────────────────────────

export const TEMPLATE_THEMES = {
  graphite: { id: "graphite", name: "Graphite", accent: "#111827", accentLight: "#F3F4F6", accentText: "#fff", preview: ["#111827", "#F3F4F6", "#6B7280"] },
  coral:    { id: "coral",    name: "Coral",    accent: "#E8533A", accentLight: "#FFF3F0", accentText: "#fff", preview: ["#E8533A", "#FFF3F0", "#777777"] },
  ocean:    { id: "ocean",    name: "Ocean",    accent: "#0EA5E9", accentLight: "#F0F9FF", accentText: "#fff", preview: ["#0EA5E9", "#F0F9FF", "#64748B"] },
  violet:   { id: "violet",   name: "Violet",   accent: "#7C3AED", accentLight: "#F5F3FF", accentText: "#fff", preview: ["#7C3AED", "#F5F3FF", "#6B7280"] },
  amber:    { id: "amber",    name: "Amber",    accent: "#D97706", accentLight: "#FFFBEB", accentText: "#fff", preview: ["#D97706", "#FFFBEB", "#78716C"] },
  forest:   { id: "forest",   name: "Forest",   accent: "#059669", accentLight: "#ECFDF5", accentText: "#fff", preview: ["#059669", "#ECFDF5", "#6B7280"] },
};

// ─── Merge / Smart Fields ─────────────────────────────────────────────────────

export const MERGE_FIELDS = [
  { tag: "{{client_name}}",      label: "Client Name" },
  { tag: "{{client_email}}",     label: "Client Email" },
  { tag: "{{project_title}}",    label: "Project Title" },
  { tag: "{{freelancer_name}}", label: "Your Name" },
  { tag: "{{date}}",             label: "Today's Date" },
  { tag: "{{due_date}}",         label: "Due Date" },
  { tag: "{{total_amount}}",     label: "Total Amount" },
  { tag: "{{company_name}}",     label: "Company Name" },
];

// ─── Block Definitions ────────────────────────────────────────────────────────

export const BLOCK_DEFS = {
  cover: {
    type: "cover", label: "Cover / Hero", icon: "🖼️",
    description: "Full-width hero with title, subtitle, and branding",
    defaultData: {
      title: "Document Title",
      subtitle: "Prepared exclusively for {{client_name}}",
      background: "#111827",
      textColor: "#ffffff",
      align: "center",
      showDate: true,
      logoText: "",
      minHeight: 300,
    },
  },
  richText: {
    type: "richText", label: "Text", icon: "📝",
    description: "Headings, paragraphs, and formatted text",
    defaultData: {
      html: "<h2>Section Heading</h2><p>Add your content here. Write paragraphs, format text, and express your ideas clearly.</p>",
      align: "left",
      padding: "md",
    },
  },
  callout: {
    type: "callout", label: "Callout Box", icon: "💡",
    description: "Highlighted box to draw attention to key info",
    defaultData: {
      icon: "💡",
      title: "Important Note",
      text: "Add important information or highlight key details your client should notice.",
      background: "#FFFBEB",
      borderColor: "#D97706",
      textColor: "#111827",
    },
  },
  image: {
    type: "image", label: "Image", icon: "🖼",
    description: "Display an image with optional caption",
    defaultData: { src: "", caption: "", alt: "", align: "center", width: "100%", rounded: true },
  },
  video: {
    type: "video", label: "Video Embed", icon: "▶️",
    description: "Embed a YouTube or Vimeo video",
    defaultData: { url: "", caption: "" },
  },
  divider: {
    type: "divider", label: "Divider", icon: "➖",
    description: "Horizontal line to separate sections",
    defaultData: { style: "solid", color: "#E5E7EB", spacingTop: 24, spacingBottom: 24 },
  },
  spacer: {
    type: "spacer", label: "Spacer", icon: "⬜",
    description: "Add empty vertical space",
    defaultData: { height: 48 },
  },
  button: {
    type: "button", label: "Button / CTA", icon: "🔘",
    description: "Call-to-action button",
    defaultData: { text: "Accept Proposal", url: "", align: "center", size: "md", variant: "solid" },
  },
  columns: {
    type: "columns", label: "Two Columns", icon: "▦",
    description: "Two side-by-side text columns",
    defaultData: {
      gap: "md",
      columns: [
        { id: "col-a", title: "Column One", content: "Add content for the left column here. You can describe services, list benefits, or add any relevant information." },
        { id: "col-b", title: "Column Two", content: "Add content for the right column here. This is great for comparisons, paired information, or two distinct topics." },
      ],
    },
  },
  table: {
    type: "table", label: "Table", icon: "📊",
    description: "Structured data table",
    defaultData: {
      caption: "",
      headers: ["Item", "Description", "Value"],
      rows: [
        ["Row 1", "Description for row 1", "$0"],
        ["Row 2", "Description for row 2", "$0"],
        ["Row 3", "Description for row 3", "$0"],
      ],
    },
  },
  pricing: {
    type: "pricing", label: "Pricing Packages", icon: "💳",
    description: "Tiered pricing cards with features",
    defaultData: {
      title: "Choose Your Package",
      subtitle: "All packages include dedicated support and revisions",
      packages: [
        {
          id: "pkg-a",
          name: "Starter",
          price: "$500",
          period: "one-time",
          description: "Perfect for small projects and one-off work",
          features: ["Up to 5 pages", "2 revision rounds", "Source files", "7-day delivery"],
          highlighted: false,
          cta: "Get Started",
        },
        {
          id: "pkg-b",
          name: "Professional",
          price: "$1,200",
          period: "one-time",
          description: "Most popular for growing businesses",
          features: ["Up to 15 pages", "Unlimited revisions", "Priority support", "Source files", "14-day delivery"],
          highlighted: true,
          cta: "Most Popular",
        },
        {
          id: "pkg-c",
          name: "Enterprise",
          price: "Custom",
          period: "",
          description: "Tailored for large-scale requirements",
          features: ["Unlimited pages", "Dedicated manager", "Custom integrations", "SLA guarantee", "Rush delivery"],
          highlighted: false,
          cta: "Contact Us",
        },
      ],
    },
  },
  lineItems: {
    type: "lineItems", label: "Invoice / Line Items", icon: "🧾",
    description: "Itemized list with subtotal, tax, and total",
    defaultData: {
      title: "Project Investment",
      items: [
        { id: "li-a", description: "Web Design", qty: 1, rate: 2000, total: 2000 },
        { id: "li-b", description: "Development (hourly)", qty: 20, rate: 75, total: 1500 },
        { id: "li-c", description: "SEO Setup", qty: 1, rate: 300, total: 300 },
      ],
      taxRate: 0,
      discount: 0,
      discountType: "fixed",
      notes: "Payment due within 14 days. Bank transfer or card accepted.",
      currency: "USD",
    },
  },
  timeline: {
    type: "timeline", label: "Timeline / Milestones", icon: "📅",
    description: "Visual project phases and deliverables",
    defaultData: {
      title: "Project Timeline",
      milestones: [
        { id: "ms-a", phase: "Phase 1", title: "Discovery & Strategy",   date: "Week 1",   description: "Kickoff call, research, and planning." },
        { id: "ms-b", phase: "Phase 2", title: "Design & Concepts",      date: "Week 2–3", description: "Initial concepts and client feedback rounds." },
        { id: "ms-c", phase: "Phase 3", title: "Development & Revisions",date: "Week 4–6", description: "Build, test, and refine the final deliverable." },
        { id: "ms-d", phase: "Phase 4", title: "Launch & Handover",      date: "Week 7",   description: "Final delivery, files, and training." },
      ],
    },
  },
  signature: {
    type: "signature", label: "Signature Block", icon: "✍️",
    description: "E-signature fields for client agreement",
    defaultData: {
      title: "Agreement & Signature",
      agreementText: "By signing below, you confirm you have read and agree to the terms and conditions outlined in this document, and you authorize work to commence as described.",
      fields: [
        { id: "sf-a", label: "Full Name",  type: "text",      required: true  },
        { id: "sf-b", label: "Signature",  type: "signature", required: true  },
        { id: "sf-c", label: "Date",       type: "date",      required: true  },
        { id: "sf-d", label: "Job Title",  type: "text",      required: false },
      ],
    },
  },
  form: {
    type: "form", label: "Form / Questionnaire", icon: "📋",
    description: "Collect information from your client",
    defaultData: {
      title: "Client Information",
      description: "Please fill out the form below. Your answers help us deliver the best results.",
      submitLabel: "Submit",
      fields: [
        { id: "ff-a", type: "text",     label: "Full Name",              placeholder: "Jane Smith",                     required: true,  width: "full" },
        { id: "ff-b", type: "email",    label: "Email Address",          placeholder: "jane@example.com",               required: true,  width: "half" },
        { id: "ff-c", type: "phone",    label: "Phone Number",           placeholder: "+1 (555) 000-0000",              required: false, width: "half" },
        { id: "ff-d", type: "textarea", label: "Tell us about your project", placeholder: "Describe your goals...",     required: false, rows: 4, width: "full" },
        { id: "ff-e", type: "dropdown", label: "How did you find us?",   options: ["Google", "Social Media", "Referral", "Other"], required: false, width: "full" },
        { id: "ff-f", type: "radio",    label: "Service Interested In",  options: ["Branding", "Web Design", "Marketing", "Photography"], required: false, width: "full" },
        { id: "ff-g", type: "date",     label: "Preferred Start Date",   required: false, width: "half" },
        { id: "ff-h", type: "rating",   label: "How urgent is this project?", required: false, width: "half" },
        { id: "ff-i", type: "checkbox", label: "I agree to the terms and conditions", required: true, width: "full" },
      ],
    },
  },
};

// ─── Form Field Types ─────────────────────────────────────────────────────────

export const FORM_FIELD_TYPES = [
  { type: "text",     label: "Short Text",       icon: "Aa" },
  { type: "textarea", label: "Long Text",         icon: "¶"  },
  { type: "email",    label: "Email",             icon: "@"  },
  { type: "phone",    label: "Phone",             icon: "☎"  },
  { type: "number",   label: "Number",            icon: "#"  },
  { type: "date",     label: "Date",              icon: "📅" },
  { type: "dropdown", label: "Dropdown",          icon: "▾" },
  { type: "radio",    label: "Multiple Choice",   icon: "◉" },
  { type: "checkbox", label: "Checkbox",          icon: "☑" },
  { type: "rating",   label: "Star Rating",       icon: "★" },
  { type: "scale",    label: "Scale 1–10",        icon: "〰" },
  { type: "file",     label: "File Upload",       icon: "📎" },
];

export const FORM_FIELD_DEFAULTS = {
  text:     { label: "Short Answer",    placeholder: "Type here...",           required: false, width: "full" },
  textarea: { label: "Long Answer",     placeholder: "Type here...",           required: false, rows: 3, width: "full" },
  email:    { label: "Email Address",   placeholder: "you@example.com",        required: false, width: "half" },
  phone:    { label: "Phone Number",    placeholder: "+1 (555) 000-0000",      required: false, width: "half" },
  number:   { label: "Number",          placeholder: "0",                      required: false, width: "half" },
  date:     { label: "Date",                                                   required: false, width: "half" },
  dropdown: { label: "Select One",      options: ["Option A", "Option B", "Option C"], required: false, width: "full" },
  radio:    { label: "Choose One",      options: ["Option A", "Option B", "Option C"], required: false, width: "full" },
  checkbox: { label: "I agree",                                                required: false, width: "full" },
  rating:   { label: "Rate this",                                              required: false, width: "full" },
  scale:    { label: "Scale (1–10)",    min: 1, max: 10,                       required: false, width: "full" },
  file:     { label: "Upload File",                                            required: false, width: "full" },
};

// ─── Block Categories ─────────────────────────────────────────────────────────

export const BLOCK_CATEGORIES = [
  { id: "layout",   label: "Layout",   blocks: ["cover", "divider", "spacer", "columns"] },
  { id: "content",  label: "Content",  blocks: ["richText", "callout", "image", "video", "button", "table"] },
  { id: "business", label: "Business", blocks: ["pricing", "lineItems", "timeline", "signature"] },
  { id: "forms",    label: "Forms",    blocks: ["form"] },
];

// ─── Factory Functions ────────────────────────────────────────────────────────

export function createBlock(type) {
  const def = BLOCK_DEFS[type];
  if (!def) throw new Error(`Unknown block type: ${type}`);
  return { id: nanoid(8), type, data: JSON.parse(JSON.stringify(def.defaultData)) };
}

export function createPage(title = "Page") {
  return { id: nanoid(8), title, blocks: [] };
}

export function createFormField(type) {
  const defaults = FORM_FIELD_DEFAULTS[type] || {};
  return { id: nanoid(6), type, ...defaults };
}

export function calcLineItemsTotal(data) {
  const subtotal = (data.items || []).reduce((s, i) => s + i.qty * i.rate, 0);
  const discountAmt = data.discount > 0
    ? (data.discountType === "percent" ? subtotal * (data.discount / 100) : data.discount)
    : 0;
  const taxable = subtotal - discountAmt;
  const taxAmt = data.taxRate > 0 ? taxable * (data.taxRate / 100) : 0;
  return { subtotal, discountAmt, taxAmt, total: taxable + taxAmt };
}

export function createDefaultDocument(type = "proposal") {
  const shared = (html) => ({ id: nanoid(8), type: "richText", data: { ...BLOCK_DEFS.richText.defaultData, html } });
  const cover = { id: nanoid(8), type: "cover", data: { ...BLOCK_DEFS.cover.defaultData, title: `${type.charAt(0).toUpperCase() + type.slice(1)} Title` } };

  const pages = {
    proposal: [
      { id: nanoid(8), title: "Overview",        blocks: [cover, shared("<h2>Introduction</h2><p>Thank you for considering us. This proposal outlines the scope, timeline, and investment for your project.</p>"), { id: nanoid(8), type: "callout", data: BLOCK_DEFS.callout.defaultData }] },
      { id: nanoid(8), title: "Scope & Pricing", blocks: [shared("<h2>Scope of Work</h2><p>The following deliverables are included in this proposal.</p>"), { id: nanoid(8), type: "pricing", data: BLOCK_DEFS.pricing.defaultData }, { id: nanoid(8), type: "timeline", data: BLOCK_DEFS.timeline.defaultData }] },
      { id: nanoid(8), title: "Agreement",       blocks: [shared("<h2>Terms & Conditions</h2><p>1. A 50% deposit is required to begin work.<br>2. Remaining balance is due upon completion.<br>3. Additional revisions billed at hourly rate.</p>"), { id: nanoid(8), type: "signature", data: BLOCK_DEFS.signature.defaultData }] },
    ],
    contract: [
      { id: nanoid(8), title: "Agreement",  blocks: [cover, shared("<h2>Service Agreement</h2><p>This agreement is entered into between <strong>{{freelancer_name}}</strong> (\"Service Provider\") and <strong>{{client_name}}</strong> (\"Client\").</p>"), { id: nanoid(8), type: "lineItems", data: BLOCK_DEFS.lineItems.defaultData }] },
      { id: nanoid(8), title: "Terms",      blocks: [shared("<h2>Payment Terms</h2><p>Payment is due within 14 days of invoice. Late payments incur a 1.5% monthly fee.</p><h2>Intellectual Property</h2><p>All work remains property of the Service Provider until payment is received in full.</p><h2>Termination</h2><p>Either party may terminate with 14 days written notice.</p>"), { id: nanoid(8), type: "signature", data: BLOCK_DEFS.signature.defaultData }] },
    ],
    questionnaire: [
      { id: nanoid(8), title: "Questionnaire", blocks: [cover, shared("<h2>Welcome!</h2><p>Please take a few minutes to fill out this questionnaire. Your answers help us deliver the best results.</p>"), { id: nanoid(8), type: "form", data: BLOCK_DEFS.form.defaultData }] },
    ],
    invoice: [
      { id: nanoid(8), title: "Invoice", blocks: [cover, { id: nanoid(8), type: "lineItems", data: BLOCK_DEFS.lineItems.defaultData }, shared("<h2>Payment Instructions</h2><p>Please make payment via bank transfer or card. Contact us with any questions.</p>")] },
    ],
  };

  return { version: 2, type, theme: "coral", pages: pages[type] || pages.proposal };
}

// ─── Legacy compatibility exports ────────────────────────────────────────────

export function parseTemplateContent(content) {
  return parseDocumentContent(content);
}

export function isBuilderDocument(content) {
  const parsed = parseDocumentContent(content);
  return !!(parsed?.version && parsed?.pages);
}

export function createBuilderDocumentFromTemplate(template) {
  if (!template) return createDefaultDocument("proposal");
  const parsed = parseDocumentContent(template.content);
  if (parsed?.version && parsed?.pages) return parsed;
  return createDefaultDocument(template.type || "proposal");
}

export function parseDocumentContent(content) {
  if (!content) return null;
  try {
    const parsed = typeof content === "string" ? JSON.parse(content) : content;
    if (parsed?.version && parsed?.pages) return parsed;
    return null;
  } catch { return null; }
}

export function serializeDocument(doc) {
  return JSON.stringify(doc);
}

// ─── Template Gallery ─────────────────────────────────────────────────────────

export const TEMPLATE_GALLERY = [
  { id: "gallery-proposal-1",       name: "Modern Business Proposal",        type: "proposal",       description: "Professional proposal with pricing, timeline, and signature.", tags: ["business", "clean"],    content: null },
  { id: "gallery-proposal-2",       name: "Creative Agency Proposal",        type: "proposal",       description: "Showcase your creative work with a branded proposal.",          tags: ["creative", "agency"],   content: null },
  { id: "gallery-contract-1",       name: "Freelance Service Agreement",     type: "contract",       description: "Standard contract covering payment, IP, and termination.",      tags: ["standard", "freelance"],content: null },
  { id: "gallery-contract-2",       name: "Web Design Contract",             type: "contract",       description: "Specialized contract for web design projects.",                  tags: ["web", "design"],        content: null },
  { id: "gallery-questionnaire-1",  name: "Client Onboarding Questionnaire", type: "questionnaire",  description: "Gather essential info before starting a project.",               tags: ["onboarding"],           content: null },
  { id: "gallery-questionnaire-2",  name: "Brand Discovery Form",            type: "questionnaire",  description: "Deep-dive questions to understand your client's brand.",         tags: ["branding", "discovery"],content: null },
  { id: "gallery-invoice-1",        name: "Standard Invoice",                type: "invoice",        description: "Clean invoice with line items, tax, and payment terms.",         tags: ["standard"],             content: null },
  { id: "gallery-invoice-2",        name: "Project Invoice",                 type: "invoice",        description: "Detailed project invoice with milestone breakdown.",             tags: ["project"],              content: null },
];
