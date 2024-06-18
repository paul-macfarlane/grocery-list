import type { PageServerLoad } from "./$types";
import { getUserForSession } from "$lib/repository/userSessions";
import { redirect } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ cookies }) => {
  const user = await getUserForSession(cookies);
  if (!user) {
    throw redirect(302, "/");
  }

  return {
    user,
  };
};
