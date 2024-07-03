import { z } from "zod";
import { db } from "$lib/db";
import { groceryLists, groceryListItems } from "$lib/db/schema";
import type {
  CreateGroceryList,
  GroceryList,
  GroceryListItem,
} from "$lib/types/groceryList";
import { eq } from "drizzle-orm";

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
      .insert(groceryLists)
      .values({
        title: data.title,
        createdByUserId: userId,
      })
      .returning({
        id: groceryLists.id,
        title: groceryLists.title,
        createdByUserId: groceryLists.createdByUserId,
        createdAt: groceryLists.createdAt,
        updatedAt: groceryLists.updatedAt,
      });
    if (!groceryListRes.length) {
      throw new Error("error accessing created grocery list");
    }

    let items: GroceryListItem[] = [];
    if (data.items.length) {
      items = await tx
        .insert(groceryListItems)
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
          id: groceryListItems.id,
          groceryListId: groceryListItems.groceryListId,
          name: groceryListItems.name,
          quantity: groceryListItems.quantity,
          notes: groceryListItems.notes,
          link: groceryListItems.link,
          createdByUserId: groceryListItems.createdByUserId,
          createdAt: groceryListItems.createdAt,
          updatedAt: groceryListItems.updatedAt,
        });
      if (items.length !== data.items.length) {
        throw new Error("error accessing created grocery list items");
      }
    }

    return {
      id: groceryListRes[0].id,
      title: groceryListRes[0].title,
      createdByUserId: groceryListRes[0].createdByUserId,
      createdAt: groceryListRes[0].createdAt,
      updatedAt: groceryListRes[0].updatedAt,
      items,
    };
  });
}

export async function getGroceryListsByUserId(
  userId: string,
): Promise<GroceryList[]> {
  const rows = await db
    .select()
    .from(groceryLists)
    .innerJoin(
      groceryListItems,
      eq(groceryLists.id, groceryListItems.groceryListId),
    )
    .where(eq(groceryLists.createdByUserId, userId));

  const records = rows.reduce<Record<number, GroceryList>>((acc, row) => {
    if (!acc[row.grocery_lists.id]) {
      acc[row.grocery_lists.id] = {
        id: row.grocery_lists.id,
        title: row.grocery_lists.title,
        items: [],
        createdByUserId: row.grocery_lists.createdByUserId,
        createdAt: row.grocery_lists.createdAt,
        updatedAt: row.grocery_lists.updatedAt,
      };
    }

    acc[row.grocery_lists.id].items.push({
      id: row.grocery_list_items.id,
      groceryListId: row.grocery_list_items.groceryListId,
      name: row.grocery_list_items.name,
      quantity: row.grocery_list_items.quantity,
      notes: row.grocery_list_items.notes,
      link: row.grocery_list_items.link,
      createdByUserId: row.grocery_list_items.createdByUserId,
      createdAt: row.grocery_list_items.createdAt,
      updatedAt: row.grocery_list_items.updatedAt,
    });

    return acc;
  }, {});

  return Object.values(records);
}
