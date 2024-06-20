import { getUserForSession } from "$lib/services/userSessions";
import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "../../../.svelte-kit/types/src/routes/(app)/$types";

export const load: LayoutServerLoad = async ({ cookies }) => {
  const user = await getUserForSession(cookies);
  if (!user) {
    throw redirect(302, "/");
  }

  return {
    user,
  };
};
