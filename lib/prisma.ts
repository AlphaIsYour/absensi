// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

declare global {
  // allow global `var` declarations
  var prisma: PrismaClient | undefined;
}

const prisma =
  global.prisma ||
  new PrismaClient({
    // log: ['query'], // Uncomment ini jika ingin melihat query SQL di console
  });

if (process.env.NODE_ENV !== "production") global.prisma = prisma;

export default prisma;
