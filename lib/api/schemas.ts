import { z } from "zod";

export const categorySchema = z
  .string()
  .trim()
  .min(1, "Category is required")
  .max(32, "Category name is too long");

export const customerSchema = z.object({
  name: z.string().trim().min(1, "Customer name is required"),
  reg: z.string(),
  phone: z.string(),
  addr: z.string(),
  deposit: z.string(),
});

export const rentalItemSchema = z.object({
  id: z.union([z.string(), z.number()]),
  name: z.string().trim().min(1),
  qty: z.number().int().positive(),
  unit: z.number().nonnegative(),
  isStand: z.boolean().optional(),
  freeStand: z.boolean().optional(),
});

export const createRentalSchema = z.object({
  id: z.string().trim().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD"),
  returnDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "returnDate must be YYYY-MM-DD")
    .optional(),
  cust: customerSchema,
  days: z.number().positive(),
  durLabel: z.string().trim().min(1),
  priceMode: z.enum(["base", "vat"]),
  modeLabel: z.string().trim().min(1),
  items: z
    .array(rentalItemSchema)
    .min(1, "At least one rental item is required"),
  gross: z.number(),
  discount: z.number().nonnegative(),
  base: z.number().nonnegative(),
  vat: z.number().nonnegative(),
  total: z.number().nonnegative(),
  status: z.literal("out"),
});

export const inventoryFieldSchema = z.enum([
  "name",
  "qty",
  "price",
  "cat",
  "icon",
  "noStand",
  "noFree",
  "isStand",
]);

export const createInventorySchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  qty: z.number().int().nonnegative(),
  price: z.number().nonnegative(),
  cat: categorySchema,
  icon: z.string().trim().min(1).max(8).optional(),
  noStand: z.boolean().optional(),
  noFree: z.boolean().optional(),
  isStand: z.boolean().optional(),
});

export const invFlagModeSchema = z.enum(["", "isStand", "noStand", "noFree"]);

const patchInventoryFieldSchema = z
  .object({
    id: z.number().int().positive(),
    field: inventoryFieldSchema,
    value: z.union([z.string(), z.number(), z.boolean()]),
  })
  .superRefine((body, ctx) => {
    if (body.field === "name" && typeof body.value !== "string") {
      ctx.addIssue({
        code: "custom",
        message: "name must be a string",
        path: ["value"],
      });
    }
    if (body.field === "cat" && typeof body.value !== "string") {
      ctx.addIssue({
        code: "custom",
        message: "cat must be a string",
        path: ["value"],
      });
    }
    if (body.field === "icon" && typeof body.value !== "string") {
      ctx.addIssue({
        code: "custom",
        message: "icon must be a string",
        path: ["value"],
      });
    }
    if (
      (body.field === "qty" || body.field === "price") &&
      typeof body.value !== "number"
    ) {
      ctx.addIssue({
        code: "custom",
        message: `${body.field} must be a number`,
        path: ["value"],
      });
    }
    if (
      (body.field === "noStand" ||
        body.field === "noFree" ||
        body.field === "isStand") &&
      typeof body.value !== "boolean" &&
      typeof body.value !== "number"
    ) {
      ctx.addIssue({
        code: "custom",
        message: `${body.field} must be a boolean or 0/1`,
        path: ["value"],
      });
    }
    if (body.field === "cat" && typeof body.value === "string") {
      const parsed = categorySchema.safeParse(body.value);
      if (!parsed.success) {
        ctx.addIssue({
          code: "custom",
          message: parsed.error.issues[0]?.message ?? "Invalid category",
          path: ["value"],
        });
      }
    }
  });

const patchInventoryFlagModeSchema = z.object({
  id: z.number().int().positive(),
  flagMode: invFlagModeSchema,
});

export const patchInventorySchema = z.union([
  patchInventoryFieldSchema,
  patchInventoryFlagModeSchema,
]);

export const deleteInventorySchema = z.object({
  id: z.number().int().positive(),
});

export const deleteActivitySchema = z.union([
  z.object({ id: z.coerce.number().int().positive() }),
  z.object({ all: z.literal(true) }),
]);

export const deleteAllRentalsSchema = z.object({ all: z.literal(true) });

export const rentalIdSchema = z
  .string()
  .trim()
  .min(1, "Rental id is required")
  .regex(/^R\d+$/, "Rental id must look like R123456");
