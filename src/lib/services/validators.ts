import { z } from "zod";

export const validateAndTransformStrToNum = z
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
  .transform((val) => parseInt(val, 10));

type SubstituteListItemParam = {
  name: unknown;
  quantity?: unknown;
  notes?: unknown;
  link?: unknown;
  errorMapSuffix?: string;
};

type SafeParseSubstituteListItemResponse = {
  data: {
    name: string;
    quantity: number | null;
    notes: string | null;
    link: string | null;
  } | null;
  errorMap: Map<string, string>;
};

export function safeParseSubstituteListItem(
  param: SubstituteListItemParam,
): SafeParseSubstituteListItemResponse {
  const errorMap = new Map<string, string>();

  let name = "";
  const nameCheck = z
    .string({ message: "is string" })
    .min(1, "is required")
    .max(256, "cannot be > 256 characters")
    .safeParse(param.name);
  if (!nameCheck.success) {
    errorMap.set(
      `name${param.errorMapSuffix}`,
      nameCheck.error.errors.map((err) => err.message).join(","),
    );
  } else {
    name = nameCheck.data;
  }

  let quantity: number | null = null;
  const quantityCheck = z
    .number({ message: "is a number" })
    .min(1, "if set must be > 0")
    .max(1000000, "if set must be <= 1,000,000")
    .nullable()
    .safeParse(param.quantity);
  if (!quantityCheck.success) {
    errorMap.set(
      `quantity${param.errorMapSuffix}`,
      quantityCheck.error.errors.map((err) => err.message).join(","),
    );
  } else {
    quantity = quantityCheck.data;
  }

  let notes: string | null = null;
  const noteCheck = z
    .string({ message: "is string" })
    .min(1, "if set cannot be empty")
    .max(256, "if set cannot be > 256 characters")
    .nullable()
    .safeParse(param.notes);
  if (!noteCheck.success) {
    errorMap.set(
      `notes${param.errorMapSuffix}`,
      noteCheck.error.errors.map((err) => err.message).join(","),
    );
  } else {
    notes = noteCheck.data;
  }

  let link: string | null = null;
  const linkCheck = z
    .string({ message: "is string" })
    .min(1, "is required")
    .min(1, "if set cannot be empty")
    .max(256, "if set cannot be > 256 characters")
    .nullable()
    .safeParse(param.link);
  if (!linkCheck.success) {
    errorMap.set(
      `link${param.errorMapSuffix}`,
      linkCheck.error.errors.map((err) => err.message).join(","),
    );
  } else {
    link = linkCheck.data;
  }

  let data: {
    name: string;
    quantity: number | null;
    notes: string | null;
    link: string | null;
  } | null = null;
  if (errorMap.size === 0) {
    data = {
      name,
      quantity,
      notes,
      link,
    };
  }

  return {
    errorMap,
    data,
  };
}
