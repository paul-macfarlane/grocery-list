import { z } from "zod";

export const validateAndTransformStrToNum = z
  .string()
  .refine(
    (val) => {
      const parsed = parseInt(val);

      return !isNaN(parsed) && parsed.toString() === val;
    },
    {
      message: "must be a number",
    },
  )
  .transform((val) => parseInt(val));
