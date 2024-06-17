import { pgTable, varchar, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const userSessions = pgTable("user_sessions", {
  id: varchar("id", { length: 256 }).primaryKey().notNull(),
  userId: varchar("user_id", { length: 256 }).notNull(),
  csrfToken: varchar("csrf_token", { length: 256 }).notNull(),
  authProvider: varchar("auth_provider", { length: 64 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

export const users = pgTable("users", {
  id: varchar("id", { length: 256 }).primaryKey().notNull(),
  authProvider: varchar("auth_provider", { length: 64 }).notNull(),
  email: varchar("email", { length: 256 }).notNull(),
  firstName: varchar("first_name", { length: 256 }).notNull(),
  lastName: varchar("last_name", { length: 256 }).notNull(),
  profilePicUrl: varchar("profile_pic_url", { length: 256 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
