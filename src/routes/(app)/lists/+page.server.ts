import type { PageServerLoad } from "./$types";
import { getUserForSessionOrRedirect } from "$lib/services/users";
import { getMinifiedGroceryListsByCreator } from "$lib/services/groceryList";

export const load: PageServerLoad = async ({ cookies }) => {
  const user = await getUserForSessionOrRedirect(cookies);

  const groceryLists = await getMinifiedGroceryListsByCreator(user.id);

  return {
    groceryLists,
  };
};
