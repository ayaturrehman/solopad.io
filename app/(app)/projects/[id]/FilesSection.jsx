"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, File, Download, Trash2, Eye, EyeOff } from "lucide-react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { formatBytes, formatDate } from "@/lib/utils";

export default function FilesSection({ projectId, files: initialFiles }) {
  const router = useRouter();
  const inputRef = useRef(null);
  const [files, setFiles] = useState(initialFiles);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  async function uploadFile(file) {
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    form.append("projectId", projectId);
    const res = await fetch("/api/files", { method: "POST", body: form });
    const data = await res.json();
    const created = data.file ?? data;
    if (created?.id) setFiles((prev) => [created, ...prev]);
    setUploading(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }

  async function deleteFile(file) {
    const filename = encodeURIComponent(file.name);
    await fetch(`/api/files/${projectId}/${filename}/delete`, { method: "DELETE" });
    setFiles((prev) => prev.filter((f) => f.id !== file.id));
  }

  async function toggleVisibility(file) {
    const next = !file.visibleToClient;
    setFiles((prev) => prev.map((f) => f.id === file.id ? { ...f, visibleToClient: next } : f));
    await fetch(`/api/files/${projectId}/${encodeURIComponent(file.name)}/visibility`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visibleToClient: next }),
    });
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="font-semibold text-zinc-900">Files & Deliverables</h2>
      </CardHeader>
      <CardBody className="space-y-4">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`cursor-pointer rounded border-2 border-dashed p-6 text-center transition-colors ${
            dragOver ? "border-zinc-400 bg-zinc-50" : "border-zinc-200 hover:border-zinc-300"
          }`}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="mx-auto mb-2 h-6 w-6 text-zinc-400" />
          <p className="text-sm font-medium text-zinc-600">
            {uploading ? "Uploading..." : "Drop a file or click to upload"}
          </p>
          <p className="mt-1 text-xs text-zinc-400">Max 100MB per file</p>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f); }}
          />
        </div>

        {files.length === 0 && (
          <p className="text-center text-sm text-zinc-400">No files uploaded yet.</p>
        )}

        {files.map((file) => (
          <div key={file.id} className="flex items-center gap-3 rounded border border-zinc-100 p-3">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-zinc-100">
              <File className="h-4 w-4 text-zinc-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-zinc-900">{file.name}</p>
              <p className="text-xs text-zinc-400">
                {formatBytes(file.sizeBytes)} · {formatDate(file.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => toggleVisibility(file)}
                title={file.visibleToClient ? "Visible to client — click to hide" : "Hidden from client — click to show"}
                className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors ${
                  file.visibleToClient
                    ? "bg-green-50 text-green-600 hover:bg-green-100"
                    : "bg-zinc-100 text-zinc-400 hover:bg-zinc-200"
                }`}
              >
                {file.visibleToClient
                  ? <><Eye className="h-3.5 w-3.5" /> Client can see</>
                  : <><EyeOff className="h-3.5 w-3.5" /> Hidden</>
                }
              </button>
              <a
                href={`/api/files/${projectId}/${encodeURIComponent(file.name)}`}
                download={file.name}
                className="rounded p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
              >
                <Download className="h-4 w-4" />
              </a>
              <button
                onClick={() => deleteFile(file)}
                className="rounded p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
