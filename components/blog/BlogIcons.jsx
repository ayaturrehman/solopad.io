const BLUE = "#1D4ED8";
const BLUE_SOFT = "#93C5FD";
const BLUE_PALE = "#DBEAFE";
const ORANGE = "#F05A37";
const ORANGE_SOFT = "#FDBA74";
const WHITE = "#FFFFFF";

function SceneFrame({ children, size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {children}
    </svg>
  );
}

export function IconProposal({ size = 48 }) {
  return (
    <SceneFrame size={size}>
      <rect x="8" y="8" width="64" height="64" rx="18" fill={BLUE_PALE} />
      <rect x="22" y="16" width="36" height="48" rx="6" fill={WHITE} />
      <rect x="22" y="16" width="36" height="10" rx="6" fill={BLUE} />
      <rect x="28" y="32" width="24" height="3" rx="1.5" fill={BLUE_SOFT} />
      <rect x="28" y="39" width="20" height="3" rx="1.5" fill={BLUE_SOFT} />
      <rect x="28" y="46" width="16" height="3" rx="1.5" fill={BLUE_PALE} />
      <circle cx="54" cy="56" r="10" fill={ORANGE} />
      <path d="M50 56.5l2.5 2.5 5.5-6" stroke={WHITE} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </SceneFrame>
  );
}

