/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  experimental: {
    optimizePackageImports: ["lucide-react", "@tiptap/react", "@tiptap/starter-kit"],
  },
};

export default nextConfig;
