import db from "@/lib/db";
import { ALL_STARTER_TEMPLATES } from "./starterTemplates";

/**
 * Seed default PDF templates for a user if they have none.
 * Safe to call multiple times — skips if templates already exist.
 */
export async function seedDefaultTemplates(userId) {
  const existing = await db.pdfTemplate.count({ where: { userId } });
  if (existing > 0) return false;

  await db.pdfTemplate.createMany({
    data: ALL_STARTER_TEMPLATES.map((t) => ({ ...t, userId })),
  });

  return true;
}