export function IconContract({ size = 48 }) {
  return (
    <SceneFrame size={size}>
      <rect x="8" y="8" width="64" height="64" rx="18" fill={BLUE_PALE} />
      <rect x="18" y="18" width="30" height="42" rx="5" fill={WHITE} />
      <rect x="32" y="22" width="30" height="42" rx="5" fill={BLUE} />
      <rect x="38" y="32" width="18" height="2.5" rx="1.25" fill={BLUE_SOFT} />
      <rect x="38" y="38" width="14" height="2.5" rx="1.25" fill={BLUE_SOFT} />
      <path d="M40 52c6-1 10 2 12 7" stroke={ORANGE} strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="24" cy="54" r="7" fill={ORANGE} />
      <path d="M21.2 54.2l1.8 1.8 4-4.2" stroke={WHITE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </SceneFrame>
  );
}

export function IconCompare({ size = 48 }) {
  return (
    <SceneFrame size={size}>
      <rect x="8" y="8" width="64" height="64" rx="18" fill={BLUE_PALE} />
      <rect x="16" y="22" width="22" height="36" rx="6" fill={WHITE} />
      <rect x="16" y="22" width="22" height="8" rx="6" fill={BLUE} />
      <rect x="42" y="22" width="22" height="36" rx="6" fill={WHITE} />
      <rect x="42" y="22" width="22" height="8" rx="6" fill={ORANGE} />
      <rect x="21" y="36" width="12" height="3" rx="1.5" fill={BLUE_SOFT} />
      <rect x="21" y="43" width="9" height="3" rx="1.5" fill={BLUE_PALE} />
      <rect x="47" y="36" width="12" height="3" rx="1.5" fill={ORANGE_SOFT} />
      <rect x="47" y="43" width="9" height="3" rx="1.5" fill="#FED7AA" />
    </SceneFrame>
  );
}

export function IconAI({ size = 48 }) {
  return (
    <SceneFrame size={size}>
      <rect x="8" y="8" width="64" height="64" rx="18" fill={BLUE_PALE} />
      <rect x="22" y="22" width="36" height="28" rx="10" fill={BLUE} />
      <circle cx="33" cy="35" r="3.2" fill={WHITE} />
      <circle cx="47" cy="35" r="3.2" fill={WHITE} />
      <path d="M34 43h12" stroke={ORANGE} strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="58" cy="20" r="7" fill={ORANGE} />
      <path d="M58 16.5v7M54.5 20h7" stroke={WHITE} strokeWidth="1.8" strokeLinecap="round" />
      <rect x="30" y="52" width="20" height="6" rx="3" fill={WHITE} />
    </SceneFrame>
  );
}

export function IconSoftware({ size = 48 }) {
  return (
    <SceneFrame size={size}>
      <rect x="8" y="8" width="64" height="64" rx="18" fill={BLUE_PALE} />
      <rect x="16" y="20" width="48" height="34" rx="7" fill={WHITE} />
      <rect x="16" y="20" width="48" height="8" rx="7" fill={BLUE} />
      <circle cx="22" cy="24" r="1.6" fill={ORANGE} />
      <circle cx="27" cy="24" r="1.6" fill={WHITE} />
      <rect x="22" y="34" width="14" height="14" rx="3" fill={BLUE_PALE} />
      <rect x="40" y="36" width="18" height="3" rx="1.5" fill={BLUE_SOFT} />
      <rect x="40" y="42" width="12" height="3" rx="1.5" fill={ORANGE} />
      <rect x="28" y="56" width="24" height="4" rx="2" fill={BLUE} />
    </SceneFrame>
  );
}

export function IconGuide({ size = 48 }) {
  return (
    <SceneFrame size={size}>
      <rect x="8" y="8" width="64" height="64" rx="18" fill={BLUE_PALE} />
      <path d="M22 18h22a6 6 0 016 6v36H28a6 6 0 01-6-6V18z" fill={WHITE} />
      <path d="M28 18h22a6 6 0 016 6v36H34a6 6 0 01-6-6V18z" fill={BLUE} />
      <rect x="38" y="30" width="12" height="3" rx="1.5" fill={BLUE_SOFT} />
      <rect x="38" y="37" width="10" height="3" rx="1.5" fill={BLUE_SOFT} />
      <rect x="50" y="18" width="6" height="22" rx="2" fill={ORANGE} />
    </SceneFrame>
  );
}

export function IconInvoice({ size = 48 }) {
  return (
    <SceneFrame size={size}>
      <rect x="8" y="8" width="64" height="64" rx="18" fill={BLUE_PALE} />
      <rect x="22" y="14" width="36" height="50" rx="6" fill={WHITE} />
      <rect x="22" y="14" width="36" height="12" rx="6" fill={BLUE} />
      <rect x="28" y="32" width="24" height="3" rx="1.5" fill={BLUE_SOFT} />
      <rect x="28" y="39" width="18" height="3" rx="1.5" fill={BLUE_PALE} />
      <rect x="28" y="50" width="16" height="8" rx="3" fill={ORANGE} />
      <text x="36" y="56" textAnchor="middle" fontSize="7" fontWeight="700" fill={WHITE}>£</text>
    </SceneFrame>
  );
}

export function IconTime({ size = 48 }) {
  return (
    <SceneFrame size={size}>
      <rect x="8" y="8" width="64" height="64" rx="18" fill={BLUE_PALE} />
      <circle cx="40" cy="40" r="22" fill={WHITE} />
      <circle cx="40" cy="40" r="18" fill={BLUE} />
      <path d="M40 40L40 26" stroke={WHITE} strokeWidth="3" strokeLinecap="round" />
      <path d="M40 40L50 46" stroke={ORANGE} strokeWidth="3" strokeLinecap="round" />
      <circle cx="40" cy="40" r="3" fill={ORANGE} />
    </SceneFrame>
  );
}

export function IconBudget({ size = 48 }) {
  return (
    <SceneFrame size={size}>
      <rect x="8" y="8" width="64" height="64" rx="18" fill={BLUE_PALE} />
      <rect x="18" y="28" width="44" height="28" rx="8" fill={BLUE} />
      <rect x="18" y="28" width="44" height="8" rx="8" fill={ORANGE} />
      <circle cx="40" cy="48" r="7" fill={WHITE} />
      <text x="40" y="51.5" textAnchor="middle" fontSize="9" fontWeight="800" fill={BLUE}>£</text>
      <rect x="26" y="20" width="28" height="10" rx="5" fill={WHITE} />
    </SceneFrame>
  );
}

const iconMap = {
  "how-to-write-a-freelance-proposal": IconProposal,
  "freelance-contract-template-guide": IconContract,
  "honeybook-vs-dubsado-vs-bonsai": IconCompare,
  "best-freelance-management-software-2026": IconSoftware,
  "ai-proposal-writer-freelance": IconAI,
  "freelance-invoice-template-examples": IconInvoice,
  "freelance-time-tracking-software": IconTime,
  "cheap-freelance-management-tool": IconBudget,
};

const categoryIconMap = {
  Guides: IconGuide,
  Comparisons: IconCompare,
};

export function getBlogIcon(slug, category) {
  return iconMap[slug] || categoryIconMap[category] || IconGuide;
}

export function BlogHeroArt() {
  return (
    <svg viewBox="0 0 420 340" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ width: "100%", height: "auto", display: "block" }}>
      <rect x="24" y="28" width="372" height="284" rx="36" fill={BLUE_PALE} />
      <circle cx="86" cy="72" r="28" fill={ORANGE} opacity="0.18" />
      <circle cx="348" cy="268" r="42" fill={BLUE} opacity="0.12" />
      <rect x="72" y="64" width="176" height="212" rx="18" fill={WHITE} />
      <rect x="72" y="64" width="176" height="36" rx="18" fill={BLUE} />
      <rect x="92" y="120" width="96" height="8" rx="4" fill={BLUE_SOFT} />
      <rect x="92" y="140" width="128" height="8" rx="4" fill={BLUE_PALE} />
      <rect x="92" y="160" width="110" height="8" rx="4" fill={BLUE_PALE} />
      <rect x="92" y="196" width="72" height="28" rx="8" fill={ORANGE} />
      <rect x="188" y="88" width="140" height="168" rx="18" fill={BLUE} transform="rotate(8 258 172)" />
      <rect x="214" y="126" width="78" height="8" rx="4" fill={BLUE_SOFT} />
      <rect x="214" y="146" width="64" height="8" rx="4" fill={WHITE} opacity="0.45" />
      <circle cx="318" cy="86" r="22" fill={ORANGE} />
      <path d="M310 86l6 6 12-13" stroke={WHITE} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="300" y="236" width="64" height="36" rx="12" fill={WHITE} />
      <rect x="312" y="248" width="40" height="12" rx="6" fill={ORANGE} />
    </svg>
  );
}

