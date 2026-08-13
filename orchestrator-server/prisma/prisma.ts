import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";
import pg from "pg"; // 👈 1. Import pg
import configureEnv from "../src/utility/env.config.js";

const rawEnv = process.env.NODE_ENV;

const curEnv: "prod" | "dev" | "test" =
  rawEnv === "prod" || rawEnv === "test" ? rawEnv : "dev";

configureEnv(curEnv)
// 👈 2. Create the pg Pool instance
const pool = new pg.Pool({ connectionString: process.env.DB_URL });

// 👈 3. Pass the pool instance to PrismaPg
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({
  adapter,
});