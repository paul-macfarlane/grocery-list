import { z } from "zod";
import { db } from "$lib/db";
import {
  groceryLists,
  groceryListItems,
  groceryListGroups,
} from "$lib/db/schema";
import type {
  GroceryList,
  GroceryListGroup,
  GroceryListMinified,
  UpsertGroceryList,
} from "$lib/types/groceryList";
import { and, count, eq, inArray, isNull, notInArray, sql } from "drizzle-orm";
import { validateAndTransformStrToNum } from "$lib/services/validators";
import { ApplicationError, NotFoundError } from "$lib/types/errors";

type ParseGroceryListFromFormRes = {
  data: UpsertGroceryList;
  errorMap: Map<string, string>;
};

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

    let listKey = "";
    const listKeyCheck = z
      .string({ message: "must exist as an input" })
      .safeParse(formData.get(`itemListKey${i}`)?.toString().trim());
    if (listKeyCheck.success) {
      listKey = listKeyCheck.data;
    } else {
      response.errorMap.set(
        `itemListKey${i}`,
        listKeyCheck.error.errors.map((err) => err.message).join(","),
      );
    }

    let substituteForItemId: number | null = null;
    const substituteCheck = z
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
      .safeParse(formData.get(`substituteFor${i}`)?.toString().trim());
    if (substituteCheck.success) {
      substituteForItemId = substituteCheck.data;
    } else {
      response.errorMap.set(
        `substituteFor${i}`,
        substituteCheck.error.errors.map((err) => err.message).join(","),
      );
    }

    let substituteForItemListKey: string | null = null;
    const subForListKeyCheck = z
      .string({ message: "must exist as an input" })
      .nullable()
      .safeParse(formData.get(`subForListKey${i}`)?.toString().trim());
    if (subForListKeyCheck.success) {
      substituteForItemListKey = subForListKeyCheck.data;
    } else {
      response.errorMap.set(
        `subForListKey${i}`,
        subForListKeyCheck.error.errors.map((err) => err.message).join(","),
      );
    }

    response.data.items.push({
      id: itemId,
      name,
      quantity,
      notes,
      link,
      groupName,
      listKey,
      substituteForItemId,
      substituteForItemListKey,
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
      // upsert all items except those that were substitutes for new items, and the new items with substitutes - those need to be upserted one by one since there is no other way to link the items
      const mainUpserts = upsertGroceryList.items.filter((item) => {
        if (item.substituteForItemListKey && !item.substituteForItemId) {
          // filter out that are substitutes for new items
          return false;
        }

        // filter out new items that have substitutes
        return !(
          !item.id &&
          !item.substituteForItemListKey &&
          upsertGroceryList.items.find(
            (potentialSubItem) =>
              item.listKey === potentialSubItem.substituteForItemListKey,
          )
        );
      });

      if (mainUpserts.length) {
        await tx
          .insert(groceryListItems)
          .values(
            mainUpserts.map((item) => ({
              id: item.id ?? undefined,
              groceryListId: groceryListRes[0].id,
              substituteForItemId: item.substituteForItemId,
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
              substituteForItemId: sql.raw(
                `excluded.${groceryListItems.substituteForItemId.name}`,
              ),
              quantity: sql.raw(`excluded.${groceryListItems.quantity.name}`),
              notes: sql.raw(`excluded.${groceryListItems.notes.name}`),
              link: sql.raw(`excluded.${groceryListItems.link.name}`),
              groceryListGroupId: sql.raw(
                `excluded.${groceryListItems.groceryListGroupId.name}`,
              ),
            },
          });
      }

      const newItemsWithSubs = upsertGroceryList.items.filter(
        (item) =>
          !!(
            !item.id &&
            !item.substituteForItemListKey &&
            upsertGroceryList.items.find(
              (potentialSubItem) =>
                item.listKey === potentialSubItem.substituteForItemListKey,
            )
          ),
      );
      if (newItemsWithSubs.length) {
        for (let i = 0; i < newItemsWithSubs.length; i++) {
          const newItemQueryRes = await tx
            .insert(groceryListItems)
            .values([
              {
                groceryListId: groceryListRes[0].id,
                substituteForItemId: newItemsWithSubs[i].substituteForItemId,
                groceryListGroupId: newItemsWithSubs[i].groupName
                  ? groupNameToIdMap.get(newItemsWithSubs[i].groupName!) ?? null
                  : null,
                name: newItemsWithSubs[i].name,
                quantity: newItemsWithSubs[i].quantity,
                notes: newItemsWithSubs[i].notes,
                link: newItemsWithSubs[i].link,
                createdByUserId: userId,
              },
            ])
            .returning({
              id: groceryListItems.id,
            });

          const subsForNewItem = upsertGroceryList.items.filter(
            (item) =>
              item.substituteForItemListKey === newItemsWithSubs[i].listKey,
          );

          await tx.insert(groceryListItems).values(
            subsForNewItem.map((sub) => ({
              groceryListId: groceryListRes[0].id,
              substituteForItemId: newItemQueryRes[0].id,
              groceryListGroupId: sub.groupName
                ? groupNameToIdMap.get(sub.groupName!) ?? null
                : null,
              name: sub.name,
              quantity: sub.quantity,
              notes: sub.notes,
              link: sub.link,
              createdByUserId: userId,
            })),
          );
        }
      }
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
      and(
        eq(groceryLists.id, groceryListItems.groceryListId),
        isNull(groceryListItems.substituteForItemId),
      ),
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
): Promise<GroceryList | null> {
  const listRows = await db
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
  if (!listRows.length) {
    return null;
  }

  return Object.values(
    listRows.reduce<Record<number, GroceryList>>((accList, listRow) => {
      if (!accList[listRow.grocery_lists.id]) {
        accList[listRow.grocery_lists.id] = {
          id: listRow.grocery_lists.id,
          title: listRow.grocery_lists.title,
          budget: listRow.grocery_lists.budget,
          items: [],
          createdByUserId: listRow.grocery_lists.createdByUserId,
          createdAt: listRow.grocery_lists.createdAt,
          updatedAt: listRow.grocery_lists.updatedAt,
        };
      }

      if (listRow.grocery_list_items) {
        let listGroup: GroceryListGroup | null = null;
        if (
          listRow.grocery_list_groups &&
          listRow.grocery_list_groups.id ===
            listRow.grocery_list_items.groceryListGroupId
        ) {
          listGroup = listRow.grocery_list_groups;
        }

        const existingItemIndex = accList[
          listRow.grocery_lists.id
        ].items.findIndex((item) => item.id === listRow.grocery_list_items!.id);
        if (existingItemIndex > -1 && listGroup) {
          accList[listRow.grocery_lists.id].items[existingItemIndex].group =
            listGroup;
        } else if (existingItemIndex === -1) {
          accList[listRow.grocery_lists.id].items.push({
            id: listRow.grocery_list_items.id,
            groceryListId: listRow.grocery_list_items.groceryListId,
            substituteForItemId: listRow.grocery_list_items.substituteForItemId,
            name: listRow.grocery_list_items.name,
            quantity: listRow.grocery_list_items.quantity,
            notes: listRow.grocery_list_items.notes,
            link: listRow.grocery_list_items.link,
            group: listGroup,
            createdByUserId: listRow.grocery_list_items.createdByUserId,
            createdAt: listRow.grocery_list_items.createdAt,
            updatedAt: listRow.grocery_list_items.updatedAt,
          });
        }
      }

      return accList;
    }, {}),
  )[0];
}

export async function duplicateGroceryList(
  userId: string,
  groceryListId: number,
): Promise<void> {
  const listToDuplicate = await getGroceryListByIdAndCreator(
    userId,
    groceryListId,
  );
  if (!listToDuplicate) {
    throw new NotFoundError("grocery list");
  }

  return db.transaction(async (tx) => {
    const newListRows = await tx
      .insert(groceryLists)
      .values({
        title: `Copy of ${listToDuplicate.title}`,
        budget: listToDuplicate.budget,
        createdByUserId: userId,
      })
      .returning({
        id: groceryLists.id,
      });
    if (!newListRows.length) {
      throw new ApplicationError("unable to create grocery list");
    }

    if (listToDuplicate.items.length) {
      const newListGroupNameToId = new Map<string, number>();
      const listGroupsToDuplicate = listToDuplicate.items
        .filter((item) => item.group)
        .map((item) => item.group!);
      if (listGroupsToDuplicate.length) {
        const newListGroupRows = await tx
          .insert(groceryListGroups)
          .values(
            listGroupsToDuplicate.map((group) => ({
              groceryListId: newListRows[0].id,
              name: group.name,
              createdByUserId: userId,
            })),
          )
          .returning({
            id: groceryListGroups.id,
            name: groceryListGroups.name,
          });

        newListGroupRows.forEach((row) => {
          newListGroupNameToId.set(row.name, row.id);
        });
      }

      // items with substitutes, and items that are substitutes, need to be duplicated separately since the items with substitutes need to be created before the substitutes are created
      const mainItemsWithoutSubs = listToDuplicate.items.filter((item) => {
        if (item.substituteForItemId) {
          // filter out items that are substitutes
          return false;
        }

        // filter out items that have substitutes
        return !listToDuplicate.items.find(
          (potentialSubItem) =>
            item.id === potentialSubItem.substituteForItemId,
        );
      });

      if (mainItemsWithoutSubs.length) {
        await tx.insert(groceryListItems).values(
          mainItemsWithoutSubs.map((item) => ({
            groceryListId: newListRows[0].id,
            substituteForItemId: item.substituteForItemId,
            groceryListGroupId: item.group
              ? newListGroupNameToId.get(item.group.name)
              : undefined,
            name: item.name,
            quantity: item.quantity,
            notes: item.notes,
            link: item.link,
            createdByUserId: userId,
          })),
        );
      }

      const itemsWithSubs = listToDuplicate.items.filter(
        (item) =>
          !!(
            !item.substituteForItemId &&
            listToDuplicate.items.find(
              (potentialSubItem) =>
                item.id === potentialSubItem.substituteForItemId,
            )
          ),
      );
      if (itemsWithSubs.length) {
        for (let i = 0; i < itemsWithSubs.length; i++) {
          const newItemQueryRes = await tx
            .insert(groceryListItems)
            .values([
              {
                groceryListId: newListRows[0].id,
                substituteForItemId: itemsWithSubs[i].substituteForItemId,
                groceryListGroupId: itemsWithSubs[i].group
                  ? newListGroupNameToId.get(itemsWithSubs[i].group!.name)
                  : undefined,
                name: itemsWithSubs[i].name,
                quantity: itemsWithSubs[i].quantity,
                notes: itemsWithSubs[i].notes,
                link: itemsWithSubs[i].link,
                createdByUserId: userId,
              },
            ])
            .returning({
              id: groceryListItems.id,
            });

          const subsForNewItem = listToDuplicate.items.filter(
            (item) => item.substituteForItemId === itemsWithSubs[i].id,
          );

          await tx.insert(groceryListItems).values(
            subsForNewItem.map((sub) => ({
              groceryListId: newListRows[0].id,
              substituteForItemId: newItemQueryRes[0].id,
              groceryListGroupId: sub.group
                ? newListGroupNameToId.get(sub.group!.name) ?? null
                : null,
              name: sub.name,
              quantity: sub.quantity,
              notes: sub.notes,
              link: sub.link,
              createdByUserId: userId,
            })),
          );
        }
      }
    }
  });
}
