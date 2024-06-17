import { defineConfig } from "drizzle-kit";
import "dotenv/config";

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    host: process.env.PG_HOST!,
    user: process.env.PG_USER!,
    password: process.env.PG_PASSWORD!,
    database: process.env.PG_DATABASE!,
    port: +process.env.PG_PORT!,
  },
});
