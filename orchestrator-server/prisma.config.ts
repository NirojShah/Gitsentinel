import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// Read the database url directly from process.env if Node's native loader has it parsed, 
// otherwise fall back to the Prisma configuration lookup engine.
const dbUrl = process.env.DATABASE_URL || env("DATABASE_URL");

console.log({ dbUrl })

export default defineConfig({
  schema: "prisma/schema",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // 💡 Hardcoding your local Docker address solves Prisma 7 Studio parsing bugs instantly
    url: dbUrl,
  },
});