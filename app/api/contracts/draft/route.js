import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { requirePermission } from "@/lib/permissions";
import { NextResponse } from "next/server";

const contractDraftSchema = z.object({
  title: z.string().min(1),
  clientName: z.string().nullable(),
  clientEmail: z.string().nullable(),
  clauses: z
    .array(
      z.object({
        heading: z.string().min(1),
        body: z.string().min(1),
      })
    )
    .min(3)
    .max(7),
  signatureName: z.string().nullable(),
});

export async function POST(req) {
  const { session, error, status: permStatus } = await requirePermission("manage_contracts");
  if (error) return NextResponse.json({ error }, { status: permStatus });

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is missing. Add it to enable AI drafting." },
      { status: 500 }
    );
  }

  const body = await req.json();
  const { requirements, projectTitle, clientName, clientEmail } = body ?? {};

  if (!requirements?.trim()) {
    return NextResponse.json({ error: "Requirements are required." }, { status: 400 });
  }

  const name = session.user.companyName || session.user.name || "Freelancer";

  try {
    const { object } = await generateObject({
      model: openai("gpt-5-mini"),
      schema: contractDraftSchema,
      schemaName: "contract_draft",
      schemaDescription:
        "A practical freelance service agreement draft with clear, professional clauses.",
      system: `You draft freelance service agreements for consultants, designers, developers, and solo studios. Write clear, professional contract clauses. Use plain language. Make clauses practical and realistic. Default clauses should cover scope, payment, IP, confidentiality, and termination.`,
      prompt: `Draft a service agreement from these requirements:

Requirements:
${requirements.trim()}

Known context:
- Freelancer: ${name}
- Project: ${projectTitle || "Not provided"}
- Client: ${clientName || "Unknown"}`,
    });

    return NextResponse.json({ draft: object });
  } catch (error) {
    console.error("Failed to draft contract", error);
    return NextResponse.json({ error: "Failed to draft contract." }, { status: 500 });
  }
}
