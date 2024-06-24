import type { Actions } from "./$types";
import { z } from "zod";
import { fail } from "@sveltejs/kit";

// todo move this to a types file or something like that, then export it
type ShoppingListItem = {
  name: string;
  quantity: number | null;
  notes: string | null;
  link: string | null;
};

// todo move this to a types file or something like that, then export it
type ShoppingList = {
  title: string;
  items: ShoppingListItem[];
};

type ParseShoppingListFromFormRes = {
  data: ShoppingList;
  errorMap: Map<string, string>;
};

// don't love how complicated this parsing is, but atm don't have a simpler way to parse dynamically sized/attributed form data and coalescing empty strings to nulls
// todo this could use some unit tests
function parseShoppingListFromFormData(
  formData: FormData,
): ParseShoppingListFromFormRes {
  let response: ParseShoppingListFromFormRes = {
    data: {
      title: "",
      items: [],
    },
    errorMap: new Map<string, string>(),
  };

  const countCheck = z
    .string()
    .refine(
      (val) => {
        const parsed = parseInt(val, 10);
        return !isNaN(parsed) && parsed.toString() === val;
      },
      {
        message: "must be a number",
      },
    )
    .transform((val) => parseInt(val, 10))
    .safeParse(formData.get("count"));
  if (!countCheck.success) {
    throw new Error(
      `internal form data error: ${countCheck.error.errors.join(",")}`,
    );
  }

  const count = countCheck.data;
  const titleCheck = z
    .string({ message: "must exist as an input" })
    .min(1, "is required")
    .max(256, "cannot be more than 256 characters")
    .safeParse(formData.get("title"));
  if (titleCheck.success) {
    response.data.title = titleCheck.data;
  } else {
    response.errorMap.set("title", titleCheck.error.errors.join(","));
  }

  for (let i = 0; i < count; i++) {
    const nameCheck = z
      .string({ message: "must exist as an input" })
      .min(1, "is required")
      .max(256, "cannot be more than 256 characters")
      .safeParse(formData.get(`name${i}`));
    let name = "";
    if (nameCheck.success) {
      name = nameCheck.data;
    } else {
      response.errorMap.set(`name${i}`, nameCheck.error.errors.join(","));
    }

    const quantityCheck = z
      .string({ message: "must exist as an input" })
      .refine(
        (val) =>
          val === "" ||
          (!isNaN(parseInt(val, 10)) &&
            parseInt(val, 10).toString() === val &&
            parseInt(val, 10) > 0),
        {
          message: "must be a number greater than 0",
        },
      )
      .transform((val) => {
        if (val === null || val === "") {
          return null;
        }

        return parseInt(val, 10);
      })
      .safeParse(formData.get(`quantity${i}`));
    let quantity: number | null = null;
    if (quantityCheck.success) {
      quantity = quantityCheck.data;
    } else {
      response.errorMap.set(
        `quantity${i}`,
        quantityCheck.error.errors.join(","),
      );
    }

    const notesCheck = z
      .string({ message: "must be set" })
      .max(256, "cannot be more than 256 characters")
      .transform((val) => {
        if (val === "") {
          return null;
        }

        return val;
      })
      .safeParse(formData.get(`notes${i}`));
    let notes: string | null = null;
    if (notesCheck.success) {
      notes = notesCheck.data;
    } else {
      response.errorMap.set(`notes${i}`, notesCheck.error.errors.join(","));
    }

    const linkCheck = z
      .string({ message: "must be set" })
      .max(256, "cannot be more than 256 characters")
      .transform((val) => {
        if (val === "") {
          return null;
        }

        return val;
      })
      .safeParse(formData.get(`link${i}`));
    let link: string | null = null;
    if (linkCheck.success) {
      link = linkCheck.data;
    } else {
      response.errorMap.set(`link${i}`, linkCheck.error.errors.join(","));
    }

    response.data.items.push({
      name,
      quantity,
      notes,
      link,
    });
  }

  return response;
}

export const actions = {
  default: async (event) => {
    const formData = await event.request.formData();
    const res = parseShoppingListFromFormData(formData);
    if (res.errorMap.size > 0) {
      return fail(400, { errorMap: res.errorMap });
    }

    console.log(res.data);

    // todo insert data in db based on res.data
  },
} satisfies Actions;
