import { users, userSessions } from "$lib/db/schema";
import { db } from "$lib/db";
import { randomBytes } from "crypto";
import { and, eq, ne } from "drizzle-orm";
import { type Cookies, redirect } from "@sveltejs/kit";
import {
  type UpdateUserInfo,
  type UserInfo,
  type UserSession,
} from "$lib/types/users";
import { z } from "zod";
import { ConflictError, NotFoundError } from "$lib/types/errors";

const adjectives = [
  "Brave",
  "Sunny",
  "Happy",
  "Eager",
  "Calm",
  "Bright",
  "Jolly",
  "Wise",
  "Clever",
  "Gentle",
  "Noble",
  "Swift",
  "Bold",
  "Shy",
  "Mighty",
  "Quick",
  "Fierce",
  "Vivid",
  "Proud",
  "Gentle",
];
const nouns = [
  "Tiger",
  "Sky",
  "River",
  "Mountain",
  "Lion",
  "Falcon",
  "Wolf",
  "Eagle",
  "Bear",
  "Hawk",
  "Panther",
  "Dolphin",
  "Fox",
  "Otter",
  "Deer",
  "Rabbit",
  "Turtle",
  "Cheetah",
  "Buffalo",
  "Leopard",
];

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateUsername(): string {
  const adjective = getRandomElement(adjectives);
  const noun = getRandomElement(nouns);
  const suffix = String(Math.floor(Math.random() * 1000000)).padStart(6, "0");
  return `${adjective}${noun}${suffix}`;
}

async function isUsernameTaken(username: string): Promise<boolean> {
  return !!(
    await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, username))
  ).length;
}

async function generateUniqueUsername(): Promise<string> {
  let username = "";
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 30;

  while (!isUnique && attempts < maxAttempts) {
    username = generateUsername();
    isUnique = !(await isUsernameTaken(username));
    attempts++;
  }

  return username;
}

export async function createUserSession(user: UserInfo): Promise<UserSession> {
  const sessionId = randomBytes(16).toString("hex");
  const csrfToken = randomBytes(16).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

  return db.transaction(async (tx) => {
    await tx
      .insert(users)
      .values({
        id: user.id,
        authProvider: user.authProvider,
        email: user.email,
        username: await generateUniqueUsername(),
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicUrl: user.profilePicUrl,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profilePicUrl: user.profilePicUrl,
        },
      });

    const userSession = await tx
      .insert(userSessions)
      .values({
        id: sessionId,
        userId: user.id,
        csrfToken,
        authProvider: user.authProvider,
        expiresAt,
      })
      .returning({
        id: userSessions.id,
        userId: userSessions.id,
        csrfToken: userSessions.csrfToken,
        authProvider: userSessions.authProvider,
        expiresAt: userSessions.expiresAt,
        createdAt: userSessions.createdAt,
      });

    return userSession[0];
  });
}

export async function getUserSession(
  cookies: Cookies,
): Promise<UserSession | null> {
  const sessionId = cookies.get("sessionId");
  if (!sessionId) {
    return null;
  }

  const userSessionRes = await db
    .select()
    .from(userSessions)
    .where(eq(userSessions.id, sessionId));
  if (!userSessionRes || !userSessionRes.length) {
    return null;
  }

  const userSession = userSessionRes[0];
  if (new Date() > userSession.expiresAt) {
    await deleteUserSession(sessionId, cookies);

    return null;
  }

  return userSession;
}

export async function deleteUserSession(
  sessionId: string,
  cookies: Cookies,
): Promise<void> {
  cookies.delete("sessionId", { path: "/", httpOnly: true });

  await db.delete(userSessions).where(eq(userSessions.id, sessionId));
}

export async function getUserForSessionOrRedirect(
  cookies: Cookies,
  redirectUrl = "/auth",
): Promise<UserInfo> {
  const user = await getUserForSession(cookies);
  if (!user) {
    redirect(302, redirectUrl);
  }

  return user;
}

export async function getUserForSession(
  cookies: Cookies,
): Promise<UserInfo | null> {
  const sessionId = cookies.get("sessionId");
  if (!sessionId) {
    return null;
  }

  const sessions = await db
    .select()
    .from(userSessions)
    .where(eq(userSessions.id, sessionId));
  if (!sessions || !sessions.length) {
    return null;
  }

  const userRes = await db
    .select()
    .from(users)
    .where(eq(users.id, sessions[0].userId));
  if (!userRes || !userRes.length) {
    return null;
  }

  return userRes[0];
}

type ParseUpdateUserFromFormDataRes = {
  data: UpdateUserInfo;
  errorMap: Map<string, string>;
};

export function parseUpdateUserFromFormData(
  formData: FormData,
): ParseUpdateUserFromFormDataRes {
  let username = "";
  const errorMap = new Map<string, string>();
  const usernameCheck = z
    .string()
    .min(8, "must be at least 8 characters long")
    .max(20, "must be 20 characters or less")
    .safeParse(formData.get("username")?.toString().trim());
  if (usernameCheck.success) {
    username = usernameCheck.data;
  } else {
    errorMap.set(
      `username`,
      usernameCheck.error.errors.map((err) => err.message).join(","),
    );
  }

  return {
    data: {
      username,
    },
    errorMap,
  };
}

export async function updateUser(
  userId: string,
  updateUser: UpdateUserInfo,
): Promise<void> {
  const userWithIdRes = await db
    .select()
    .from(users)
    .where(eq(users.id, userId));
  if (!userWithIdRes.length) {
    throw new NotFoundError("user");
  }

  const userWithUserNameRes = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.username, updateUser.username), ne(users.id, userId)));
  if (userWithUserNameRes.length) {
    throw new ConflictError("username already taken");
  }

  await db
    .update(users)
    .set({
      username: updateUser.username,
    })
    .where(eq(users.id, userId));
}
