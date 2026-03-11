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

function htmlToText(html = "") {
  return String(html)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/h[1-6]>/gi, "\n")
    .replace(/<li>/gi, "• ")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function blockToClause(block, index) {
  if (block.type === "richText") {
    const text = htmlToText(block.data?.html || "");
    if (!text) return null;
    return {
      heading: text.split("\n")[0]?.slice(0, 80) || `Clause ${index + 1}`,
      body: text,
    };
  }

  if (block.type === "callout") {
    const title = block.data?.title || `Callout ${index + 1}`;
    const text = block.data?.text || "";
    return {
      heading: title,
      body: text,
    };
  }

  if (block.type === "lineItems") {
    const items = block.data?.items || [];
    const lines = items.map((item) => {
      const qty = item.qty ?? 1;
      const rate = item.rate ?? 0;
      const total = item.total ?? qty * rate;
      return `${item.description || "Line item"} — Qty ${qty}, Rate ${rate}, Total ${total}`;
    });
    const notes = block.data?.notes ? `\n\n${block.data.notes}` : "";
    return {
      heading: block.data?.title || "Commercial Terms",
      body: lines.join("\n") + notes,
    };
  }

  if (block.type === "signature") {
    const fields = (block.data?.fields || []).map((field) => field.label).join(", ");
    return {
      heading: block.data?.title || "Signatures",
      body: `${block.data?.agreementText || ""}${fields ? `\n\nRequired fields: ${fields}` : ""}`.trim(),
    };
  }

  return null;
}

export function createContractDraftFromTemplate(template) {
  const parsed = parseDocumentContent(template?.content);
  if (!parsed?.pages?.length) {
    try {
      const legacy = typeof template?.content === "string" ? JSON.parse(template.content) : template?.content;
      if (Array.isArray(legacy?.clauses) && legacy.clauses.length) {
        return {
          title: legacy.title || template?.name || "New Contract",
          clauses: legacy.clauses,
        };
      }
    } catch {}
    return null;
  }

  const coverBlock = parsed.pages
    .flatMap((page) => page.blocks || [])
    .find((block) => block.type === "cover");

  const clauses = parsed.pages.flatMap((page) =>
    (page.blocks || [])
      .map((block, index) => blockToClause(block, index))
      .filter(Boolean)
  );

  return {
    title: coverBlock?.data?.title || template?.name || "New Contract",
    clauses: clauses.length
      ? clauses
      : [{ heading: "Agreement", body: "Add your contract terms here." }],
  };
}

// ─── Template Gallery ─────────────────────────────────────────────────────────

function gid() { return Math.random().toString(36).slice(2, 10); }

