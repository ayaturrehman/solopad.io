/** @type {import('next').NextConfig} */

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://www.googletagmanager.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https://images.unsplash.com https://*.stripe.com https://www.google-analytics.com",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://api.stripe.com https://api.openai.com https://www.google-analytics.com https://analytics.google.com wss: ws:",
      "frame-src https://js.stripe.com",
    ].join("; "),
  },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig = {
  compress: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@tiptap/react",
      "@tiptap/starter-kit",
      "@tiptap/extension-link",
      "@tiptap/extension-text-align",
      "@tiptap/extension-underline",
      "@tiptap/extension-color",
      "@tiptap/extension-text-style",
      "@tiptap/extension-highlight",
      "@tiptap/extension-image",
      "@tiptap/extension-table",
      "@tiptap/extension-table-cell",
      "@tiptap/extension-table-header",
      "@tiptap/extension-table-row",
      "@tiptap/extension-task-item",
      "@tiptap/extension-task-list",
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
