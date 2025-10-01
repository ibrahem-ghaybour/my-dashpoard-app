import { toTypedSchema } from "@vee-validate/zod";
import { z } from "zod";

export function Schema<T extends z.ZodRawShape>(obj: T) {
  return toTypedSchema(z.object(obj));
}