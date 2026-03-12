import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, BookmarkPlus, FileText, Layers, SquarePen } from "lucide-react";
import db from "@/lib/db";
import { getSession } from "@/lib/session";
import { TEMPLATE_GALLERY, isBuilderDocument, parseTemplateContent } from "@/lib/template-builder";
import { formatDate } from "@/lib/utils";

const TYPE_LABELS = {
  proposal: "Proposal",
  contract: "Contract",
  questionnaire: "Questionnaire",
  invoice: "Invoice",
};

function getTemplateBuilderHref(template) {
  if (template.id.startsWith("sys-")) return `/templates/builder?preset=${template.id}`;
  if (template.id.startsWith("gallery-")) return `/templates/builder?type=${template.type}`;
  return `/templates/builder?templateId=${template.id}`;
}

function getTemplateMeta(template) {
  const content = parseTemplateContent(template.content);

  if (isBuilderDocument(content)) {
    const pages = Array.isArray(content.pages) ? content.pages.length : 0;
    const blocks = Array.isArray(content.pages)
      ? content.pages.reduce((total, page) => total + (Array.isArray(page.blocks) ? page.blocks.length : 0), 0)
      : 0;

    return {
      pageCount: pages,
      blockCount: blocks,
      description: template.description || "Custom builder template",
    };
  }

  return {
    pageCount: template.pages || 1,
    blockCount: Array.isArray(template.includes) ? template.includes.length : 0,
    description: template.description || "Reusable template",
  };
}

export default async function TemplateDetailPage({ params }) {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const { id } = await params;
  const galleryTemplate = TEMPLATE_GALLERY.find((template) => template.id === id) || null;
  const savedTemplate = galleryTemplate ? null : await db.template.findFirst({
    where: { id, userId: session.user.id },
  });

  const template = galleryTemplate || savedTemplate;
  if (!template) notFound();

  const meta = getTemplateMeta(template);
  const builderHref = getTemplateBuilderHref(template);
  const isSaved = !galleryTemplate;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/templates" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900">
          <ArrowLeft className="h-4 w-4" />
          Templates
        </Link>
        <span className="text-zinc-300">/</span>
        <span className="text-sm font-medium text-zinc-900">{template.name}</span>
      </div>

      <div className="rounded border border-zinc-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-700">
              {TYPE_LABELS[template.type] || "Template"}
            </span>
            <div>
              <h1 className="text-2xl font-semibold text-zinc-900">{template.name}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">{meta.description}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={builderHref}
              className="inline-flex items-center gap-2 rounded bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700"
            >
              <SquarePen className="h-4 w-4" />
              Open in builder
            </Link>
            <Link
              href="/templates"
              className="inline-flex items-center gap-2 rounded border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Back to templates
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded border border-zinc-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Library</p>
          <p className="mt-2 text-sm font-medium text-zinc-900">{isSaved ? "My Templates" : "Gallery"}</p>
        </div>
        <div className="rounded border border-zinc-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Pages</p>
          <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-zinc-900">
            <Layers className="h-4 w-4 text-zinc-400" />
            {meta.pageCount}
          </p>
        </div>
        <div className="rounded border border-zinc-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Blocks / Includes</p>
          <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-zinc-900">
            <BookmarkPlus className="h-4 w-4 text-zinc-400" />
            {meta.blockCount}
          </p>
        </div>
      </div>

      <div className="rounded border border-zinc-200 bg-white p-6">
        <div className="mb-5">
          <h2 className="text-sm font-semibold text-zinc-900">Template overview</h2>
          <p className="mt-1 text-sm text-zinc-500">Quick summary of this template before you open it in the builder.</p>
        </div>

        {Array.isArray(template.includes) && template.includes.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {template.includes.map((item) => (
              <span key={item} className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-600">
                {item}
              </span>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-zinc-900">
              <FileText className="h-4 w-4 text-zinc-400" />
              {TYPE_LABELS[template.type] || "Template"} document
            </div>
            <p className="text-sm text-zinc-500">
              {isSaved ? `Saved ${formatDate(template.createdAt)}` : "Built-in template ready to customize."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
