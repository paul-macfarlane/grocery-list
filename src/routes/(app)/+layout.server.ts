import { getUserForSession } from "$lib/services/userSessions";
import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ cookies, url }) => {
  const user = await getUserForSession(cookies);
  if (!user) {
    throw redirect(302, "/auth");
  }

  return {
    user,
    pathname: url.pathname,
  };
};
