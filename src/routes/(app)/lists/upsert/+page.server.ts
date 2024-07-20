import type { Actions } from "./$types";
import { fail } from "@sveltejs/kit";
import { upsertGroceryList } from "$lib/services/groceryList";
import { getUserForSessionOrRedirect } from "$lib/services/users";
import { safeParseFormGroceryList } from "$lib/validators/groceryList";

export const actions = {
  default: async (event) => {
    const user = await getUserForSessionOrRedirect(event.cookies);

    try {
      const formData = await event.request.formData();
      const res = safeParseFormGroceryList(formData);
      if (res.errorMap.size > 0) {
        return fail(400, { errorMap: res.errorMap });
      }

      await upsertGroceryList(res.data!, user.id);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e: unknown) {
      return fail(500, {
        errorMap: new Map<string, string>(),
        message: "internal server error",
      });
    }
  },
} satisfies Actions;
