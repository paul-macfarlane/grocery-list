import type { Actions } from "./$types";
import { getUserForSession } from "$lib/services/userSessions";
import { fail, redirect } from "@sveltejs/kit";
import { validateAndTransformStrToNum } from "$lib/services/validators";
import {
  deleteGroceryList,
  getGroceryListByIdAndCreator,
} from "$lib/services/groceryList";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ cookies, params }) => {
  const user = await getUserForSession(cookies);
  if (!user) {
    throw redirect(302, "/auth");
  }

  const { data: groceryListId, error } = validateAndTransformStrToNum.safeParse(
    params.id,
  );
  if (error) {
    throw fail(400, { error });
  }

  const groceryList = await getGroceryListByIdAndCreator(
    user.id,
    groceryListId,
  );

  return {
    groceryList,
  };
};

export const actions = {
  delete: async ({ cookies, params }) => {
    const user = await getUserForSession(cookies);
    if (!user) {
      throw redirect(302, "/auth");
    }

    const { data: groceryListId, error } =
      validateAndTransformStrToNum.safeParse(params.id);
    if (error) {
      return fail(400, { error });
    }

    await deleteGroceryList(user.id, groceryListId);

    throw redirect(302, "/lists");
  },
} satisfies Actions;
