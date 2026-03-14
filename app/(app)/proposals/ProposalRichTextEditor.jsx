"use client";

import { useEffect, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import { Table } from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Eraser,
  Heading2,
  Heading3,
  Highlighter,
  Italic,
  Link2,
  List,
  ListOrdered,
  Pilcrow,
  Underline as UnderlineIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { richTextToHtml } from "./richText";

const COLORS = ["#18181b", "#2563eb", "#0f766e", "#b45309", "#be123c"];

function ToolbarButton({ active, onClick, title, children }) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      className={cn(
        "inline-flex h-7 w-7 items-center justify-center rounded transition-colors",
        active ? "bg-zinc-950 text-white" : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
      )}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="mx-1 h-5 w-px bg-zinc-200" />;
}

// Exported standalone toolbar — pass any Tiptap editor instance
export function RichTextToolbar({ editor }) {
  if (!editor) return null;

  function setLink() {
    const prev = editor.getAttributes("link").href || "";
    const url = window.prompt("Enter link URL", prev);
    if (url === null) return;
    if (!url.trim()) { editor.chain().focus().extendMarkRange("link").unsetLink().run(); return; }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  }

  return (
    <div className="flex flex-wrap items-center gap-0.5">
      <ToolbarButton title="Paragraph" active={editor.isActive("paragraph")} onClick={() => editor.chain().focus().setParagraph().run()}><Pilcrow className="h-3.5 w-3.5" /></ToolbarButton>
      <ToolbarButton title="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 className="h-3.5 w-3.5" /></ToolbarButton>
      <ToolbarButton title="Heading 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 className="h-3.5 w-3.5" /></ToolbarButton>
      <ToolbarDivider />
      <ToolbarButton title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><Bold className="h-3.5 w-3.5" /></ToolbarButton>
      <ToolbarButton title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic className="h-3.5 w-3.5" /></ToolbarButton>
      <ToolbarButton title="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}><UnderlineIcon className="h-3.5 w-3.5" /></ToolbarButton>
      <ToolbarDivider />
      {COLORS.map((color) => (
        <button key={color} type="button" title={`Color ${color}`} onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setColor(color).run(); }} className="h-5 w-5 rounded-full border border-white/80 shadow-sm transition-transform hover:scale-105" style={{ backgroundColor: color }} />
      ))}
      <ToolbarButton title="Highlight" active={editor.isActive("highlight")} onClick={() => editor.chain().focus().toggleHighlight({ color: "#fef08a" }).run()}><Highlighter className="h-3.5 w-3.5" /></ToolbarButton>
      <ToolbarDivider />
      <ToolbarButton title="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}><List className="h-3.5 w-3.5" /></ToolbarButton>
      <ToolbarButton title="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered className="h-3.5 w-3.5" /></ToolbarButton>
      <ToolbarDivider />
      <ToolbarButton title="Align left" active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()}><AlignLeft className="h-3.5 w-3.5" /></ToolbarButton>
      <ToolbarButton title="Align center" active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()}><AlignCenter className="h-3.5 w-3.5" /></ToolbarButton>
      <ToolbarButton title="Align right" active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()}><AlignRight className="h-3.5 w-3.5" /></ToolbarButton>
      <ToolbarDivider />
      <ToolbarButton title="Link" active={editor.isActive("link")} onClick={setLink}><Link2 className="h-3.5 w-3.5" /></ToolbarButton>
      <ToolbarDivider />
      <ToolbarButton title="Clear formatting" active={false} onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().setParagraph().setTextAlign("left").run()}><Eraser className="h-3.5 w-3.5" /></ToolbarButton>
    </div>
  );
}

export default function ProposalRichTextEditor({
  value,
  onChange,
  placeholder = "Write here…",
  minHeightClassName = "min-h-[160px]",
  noToolbar = false,
  onEditorFocus = null,
  onEditorBlur = null,
}) {
  const [focused, setFocused] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" } }),
    ],
    content: richTextToHtml(value),
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
    onFocus: ({ editor: e }) => { setFocused(true); onEditorFocus?.(e); },
    onBlur: () => { setFocused(false); onEditorBlur?.(); },
    editorProps: {
      attributes: {
        class: cn("proposal-rich-text proposal-rich-text-editor px-0 py-0 text-[13px] leading-relaxed text-zinc-700 focus:outline-none", minHeightClassName),
        "data-placeholder": placeholder,
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const next = richTextToHtml(value);
    if (current !== next) editor.commands.setContent(next, { emitUpdate: false });
  }, [editor, value]);

  if (!editor) return null;

  return (
    <div className={cn("transition-colors", focused && !noToolbar ? "ring-1 ring-blue-200 rounded" : "")}>
      {!noToolbar && (
        <div className={cn("flex flex-wrap items-center gap-1 border border-zinc-200 rounded bg-zinc-50/80 px-2 py-1.5 mb-1", !focused && "hidden")}>
          <RichTextToolbar editor={editor} />
        </div>
      )}
      <EditorContent editor={editor} />
      <style>{`
        .proposal-rich-text p.is-editor-empty:first-child::before {
          color: #a1a1aa;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
        .proposal-rich-text p + p,
        .proposal-rich-text ul + p,
        .proposal-rich-text ol + p,
        .proposal-rich-text p + ul,
        .proposal-rich-text p + ol,
        .proposal-rich-text h2 + p,
        .proposal-rich-text h3 + p { margin-top: 0.75rem; }
        .proposal-rich-text ul, .proposal-rich-text ol { margin: 0.75rem 0; padding-left: 1.5rem; }
        .proposal-rich-text ul { list-style: disc; }
        .proposal-rich-text ol { list-style: decimal; }
        .proposal-rich-text li + li { margin-top: 0.25rem; }
        .proposal-rich-text h2, .proposal-rich-text h3 { color: #09090b; font-weight: 600; letter-spacing: -0.02em; }
        .proposal-rich-text h2 { font-size: 1.2rem; line-height: 1.3; margin-top: 0.25rem; }
        .proposal-rich-text h3 { font-size: 1rem; line-height: 1.35; margin-top: 0.25rem; }
        .proposal-rich-text a { color: #2563eb; text-decoration: underline; text-decoration-thickness: 1.5px; text-underline-offset: 2px; }
        .proposal-rich-text table { display: block; width: max-content; min-width: 100%; max-width: 100%; margin: 0.75rem 0; overflow-x: auto; border-collapse: collapse; }
        .proposal-rich-text th, .proposal-rich-text td { min-width: 120px; border: 1px solid #e4e4e7; padding: 0.5rem 0.75rem; vertical-align: top; }
        .proposal-rich-text th { background: #f4f4f5; color: #09090b; font-weight: 600; }
        .proposal-rich-text td p, .proposal-rich-text th p { margin: 0; }
        .proposal-rich-text-editor { white-space: normal; }
      `}</style>
    </div>
  );
}
