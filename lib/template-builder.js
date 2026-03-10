export function createTemplateNodeId(prefix = "node") {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;
}

export const TEMPLATE_THEMES = [
  {
    id: "graphite",
    name: "Graphite",
    accent: "#18181b",
    accentSoft: "#f4f4f5",
    canvas: "#f7f7f8",
    surface: "#ffffff",
    text: "#18181b",
    muted: "#71717a",
  },
  {
    id: "ocean",
    name: "Ocean",
    accent: "#0f766e",
    accentSoft: "#ecfeff",
    canvas: "#f3fbfc",
    surface: "#ffffff",
    text: "#0f172a",
    muted: "#64748b",
  },
  {
    id: "amber",
    name: "Amber",
    accent: "#b45309",
    accentSoft: "#fff7ed",
    canvas: "#fffbf5",
    surface: "#ffffff",
    text: "#292524",
    muted: "#78716c",
  },
  {
    id: "berry",
    name: "Berry",
    accent: "#be185d",
    accentSoft: "#fff1f2",
    canvas: "#fff8fb",
    surface: "#ffffff",
    text: "#1f2937",
    muted: "#6b7280",
  },
];

export const TEMPLATE_BLOCK_LIBRARY = [
  { type: "cover", label: "Cover" },
  { type: "richText", label: "Text" },
  { type: "callout", label: "Callout" },
  { type: "pricing", label: "Pricing" },
  { type: "questions", label: "Questions" },
  { type: "signature", label: "Signature" },
];

function getThemeById(themeId) {
  return TEMPLATE_THEMES.find((theme) => theme.id === themeId) || TEMPLATE_THEMES[0];
}

export function createBlock(type, overrides = {}) {
  const base = {
    id: createTemplateNodeId("block"),
    type,
  };

  switch (type) {
    case "cover":
      return {
        ...base,
        title: "Document title",
        subtitle: "A clear opening section that explains what the client is about to review.",
        meta: "Prepared by your studio",
        align: "center",
        ...overrides,
      };
    case "callout":
      return {
        ...base,
        label: "Important",
        body: "Use this area for notices, onboarding guidance, or next-step instructions.",
        ...overrides,
      };
    case "pricing":
      return {
        ...base,
        heading: "Investment",
        items: [
          { id: createTemplateNodeId("line"), label: "Core package", value: "$2,500", note: "Primary deliverable scope" },
        ],
        ...overrides,
      };
    case "questions":
      return {
        ...base,
        heading: "Questions",
        items: [
          { id: createTemplateNodeId("question"), prompt: "What outcome matters most for this project?" },
          { id: createTemplateNodeId("question"), prompt: "Are there deadlines or dependencies we should know about?" },
        ],
        ...overrides,
      };
    case "signature":
      return {
        ...base,
        heading: "Approval",
        body: "Sign below to confirm approval and allow the project to begin.",
        signerLabel: "Client signature",
        ...overrides,
      };
    case "richText":
    default:
      return {
        ...base,
        heading: "Section heading",
        body: "Write the main content for this section here. Use it for scope, process, deliverables, or legal terms.",
        ...overrides,
      };
  }
}

export function createPage(title = "New page", blocks = [createBlock("richText")]) {
  return {
    id: createTemplateNodeId("page"),
    title,
    blocks,
  };
}

function baseDocument(type, name, description, themeId, pages) {
  return {
    version: 1,
    kind: "builder-document",
    type,
    name,
    description,
    theme: { ...getThemeById(themeId) },
    pages,
  };
}