function Scene({ children }) {
  return (
    <svg
      viewBox="0 0 320 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
      style={{ width: "100%", height: "100%", display: "block" }}
    >
      {children}
    </svg>
  );
}

export function BlogSceneIllustration({ slug, category }) {
  const scenes = {
    "freelance-invoice-template-examples": (
      <Scene>
        <rect width="320" height="180" fill={BLUE_PALE} />
        <circle cx="280" cy="28" r="40" fill={ORANGE} opacity="0.16" />
        <rect x="86" y="22" width="148" height="148" rx="16" fill={WHITE} />
        <rect x="86" y="22" width="148" height="32" rx="16" fill={BLUE} />
        <rect x="106" y="72" width="88" height="7" rx="3.5" fill={BLUE_SOFT} />
        <rect x="106" y="90" width="108" height="7" rx="3.5" fill={BLUE_PALE} />
        <rect x="106" y="108" width="72" height="7" rx="3.5" fill={BLUE_PALE} />
        <rect x="106" y="130" width="64" height="22" rx="8" fill={ORANGE} />
      </Scene>
    ),
    "how-to-write-a-freelance-proposal": (
      <svg viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect width="320" height="180" fill="#FFF4F0" />
        <rect x="58" y="28" width="130" height="124" rx="14" fill={WHITE} />
        <rect x="132" y="40" width="130" height="124" rx="14" fill={BLUE} />
        <rect x="78" y="52" width="70" height="7" rx="3.5" fill={BLUE_SOFT} />
        <rect x="78" y="70" width="86" height="7" rx="3.5" fill={BLUE_PALE} />
        <circle cx="236" cy="132" r="18" fill={ORANGE} />
        <path d="M229 132l5 5 11-12" stroke={WHITE} strokeWidth="3" strokeLinecap="round" />
      </svg>
    ),
    "freelance-contract-template-guide": (
      <svg viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect width="320" height="180" fill={BLUE_PALE} />
        <rect x="70" y="24" width="110" height="132" rx="12" fill={WHITE} />
        <rect x="140" y="36" width="110" height="132" rx="12" fill={BLUE} />
        <path d="M168 128c18-4 32 8 38 22" stroke={ORANGE} strokeWidth="4" strokeLinecap="round" />
        <rect x="88" y="48" width="54" height="7" rx="3.5" fill={BLUE_SOFT} />
      </svg>
    ),
    "honeybook-vs-dubsado-vs-bonsai": (
      <svg viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect width="320" height="180" fill={BLUE_PALE} />
        <rect x="48" y="36" width="100" height="108" rx="16" fill={WHITE} />
        <rect x="48" y="36" width="100" height="22" rx="16" fill={BLUE} />
        <rect x="172" y="36" width="100" height="108" rx="16" fill={WHITE} />
        <rect x="172" y="36" width="100" height="22" rx="16" fill={ORANGE} />
      </svg>
    ),
    "ai-proposal-writer-freelance": (
      <svg viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect width="320" height="180" fill={BLUE_PALE} />
        <rect x="96" y="40" width="128" height="88" rx="24" fill={BLUE} />
        <circle cx="140" cy="80" r="10" fill={WHITE} />
        <circle cx="180" cy="80" r="10" fill={WHITE} />
        <path d="M142 104h36" stroke={ORANGE} strokeWidth="5" strokeLinecap="round" />
        <circle cx="232" cy="44" r="16" fill={ORANGE} />
      </svg>
    ),
    "freelance-time-tracking-software": (
      <svg viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect width="320" height="180" fill="#FFF4F0" />
        <circle cx="160" cy="90" r="58" fill={WHITE} />
        <circle cx="160" cy="90" r="46" fill={BLUE} />
        <path d="M160 90V54" stroke={WHITE} strokeWidth="6" strokeLinecap="round" />
        <path d="M160 90l24 16" stroke={ORANGE} strokeWidth="6" strokeLinecap="round" />
        <circle cx="160" cy="90" r="7" fill={ORANGE} />
      </svg>
    ),
    "cheap-freelance-management-tool": (
      <svg viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect width="320" height="180" fill={BLUE_PALE} />
        <rect x="70" y="62" width="180" height="78" rx="18" fill={BLUE} />
        <rect x="70" y="62" width="180" height="22" rx="18" fill={ORANGE} />
        <circle cx="160" cy="112" r="18" fill={WHITE} />
      </svg>
    ),
    "best-freelance-management-software-2026": (
      <svg viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect width="320" height="180" fill={BLUE_PALE} />
        <rect x="48" y="36" width="224" height="108" rx="16" fill={WHITE} />
        <rect x="48" y="36" width="224" height="24" rx="16" fill={BLUE} />
        <rect x="68" y="80" width="70" height="44" rx="8" fill={BLUE_PALE} />
        <rect x="154" y="86" width="96" height="8" rx="4" fill={BLUE_SOFT} />
        <rect x="154" y="104" width="64" height="8" rx="4" fill={ORANGE} />
      </svg>
    ),
  };

  const fallback = category === "Comparisons" ? scenes["honeybook-vs-dubsado-vs-bonsai"] : scenes["how-to-write-a-freelance-proposal"];
  return scenes[slug] || fallback;
}

export function BlogHeroIllustration({ category }) {
  if (category === "Comparisons") {
    return (
      <svg width="100%" height="100%" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.12 }}>
        <rect x="20" y="20" width="150" height="160" rx="16" fill={BLUE} />
        <rect x="230" y="20" width="150" height="160" rx="16" fill={ORANGE} />
      </svg>
    );
  }

  return (
    <svg width="100%" height="100%" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.12 }}>
      <rect x="120" y="10" width="160" height="180" rx="12" fill={BLUE} />
      <circle cx="60" cy="60" r="30" fill={ORANGE} />
      <circle cx="340" cy="140" r="30" fill={ORANGE} />
    </svg>
  );
}
