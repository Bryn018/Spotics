import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __spoticsPrisma: PrismaClient | undefined;
}

export const db =
  global.__spoticsPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.__spoticsPrisma = db;
}
