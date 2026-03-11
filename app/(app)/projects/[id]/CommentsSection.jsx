"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";

export default function CommentsSection({
  projectId,
  comments,
  isFreelancer,
  authorName,
  title = "Comments",
  emptyMessage = "No comments yet.",
  placeholder = "Add a comment...",
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  async function sendComment(e) {
    e.preventDefault();
    if (!body.trim()) return;
    setSending(true);

    await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId,
        authorName: authorName || "Freelancer",
        authorType: isFreelancer ? "freelancer" : "client",
        body: body.trim(),
      }),
    });

    setBody("");
    setSending(false);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="font-semibold text-zinc-900">{title}</h2>
      </CardHeader>
      <CardBody className="space-y-4">
        {comments.length === 0 && (
          <p className="text-center text-sm text-zinc-400">{emptyMessage}</p>
        )}
        <div className="max-h-80 space-y-3 overflow-y-auto">
          {comments.map((c) => (
            <div
              key={c.id}
              className={`flex gap-3 ${c.authorType === "freelancer" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  c.authorType === "freelancer" ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600"
                }`}
              >
                {c.authorName?.[0]?.toUpperCase() ?? "?"}
              </div>
              <div className={`flex max-w-[75%] flex-col ${c.authorType === "freelancer" ? "items-end" : "items-start"}`}>
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-xs font-medium text-zinc-600">{c.authorName}</span>
                  <span className="text-xs text-zinc-400">{formatDate(c.createdAt)}</span>
                </div>
                <div
                  className={`rounded px-3 py-2 text-sm ${
                    c.authorType === "freelancer" ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-900"
                  }`}
                >
                  {c.body}
                </div>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={sendComment} className="flex gap-2 border-t border-zinc-100 pt-2">
          <input
            className="h-10 flex-1 rounded border border-zinc-200 px-3 text-sm placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            placeholder={placeholder}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <button
            type="submit"
            disabled={sending || !body.trim()}
            className="flex h-10 w-10 items-center justify-center rounded bg-zinc-900 text-white hover:bg-zinc-700 disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </CardBody>
    </Card>
  );
}
