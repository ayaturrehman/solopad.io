import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { requirePermission } from "@/lib/permissions";
import { NextResponse } from "next/server";

const taskSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable(),
  priority: z.enum(["low", "medium", "high"]),
  dueDateDaysFromNow: z.number().int().min(0).max(365).nullable()
    .describe("How many days from today the task should be due. null if no clear deadline."),
  subtasks: z.array(
    z.object({
      title: z.string().min(1),
    })
  ).max(10),
});

export async function POST(req) {
  const { session, error, status: permStatus } = await requirePermission("manage_tasks");
  if (error) return NextResponse.json({ error }, { status: permStatus });

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OPENAI_API_KEY is missing." }, { status: 500 });
  }

  const body = await req.json();
  const { description } = body ?? {};

  if (!description?.trim()) {
    return NextResponse.json({ error: "Description is required." }, { status: 400 });
  }

  const today = new Date().toISOString().split("T")[0];

  try {
    const { object } = await generateObject({
      model: openai("gpt-5-mini"),
      schema: taskSchema,
      schemaName: "task_breakdown",
      schemaDescription: "A practical task breakdown with subtasks, priority and due date for a freelancer.",
      system: `You are a project planning assistant for freelancers. Today's date is ${today}.
Break down work into a clear, actionable task with practical subtasks.
- Set priority based on urgency and scope (high = critical/urgent, medium = normal, low = nice-to-have)
- Set dueDateDaysFromNow based on realistic scope: small tasks 1-3 days, medium 3-7 days, large 7-30 days
- Subtasks should be concrete, specific, completable steps (3-7 subtasks for complex work)
- If the work is simple and doesn't need subtasks, return an empty subtasks array
- Keep titles concise and actionable`,
      prompt: `Break down this work into a task:\n\n${description.trim()}`,
    });

    // Convert dueDateDaysFromNow to an actual date string
    let dueDate = null;
    if (object.dueDateDaysFromNow !== null) {
      const due = new Date();
      due.setDate(due.getDate() + object.dueDateDaysFromNow);
      dueDate = due.toISOString().split("T")[0];
    }

    return NextResponse.json({
      task: {
        title: object.title,
        description: object.description || "",
        priority: object.priority,
        dueDate,
        subtasks: object.subtasks.map((s) => ({
          id: `subtask-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          title: s.title,
          done: false,
        })),
      },
    });
  } catch (err) {
    console.error("[AI] Task generation failed:", err);
    return NextResponse.json({ error: "Failed to generate task." }, { status: 500 });
  }
}
