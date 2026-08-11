import "dotenv/config";
import { defineConfig, env } from "prisma/config";
import configureEnv from "./src/utility/env.config.js";

const rawEnv = process.env.NODE_ENV;
const curEnv: "prod" | "dev" | "test" =
  rawEnv === "prod" || rawEnv === "test" ? rawEnv : "dev";

configureEnv(curEnv)


// Read the database url directly from process.env if Node's native loader has it parsed, 
// otherwise fall back to the Prisma configuration lookup engine.
const dbUrl = process.env.DB_URL;

console.log({ dbUrl })

export default defineConfig({
  schema: "prisma/schema",
  datasource: {
    // 💡 Hardcoding your local Docker address solves Prisma 7 Studio parsing bugs instantly
    url: dbUrl,
  },
});