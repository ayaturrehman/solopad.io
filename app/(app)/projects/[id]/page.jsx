export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/session";
import db from "@/lib/db";
import ProjectHeader from "./ProjectHeader";
import FilesSection from "./FilesSection";
import CommentsSection from "./CommentsSection";
import InvoiceSection from "./InvoiceSection";

export default async function ProjectPage({ params }) {
  const { id } = await params;
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const project = await db.project.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!project) redirect("/dashboard");

  const [files, comments, invoices] = await Promise.all([
    db.file.findMany({ where: { projectId: id }, orderBy: { createdAt: "desc" } }),
    db.comment.findMany({ where: { projectId: id }, orderBy: { createdAt: "asc" } }),
    db.invoice.findMany({ where: { projectId: id }, orderBy: { createdAt: "desc" } }),
  ]);

  const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/p/${project.portalToken}`;

  return (
    <div>
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900"
      >
        <ArrowLeft className="h-4 w-4" />
        All projects
      </Link>

      <ProjectHeader project={project} portalUrl={portalUrl} />

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <FilesSection projectId={id} files={files} />
          <CommentsSection projectId={id} comments={comments} isFreelancer={true} authorName="You" />
        </div>
        <div>
          <InvoiceSection projectId={id} invoices={invoices} />
        </div>
      </div>
    </div>
  );
}