export function createDefaultBuilderDocument(type = "proposal") {
  if (type === "contract") {
    return baseDocument("contract", "Services Agreement", "A reusable contract layout with a cover, terms, and signature.", "graphite", [
      createPage("Cover", [
        createBlock("cover", {
          title: "Services Agreement",
          subtitle: "A clean contract cover introducing the agreement and the parties involved.",
          meta: "Prepared for your client",
        }),
        createBlock("callout", {
          label: "Ready to sign",
          body: "All required fields are complete. Review the agreement below before signing.",
        }),
      ]),
      createPage("Contract", [
        createBlock("richText", {
          heading: "Scope of work",
          body: "Describe the services being provided, the responsibilities of each party, and what is included in the engagement.",
        }),
        createBlock("richText", {
          heading: "Payment terms",
          body: "Explain fees, due dates, late-payment terms, and how additional scope will be handled.",
        }),
        createBlock("signature", {
          heading: "Signature",
          body: "By signing, both parties agree to the terms of this agreement.",
        }),
      ]),
    ]);
  }

  if (type === "questionnaire") {
    return baseDocument("questionnaire", "Client Questionnaire", "A guided onboarding form with a branded intro and questions.", "ocean", [
      createPage("Welcome", [
        createBlock("cover", {
          title: "Client Questionnaire",
          subtitle: "Use this page to welcome the client and explain the purpose of the form.",
          meta: "A short onboarding experience",
        }),
        createBlock("callout", {
          label: "Before you begin",
          body: "Please answer the questions below so we can tailor the engagement to your goals.",
        }),
      ]),
      createPage("Questions", [
        createBlock("questions", {
          heading: "Project intake",
          items: [
            { id: createTemplateNodeId("question"), prompt: "What are you trying to achieve with this project?" },
            { id: createTemplateNodeId("question"), prompt: "Who is the audience or customer this work is for?" },
            { id: createTemplateNodeId("question"), prompt: "What does success look like in the next 90 days?" },
          ],
        }),
      ]),
    ]);
  }

  return baseDocument("proposal", "Project Proposal", "A multi-section proposal with cover, approach, and pricing.", "berry", [
    createPage("Introduction", [
      createBlock("cover", {
        title: "Project Proposal",
        subtitle: "Introduce the engagement, frame the opportunity, and set the tone of the proposal.",
        meta: "Prepared by your studio",
      }),
      createBlock("richText", {
        heading: "Why this matters",
        body: "Summarize the client challenge, the desired outcome, and why this work matters now.",
      }),
    ]),
    createPage("Scope", [
      createBlock("richText", {
        heading: "Approach",
        body: "Explain the process, deliverables, and the way you plan to move the project forward.",
      }),
      createBlock("pricing", {
        heading: "Investment",
        items: [
          { id: createTemplateNodeId("line"), label: "Discovery", value: "$750", note: "Research and workshop" },
          { id: createTemplateNodeId("line"), label: "Execution", value: "$2,500", note: "Main delivery scope" },
        ],
      }),
    ]),
  ]);
}

export function parseTemplateContent(content) {
  if (!content) return null;
  if (typeof content === "object") return content;

  try {
    return JSON.parse(content);
  } catch {
    return content;
  }
}

export function isBuilderDocument(content) {
  return Boolean(content && typeof content === "object" && content.kind === "builder-document");
}

function normalizeTheme(theme, type) {
  const fallback = createDefaultBuilderDocument(type).theme;
  return {
    ...fallback,
    ...(theme || {}),
  };
}

function normalizeItemList(items, keyName) {
  return Array.isArray(items)
    ? items.map((item) => ({
        id: item?.id || createTemplateNodeId(keyName),
        ...item,
      }))
    : [];
}

function normalizeBlock(block) {
  if (!block?.type) return createBlock("richText");

  if (block.type === "pricing") {
    return createBlock("pricing", {
      ...block,
      items: normalizeItemList(block.items, "line"),
    });
  }

  if (block.type === "questions") {
    return createBlock("questions", {
      ...block,
      items: normalizeItemList(block.items, "question"),
    });
  }

  return createBlock(block.type, block);
}

function normalizePages(pages) {
  if (!Array.isArray(pages) || pages.length === 0) {
    return [createPage()];
  }

  return pages.map((page, index) => ({
    id: page?.id || createTemplateNodeId(`page${index + 1}`),
    title: page?.title || `Page ${index + 1}`,
    blocks: Array.isArray(page?.blocks) && page.blocks.length ? page.blocks.map(normalizeBlock) : [createBlock("richText")],
  }));
}

