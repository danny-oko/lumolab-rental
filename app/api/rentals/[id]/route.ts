import { rentalIdSchema } from "@/lib/api/schemas";
import { logRentalDelete } from "@/lib/api/activity";
import { parseValue } from "@/lib/api/validate";
import { deleteRental } from "@/lib/db/repository";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const parsed = parseValue(rawId, rentalIdSchema);
  if ("error" in parsed) return parsed.error;

  try {
    const rental = await deleteRental(parsed.data);

    if (!rental) {
      return NextResponse.json({ error: "Rental not found" }, { status: 404 });
    }

    await logRentalDelete(rental);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/rentals/[id]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete rental" },
      { status: 500 },
    );
  }
}
