// Clean line icons for blog posts — royalty free, no emojis
// Each icon is 1:1 aspect ratio, designed for 40-80px display

export function IconProposal({ size = 48, color = "#2563EB" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="6" width="28" height="36" rx="3" stroke={color} strokeWidth="2" />
      <path d="M16 16h16M16 22h16M16 28h10" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M30 30l4 4 8-8" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconContract({ size = 48, color = "#2563EB" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="6" width="26" height="36" rx="3" stroke={color} strokeWidth="2" />
      <path d="M14 16h14M14 22h14M14 28h8" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M28 32c2-4 6-6 10-4s2 8-2 10-8 1-8-2 0-4 0-4z" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M26 38l2-6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconCompare({ size = 48, color = "#2563EB" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="10" width="16" height="28" rx="3" stroke={color} strokeWidth="2" />
      <rect x="28" y="10" width="16" height="28" rx="3" stroke={color} strokeWidth="2" />
      <path d="M22 20h4M22 24h4M22 28h4" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="20" r="2" fill={color} />
      <circle cx="12" cy="26" r="2" fill={color} />
      <circle cx="36" cy="20" r="2" fill={color} />
      <circle cx="36" cy="26" r="2" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

export function IconAI({ size = 48, color = "#2563EB" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="12" y="8" width="24" height="20" rx="4" stroke={color} strokeWidth="2" />
      <circle cx="20" cy="18" r="2.5" fill={color} />
      <circle cx="28" cy="18" r="2.5" fill={color} />
      <path d="M20 24h8" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M18 28v6l6-3 6 3v-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 14v0a2 2 0 012-2h0" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M40 14v0a2 2 0 00-2-2h0" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M24 4v4M18 6l1 3M30 6l-1 3" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconSoftware({ size = 48, color = "#2563EB" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="8" width="36" height="26" rx="3" stroke={color} strokeWidth="2" />
      <path d="M6 14h36" stroke={color} strokeWidth="2" />
      <circle cx="11" cy="11" r="1.5" fill={color} />
      <circle cx="16" cy="11" r="1.5" fill={color} />
      <circle cx="21" cy="11" r="1.5" fill={color} />
      <rect x="12" y="20" width="10" height="8" rx="1.5" stroke={color} strokeWidth="1.5" />
      <path d="M28 20h8M28 24h6M28 28h8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M18 34v6M14 40h20" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M30 34v6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconGuide({ size = 48, color = "#2563EB" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 10a4 4 0 014-4h20l8 8v24a4 4 0 01-4 4H12a4 4 0 01-4-4V10z" stroke={color} strokeWidth="2" />
      <path d="M32 6v8h8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 20h16M16 26h16M16 32h10" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <circle cx="16" cy="20" r="0" fill={color} />
    </svg>
  );
}

export function IconInvoice({ size = 48, color = "#2563EB" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="6" width="28" height="36" rx="3" stroke={color} strokeWidth="2" />
      <path d="M16 14h10M16 20h16M16 26h16M16 32h8" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <rect x="28" y="30" width="6" height="6" rx="1" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

// Map slug or category to the right icon
const iconMap = {
  "how-to-write-a-freelance-proposal": IconProposal,
  "freelance-contract-template-guide": IconContract,
  "honeybook-vs-dubsado-vs-bonsai": IconCompare,
  "best-freelance-management-software-2026": IconSoftware,
  "ai-proposal-writer-freelance": IconAI,
  "freelance-invoice-template-examples": IconInvoice,
};

const categoryIconMap = {
  Guides: IconGuide,
  Comparisons: IconCompare,
};

export function getBlogIcon(slug, category) {
  return iconMap[slug] || categoryIconMap[category] || IconGuide;
}

// Hero illustration for blog post pages — abstract decorative element
export function BlogHeroIllustration({ category, color = "#2563EB" }) {
  if (category === "Comparisons") {
    return (
      <svg width="100%" height="100%" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.06 }}>
        <rect x="20" y="20" width="150" height="160" rx="16" stroke={color} strokeWidth="3" />
        <rect x="230" y="20" width="150" height="160" rx="16" stroke={color} strokeWidth="3" />
        <path d="M185 60h30M185 100h30M185 140h30" stroke={color} strokeWidth="3" strokeLinecap="round" />
        <circle cx="95" cy="70" r="20" stroke={color} strokeWidth="2" />
        <circle cx="305" cy="70" r="20" stroke={color} strokeWidth="2" />
        <rect x="55" y="110" width="80" height="8" rx="4" fill={color} />
        <rect x="55" y="130" width="60" height="8" rx="4" fill={color} />
        <rect x="265" y="110" width="80" height="8" rx="4" fill={color} />
        <rect x="265" y="130" width="60" height="8" rx="4" fill={color} />
      </svg>
    );
  }

  // Default: document/guide illustration
  return (
    <svg width="100%" height="100%" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.06 }}>
      <rect x="120" y="10" width="160" height="180" rx="12" stroke={color} strokeWidth="3" />
      <path d="M150 60h100M150 80h100M150 100h70" stroke={color} strokeWidth="3" strokeLinecap="round" />
      <path d="M150 130h60M150 150h40" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <circle cx="60" cy="60" r="30" stroke={color} strokeWidth="2" />
      <path d="M50 55l6 6 14-14" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="340" cy="140" r="30" stroke={color} strokeWidth="2" />
      <path d="M330 135l6 6 14-14" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M30 140l40-30M330 50l40 30" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 6" />
    </svg>
  );
}
