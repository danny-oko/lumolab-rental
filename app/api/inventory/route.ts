import { listInventory, updateInventoryItem } from "@/lib/db/repository";
import type { InventoryItem } from "@/lib/rental/types";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const inventory = await listInventory();
    return NextResponse.json(inventory);
  } catch (err) {
    console.error("GET /api/inventory", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load inventory" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as {
      id: number;
      field: keyof InventoryItem;
      value: string | number;
    };

    if (!body.id || !body.field) {
      return NextResponse.json({ error: "id and field are required" }, { status: 400 });
    }

    const updated = await updateInventoryItem(body.id, body.field, body.value);
    if (!updated) {
      return NextResponse.json({ error: "Invalid field or item" }, { status: 400 });
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PATCH /api/inventory", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update inventory" },
      { status: 500 },
    );
  }
}
