import { z } from "zod";
import type {
  UpsertGroceryList,
  UpsertGroceryListItem,
} from "$lib/types/groceryList";
import { validateAndTransformStrToNum } from "$lib/validators/common";

type ParseFormListResponse = {
  data: UpsertGroceryList | null;
  errorMap: Map<string, string>;
};

export function safeParseFormGroceryList(
  formData: FormData,
): ParseFormListResponse {
  let errorMap = new Map<string, string>();
  let data = null;

  let itemCount = 0;
  const itemsCountCheck = validateAndTransformStrToNum.safeParse(
    formData.get("itemsCount"),
  );
  if (itemsCountCheck.success) {
    itemCount = itemsCountCheck.data;
  } else {
    errorMap.set(
      "ItemsCount",
      itemsCountCheck.error.errors.map((err) => err.message).join(","),
    );

    return {
      data,
      errorMap,
    };
  }

  const items = [];
  const nonEmptyStringOrNull = (str: string): string | null => {
    return str !== "" ? str : null;
  };
  for (let i = 0; i < itemCount; i++) {
    const unvalidatedListKey = nonEmptyStringOrNull(
      formData.get(`itemListKey${i}`)?.toString().trim() ?? "",
    );

    items.push({
      id: formData.get(`itemId${unvalidatedListKey}`)
        ? parseInt(
            formData.get(`itemId${unvalidatedListKey}`)?.toString() ?? "",
          )
        : null,
      name: formData.get(`itemName${unvalidatedListKey}`)?.toString().trim(),
      quantity: formData.get(`itemQuantity${unvalidatedListKey}`)
        ? parseInt(
            formData.get(`itemQuantity${unvalidatedListKey}`)?.toString() ?? "",
          )
        : null,
      notes: nonEmptyStringOrNull(
        formData.get(`itemNotes${unvalidatedListKey}`)?.toString() ?? "",
      ),
      link: nonEmptyStringOrNull(
        formData.get(`itemLink${unvalidatedListKey}`)?.toString().trim() ?? "",
      ),
      groupName: nonEmptyStringOrNull(
        formData.get(`itemGroupName${unvalidatedListKey}`)?.toString().trim() ??
          "",
      ),
      substituteForItemId: formData.get(
        `itemSubstituteForItemId${unvalidatedListKey}`,
      )
        ? parseInt(
            formData
              .get(`itemSubstituteForItemId${unvalidatedListKey}`)
              ?.toString()
              .trim() ?? "",
          )
        : null,
      listKey: formData.get(`itemListKey${i}`)?.toString().trim(),
      substituteForItemListKey: nonEmptyStringOrNull(
        formData
          .get(`itemSubstituteForItemListKey${unvalidatedListKey}`)
          ?.toString()
          .trim() ?? "",
      ),
      errorMapPrefix: "item",
      errorMapSuffix: unvalidatedListKey ?? "",
    });
  }

  const listRes = safeParseUpsertGroceryList({
    id: formData.get("id")
      ? parseInt(formData.get("id")?.toString() ?? "")
      : null,
    title: formData.get("title"),
    budget: formData.get("budget")
      ? parseFloat(formData.get("budget")?.toString() ?? "")
      : null,
    items,
  });
  if (listRes.errorMap.size === 0) {
    data = listRes.data!;
  } else {
    errorMap = new Map([...errorMap, ...listRes.errorMap]);
  }

  return {
    data,
    errorMap,
  };
}

type ParseListParams = {
  id: unknown;
  title: unknown;
  budget: unknown;
  items: ParseListItemParams[];
};

type ParseListResponse = {
  data: UpsertGroceryList | null;
  errorMap: Map<string, string>;
};

export function safeParseUpsertGroceryList(
  params: ParseListParams,
): ParseListResponse {
  let errorMap = new Map<string, string>();

  let id: number | null = null;
  const idCheck = z
    .number({ message: "must be a number" })
    .nullable()
    .safeParse(params.id);
  if (idCheck.success) {
    id = idCheck.data;
  } else {
    errorMap.set(
      `Id`,
      idCheck.error.errors.map((err) => err.message).join(","),
    );
  }

  let title = "";
  const titleCheck = z
    .string({ message: "must be a string" })
    .min(1, "is required")
    .max(256, "cannot be > 256 characters")
    .safeParse(params.title);
  if (titleCheck.success) {
    title = titleCheck.data;
  } else {
    errorMap.set(
      `Title`,
      titleCheck.error.errors.map((err) => err.message).join(","),
    );
  }

  let budget: number | null = null;
  const budgetCheck = z
    .number({ message: "must be a number" })
    .min(0, "if set must be >= 0")
    .nullable()
    .safeParse(params.budget);
  if (budgetCheck.success) {
    budget = budgetCheck.data;
  } else {
    errorMap.set(
      `Budget`,
      budgetCheck.error.errors.map((err) => err.message).join(","),
    );
  }

  const items: UpsertGroceryListItem[] = [];
  params.items.forEach((item) => {
    const res = safeParseUpsertGroceryListItem(item);
    if (res.errorMap.size > 0) {
      errorMap = new Map([...errorMap, ...res.errorMap]);
    } else {
      items.push(res.data!);
    }
  });

  let data = null;
  if (errorMap.size === 0) {
    data = {
      id,
      title,
      budget,
      items,
    };
  }

  return {
    data,
    errorMap,
  };
}

