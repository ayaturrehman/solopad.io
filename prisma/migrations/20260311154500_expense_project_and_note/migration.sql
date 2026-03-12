ALTER TABLE "Expense" ADD COLUMN "projectId" TEXT;
ALTER TABLE "Expense" ADD COLUMN "note" TEXT;

ALTER TABLE "RecurringExpense" ADD COLUMN "projectId" TEXT;
ALTER TABLE "RecurringExpense" ADD COLUMN "note" TEXT;
