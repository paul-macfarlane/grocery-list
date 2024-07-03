import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const userSessions = sqliteTable("user_sessions", {
  id: text("id", { length: 256 }).primaryKey().notNull(),
  userId: text("user_id", { length: 256 })
    .notNull()
    .references(() => users.id),
  csrfToken: text("csrf_token", { length: 256 }).notNull(),
  authProvider: text("auth_provider", { length: 64 }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
});

export const users = sqliteTable("users", {
  id: text("id", { length: 256 }).primaryKey().notNull(),
  authProvider: text("auth_provider", { length: 64 }).notNull(),
  email: text("email", { length: 256 }).notNull(),
  firstName: text("first_name", { length: 256 }).notNull(),
  lastName: text("last_name", { length: 256 }).notNull(),
  profilePicUrl: text("profile_pic_url", { length: 256 }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date()),
});

export const groceryLists = sqliteTable("grocery_lists", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title", { length: 256 }).notNull(),
  createdByUserId: text("created_by_user_id", { length: 256 })
    .notNull()
    .references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date()),
});

export const groceryListItems = sqliteTable("grocery_list_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  groceryListId: integer("grocery_list_id")
    .notNull()
    .references(() => groceryLists.id),
  name: text("name", { length: 256 }).notNull(),
  quantity: integer("quantity"),
  notes: text("notes"),
  link: text("link"),
  createdByUserId: text("created_by_user_id", { length: 256 })
    .notNull()
    .references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date()),
});