const GALLERY_CONTENT = {
  "gallery-proposal-1": JSON.stringify({
    version: 2, type: "proposal", theme: "graphite",
    pages: [
      {
        id: gid(), title: "Overview",
        blocks: [
          { id: gid(), type: "cover", data: { title: "Website Redesign Proposal", subtitle: "Prepared exclusively for {{client_name}}", background: "#111827", textColor: "#ffffff", align: "center", showDate: true, logoText: "{{freelancer_name}}", minHeight: 280 } },
          { id: gid(), type: "richText", data: { html: "<h2>Introduction</h2><p>Thank you for considering us for your upcoming project. We've taken time to understand your goals and have put together a proposal that outlines our approach, deliverables, timeline, and investment.</p><p>Our team brings <strong>5+ years of experience</strong> delivering clean, conversion-focused digital experiences for brands like yours.</p>", align: "left", padding: "md" } },
          { id: gid(), type: "callout", data: { icon: "🎯", title: "Our Commitment", text: "We guarantee 100% satisfaction on every deliverable. If you're not happy with the initial concepts, we'll revise at no extra charge.", background: "#F0F9FF", borderColor: "#0EA5E9", textColor: "#111827" } },
          { id: gid(), type: "columns", data: { gap: "md", columns: [{ id: "col-a", title: "What We Do Best", content: "Brand identity, web design, UX strategy, and digital marketing that converts visitors into customers." }, { id: "col-b", title: "Why Choose Us", content: "Transparent pricing, clear communication, on-time delivery, and a genuine passion for your success." }] } },
        ],
      },
      {
        id: gid(), title: "Scope & Pricing",
        blocks: [
          { id: gid(), type: "richText", data: { html: "<h2>Scope of Work</h2><p>The following deliverables are included in this proposal. All work will be completed by our in-house team with no outsourcing.</p>", align: "left", padding: "md" } },
          { id: gid(), type: "table", data: { caption: "Deliverables Overview", headers: ["Deliverable", "Description", "Est. Hours"], rows: [["Discovery Workshop", "1-hour kickoff, competitive audit, user personas", "8 hrs"], ["UX Wireframes", "Low-fidelity wireframes for all key pages", "12 hrs"], ["Visual Design", "High-fidelity mockups in Figma, 2 revision rounds", "20 hrs"], ["Development", "Responsive build in Next.js, CMS integration", "40 hrs"], ["QA & Launch", "Cross-browser testing, performance optimization", "8 hrs"]] } },
          { id: gid(), type: "pricing", data: { title: "Investment Options", subtitle: "All packages include 30-day post-launch support and source files", packages: [{ id: "pkg-a", name: "Essential", price: "$2,500", period: "one-time", description: "Ideal for small businesses launching online", features: ["5-page website", "Mobile responsive", "2 revision rounds", "CMS integration", "30-day support"], highlighted: false, cta: "Get Started" }, { id: "pkg-b", name: "Professional", price: "$5,500", period: "one-time", description: "Most popular for growing companies", features: ["Up to 15 pages", "Custom animations", "Unlimited revisions", "E-commerce ready", "SEO setup", "3-month support"], highlighted: true, cta: "Best Value" }, { id: "pkg-c", name: "Enterprise", price: "Custom", period: "", description: "Tailored for complex requirements", features: ["Unlimited pages", "Dedicated PM", "Custom integrations", "Performance SLA", "Priority support", "Training sessions"], highlighted: false, cta: "Let's Talk" }] } },
          { id: gid(), type: "timeline", data: { title: "Project Timeline", milestones: [{ id: "ms-a", phase: "Week 1", title: "Discovery & Strategy", date: "Days 1–5", description: "Kickoff call, research audit, persona workshops, and project charter sign-off." }, { id: "ms-b", phase: "Week 2–3", title: "UX & Wireframes", date: "Days 6–15", description: "Sitemap, user flows, and low-fidelity wireframes presented for feedback." }, { id: "ms-c", phase: "Week 4–5", title: "Visual Design", date: "Days 16–25", description: "Brand-aligned high-fidelity designs with two rounds of client revisions." }, { id: "ms-d", phase: "Week 6–8", title: "Development", date: "Days 26–40", description: "Responsive front-end build, CMS setup, and third-party integrations." }, { id: "ms-e", phase: "Week 9", title: "QA & Launch", date: "Days 41–45", description: "Full QA pass, performance tuning, and coordinated go-live." }] } },
        ],
      },
      {
        id: gid(), title: "Terms & Signature",
        blocks: [
          { id: gid(), type: "richText", data: { html: "<h2>Terms & Conditions</h2><p><strong>1. Payment Schedule</strong><br>A 50% deposit ($1,250–$2,750 depending on package) is required to commence work. The remaining balance is due upon final delivery before files are transferred.</p><p><strong>2. Revisions</strong><br>Each phase includes the agreed number of revision rounds. Additional revisions are billed at $85/hour.</p><p><strong>3. Intellectual Property</strong><br>All designs and code become the client's property upon receipt of full payment.</p><p><strong>4. Confidentiality</strong><br>Both parties agree to keep all project details confidential for 12 months post-launch.</p><p><strong>5. Cancellation</strong><br>Cancellation with less than 7 days' notice forfeits the deposit. Work completed to date will be invoiced at the hourly rate.</p>", align: "left", padding: "md" } },
          { id: gid(), type: "signature", data: { title: "Agreement & Sign-off", agreementText: "By signing below, {{client_name}} confirms they have read and agree to all terms in this proposal, and authorizes {{freelancer_name}} to proceed with the project as described.", fields: [{ id: "sf-a", label: "Client Full Name", type: "text", required: true }, { id: "sf-b", label: "Signature", type: "signature", required: true }, { id: "sf-c", label: "Date", type: "date", required: true }, { id: "sf-d", label: "Company / Organisation", type: "text", required: false }] } },
        ],
      },
    ],
  }),

  "gallery-proposal-2": JSON.stringify({
    version: 2, type: "proposal", theme: "coral",
    pages: [
      {
        id: gid(), title: "Cover",
        blocks: [
          { id: gid(), type: "cover", data: { title: "Brand Identity & Campaign Proposal", subtitle: "A bold new direction for {{client_name}}", background: "#E8533A", textColor: "#ffffff", align: "left", showDate: true, logoText: "Studio", minHeight: 320 } },
          { id: gid(), type: "richText", data: { html: "<h2>Hello, {{client_name}} 👋</h2><p>We're thrilled you reached out. After reviewing your brief and researching your market, we've developed a tailored creative strategy that we believe will elevate your brand and connect deeply with your audience.</p><p>This proposal covers our creative approach, deliverables, process, and investment. We hope it sparks the same excitement we feel about this project.</p>", align: "left", padding: "md" } },
          { id: gid(), type: "callout", data: { icon: "✨", title: "Our Creative Philosophy", text: "Great design isn't just beautiful — it communicates, persuades, and converts. Everything we create is rooted in strategy, not just aesthetics.", background: "#FFF3F0", borderColor: "#E8533A", textColor: "#111827" } },
        ],
      },
      {
        id: gid(), title: "Process & Deliverables",
        blocks: [
          { id: gid(), type: "richText", data: { html: "<h2>Our Creative Process</h2><p>We follow a proven 4-step process that keeps you involved at every stage without overwhelming you with decisions.</p>", align: "left", padding: "md" } },
          { id: gid(), type: "columns", data: { gap: "md", columns: [{ id: "col-a", title: "🔍 Discover", content: "We start by understanding your business deeply — your audience, competitors, values, and goals. This informs every creative decision." }, { id: "col-b", title: "🎨 Define", content: "We establish a creative direction: moodboards, visual language, tone of voice, and brand positioning before a single pixel is placed." }] } },
          { id: gid(), type: "columns", data: { gap: "md", columns: [{ id: "col-c", title: "✏️ Design", content: "With your approval on direction, we craft the full suite of deliverables — logo, brand system, campaign assets, and collateral." }, { id: "col-d", title: "🚀 Deliver", content: "Final files in all required formats, a brand guidelines document, and a handover call to walk you through everything." }] } },
          { id: gid(), type: "table", data: { caption: "Project Deliverables", headers: ["Item", "Details", "Format"], rows: [["Logo Suite", "Primary, secondary, and icon variations", "SVG, PNG, PDF"], ["Brand Guidelines", "Typography, colour, usage rules (20+ pages)", "PDF + Figma"], ["Social Templates", "10 editable post templates", "Figma + Canva"], ["Campaign Assets", "3 hero banners, 6 ad sizes", "PNG + AI"], ["Presentation Deck", "10-slide brand story template", "PowerPoint + PDF"]] } },
        ],
      },
      {
        id: gid(), title: "Investment & Next Steps",
        blocks: [
          { id: gid(), type: "pricing", data: { title: "Creative Packages", subtitle: "Choose the level of creative support that fits your goals", packages: [{ id: "pkg-a", name: "Brand Starter", price: "$1,800", period: "one-time", description: "Core identity for early-stage brands", features: ["Logo suite", "Brand colours & fonts", "Business card design", "2 social templates", "Style guide PDF"], highlighted: false, cta: "Get Started" }, { id: "pkg-b", name: "Brand Pro", price: "$4,200", period: "one-time", description: "Complete brand identity + campaign launch", features: ["Everything in Starter", "Brand guidelines (20+ pages)", "10 social templates", "Campaign hero assets", "Pitch deck template", "Canva kit"], highlighted: true, cta: "Most Popular" }, { id: "pkg-c", name: "Brand Full", price: "$7,500", period: "one-time", description: "Full-service creative partnership", features: ["Everything in Pro", "Motion logo animation", "Photography art direction", "Print collateral", "Ad campaign (3 platforms)", "60-day creative retainer"], highlighted: false, cta: "Full Service" }] } },
          { id: gid(), type: "callout", data: { icon: "📅", title: "Ready to get started?", text: "We have availability starting next week. Sign this proposal and pay the deposit to secure your spot in our production calendar.", background: "#FFF3F0", borderColor: "#E8533A", textColor: "#111827" } },
          { id: gid(), type: "signature", data: { title: "Let's make it official", agreementText: "By signing below, both parties agree to the scope, timeline, and investment outlined in this proposal.", fields: [{ id: "sf-a", label: "Client Name", type: "text", required: true }, { id: "sf-b", label: "Signature", type: "signature", required: true }, { id: "sf-c", label: "Date", type: "date", required: true }] } },
        ],
      },
    ],
  }),

  "gallery-contract-1": JSON.stringify({
    version: 2, type: "contract", theme: "graphite",
    pages: [
      {
        id: gid(), title: "Agreement",
        blocks: [
          { id: gid(), type: "cover", data: { title: "Freelance Services Agreement", subtitle: "Between {{freelancer_name}} and {{client_name}}", background: "#111827", textColor: "#ffffff", align: "center", showDate: true, logoText: "", minHeight: 260 } },
          { id: gid(), type: "richText", data: { html: "<h2>1. Parties</h2><p>This Freelance Services Agreement (\"Agreement\") is entered into as of <strong>{{date}}</strong> between:</p><ul><li><strong>Service Provider:</strong> {{freelancer_name}} (\"Freelancer\")</li><li><strong>Client:</strong> {{client_name}}, {{company_name}} (\"Client\")</li></ul><h2>2. Services</h2><p>Freelancer agrees to provide the following services as described in the attached Statement of Work (SOW): <strong>{{project_title}}</strong>. All work will be performed to a professional standard, in a timely manner, and in accordance with the specifications agreed upon.</p>", align: "left", padding: "md" } },
          { id: gid(), type: "lineItems", data: { title: "Project Investment", items: [{ id: "li-a", description: "Project Discovery & Planning", qty: 1, rate: 500, total: 500 }, { id: "li-b", description: "Design & Creative (hourly)", qty: 20, rate: 85, total: 1700 }, { id: "li-c", description: "Development (hourly)", qty: 30, rate: 95, total: 2850 }, { id: "li-d", description: "Testing & QA", qty: 1, rate: 400, total: 400 }, { id: "li-e", description: "Project Management", qty: 1, rate: 350, total: 350 }], taxRate: 20, discount: 0, discountType: "fixed", notes: "Invoice will be raised upon completion of each milestone. Payment terms: Net 14.", currency: "USD" } },
        ],
      },
      {
        id: gid(), title: "Terms",
        blocks: [
          { id: gid(), type: "richText", data: { html: "<h2>3. Payment Terms</h2><p>Client agrees to pay Freelancer as follows:</p><ul><li><strong>Deposit (50%):</strong> Due upon signing this Agreement before work commences</li><li><strong>Milestone Payment (25%):</strong> Due upon delivery of initial concepts/drafts</li><li><strong>Final Payment (25%):</strong> Due upon final delivery and acceptance</li></ul><p>Invoices are payable within <strong>14 days</strong> of issue. Late payments accrue interest at <strong>1.5% per month</strong>.</p><h2>4. Revisions & Scope Changes</h2><p>Up to <strong>2 rounds of revisions</strong> are included per deliverable. Additional revisions or scope changes will be quoted separately and require written approval before work proceeds.</p><h2>5. Intellectual Property</h2><p>Upon receipt of full and final payment, all rights to the completed deliverables transfer to the Client. Freelancer retains the right to display work in their portfolio unless agreed otherwise in writing.</p><h2>6. Confidentiality</h2><p>Both parties agree to keep all project information, business data, and trade secrets strictly confidential during and for <strong>2 years</strong> after this Agreement.</p><h2>7. Warranties</h2><p>Freelancer warrants that all work is original, does not infringe third-party rights, and will be free from material defects for 30 days post-delivery. Freelancer makes no warranties beyond this.</p><h2>8. Limitation of Liability</h2><p>Freelancer's total liability under this Agreement shall not exceed the total fees paid. Neither party shall be liable for indirect, incidental, or consequential damages.</p><h2>9. Termination</h2><p>Either party may terminate this Agreement with <strong>14 days' written notice</strong>. In the event of termination, Client shall pay for all work completed to date. The deposit is non-refundable.</p><h2>10. Governing Law</h2><p>This Agreement is governed by the laws of the jurisdiction in which the Freelancer is registered. Any disputes will be resolved through mediation before litigation.</p>", align: "left", padding: "md" } },
          { id: gid(), type: "signature", data: { title: "Signatures", agreementText: "Both parties agree to be bound by the terms of this Agreement. This Agreement becomes effective on the date of the last signature.", fields: [{ id: "sf-a", label: "Freelancer Name", type: "text", required: true }, { id: "sf-b", label: "Freelancer Signature", type: "signature", required: true }, { id: "sf-c", label: "Date", type: "date", required: true }, { id: "sf-d", label: "Client Name", type: "text", required: true }, { id: "sf-e", label: "Client Signature", type: "signature", required: true }, { id: "sf-f", label: "Date", type: "date", required: true }] } },
        ],
      },
    ],
  }),

  "gallery-contract-2": JSON.stringify({
    version: 2, type: "contract", theme: "ocean",
    pages: [
      {
        id: gid(), title: "Web Design Contract",
        blocks: [
          { id: gid(), type: "cover", data: { title: "Web Design & Development Agreement", subtitle: "{{project_title}} — {{client_name}}", background: "#0EA5E9", textColor: "#ffffff", align: "center", showDate: true, logoText: "", minHeight: 260 } },
          { id: gid(), type: "richText", data: { html: "<h2>Project Overview</h2><p>This contract governs the design and development of the website project <strong>{{project_title}}</strong> between <strong>{{freelancer_name}}</strong> (\"Designer\") and <strong>{{client_name}}</strong> (\"Client\").</p><h2>1. Scope of Work</h2><p>Designer agrees to provide the following services:</p><ul><li>Custom responsive website design (up to agreed number of pages)</li><li>UX wireframes and high-fidelity mockups</li><li>Front-end development using agreed technology stack</li><li>CMS integration and content entry (Client-supplied content)</li><li>Cross-browser and mobile compatibility testing</li><li>1 round of post-launch bug fixes (within 30 days)</li></ul><p><strong>Out of scope:</strong> Copywriting, photography, SEO campaigns, ongoing maintenance, third-party software licences, or server/hosting costs unless separately agreed in writing.</p>", align: "left", padding: "md" } },
          { id: gid(), type: "callout", data: { icon: "⚠️", title: "Client Responsibilities", text: "Client is responsible for providing all written content, images, and brand assets within 5 business days of project commencement. Delays in content delivery may affect the project timeline.", background: "#FFFBEB", borderColor: "#D97706", textColor: "#111827" } },
          { id: gid(), type: "lineItems", data: { title: "Project Fee Breakdown", items: [{ id: "li-a", description: "UX Research & Wireframing", qty: 1, rate: 800, total: 800 }, { id: "li-b", description: "Visual Design (per page)", qty: 8, rate: 250, total: 2000 }, { id: "li-c", description: "Front-End Development", qty: 1, rate: 3500, total: 3500 }, { id: "li-d", description: "CMS Setup & Training", qty: 1, rate: 600, total: 600 }, { id: "li-e", description: "QA Testing & Launch", qty: 1, rate: 500, total: 500 }], taxRate: 0, discount: 300, discountType: "fixed", notes: "50% deposit required to begin. Remainder due on final delivery. Files released after full payment.", currency: "USD" } },
        ],
      },
      {
        id: gid(), title: "Legal Terms",
        blocks: [
          { id: gid(), type: "richText", data: { html: "<h2>2. Timeline</h2><p>Project will be completed within <strong>6–8 weeks</strong> of deposit receipt and delivery of Client content. Timeline extensions caused by Client delays will not incur additional charges up to 2 weeks; beyond that, a $150/week holding fee applies.</p><h2>3. Revisions Policy</h2><p>Each design phase includes <strong>2 rounds of revisions</strong>. Revision requests must be consolidated and submitted within 5 business days of delivery. Additional revision rounds are billed at $75/hour.</p><h2>4. Content & Third Parties</h2><p>Client is responsible for all third-party software licences (fonts, plugins, stock images) unless Designer sources them as part of scope. Designer is not liable for third-party service outages or price changes.</p><h2>5. Hosting & Domain</h2><p>This contract does not include hosting or domain registration. Designer will assist with deployment but Client is responsible for selecting and paying for hosting and domain services.</p><h2>6. Ownership & Licence</h2><p>Designer retains copyright of all work until full payment is received. Upon full payment, Client receives full ownership of the final deliverables. Designer retains the right to display the project in their portfolio.</p><h2>7. Warranties & Liability</h2><p>Designer warrants the website will function as specified in agreed browsers and device sizes. Designer is not liable for performance issues caused by third-party services, Client-installed plugins, or hosting configuration.</p><h2>8. Termination</h2><p>If the Client cancels after work has begun, they will be invoiced for work completed at the hourly rate of $95/hr. The initial deposit is non-refundable.</p>", align: "left", padding: "md" } },
          { id: gid(), type: "signature", data: { title: "Agreement Sign-off", agreementText: "By signing, both parties confirm they understand and agree to all terms in this Web Design & Development Agreement.", fields: [{ id: "sf-a", label: "Designer / Agency Name", type: "text", required: true }, { id: "sf-b", label: "Designer Signature", type: "signature", required: true }, { id: "sf-c", label: "Date Signed", type: "date", required: true }, { id: "sf-d", label: "Client Name", type: "text", required: true }, { id: "sf-e", label: "Client Signature", type: "signature", required: true }, { id: "sf-f", label: "Client Date", type: "date", required: true }] } },
        ],
      },
    ],
  }),

  "gallery-questionnaire-1": JSON.stringify({
    version: 2, type: "questionnaire", theme: "forest",
    pages: [
      {
        id: gid(), title: "Client Onboarding",
        blocks: [
          { id: gid(), type: "cover", data: { title: "Welcome Aboard! 🎉", subtitle: "Let's get to know you and your project", background: "#059669", textColor: "#ffffff", align: "center", showDate: false, logoText: "", minHeight: 240 } },
          { id: gid(), type: "richText", data: { html: "<h2>Before We Begin</h2><p>We're so excited to start working with you! This short questionnaire helps us understand your business, goals, and preferences so we can hit the ground running.</p><p>It should take about <strong>10–15 minutes</strong> to complete. The more detail you provide, the better we can serve you.</p>", align: "left", padding: "md" } },
          { id: gid(), type: "form", data: { title: "About You & Your Business", description: "Tell us about yourself and what you do.", submitLabel: "Continue", fields: [
            { id: "ff-a", type: "text", label: "Your Full Name", placeholder: "Jane Smith", required: true, width: "half" },
            { id: "ff-b", type: "text", label: "Company / Brand Name", placeholder: "Acme Inc.", required: true, width: "half" },
            { id: "ff-c", type: "email", label: "Email Address", placeholder: "jane@example.com", required: true, width: "half" },
            { id: "ff-d", type: "phone", label: "Phone Number", placeholder: "+1 (555) 000-0000", required: false, width: "half" },
            { id: "ff-e", type: "url", label: "Current Website (if any)", placeholder: "https://yourwebsite.com", required: false, width: "full" },
            { id: "ff-f", type: "dropdown", label: "Industry / Sector", options: ["E-commerce", "Professional Services", "Healthcare", "Technology", "Education", "Non-profit", "Hospitality", "Creative / Agency", "Other"], required: true, width: "half" },
            { id: "ff-g", type: "dropdown", label: "Business Stage", options: ["Idea / Pre-launch", "Early stage (< 1 year)", "Growing (1–3 years)", "Established (3+ years)", "Enterprise"], required: true, width: "half" },
            { id: "ff-h", type: "textarea", label: "Describe your business in 2–3 sentences", placeholder: "What do you sell or offer? Who are your customers?", required: true, rows: 3, width: "full" },
            { id: "ff-i", type: "textarea", label: "What are your top 3 business goals this year?", placeholder: "e.g. increase online sales, launch new product, expand to new markets", required: true, rows: 3, width: "full" },
          ] } },
          { id: gid(), type: "form", data: { title: "Project Details", description: "Help us understand exactly what you need.", submitLabel: "Submit", fields: [
            { id: "ff-j", type: "radio", label: "What type of project is this?", options: ["New website", "Website redesign", "Mobile app", "Brand identity", "Marketing campaign", "Other"], required: true, width: "full" },
            { id: "ff-k", type: "textarea", label: "Describe the project in detail", placeholder: "What problem are you solving? What does success look like?", required: true, rows: 4, width: "full" },
            { id: "ff-l", type: "dropdown", label: "Estimated budget range", options: ["Under $1,000", "$1,000–$3,000", "$3,000–$7,500", "$7,500–$15,000", "$15,000–$30,000", "$30,000+", "Not sure yet"], required: true, width: "half" },
            { id: "ff-m", type: "date", label: "Preferred project start date", required: false, width: "half" },
            { id: "ff-n", type: "date", label: "Hard deadline (if any)", required: false, width: "half" },
            { id: "ff-o", type: "radio", label: "How did you find us?", options: ["Google Search", "Social Media", "Referral from friend/colleague", "Previous client", "Online community", "Other"], required: false, width: "full" },
            { id: "ff-p", type: "textarea", label: "Anything else you'd like us to know?", placeholder: "Any concerns, preferences, or special requirements...", required: false, rows: 3, width: "full" },
            { id: "ff-q", type: "checkbox", label: "I agree to the project brief being used to prepare a tailored proposal", required: true, width: "full" },
          ] } },
        ],
      },
    ],
  }),

  "gallery-questionnaire-2": JSON.stringify({
    version: 2, type: "questionnaire", theme: "violet",
    pages: [
      {
        id: gid(), title: "Brand Discovery",
        blocks: [
          { id: gid(), type: "cover", data: { title: "Brand Discovery Session", subtitle: "Understanding the soul of {{client_name}}", background: "#7C3AED", textColor: "#ffffff", align: "center", showDate: false, logoText: "", minHeight: 260 } },
          { id: gid(), type: "richText", data: { html: "<h2>Why This Matters</h2><p>A great brand isn't just a logo — it's a feeling, a story, and a promise. This deep-dive questionnaire helps us uncover the heart of your brand so we can create an identity that truly resonates.</p><p>Take your time. There are no wrong answers. The more honest and specific you are, the stronger the creative work will be.</p>", align: "left", padding: "md" } },
          { id: gid(), type: "callout", data: { icon: "🎨", title: "Set aside 20–30 minutes", text: "This questionnaire goes deeper than most. Find a quiet moment, grab a coffee, and let your thoughts flow freely.", background: "#F5F3FF", borderColor: "#7C3AED", textColor: "#111827" } },
          { id: gid(), type: "form", data: { title: "Brand Foundations", description: "Let's start with the core of your brand.", submitLabel: "Next", fields: [
            { id: "ff-a", type: "text", label: "Brand / Company Name", placeholder: "Your brand name", required: true, width: "half" },
            { id: "ff-b", type: "text", label: "Tagline (if you have one)", placeholder: "e.g. Just do it", required: false, width: "half" },
            { id: "ff-c", type: "textarea", label: "What is your brand's mission? (Why do you exist?)", placeholder: "Beyond making money — what change do you want to make in the world?", required: true, rows: 3, width: "full" },
            { id: "ff-d", type: "textarea", label: "What are your brand's core values? (3–5 words or phrases)", placeholder: "e.g. Authentic, bold, community-first, sustainable", required: true, rows: 2, width: "full" },
            { id: "ff-e", type: "textarea", label: "If your brand were a person, how would you describe them?", placeholder: "Age, personality, style, how they speak, what they value...", required: true, rows: 3, width: "full" },
            { id: "ff-f", type: "radio", label: "What tone best describes your brand voice?", options: ["Professional & authoritative", "Friendly & approachable", "Bold & provocative", "Playful & fun", "Luxurious & sophisticated", "Minimal & understated"], required: true, width: "full" },
          ] } },
          { id: gid(), type: "form", data: { title: "Audience & Competitors", description: "Who are you speaking to, and who are you up against?", submitLabel: "Next", fields: [
            { id: "ff-g", type: "textarea", label: "Describe your ideal customer in detail", placeholder: "Age, gender, lifestyle, job, income, what they care about, where they hang out...", required: true, rows: 4, width: "full" },
            { id: "ff-h", type: "textarea", label: "What problem do you solve for them?", placeholder: "What pain point or desire does your brand address?", required: true, rows: 3, width: "full" },
            { id: "ff-i", type: "textarea", label: "Name 3 competitors and what you admire/dislike about their branding", placeholder: "Competitor 1: [name] — Love: ... Dislike: ...", required: false, rows: 4, width: "full" },
            { id: "ff-j", type: "textarea", label: "How are you different from your competitors?", placeholder: "What makes you uniquely valuable? Why should customers choose you?", required: true, rows: 3, width: "full" },
          ] } },
          { id: gid(), type: "form", data: { title: "Visual & Aesthetic Preferences", description: "Let's explore your visual world.", submitLabel: "Submit", fields: [
            { id: "ff-k", type: "checkbox", label: "Modern & clean", required: false, width: "half" },
            { id: "ff-l", type: "checkbox", label: "Classic & timeless", required: false, width: "half" },
            { id: "ff-m", type: "checkbox", label: "Bold & edgy", required: false, width: "half" },
            { id: "ff-n", type: "checkbox", label: "Soft & organic", required: false, width: "half" },
            { id: "ff-o", type: "textarea", label: "Share 3 brands whose visual identity you admire and why", placeholder: "e.g. Apple — because it's clean and premium feeling", required: false, rows: 3, width: "full" },
            { id: "ff-p", type: "radio", label: "Colour direction preference", options: ["Neutral & muted", "Bold & vibrant", "Earthy & warm", "Cool & professional", "Dark & moody", "Pastel & light", "No preference — surprise me!"], required: false, width: "full" },
            { id: "ff-q", type: "textarea", label: "Any colours, styles, or references to avoid?", placeholder: "Any hard nos? Colours associated with competitors? Things that feel off-brand?", required: false, rows: 3, width: "full" },
            { id: "ff-r", type: "rating", label: "Overall excitement level about this project (1–5 ⭐)", required: false, width: "full" },
          ] } },
        ],
      },
    ],
  }),

  "gallery-invoice-1": JSON.stringify({
    version: 2, type: "invoice", theme: "graphite",
    pages: [
      {
        id: gid(), title: "Invoice",
        blocks: [
          { id: gid(), type: "cover", data: { title: "Invoice", subtitle: "{{freelancer_name}} → {{client_name}}", background: "#111827", textColor: "#ffffff", align: "left", showDate: true, logoText: "{{freelancer_name}}", minHeight: 200 } },
          { id: gid(), type: "columns", data: { gap: "md", columns: [{ id: "col-a", title: "Bill To", content: "{{client_name}}\n{{company_name}}\n{{client_email}}" }, { id: "col-b", title: "Invoice Details", content: "Invoice #: INV-001\nDate: {{date}}\nDue Date: {{due_date}}\nProject: {{project_title}}" }] } },
          { id: gid(), type: "lineItems", data: { title: "Services Rendered", items: [{ id: "li-a", description: "Website Design — 5 pages", qty: 1, rate: 1500, total: 1500 }, { id: "li-b", description: "Front-End Development", qty: 1, rate: 2000, total: 2000 }, { id: "li-c", description: "Content Management System Setup", qty: 1, rate: 600, total: 600 }, { id: "li-d", description: "Mobile Optimisation", qty: 1, rate: 400, total: 400 }, { id: "li-e", description: "Project Management", qty: 8, rate: 75, total: 600 }], taxRate: 20, discount: 0, discountType: "fixed", notes: "Payment is due within 14 days. Please make payment via bank transfer to the account details provided separately. Include invoice number as reference.", currency: "USD" } },
          { id: gid(), type: "callout", data: { icon: "🏦", title: "Payment Details", text: "Bank: Chase Bank\nAccount Name: Jane Smith\nAccount Number: XXXX-XXXX\nSort Code / Routing: XXX-XXX\n\nPlease reference: INV-001", background: "#F3F4F6", borderColor: "#9CA3AF", textColor: "#111827" } },
          { id: gid(), type: "richText", data: { html: "<p style='font-size:12px;color:#6B7280'>Thank you for your business. If you have any questions about this invoice, please contact us at hello@yourname.com. Late payments may be subject to a 1.5% monthly fee after the due date.</p>", align: "center", padding: "sm" } },
        ],
      },
    ],
  }),

  "gallery-invoice-2": JSON.stringify({
    version: 2, type: "invoice", theme: "ocean",
    pages: [
      {
        id: gid(), title: "Project Invoice",
        blocks: [
          { id: gid(), type: "cover", data: { title: "Project Invoice", subtitle: "{{project_title}} — Milestone Billing", background: "#0EA5E9", textColor: "#ffffff", align: "left", showDate: true, logoText: "{{freelancer_name}}", minHeight: 200 } },
          { id: gid(), type: "columns", data: { gap: "md", columns: [{ id: "col-a", title: "Billed To", content: "{{client_name}}\n{{company_name}}\n{{client_email}}" }, { id: "col-b", title: "Invoice Reference", content: "Invoice #: INV-2024-042\nProject: {{project_title}}\nBilling Date: {{date}}\nDue: {{due_date}}\nTotal: {{total_amount}}" }] } },
          { id: gid(), type: "richText", data: { html: "<h2>Milestone Summary</h2><p>This invoice covers the following project milestones as agreed in the project proposal. All deliverables listed below have been completed and delivered to the client's satisfaction.</p>", align: "left", padding: "md" } },
          { id: gid(), type: "table", data: { caption: "Milestone Completion Status", headers: ["Milestone", "Deliverables", "Status", "Billed"], rows: [["Phase 1 — Discovery", "Research report, personas, sitemap", "✅ Complete", "$1,200"], ["Phase 2 — Design", "Wireframes, visual designs (8 screens)", "✅ Complete", "$3,400"], ["Phase 3 — Development", "Front-end build, CMS, integrations", "✅ Complete", "$5,200"], ["Phase 4 — QA & Launch", "Testing, bug fixes, go-live", "✅ Complete", "$800"], ["Post-launch Support", "30-day support & minor fixes", "✅ Complete", "$600"]] } },
          { id: gid(), type: "lineItems", data: { title: "Invoice Line Items", items: [{ id: "li-a", description: "Phase 1: Discovery & Strategy", qty: 1, rate: 1200, total: 1200 }, { id: "li-b", description: "Phase 2: UX & Visual Design", qty: 1, rate: 3400, total: 3400 }, { id: "li-c", description: "Phase 3: Development & CMS", qty: 1, rate: 5200, total: 5200 }, { id: "li-d", description: "Phase 4: QA, Testing & Launch", qty: 1, rate: 800, total: 800 }, { id: "li-e", description: "Post-launch Support (30 days)", qty: 1, rate: 600, total: 600 }, { id: "li-f", description: "Less: Early payment discount", qty: 1, rate: -500, total: -500 }], taxRate: 0, discount: 0, discountType: "fixed", notes: "All milestones completed. This is the final invoice for the project. Please retain this document for your records.", currency: "USD" } },
          { id: gid(), type: "callout", data: { icon: "✅", title: "Project Complete!", text: "Thank you for an amazing project! It has been a pleasure working with you. All source files have been transferred and you now have full ownership of all deliverables.", background: "#F0F9FF", borderColor: "#0EA5E9", textColor: "#111827" } },
        ],
      },
    ],
  }),
};

