import { type Handle, redirect } from "@sveltejs/kit";
import { getUserSession } from "$lib/services/users";

export const handle: Handle = async ({ event, resolve }) => {
  const userSession = await getUserSession(event.cookies);

  const authedRoute =
    !event.url.pathname.startsWith("/auth") ||
    event.url.pathname === "/auth/logout";

  if (!authedRoute && userSession) {
    console.log("redirecting user already authed");
    throw redirect(302, "/");
  }

  if (authedRoute && !userSession) {
    console.log("redirecting user not authed");
    throw redirect(302, "/auth");
  }

  return resolve(event);
};
