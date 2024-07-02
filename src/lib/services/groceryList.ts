import { z } from "zod";
import { db } from "$lib/db";
import { groceryList, groceryListItem } from "$lib/db/schema";
import type { CreateGroceryList, GroceryList } from "$lib/types/groceryList";

type ParseShoppingListFromFormRes = {
  data: CreateGroceryList;
  errorMap: Map<string, string>;
};

// don't love how complicated this parsing is
// but atm don't have a simpler way to parse dynamically sized/attributed form data and coalescing empty strings to nulls
// todo this could use some unit tests
export function parseGroceryListFromFormData(
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

export async function createGroceryList(
  data: CreateGroceryList,
  userId: string,
): Promise<GroceryList> {
  return db.transaction(async (tx) => {
    const groceryListRes = await tx
      .insert(groceryList)
      .values({
        title: data.title,
        createdByUserId: userId,
      })
      .returning({
        id: groceryList.id,
        title: groceryList.title,
        createdByUserId: groceryList.createdByUserId,
        createdAt: groceryList.createdAt,
        updatedAt: groceryList.updatedAt,
      });
    if (!groceryListRes.length) {
      throw new Error("error accessing created grocery list");
    }

    const groceryListItemsRes = await tx
      .insert(groceryListItem)
      .values(
        data.items.map((item) => ({
          groceryListId: groceryListRes[0].id,
          name: item.name,
          quantity: item.quantity,
          notes: item.notes,
          link: item.link,
          createdByUserId: userId,
        })),
      )
      .returning({
        id: groceryListItem.id,
        groceryListId: groceryListItem.groceryListId,
        name: groceryListItem.name,
        quantity: groceryListItem.quantity,
        notes: groceryListItem.notes,
        link: groceryListItem.link,
        createdByUserId: groceryListItem.createdByUserId,
        createdAt: groceryListItem.createdAt,
        updatedAt: groceryListItem.updatedAt,
      });
    if (groceryListItemsRes.length !== data.items.length) {
      throw new Error("error accessing created grocery list items");
    }

    return {
      id: groceryListRes[0].id,
      title: groceryListRes[0].title,
      createdByUserId: groceryListRes[0].createdByUserId,
      createdAt: groceryListRes[0].createdAt,
      updatedAt: groceryListRes[0].updatedAt,
      items: groceryListItemsRes,
    };
  });
}
