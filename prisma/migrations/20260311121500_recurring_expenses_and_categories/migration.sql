CREATE TABLE "ExpenseCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ExpenseCategory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "RecurringExpense" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'other',
    "frequency" TEXT NOT NULL DEFAULT 'monthly',
    "nextDate" DATETIME NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RecurringExpense_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

ALTER TABLE "Expense" ADD COLUMN "recurringExpenseId" TEXT REFERENCES "RecurringExpense" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE UNIQUE INDEX "ExpenseCategory_userId_name_key" ON "ExpenseCategory"("userId", "name");