type ParseListItemParams = {
  id: unknown;
  name: unknown;
  quantity: unknown;
  notes: unknown;
  link: unknown;
  groupName: unknown;
  substituteForItemId: unknown;
  listKey: unknown;
  substituteForItemListKey: unknown;

  errorMapPrefix?: string;
  errorMapSuffix?: string;
};

type ParseListItemResponse = {
  data: UpsertGroceryListItem | null;
  errorMap: Map<string, string>;
};

export function safeParseUpsertGroceryListItem(
  params: ParseListItemParams,
): ParseListItemResponse {
  params.errorMapPrefix = params.errorMapPrefix ?? "item";
  params.errorMapSuffix = params.errorMapSuffix ?? "";
  const errorMap = new Map<string, string>();

  let id: number | null = null;
  const idCheck = z
    .number({ message: "must be a number" })
    .nullable()
    .safeParse(params.id);
  if (idCheck.success) {
    id = idCheck.data;
  } else {
    errorMap.set(
      `${params.errorMapPrefix}Id${params.errorMapSuffix}`,
      idCheck.error.errors.map((err) => err.message).join(","),
    );
  }

  let name = "";
  const nameCheck = z
    .string({ message: "must be a string" })
    .min(1, "is required")
    .max(256, "cannot be > 256 characters")
    .safeParse(params.name);
  if (!nameCheck.success) {
    errorMap.set(
      `${params.errorMapPrefix}Name${params.errorMapSuffix}`,
      nameCheck.error.errors.map((err) => err.message).join(","),
    );
  } else {
    name = nameCheck.data;
  }

  let quantity: number | null = null;
  const quantityCheck = z
    .number({ message: "must be a number" })
    .min(1, "if set must be > 0")
    .max(1000000, "if set must be <= 1,000,000")
    .nullable()
    .safeParse(params.quantity);
  if (!quantityCheck.success) {
    errorMap.set(
      `${params.errorMapPrefix}Quantity${params.errorMapSuffix}`,
      quantityCheck.error.errors.map((err) => err.message).join(","),
    );
  } else {
    quantity = quantityCheck.data;
  }

  let notes: string | null = null;
  const noteCheck = z
    .string({ message: "must be a string" })
    .min(1, "if set cannot be empty")
    .max(256, "if set cannot be > 256 characters")
    .nullable()
    .safeParse(params.notes);
  if (!noteCheck.success) {
    errorMap.set(
      `${params.errorMapPrefix}Notes${params.errorMapSuffix}`,
      noteCheck.error.errors.map((err) => err.message).join(","),
    );
  } else {
    notes = noteCheck.data;
  }

  let link: string | null = null;
  const linkCheck = z
    .string({ message: "must be a string" })
    .min(1, "if set cannot be empty")
    .max(256, "if set cannot be > 256 characters")
    .nullable()
    .safeParse(params.link);
  if (!linkCheck.success) {
    errorMap.set(
      `${params.errorMapPrefix}Link${params.errorMapSuffix}`,
      linkCheck.error.errors.map((err) => err.message).join(","),
    );
  } else {
    link = linkCheck.data;
  }

  let groupName: string | null = null;
  const groupNameCheck = z
    .string({ message: "must be set" })
    .min(1, "if set cannot be empty")
    .max(256, "if set cannot be > 256 characters")
    .nullable()
    .safeParse(params.groupName);
  if (groupNameCheck.success) {
    groupName = groupNameCheck.data;
  } else {
    errorMap.set(
      `${params.errorMapPrefix}GroupName${params.errorMapSuffix}`,
      groupNameCheck.error.errors.map((err) => err.message).join(","),
    );
  }

  let substituteForItemId: number | null = null;
  const substituteForItemIdCheck = z
    .number({ message: "must be a number" })
    .nullable()
    .safeParse(params.substituteForItemId);
  if (substituteForItemIdCheck.success) {
    substituteForItemId = substituteForItemIdCheck.data;
  } else {
    errorMap.set(
      `${params.errorMapPrefix}SubstituteForItemId${params.errorMapSuffix}`,
      substituteForItemIdCheck.error.errors.map((err) => err.message).join(","),
    );
  }

  let listKey = "";
  const listKeyCheck = z
    .string({ message: "must be a string" })
    .min(1, "must be at least 1 character")
    .safeParse(params.listKey);
  if (listKeyCheck.success) {
    listKey = listKeyCheck.data;
  } else {
    errorMap.set(
      `${params.errorMapPrefix}ListKey${params.errorMapSuffix}`,
      listKeyCheck.error.errors.map((err) => err.message).join(","),
    );
  }

  let substituteForItemListKey: string | null = null;
  const substituteForItemListKeyCheck = z
    .string({ message: "must be a string" })
    .min(1, "must be at least 1 character")
    .nullable()
    .safeParse(params.substituteForItemListKey);
  if (substituteForItemListKeyCheck.success) {
    substituteForItemListKey = substituteForItemListKeyCheck.data;
  } else {
    errorMap.set(
      `${params.errorMapPrefix}SubstituteForItemListKey${params.errorMapSuffix}`,
      substituteForItemListKeyCheck.error.errors
        .map((err) => err.message)
        .join(","),
    );
  }

  let data = null;
  if (errorMap.size === 0) {
    data = {
      id,
      name,
      quantity,
      notes,
      link,
      groupName,
      substituteForItemId,
      listKey,
      substituteForItemListKey,
    };
  }

  return {
    errorMap,
    data,
  };
}
