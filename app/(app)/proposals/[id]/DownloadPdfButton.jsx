"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Download, Printer } from "lucide-react";

export default function DownloadPdfButton({ proposalId, title }) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(event) {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function fetchPdfBlob() {
    const res = await fetch(`/api/pdf/proposal/${proposalId}`);
    if (!res.ok) throw new Error("Failed");
    return res.blob();
  }

  async function handleDownload() {
    setLoading(true);
    setOpen(false);
    try {
      const blob = await fetchPdfBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const safeName = (title || proposalId).replace(/[^a-z0-9]/gi, "-").toLowerCase();
      a.download = `proposal-${safeName}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  }

  function handlePrint() {
    setOpen(false);
    window.open(`/proposals/${proposalId}/print`, "_blank");
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={loading}
        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-transparent hover:text-zinc-900 disabled:opacity-50"
      >
        <Download className="h-3.5 w-3.5" />
        {loading ? "Generating..." : "PDF/Print"}
        <ChevronDown className="h-3 w-3 text-zinc-400" />
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+4px)] z-20 w-44 rounded border border-zinc-200 bg-white py-1 shadow-lg">
          <button
            type="button"
            onClick={handleDownload}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-50"
          >
            <Download className="h-3.5 w-3.5 text-zinc-400" />
            Download PDF
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-50"
          >
            <Printer className="h-3.5 w-3.5 text-zinc-400" />
            Print
          </button>
        </div>
      )}
    </div>
  );
}
