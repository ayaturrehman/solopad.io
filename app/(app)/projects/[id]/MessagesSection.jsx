"use client";

import { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";

export default function MessagesSection({ projectId, initialComments }) {
  const [messages, setMessages] = useState(initialComments);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // SSE — one persistent connection, server pushes new messages instantly
  useEffect(() => {
    const es = new EventSource(`/api/comments/stream?projectId=${projectId}`);
    es.onmessage = (e) => {
      try {
        const comment = JSON.parse(e.data);
        setMessages((prev) => {
          if (prev.some((m) => m.id === comment.id)) return prev;
          return [...prev.filter((m) => !String(m.id).startsWith("tmp-")), comment];
        });
      } catch {}
    };
    return () => es.close();
  }, [projectId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(e) {
    e.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    const optimistic = {
      id: `tmp-${Date.now()}`,
      authorName: "You",
      authorType: "freelancer",
      body: body.trim(),
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setBody("");
    await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, authorName: "You", authorType: "freelancer", body: optimistic.body }),
    });
    setSending(false);
    // SSE will push the real comment back and replace the optimistic entry
  }

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-zinc-900">Client messages</h2>
          <p className="mt-0.5 text-xs text-zinc-400">Messages sent via the client portal</p>
        </div>
        <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600">
          {messages.length} message{messages.length !== 1 ? "s" : ""}
        </span>
      </CardHeader>
      <CardBody className="p-0">
        <div className="max-h-[520px] space-y-4 overflow-y-auto p-5">
          {messages.length === 0 && (
            <p className="py-12 text-center text-sm text-zinc-400">No messages yet. Clients can message you through the portal.</p>
          )}
          {messages.map((c) => (
            <div key={c.id} className={`flex gap-3 ${c.authorType === "freelancer" ? "flex-row-reverse" : ""}`}>
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                c.authorType === "freelancer" ? "bg-zinc-900 text-white" : "bg-blue-600 text-white"
              }`}>
                {c.authorName?.[0]?.toUpperCase() ?? "?"}
              </div>
              <div className={`flex max-w-[70%] flex-col ${c.authorType === "freelancer" ? "items-end" : "items-start"}`}>
                <p className="mb-1 text-xs text-zinc-400">
                  {c.authorType === "freelancer" ? "You" : c.authorName} · {formatDate(c.createdAt)}
                </p>
                <div className={`rounded px-3 py-1.5 text-sm ${
                  c.authorType === "freelancer" ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-900"
                }`}>
                  {c.body}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="border-t border-zinc-100 p-4">
          <form onSubmit={send} className="flex gap-2">
            <input
              className="h-10 flex-1 rounded border border-zinc-200 px-3 text-sm placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none"
              placeholder="Reply to client…"
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
        </div>
      </CardBody>
    </Card>
  );
}
