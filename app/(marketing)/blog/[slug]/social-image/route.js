import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { getPostBySlug } from "@/lib/blog";

const size = { width: 1200, height: 630 };
export const revalidate = 3600;

export async function GET(_request, { params }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#F4EFE6", color: "#141B24", padding: "60px 72px", borderTop: "12px solid #1D4ED8" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 36, fontWeight: 700 }}>SoloPad.</div>
        <div style={{ color: "#1D4ED8", fontSize: 24 }}>{post.category}</div>
      </div>
      <div style={{ fontSize: post.metaTitle.length > 55 ? 56 : 64, fontWeight: 700, lineHeight: 1.15 }}>
        {post.metaTitle}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: "#52525B" }}>
        <div>Practical guides for your freelance business</div>
        <div>solopad.io</div>
      </div>
    </div>,
    size,
  );
}
