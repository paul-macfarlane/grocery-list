import { type Handle, redirect } from "@sveltejs/kit";
import { getUserSession } from "$lib/services/users";

export const handle: Handle = async ({ event, resolve }) => {
  const userSession = await getUserSession(event.cookies);

  const authedRoute =
    !event.url.pathname.startsWith("/auth") ||
    event.url.pathname === "/auth/logout";

  if (!authedRoute && userSession) {
    redirect(302, "/");
  }

  if (authedRoute && !userSession) {
    redirect(302, "/auth");
  }

  return resolve(event);
};
