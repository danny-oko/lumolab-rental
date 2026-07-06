import { z } from "zod";
import { categorySchema } from "./schemas";

export const categoryDefSchema = z.object({
  name: categorySchema,
  emoji: z.string().trim().min(1).max(8),
});

export const reorderCategoriesSchema = z.object({
  order: z.array(categorySchema).min(1),
});

export const reorderInventorySchema = z.object({
  order: z.array(z.number().int().positive()).min(1),
});
