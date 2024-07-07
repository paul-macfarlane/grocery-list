import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { deleteUserSession, getUserSession } from "$lib/services/users";

export const GET: RequestHandler = async ({ cookies }) => {
  const userSession = await getUserSession(cookies);
  if (userSession) {
    await deleteUserSession(userSession.id.toString(), cookies);
  }

  throw redirect(302, "/auth");
};
