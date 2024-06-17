import { users, userSessions } from "$lib/db/schema";
import { db } from "$lib/db";
import { randomBytes } from "crypto";

export type UserInfo = {
  id: string;
  authProvider: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePicUrl: string;
};

export type UserSession = {
  id: string;
  userId: string;
  csrfToken: string;
  authProvider: string;
  expiresAt: Date;
};

export async function createUserSession(user: UserInfo): Promise<UserSession> {
  const sessionId = randomBytes(16).toString("hex");
  const csrfToken = randomBytes(16).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

  return db.transaction(async (tx) => {
    const userSession = await tx
      .insert(userSessions)
      .values(
        {
          id: sessionId,
          userId: user.id,
          csrfToken,
          authProvider: user.authProvider,
          expiresAt,
        },
      )
      .returning({
        id: userSessions.id,
        userId: userSessions.id,
        csrfToken: userSessions.csrfToken,
        authProvider: userSessions.authProvider,
        expiresAt: userSessions.expiresAt,
        createdAt: userSessions.createdAt,
      });

    await tx
      .insert(users)
      .values(
        {
          id: user.id,
          authProvider: user.authProvider,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profilePicUrl: user.profilePicUrl,
        },
      )
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profilePicUrl: user.profilePicUrl,
        },
      });

    return userSession[0];
  });
}
