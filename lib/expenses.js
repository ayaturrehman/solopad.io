import db from "@/lib/db";

export const DEFAULT_EXPENSE_CATEGORIES = [
  "software",
  "travel",
  "equipment",
  "contractor",
  "marketing",
  "other",
];

export const RECURRING_FREQUENCIES = {
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
};

export function supportsExtendedExpenseModels() {
  return Boolean(
    db?.recurringExpense?.findMany &&
    db?.expenseCategory?.findMany
  );
}

export function normalizeCategoryName(value) {
  return (value || "").trim().toLowerCase();
}

export function getExpenseCategoryOptions(customCategories = []) {
  return Array.from(
    new Set([
      ...DEFAULT_EXPENSE_CATEGORIES,
      ...customCategories.map((category) => normalizeCategoryName(category.name || category)),
    ])
  ).sort((a, b) => a.localeCompare(b));
}

export function getNextRecurringDate(date, frequency) {
  const next = new Date(date);

  if (frequency === "weekly") next.setDate(next.getDate() + 7);
  else if (frequency === "quarterly") next.setMonth(next.getMonth() + 3);
  else if (frequency === "yearly") next.setFullYear(next.getFullYear() + 1);
  else next.setMonth(next.getMonth() + 1);

  return next;
}

export async function syncRecurringExpenses(userId) {
  if (!supportsExtendedExpenseModels()) return;

  const dueRecurring = await db.recurringExpense.findMany({
    where: {
      userId,
      active: true,
      nextDate: { lte: new Date() },
    },
    orderBy: { nextDate: "asc" },
  });

  for (const recurring of dueRecurring) {
    let cursor = new Date(recurring.nextDate);
    const now = new Date();

    while (cursor <= now) {
      const existing = await db.expense.findFirst({
        where: {
          recurringExpenseId: recurring.id,
          date: cursor,
        },
        select: { id: true },
      });

      if (!existing) {
        await db.expense.create({
          data: {
            userId,
            recurringExpenseId: recurring.id,
            projectId: recurring.projectId,
            description: recurring.description,
            note: recurring.note,
            amount: recurring.amount,
            category: recurring.category,
            date: cursor,
          },
        });
      }

      cursor = getNextRecurringDate(cursor, recurring.frequency);
    }

    await db.recurringExpense.update({
      where: { id: recurring.id },
      data: { nextDate: cursor },
    });
  }
}