export const TEMPLATE_GALLERY = [
  {
    id: "gallery-proposal-1",
    name: "Modern Business Proposal",
    type: "proposal",
    description: "Professional 3-page proposal with pricing packages, project timeline, and e-signature. Perfect for web, design, and consulting projects.",
    tags: ["business", "clean"],
    pages: 3,
    includes: ["Cover", "Pricing packages", "Timeline", "Signature"],
    theme: "graphite",
    content: GALLERY_CONTENT["gallery-proposal-1"],
  },
  {
    id: "gallery-proposal-2",
    name: "Creative Agency Proposal",
    type: "proposal",
    description: "Branded 3-page creative proposal with bold cover, process overview, and tiered pricing. Built for agencies and creative studios.",
    tags: ["creative", "agency"],
    pages: 3,
    includes: ["Bold cover", "Process steps", "Creative packages", "Signature"],
    theme: "coral",
    content: GALLERY_CONTENT["gallery-proposal-2"],
  },
  {
    id: "gallery-contract-1",
    name: "Freelance Service Agreement",
    type: "contract",
    description: "Comprehensive 2-page contract covering payment schedule, IP rights, confidentiality, revisions, and termination. Lawyer-reviewed structure.",
    tags: ["standard", "freelance"],
    pages: 2,
    includes: ["Payment terms", "IP clause", "Confidentiality", "Dual signatures"],
    theme: "graphite",
    content: GALLERY_CONTENT["gallery-contract-1"],
  },
  {
    id: "gallery-contract-2",
    name: "Web Design Contract",
    type: "contract",
    description: "Detailed web-specific contract with scope definition, revision policy, hosting disclaimer, and liability cap. Ideal for web designers.",
    tags: ["web", "design"],
    pages: 2,
    includes: ["Scope definition", "Revision policy", "Fee breakdown", "Dual signatures"],
    theme: "ocean",
    content: GALLERY_CONTENT["gallery-contract-2"],
  },
  {
    id: "gallery-questionnaire-1",
    name: "Client Onboarding Questionnaire",
    type: "questionnaire",
    description: "17-question onboarding form covering business background, project goals, budget, and timeline. Start every project on the right foot.",
    tags: ["onboarding"],
    pages: 1,
    includes: ["Business info", "Project goals", "Budget range", "Timeline"],
    theme: "forest",
    content: GALLERY_CONTENT["gallery-questionnaire-1"],
  },
  {
    id: "gallery-questionnaire-2",
    name: "Brand Discovery Form",
    type: "questionnaire",
    description: "Deep 24-question brand discovery questionnaire covering brand values, audience personas, competitor analysis, and visual preferences.",
    tags: ["branding", "discovery"],
    pages: 1,
    includes: ["Brand values", "Audience personas", "Competitor audit", "Visual prefs"],
    theme: "violet",
    content: GALLERY_CONTENT["gallery-questionnaire-2"],
  },
  {
    id: "gallery-invoice-1",
    name: "Standard Service Invoice",
    type: "invoice",
    description: "Clean professional invoice with itemised services, 20% tax, payment instructions, and bank details. Works for any freelance service.",
    tags: ["standard"],
    pages: 1,
    includes: ["Line items + tax", "Payment details", "Bank info", "Late payment notice"],
    theme: "graphite",
    content: GALLERY_CONTENT["gallery-invoice-1"],
  },
  {
    id: "gallery-invoice-2",
    name: "Project Milestone Invoice",
    type: "invoice",
    description: "Detailed project invoice showing milestone completion status, phase breakdown table, and early payment discount. Perfect for long projects.",
    tags: ["project", "milestones"],
    pages: 1,
    includes: ["Milestone table", "Phase breakdown", "Discount line", "Completion note"],
    theme: "ocean",
    content: GALLERY_CONTENT["gallery-invoice-2"],
  },
];
