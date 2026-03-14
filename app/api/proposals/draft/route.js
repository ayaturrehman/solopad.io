import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { NextResponse } from "next/server";

const proposalDraftSchema = z.object({
  title: z.string().min(1),
  clientName: z.string().nullable(),
  clientEmail: z.string().nullable(),
  intro: z.string().min(1),
  sections: z
    .array(
      z.object({
        heading: z.string().min(1),
        body: z.string().min(1),
      })
    )
    .min(3)
    .max(5),
  pricing: z
    .array(
      z.object({
        description: z.string().min(1),
        amount: z.number().min(0),
      })
    )
    .min(2)
    .max(5),
  validUntilDays: z.number().int().min(3).max(60).nullable(),
  taxRate: z.number().min(0).max(100).nullable(),
});

export async function POST(req) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is missing. Add it to enable AI drafting." },
      { status: 500 }
    );
  }

  const body = await req.json();
  const { requirements, projectTitle, clientName, clientEmail, currency } = body ?? {};

  if (!requirements?.trim()) {
    return NextResponse.json({ error: "Requirements are required." }, { status: 400 });
  }

  try {
    const { object } = await generateObject({
      model: openai("gpt-5-mini"),
      schema: proposalDraftSchema,
      schemaName: "proposal_draft",
      schemaDescription:
        "A practical client proposal draft with clear scope sections and pricing rows.",
      system: `You draft freelance proposals for consultants, designers, developers, and solo studios.

Write in a practical, client-ready tone.
- Keep the language clear and direct.
- Do not use hype, filler, or legal jargon.
- Make the proposal feel realistic for real freelance work.
- Sections should be useful and concise.
- Pricing rows must be believable and specific.
- If client details are missing, return null for clientName/clientEmail.
- Return amounts as plain numbers, without currency symbols.
- validUntilDays should be a realistic expiry recommendation.`,
      prompt: `Draft a proposal from these requirements:

Requirements:
${requirements.trim()}

Known context:
- Freelancer/company: ${session.user.companyName || session.user.name || "Freelancer"}
- Project title: ${projectTitle || "Not provided"}
- Client name: ${clientName || "Unknown"}
- Client email: ${clientEmail || "Unknown"}
- Currency: ${currency || "USD"}`,
    });

    return NextResponse.json({ draft: object });
  } catch (error) {
    console.error("Failed to draft proposal", error);
    return NextResponse.json({ error: "Failed to draft proposal." }, { status: 500 });
  }
}
