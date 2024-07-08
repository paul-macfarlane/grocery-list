import { z } from "zod";
import { db } from "$lib/db";
import {
  groceryLists,
  groceryListItems,
  groceryListGroups,
} from "$lib/db/schema";
import type {
  GroceryList,
  GroceryListItemGroup,
  GroceryListMinified,
  UpsertGroceryList,
} from "$lib/types/groceryList";
import { and, count, eq, inArray, notInArray, sql } from "drizzle-orm";
import { validateAndTransformStrToNum } from "$lib/services/validators";

type ParseGroceryListFromFormRes = {
  data: UpsertGroceryList;
  errorMap: Map<string, string>;
};

// don't love how complicated this parsing is
// but atm don't have a simpler way to parse dynamically sized/attributed form data and coalescing empty strings to nulls
// todo this could use some unit tests
export function parseGroceryListFromFormData(
  formData: FormData,
): ParseGroceryListFromFormRes {
  const response: ParseGroceryListFromFormRes = {
    data: {
      id: null,
      title: "",
      budget: null,
      items: [],
    },
    errorMap: new Map<string, string>(),
  };

  const countCheck = validateAndTransformStrToNum.safeParse(
    formData.get("count")?.toString().trim(),
  );
  if (!countCheck.success) {
    throw new Error(
      `internal form data error: ${countCheck.error.errors.map((err) => err.message).join(",")}`,
    );
  }

  const idCheck = z
    .string({ message: "must exist as an input" })
    .refine(
      (val) =>
        val === "" ||
        (!isNaN(parseInt(val, 10)) && parseInt(val, 10).toString() === val),
      {
        message: "must be a number",
      },
    )
    .transform((val) => {
      if (val === null || val === "") {
        return null;
      }

      return parseInt(val, 10);
    })
    .safeParse(formData.get(`id`)?.toString().trim());
  if (idCheck.success) {
    response.data.id = idCheck.data;
  } else {
    response.errorMap.set(
      `id`,
      idCheck.error.errors.map((err) => err.message).join(","),
    );
  }

  const count = countCheck.data;
  const titleCheck = z
    .string({ message: "must exist as an input" })
    .min(1, "is required")
    .max(256, "cannot be more than 256 characters")
    .safeParse(formData.get("title")?.toString().trim());
  if (titleCheck.success) {
    response.data.title = titleCheck.data;
  } else {
    response.errorMap.set(
      "title",
      titleCheck.error.errors.map((err) => err.message).join(","),
    );
  }

  const budgetCheck = z
    .string({ message: "must exist as an input" })
    .refine(
      (val) => val === "" || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0),
      {
        message: "must be a number greater than or equal to 0",
      },
    )
    .transform((val) => {
      if (val === null || val === "") {
        return null;
      }

      return parseFloat(val);
    })
    .safeParse(formData.get("budget")?.toString().trim());
  if (budgetCheck.success) {
    response.data.budget = budgetCheck.data;
  } else {
    response.errorMap.set(
      "budget",
      budgetCheck.error.errors.map((err) => err.message).join(","),
    );
  }

  for (let i = 0; i < count; i++) {
    const itemIdCheck = z
      .string({ message: "must exist as an input" })
      .refine(
        (val) =>
          val === "" ||
          (!isNaN(parseInt(val, 10)) && parseInt(val, 10).toString() === val),
        {
          message: "must be a number",
        },
      )
      .transform((val) => {
        if (val === null || val === "") {
          return null;
        }

        return parseInt(val, 10);
      })
      .safeParse(formData.get(`itemId${i}`)?.toString().trim());
    let itemId: number | null = null;
    if (itemIdCheck.success) {
      itemId = itemIdCheck.data;
    } else {
      response.errorMap.set(
        `itemId${i}`,
        itemIdCheck.error.errors.map((err) => err.message).join(","),
      );
    }

    const nameCheck = z
      .string({ message: "must exist as an input" })
      .min(1, "is required")
      .max(256, "cannot be more than 256 characters")
      .safeParse(formData.get(`name${i}`)?.toString().trim());
    let name = "";
    if (nameCheck.success) {
      name = nameCheck.data;
    } else {
      response.errorMap.set(
        `name${i}`,
        nameCheck.error.errors.map((err) => err.message).join(","),
      );
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
      .safeParse(formData.get(`quantity${i}`)?.toString().trim());
    let quantity: number | null = null;
    if (quantityCheck.success) {
      quantity = quantityCheck.data;
    } else {
      response.errorMap.set(
        `quantity${i}`,
        quantityCheck.error.errors.map((err) => err.message).join(","),
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
      .safeParse(formData.get(`notes${i}`)?.toString().trim());
    let notes: string | null = null;
    if (notesCheck.success) {
      notes = notesCheck.data;
    } else {
      response.errorMap.set(
        `notes${i}`,
        notesCheck.error.errors.map((err) => err.message).join(","),
      );
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
      .safeParse(formData.get(`link${i}`)?.toString().trim());
    let link: string | null = null;
    if (linkCheck.success) {
      link = linkCheck.data;
    } else {
      response.errorMap.set(
        `link${i}`,
        linkCheck.error.errors.map((err) => err.message).join(","),
      );
    }

    const groupNameCheck = z
      .string({ message: "must be set" })
      .max(256, "cannot be more than 256 characters")
      .transform((val) => {
        if (val === "") {
          return null;
        }

        return val;
      })
      .safeParse(formData.get(`groupName${i}`)?.toString().trim());
    let groupName: string | null = null;
    if (groupNameCheck.success) {
      groupName = groupNameCheck.data;
    } else {
      response.errorMap.set(
        `groupName${i}`,
        groupNameCheck.error.errors.map((err) => err.message).join(","),
      );
    }

    response.data.items.push({
      id: itemId,
      name,
      quantity,
      notes,
      link,
      groupName,
    });
  }

  return response;
}

export async function upsertGroceryList(
  upsertGroceryList: UpsertGroceryList,
  userId: string,
): Promise<void> {
  await db.transaction(async (tx) => {
    const groceryListRes = await tx
      .insert(groceryLists)
      .values({
        id: upsertGroceryList.id ?? undefined,
        title: upsertGroceryList.title,
        budget: upsertGroceryList.budget,
        createdByUserId: userId,
      })
      .onConflictDoUpdate({
        target: groceryLists.id,
        set: {
          title: upsertGroceryList.title,
          budget: upsertGroceryList.budget,
        },
      })
      .returning({
        id: groceryLists.id,
        title: groceryLists.title,
        createdByUserId: groceryLists.createdByUserId,
        createdAt: groceryLists.createdAt,
        updatedAt: groceryLists.updatedAt,
      });

    const uniqueGroupNames = new Set<string>();
    const upsertGroupNames = upsertGroceryList.items
      .filter(({ groupName }) => {
        if (!groupName || uniqueGroupNames.has(groupName)) {
          return false;
        }

        uniqueGroupNames.add(groupName);

        return true;
      })
      .map((item) => item.groupName!);
    if (upsertGroceryList.id && upsertGroupNames.length) {
      await tx
        .delete(groceryListGroups)
        .where(
          and(
            eq(groceryListGroups.groceryListId, upsertGroceryList.id),
            notInArray(groceryListGroups.name, upsertGroupNames),
          ),
        );
    }
    if (upsertGroceryList.id && !upsertGroupNames.length) {
      await tx
        .delete(groceryListGroups)
        .where(eq(groceryListGroups.groceryListId, upsertGroceryList.id));
    }

    const groupNameToIdMap = new Map<string, number>();
    if (upsertGroupNames.length) {
      const existingGroups = await tx
        .select()
        .from(groceryListGroups)
        .where(
          and(
            eq(groceryListGroups.groceryListId, groceryListRes[0].id),
            inArray(groceryListGroups.name, upsertGroupNames),
          ),
        );
      existingGroups.forEach(({ name, id }) => {
        groupNameToIdMap.set(name, id);
      });

      const newGroupNames = upsertGroupNames.filter(
        (name) => !groupNameToIdMap.has(name),
      );
      if (newGroupNames.length) {
        const res = await tx
          .insert(groceryListGroups)
          .values(
            newGroupNames.map((name) => ({
              groceryListId: groceryListRes[0].id,
              name,
              createdByUserId: userId,
            })),
          )
          .returning({
            id: groceryListGroups.id,
            name: groceryListGroups.name,
          });
        res.forEach((group) => {
          groupNameToIdMap.set(group.name, group.id);
        });
      }
    }

    const existingItemIds = upsertGroceryList.items
      .filter((i) => i.id)
      .map((i) => i.id!);
    if (upsertGroceryList.id && existingItemIds.length) {
      await tx
        .delete(groceryListItems)
        .where(
          and(
            eq(groceryListItems.groceryListId, upsertGroceryList.id),
            notInArray(groceryListItems.id, existingItemIds),
          ),
        );
    }
    if (upsertGroceryList.id && !upsertGroceryList.items.length) {
      await tx
        .delete(groceryListItems)
        .where(eq(groceryListItems.groceryListId, upsertGroceryList.id));
    }

    if (upsertGroceryList.items.length) {
      await tx
        .insert(groceryListItems)
        .values(
          upsertGroceryList.items.map((item) => ({
            id: item.id ?? undefined,
            groceryListId: groceryListRes[0].id,
            groceryListGroupId: item.groupName
              ? groupNameToIdMap.get(item.groupName) ?? null
              : null,
            name: item.name,
            quantity: item.quantity,
            notes: item.notes,
            link: item.link,
            createdByUserId: userId,
          })),
        )
        .onConflictDoUpdate({
          target: groceryListItems.id,
          set: {
            name: sql.raw(`excluded.${groceryListItems.name.name}`),
            quantity: sql.raw(`excluded.${groceryListItems.quantity.name}`),
            notes: sql.raw(`excluded.${groceryListItems.notes.name}`),
            link: sql.raw(`excluded.${groceryListItems.link.name}`),
            groceryListGroupId: sql.raw(
              `excluded.${groceryListItems.groceryListGroupId.name}`,
            ),
          },
        });
    }
  });
}

export async function getMinifiedGroceryListsByCreator(
  creatorId: string,
): Promise<GroceryListMinified[]> {
  return db
    .select({
      id: groceryLists.id,
      title: groceryLists.title,
      updatedAt: groceryLists.updatedAt,
      itemsCount: count(groceryListItems.id),
    })
    .from(groceryLists)
    .leftJoin(
      groceryListItems,
      eq(groceryLists.id, groceryListItems.groceryListId),
    )
    .where(eq(groceryLists.createdByUserId, creatorId))
    .groupBy(groceryLists.id);
}

export async function deleteGroceryList(
  userId: string,
  groceryListId: number,
): Promise<void> {
  await db
    .delete(groceryLists)
    .where(
      and(
        eq(groceryLists.id, groceryListId),
        eq(groceryLists.createdByUserId, userId),
      ),
    );
}

export async function getGroceryListByIdAndCreator(
  userId: string,
  groceryListId: number,
): Promise<GroceryList> {
  const rows = await db
    .select()
    .from(groceryLists)
    .leftJoin(
      groceryListItems,
      eq(groceryLists.id, groceryListItems.groceryListId),
    )
    .leftJoin(
      groceryListGroups,
      eq(groceryLists.id, groceryListGroups.groceryListId),
    )
    .where(
      and(
        eq(groceryLists.createdByUserId, userId),
        eq(groceryLists.id, groceryListId),
      ),
    );

  const records = rows.reduce<Record<number, GroceryList>>((acc, row) => {
    if (!acc[row.grocery_lists.id]) {
      acc[row.grocery_lists.id] = {
        id: row.grocery_lists.id,
        title: row.grocery_lists.title,
        budget: row.grocery_lists.budget,
        items: [],
        createdByUserId: row.grocery_lists.createdByUserId,
        createdAt: row.grocery_lists.createdAt,
        updatedAt: row.grocery_lists.updatedAt,
      };
    }

    if (row.grocery_list_items) {
      let group: GroceryListItemGroup | null = null;
      if (
        row.grocery_list_groups &&
        row.grocery_list_items.groceryListGroupId === row.grocery_list_groups.id
      ) {
        group = row.grocery_list_groups;
      }

      const existingItemIndex = acc[row.grocery_lists.id].items.findIndex(
        (item) => item.id === row.grocery_list_items!.id,
      );
      if (existingItemIndex > -1 && group) {
        acc[row.grocery_lists.id].items[existingItemIndex].group = group;
      }

      if (existingItemIndex === -1) {
        acc[row.grocery_lists.id].items.push({
          id: row.grocery_list_items.id,
          groceryListId: row.grocery_list_items.groceryListId,
          name: row.grocery_list_items.name,
          quantity: row.grocery_list_items.quantity,
          notes: row.grocery_list_items.notes,
          link: row.grocery_list_items.link,
          group,
          createdByUserId: row.grocery_list_items.createdByUserId,
          createdAt: row.grocery_list_items.createdAt,
          updatedAt: row.grocery_list_items.updatedAt,
        });
      }
    }

    return acc;
  }, {});

  return Object.values(records)[0];
}