export function createBuilderDocumentFromTemplate(template) {
  const parsed = parseTemplateContent(template?.content);
  const type = template?.type || "proposal";

  if (isBuilderDocument(parsed)) {
    return {
      ...parsed,
      type,
      name: parsed.name || template?.name || "Untitled template",
      description: parsed.description || template?.description || "",
      theme: normalizeTheme(parsed.theme, type),
      pages: normalizePages(parsed.pages),
    };
  }

  if (type === "invoice") return null;

  if (type === "proposal" && parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
    return {
      ...createDefaultBuilderDocument("proposal"),
      name: template?.name || "Project Proposal",
      description: template?.description || "",
      theme: normalizeTheme(parsed.theme, "proposal"),
      pages: [
        createPage("Introduction", [
          createBlock("cover", {
            title: template?.name || "Project Proposal",
            subtitle: parsed.intro || template?.description || "",
            meta: "Prepared by your studio",
          }),
          ...(Array.isArray(parsed.sections) ? parsed.sections : []).map((section) =>
            createBlock("richText", {
              heading: section.heading || "Section",
              body: section.body || "",
            })
          ),
        ]),
        createPage("Pricing", [
          createBlock("pricing", {
            heading: "Investment",
            items: (Array.isArray(parsed.pricing) ? parsed.pricing : []).map((row) => ({
              id: createTemplateNodeId("line"),
              label: row.description || "Line item",
              value: row.amount ? `$${row.amount}` : "",
              note: "",
            })),
          }),
        ]),
      ],
    };
  }

  if (type === "questionnaire") {
    return {
      ...createDefaultBuilderDocument("questionnaire"),
      name: template?.name || "Client Questionnaire",
      description: template?.description || "",
      pages: [
        createPage("Welcome", [
          createBlock("cover", {
            title: template?.name || "Client Questionnaire",
            subtitle: template?.description || "",
            meta: "A short onboarding experience",
          }),
        ]),
        createPage("Questions", [
          createBlock("questions", {
            heading: "Questions",
            items: String(parsed || "")
              .split("?")
              .map((part) => part.trim())
              .filter(Boolean)
              .map((part) => ({ id: createTemplateNodeId("question"), prompt: `${part}?` })),
          }),
        ]),
      ],
    };
  }

  return {
    ...createDefaultBuilderDocument(type),
    name: template?.name || createDefaultBuilderDocument(type).name,
    description: template?.description || "",
    pages: [
      createPage("Page 1", [
        createBlock("cover", {
          title: template?.name || createDefaultBuilderDocument(type).name,
          subtitle: template?.description || "",
          meta: "Prepared by your studio",
        }),
        createBlock("richText", {
          heading: type === "contract" ? "Agreement" : "Content",
          body: typeof parsed === "string" ? parsed : "",
        }),
      ]),
    ],
  };
}

export function serializeBuilderDocument(document) {
  return JSON.stringify(document);
}

export function extractProposalDraftFromBuilder(document) {
  const pages = Array.isArray(document?.pages) ? document.pages : [];
  const blocks = pages.flatMap((page) => page.blocks || []);
  const cover = blocks.find((block) => block.type === "cover");
  const textBlocks = blocks.filter((block) => block.type === "richText");
  const pricingBlock = blocks.find((block) => block.type === "pricing");

  return {
    title: document?.name || cover?.title || "Project Proposal",
    intro: cover?.subtitle || document?.description || "",
    sections: textBlocks.length
      ? textBlocks.map((block) => ({ heading: block.heading || "Section", body: block.body || "" }))
      : [{ heading: "Overview", body: document?.description || "" }],
    pricing: pricingBlock?.items?.length
      ? pricingBlock.items.map((item) => ({
          description: item.label || "",
          amount: String(item.value || "").replace(/[^0-9.]/g, ""),
        }))
      : [{ description: "", amount: "" }],
    currency: "USD",
  };
}

export const TEMPLATE_GALLERY = [
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
      lineItems: [{ description: "Monthly retainer — content & social", quantity: 1, rate: 800, amount: 800 }],
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
  {
    id: "sys-proposal-1",
    type: "proposal",
    name: "Project Proposal",
    description: "A polished proposal with a branded cover, scope sections, and pricing.",
    content: createDefaultBuilderDocument("proposal"),
  },
  {
    id: "sys-proposal-2",
    type: "proposal",
    name: "Brand Identity Proposal",
    description: "Proposal structure tailored for branding work and creative deliverables.",
    content: {
      ...createDefaultBuilderDocument("proposal"),
      name: "Brand Identity Proposal",
      description: "Proposal structure tailored for branding work and creative deliverables.",
    },
  },
  {
    id: "sys-contract-1",
    type: "contract",
    name: "Freelance Services Agreement",
    description: "Standard freelance contract with cover, legal terms, and signature.",
    content: createDefaultBuilderDocument("contract"),
  },
  {
    id: "sys-contract-2",
    type: "contract",
    name: "Website Development Contract",
    description: "A structured contract layout for web design and development projects.",
    content: {
      ...createDefaultBuilderDocument("contract"),
      name: "Website Development Contract",
      description: "A structured contract layout for web design and development projects.",
    },
  },
  {
    id: "sys-questionnaire-1",
    type: "questionnaire",
    name: "Client Onboarding Questionnaire",
    description: "A welcoming onboarding form with intro and discovery questions.",
    content: createDefaultBuilderDocument("questionnaire"),
  },
  {
    id: "sys-questionnaire-2",
    type: "questionnaire",
    name: "Brand Discovery Questionnaire",
    description: "Questionnaire layout focused on positioning, audience, and voice.",
    content: {
      ...createDefaultBuilderDocument("questionnaire"),
      name: "Brand Discovery Questionnaire",
      description: "Questionnaire layout focused on positioning, audience, and voice.",
    },
  },
];
