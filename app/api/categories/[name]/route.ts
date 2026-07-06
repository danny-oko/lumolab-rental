import { updateCategorySchema } from "@/lib/api/category-schemas";
import { parseJsonBody } from "@/lib/api/validate";
import { updateCategory } from "@/lib/db/repository";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ name: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const { name } = await context.params;
  const parsed = await parseJsonBody(request, updateCategorySchema);
  if ("error" in parsed) return parsed.error;

  try {
    const result = await updateCategory(decodeURIComponent(name), parsed.data);
    return NextResponse.json(result);
  } catch (err) {
    console.error("PATCH /api/categories/[name]", err);
    const message =
      err instanceof Error ? err.message : "Failed to update category";
    const status =
      message.includes("not found") ? 404
      : message.includes("already exists") ? 409
      : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
