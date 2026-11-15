const databaseUrl = process.env.DATABASE_URL;
const directUrl = process.env.DIRECT_URL;

if (!databaseUrl?.startsWith("postgresql://")) {
  throw new Error("DATABASE_URL phải là connection string PostgreSQL của Neon.");
}

if (!directUrl?.startsWith("postgresql://")) {
  throw new Error("DIRECT_URL phải là connection string PostgreSQL trực tiếp của Neon.");
}
