import { migrate } from "drizzle-orm/node-postgres/migrator";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import "dotenv/config";

async function runMigration(): Promise<void> {
  const client = new pg.Client({
    host: process.env.PG_HOST,
    port: +process.env.PG_PORT!,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
  });

  await client.connect();

  const db = drizzle(client);

  await migrate(db, { migrationsFolder: "./drizzle" });

  await client.end();
}

void runMigration();
