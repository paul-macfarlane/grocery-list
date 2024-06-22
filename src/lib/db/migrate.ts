import { migrate } from "drizzle-orm/libsql/migrator";
import { drizzle } from "drizzle-orm/libsql";
import "dotenv/config";
import { createClient } from "@libsql/client";

async function runMigration(): Promise<void> {
  const client = createClient({
    url: process.env.TURSO_CONNECTION_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });

  const db = drizzle(client);
  await migrate(db, { migrationsFolder: "./drizzle" });

  client.close();
}

void runMigration();
