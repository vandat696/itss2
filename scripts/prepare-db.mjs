import { closeSync, mkdirSync, openSync } from "node:fs";
import { dirname, resolve } from "node:path";

// Prisma's Windows engine may fail to migrate a SQLite file that does not exist.
// Create it exclusively; existing databases and their contents stay untouched.
const url = process.env.DATABASE_URL;
if (!url?.startsWith("file:")) throw new Error("DATABASE_URL cần là đường dẫn SQLite file:.");
const path = resolve("prisma", url.slice(5).split("?")[0]);
mkdirSync(dirname(path), { recursive: true });
try { closeSync(openSync(path, "wx")); }
catch (error) { if (error.code !== "EEXIST") throw error; }
