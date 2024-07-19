import { z } from "zod";
import type { UpsertGroceryListItem } from "$lib/types/groceryList";

type ParseListItemParam = {
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
  param: ParseListItemParam,
): ParseListItemResponse {
  param.errorMapPrefix = param.errorMapPrefix ?? "";
  param.errorMapSuffix = param.errorMapSuffix ?? "";
  const errorMap = new Map<string, string>();

  let id: number | null = null;
  const idCheck = z
    .number({ message: "must be a number" })
    .nullable()
    .safeParse(param.id);
  if (idCheck.success) {
    id = idCheck.data;
  } else {
    errorMap.set(
      `${param.errorMapPrefix}Id${param.errorMapSuffix}`,
      idCheck.error.errors.map((err) => err.message).join(","),
    );
  }

  let name = "";
  const nameCheck = z
    .string({ message: "must be a string" })
    .min(1, "is required")
    .max(256, "cannot be > 256 characters")
    .safeParse(param.name);
  if (!nameCheck.success) {
    errorMap.set(
      `${param.errorMapPrefix}Name${param.errorMapSuffix}`,
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
    .safeParse(param.quantity);
  if (!quantityCheck.success) {
    errorMap.set(
      `${param.errorMapPrefix}Quantity${param.errorMapSuffix}`,
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
    .safeParse(param.notes);
  if (!noteCheck.success) {
    errorMap.set(
      `${param.errorMapPrefix}Notes${param.errorMapSuffix}`,
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
    .safeParse(param.link);
  if (!linkCheck.success) {
    errorMap.set(
      `${param.errorMapPrefix}Link${param.errorMapSuffix}`,
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
    .safeParse(param.groupName);
  if (groupNameCheck.success) {
    groupName = groupNameCheck.data;
  } else {
    errorMap.set(
      `${param.errorMapPrefix}GroupName${param.errorMapSuffix}`,
      groupNameCheck.error.errors.map((err) => err.message).join(","),
    );
  }

  let substituteForItemId: number | null = null;
  const substituteForItemIdCheck = z
    .number({ message: "must be a number" })
    .nullable()
    .safeParse(param.substituteForItemId);
  if (substituteForItemIdCheck.success) {
    substituteForItemId = substituteForItemIdCheck.data;
  } else {
    errorMap.set(
      `${param.errorMapPrefix}SubstituteForItemId${param.errorMapSuffix}`,
      substituteForItemIdCheck.error.errors.map((err) => err.message).join(","),
    );
  }

  let listKey = "";
  const listKeyCheck = z
    .string({ message: "must be a string" })
    .min(1, "must be at least 1 character")
    .safeParse(param.listKey);
  if (listKeyCheck.success) {
    listKey = listKeyCheck.data;
  } else {
    errorMap.set(
      `${param.errorMapPrefix}ListKey${param.errorMapSuffix}`,
      listKeyCheck.error.errors.map((err) => err.message).join(","),
    );
  }

  let substituteForItemListKey: string | null = null;
  const substituteForItemListKeyCheck = z
    .string({ message: "must be a string" })
    .min(1, "must be at least 1 character")
    .nullable()
    .safeParse(param.substituteForItemListKey);
  if (substituteForItemListKeyCheck.success) {
    substituteForItemListKey = substituteForItemListKeyCheck.data;
  } else {
    errorMap.set(
      `${param.errorMapPrefix}SubstituteForItemListKey${param.errorMapSuffix}`,
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
