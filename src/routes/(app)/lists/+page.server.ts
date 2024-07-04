import type { PageServerLoad } from "./$types";
import { getUserForSession } from "$lib/services/userSessions";
import { redirect } from "@sveltejs/kit";
import { getGroceryListsByUserId } from "$lib/services/groceryList";

export const load: PageServerLoad = async ({ cookies }) => {
  const user = await getUserForSession(cookies);
  if (!user) {
    throw redirect(302, "/");
  }

  const groceryLists = await getGroceryListsByUserId(user.id);

  return {
    groceryLists,
  };
};