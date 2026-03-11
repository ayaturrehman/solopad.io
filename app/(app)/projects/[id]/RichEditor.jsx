"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, CheckSquare,
  Link2, Image as ImageIcon, RemoveFormatting,
  Highlighter, Type,
} from "lucide-react";
import { useRef } from "react";

const COLORS = ["#111827", "#dc2626", "#d97706", "#16a34a", "#2563eb", "#7c3aed", "#db2777"];

function ToolbarBtn({ onClick, active, title, children }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className={`flex h-7 w-7 items-center justify-center rounded text-sm transition-colors ${
        active ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-100"
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="mx-1 h-5 w-px bg-zinc-200" />;
}

export default function RichEditor({ value, onChange, placeholder = "Write your note…" }) {
  const imgInputRef = useRef(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Link.configure({ openOnClick: false }),
      Image,
    ],
    content: value || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          "min-h-[160px] px-4 py-3 text-sm leading-6 text-zinc-700 focus:outline-none prose prose-sm max-w-none",
      },
    },
  });

  if (!editor) return null;

  function setLink() {
    const url = window.prompt("Enter URL", editor.getAttributes("link").href);
    if (url === null) return;
    if (url === "") { editor.chain().focus().extendMarkRange("link").unsetLink().run(); return; }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  function insertImage() {
    imgInputRef.current?.click();
  }

  function handleImageFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      editor.chain().focus().setImage({ src: ev.target.result }).run();
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  return (
    <div className="overflow-hidden rounded border border-zinc-200 bg-white">
      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-zinc-200 bg-zinc-50 px-2 py-1.5">
        {/* font size hint */}
        <span className="mr-1 text-xs text-zinc-400">14</span>
        <Divider />

        <ToolbarBtn active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold">
          <Bold className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic">
          <Italic className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline">
          <UnderlineIcon className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()} title="Strikethrough">
          <Strikethrough className="h-3.5 w-3.5" />
        </ToolbarBtn>

        <Divider />

        {/* text color */}
        <div className="relative flex items-center gap-0.5">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setColor(c).run(); }}
              title={c}
              className="h-4 w-4 rounded-sm border border-zinc-300 transition-transform hover:scale-110"
              style={{ background: c }}
            />
          ))}
        </div>

        <Divider />

        {/* highlight */}
        <ToolbarBtn active={editor.isActive("highlight")} onClick={() => editor.chain().focus().toggleHighlight({ color: "#fef08a" }).run()} title="Highlight">
          <Highlighter className="h-3.5 w-3.5" />
        </ToolbarBtn>

        <Divider />

        {/* alignment */}
        <ToolbarBtn active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()} title="Align left">
          <AlignLeft className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()} title="Align center">
          <AlignCenter className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()} title="Align right">
          <AlignRight className="h-3.5 w-3.5" />
        </ToolbarBtn>

        <Divider />

        {/* lists */}
        <ToolbarBtn active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet list">
          <List className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numbered list">
          <ListOrdered className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn active={editor.isActive("taskList")} onClick={() => editor.chain().focus().toggleTaskList().run()} title="Checklist">
          <CheckSquare className="h-3.5 w-3.5" />
        </ToolbarBtn>

        <Divider />

        <ToolbarBtn active={editor.isActive("link")} onClick={setLink} title="Link">
          <Link2 className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn active={false} onClick={insertImage} title="Insert image">
          <ImageIcon className="h-3.5 w-3.5" />
        </ToolbarBtn>

        <Divider />

        <ToolbarBtn active={false} onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} title="Clear formatting">
          <RemoveFormatting className="h-3.5 w-3.5" />
        </ToolbarBtn>
      </div>

      {/* editor area */}
      <EditorContent editor={editor} />

      {/* hidden file input for images */}
      <input ref={imgInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageFile} />

      <style>{`
        .tiptap ul[data-type="taskList"] { list-style: none; padding-left: 0; }
        .tiptap ul[data-type="taskList"] li { display: flex; align-items: flex-start; gap: 0.5rem; }
        .tiptap ul[data-type="taskList"] li > label { display: flex; align-items: center; margin-top: 2px; }
        .tiptap ul[data-type="taskList"] li > label input { margin: 0; }
        .tiptap ul[data-type="taskList"] li > div { flex: 1; }
        .tiptap ul { list-style: disc; padding-left: 1.25rem; }
        .tiptap ol { list-style: decimal; padding-left: 1.25rem; }
        .tiptap a { color: #2563eb; text-decoration: underline; }
        .tiptap img { max-width: 100%; border-radius: 4px; margin: 0.5rem 0; }
        .tiptap p.is-editor-empty:first-child::before { color: #9ca3af; content: attr(data-placeholder); float: left; height: 0; pointer-events: none; }
      `}</style>
    </div>
  );
}
