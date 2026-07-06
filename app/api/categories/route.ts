import { categoryDefSchema, reorderCategoriesSchema } from "@/lib/api/category-schemas";
import { parseJsonBody } from "@/lib/api/validate";
import {
  createCategory,
  listCategories,
  reorderCategories,
} from "@/lib/db/repository";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const categories = await listCategories();
    return NextResponse.json(categories);
  } catch (err) {
    console.error("GET /api/categories", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load categories" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const parsed = await parseJsonBody(request, categoryDefSchema);
  if ("error" in parsed) return parsed.error;

  try {
    const created = await createCategory(parsed.data);
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("POST /api/categories", err);
    const message = err instanceof Error ? err.message : "Failed to create category";
    const status = message.includes("already exists") ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(request: Request) {
  const parsed = await parseJsonBody(request, reorderCategoriesSchema);
  if ("error" in parsed) return parsed.error;

  try {
    const categories = await reorderCategories(parsed.data.order);
    return NextResponse.json(categories);
  } catch (err) {
    console.error("PATCH /api/categories", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to reorder categories" },
      { status: 500 },
    );
  }
}
