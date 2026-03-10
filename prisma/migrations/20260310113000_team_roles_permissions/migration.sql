ALTER TABLE "User" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'owner';

ALTER TABLE "Task" ADD COLUMN "assigneeMemberId" TEXT;

CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'collaborator',
    "permissions" TEXT NOT NULL DEFAULT 'assign_tasks',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "TeamMember_userId_email_key" ON "TeamMember"("userId", "email");
CREATE INDEX "Task_assigneeMemberId_idx" ON "Task"("assigneeMemberId");
