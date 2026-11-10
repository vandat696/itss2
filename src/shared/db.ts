import { PrismaClient } from "@prisma/client";

const runtime = globalThis as typeof globalThis & { careerDb?: PrismaClient };
export const db = runtime.careerDb ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") runtime.careerDb = db;
