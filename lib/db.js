import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;
const PRISMA_CLIENT_TAG = "contacts-schema-2026-03-13-v2";

if (globalForPrisma.prisma && globalForPrisma.prismaClientTag !== PRISMA_CLIENT_TAG) {
  globalForPrisma.prisma.$disconnect().catch(() => {});
  globalForPrisma.prisma = undefined;
}

const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
  globalForPrisma.prismaClientTag = PRISMA_CLIENT_TAG;
}

export default db;
