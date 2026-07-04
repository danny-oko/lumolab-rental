import { deleteInventorySchema, patchInventorySchema, createInventorySchema } from "@/lib/api/schemas";
import {
  logInventoryCreate,
  logInventoryDelete,
  logInventoryFlags,
  logInventoryUpdate,
} from "@/lib/api/activity";
import { parseJsonBody } from "@/lib/api/validate";
import {
  createInventoryItem,
  deleteInventoryItem,
  InventoryInUseError,
  listInventory,
  updateInventoryFlags,
  updateInventoryItem,
} from "@/lib/db/repository";
import { flagModeToFlags } from "@/lib/rental/inv-flags";
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

export async function POST(request: Request) {
  const parsed = await parseJsonBody(request, createInventorySchema);
  if ("error" in parsed) return parsed.error;

  try {
    const created = await createInventoryItem(parsed.data);
    await logInventoryCreate(created);
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("POST /api/inventory", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create item" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  const parsed = await parseJsonBody(request, patchInventorySchema);
  if ("error" in parsed) return parsed.error;

  const body = parsed.data;

  try {
    if ("flagMode" in body) {
      const updated = await updateInventoryFlags(
        body.id,
        flagModeToFlags(body.flagMode),
      );
      if (!updated) {
        return NextResponse.json({ error: "Item not found" }, { status: 404 });
      }
      await logInventoryFlags(updated);
      return NextResponse.json(updated);
    }

    const { id, field, value } = body;
    const updated = await updateInventoryItem(id, field, value);
    if (!updated) {
      return NextResponse.json({ error: "Invalid field or item" }, { status: 400 });
    }

    await logInventoryUpdate(updated, field);
    return NextResponse.json(updated);
  } catch (err) {
    console.error("PATCH /api/inventory", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update inventory" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const parsed = await parseJsonBody(request, deleteInventorySchema);
  if ("error" in parsed) return parsed.error;

  try {
    const deleted = await deleteInventoryItem(parsed.data.id);
    if (!deleted) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }
    await logInventoryDelete(deleted);
    return NextResponse.json({ ok: true, id: parsed.data.id });
  } catch (err) {
    if (err instanceof InventoryInUseError) {
      return NextResponse.json(
        {
          error: `Идэвхтэй түрээст ${err.activeQty} ширхэг байна. Эхлээд ирүүлнэ үү.`,
        },
        { status: 409 },
      );
    }
    console.error("DELETE /api/inventory", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete item" },
      { status: 500 },
    );
  }
}
