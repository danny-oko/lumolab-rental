import { createRentalSchema, deleteAllRentalsSchema } from "@/lib/api/schemas";
import { logRentalCheckout } from "@/lib/api/activity";
import { parseJsonBody } from "@/lib/api/validate";
import { createRental, deleteAllRentals, listRentals } from "@/lib/db/repository";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const rentals = await listRentals();
    return NextResponse.json(rentals);
  } catch (err) {
    console.error("GET /api/rentals", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load rentals" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const parsed = await parseJsonBody(request, createRentalSchema);
  if ("error" in parsed) return parsed.error;

  try {
    const created = await createRental(parsed.data);
    await logRentalCheckout(created);
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("POST /api/rentals", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create rental" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const parsed = await parseJsonBody(request, deleteAllRentalsSchema);
  if ("error" in parsed) return parsed.error;

  try {
    const deleted = await deleteAllRentals();
    return NextResponse.json({ ok: true, deleted });
  } catch (err) {
    console.error("DELETE /api/rentals", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete rentals" },
      { status: 500 },
    );
  }
}
