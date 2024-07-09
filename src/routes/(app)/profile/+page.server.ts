import type { Actions } from "./$types";
import { fail } from "@sveltejs/kit";
import {
  getUserForSessionOrRedirect,
  parseUpdateUserFromFormData,
  updateUser,
} from "$lib/services/users";
import { ApplicationError } from "$lib/types/errors";

export const actions = {
  default: async (event) => {
    const user = await getUserForSessionOrRedirect(event.cookies);

    const formData = await event.request.formData();
    const parseRes = parseUpdateUserFromFormData(formData);
    if (parseRes.errorMap.size > 0) {
      return fail(400, {
        validationErrorMap: parseRes.errorMap,
        message: "validation error",
      });
    }

    try {
      await updateUser(user.id, parseRes.data);
    } catch (e: unknown) {
      if (e instanceof ApplicationError) {
        return fail(e.code, {
          validationErrorMap: new Map<string, string>(),
          message: e.message,
        });
      }

      return fail(500, {
        validationErrorMap: new Map<string, string>(),
        message: "internal server error",
      });
    }
  },
} satisfies Actions;
