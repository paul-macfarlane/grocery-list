import type { Actions } from "./$types";
import { fail, redirect } from "@sveltejs/kit";
import {
  upsertGroceryList,
  parseGroceryListFromFormData,
} from "$lib/services/groceryList";
import { getUserForSession } from "$lib/services/userSessions";

export const actions = {
  default: async (event) => {
    const user = await getUserForSession(event.cookies);
    if (!user) {
      throw redirect(302, "/auth");
    }

    const formData = await event.request.formData();
    const res = parseGroceryListFromFormData(formData);
    if (res.errorMap.size > 0) {
      return fail(400, { errorMap: res.errorMap });
    }

    await upsertGroceryList(res.data, user.id);
  },
} satisfies Actions;
