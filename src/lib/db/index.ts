import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { TURSO_CONNECTION_URL, TURSO_AUTH_TOKEN } from "$env/static/private";

const client = createClient({
  url: TURSO_CONNECTION_URL,
  authToken: TURSO_AUTH_TOKEN,
});

export const db = drizzle(client);
