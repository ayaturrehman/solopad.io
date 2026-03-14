"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

export default function ProposalPdfViewer({ proposalId }) {
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const urlRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/pdf/proposal/${proposalId}`);
        if (!res.ok) throw new Error("Failed to generate PDF");
        const blob = await res.blob();
        if (cancelled) return;
        const objectUrl = URL.createObjectURL(blob);
        urlRef.current = objectUrl;
        setUrl(objectUrl);
      } catch (err) {
        if (!cancelled) setError("Could not load PDF preview.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, [proposalId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-zinc-400">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Generating preview…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-zinc-400">
        {error}
      </div>
    );
  }

  return (
    <iframe
      src={url}
      className="w-full border-0"
      style={{ height: "calc(100vh - 220px)", minHeight: 600 }}
      title="Proposal PDF preview"
    />
  );
}
