import type { Actions } from "./$types";
import { getUserForSessionOrRedirect } from "$lib/services/users";
import { fail, redirect } from "@sveltejs/kit";
import {
  deleteGroceryList,
  duplicateGroceryList,
  getGroceryListByIdAndCreator,
} from "$lib/services/groceryList";
import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";
import { ApplicationError } from "$lib/types/errors";
import { validateAndTransformStrToNum } from "$lib/validators/common";

export const load: PageServerLoad = async ({ cookies, params }) => {
  const user = await getUserForSessionOrRedirect(cookies);
  const validateRes = validateAndTransformStrToNum.safeParse(params.id);
  if (validateRes.error) {
    error(400, validateRes.error.errors.map((err) => err.message).join(","));
  }

  const groceryList = await getGroceryListByIdAndCreator(
    user.id,
    validateRes.data,
  );
  if (!groceryList) {
    error(404, "grocery list not found");
  }

  return {
    groceryList,
  };
};

export const actions = {
  delete: async ({ cookies, params }) => {
    const user = await getUserForSessionOrRedirect(cookies);
    const { data: groceryListId, error } =
      validateAndTransformStrToNum.safeParse(params.id);
    if (error) {
      return fail(400, { error });
    }

    await deleteGroceryList(user.id, groceryListId);

    redirect(302, "/lists");
  },

  duplicate: async ({ cookies, params }) => {
    const user = await getUserForSessionOrRedirect(cookies);
    const validateRes = validateAndTransformStrToNum.safeParse(params.id);
    if (validateRes.error) {
      return fail(400, {
        message: validateRes.error.errors.map((err) => err.message).join(","),
      });
    }

    try {
      await duplicateGroceryList(user.id, validateRes.data);
    } catch (e: unknown) {
      if (e instanceof ApplicationError) {
        return fail(e.code, {
          message: e.message,
        });
      }

      return fail(500, { message: "internal server error" });
    }

    redirect(302, "/lists");
  },
} satisfies Actions;
