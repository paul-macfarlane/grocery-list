import type { Actions } from "./$types";
import { fail } from "@sveltejs/kit";
import {
  upsertGroceryList,
  parseGroceryListFromFormData,
} from "$lib/services/groceryList";
import { getUserForSessionOrRedirect } from "$lib/services/users";

export const actions = {
  default: async (event) => {
    const user = await getUserForSessionOrRedirect(event.cookies);

    const formData = await event.request.formData();
    const res = parseGroceryListFromFormData(formData);
    if (res.errorMap.size > 0) {
      return fail(400, { errorMap: res.errorMap });
    }

    await upsertGroceryList(res.data, user.id);
  },
} satisfies Actions;
