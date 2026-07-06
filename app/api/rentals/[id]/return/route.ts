import { rentalIdSchema } from "@/lib/api/schemas";
import { parseValue } from "@/lib/api/validate";
import { returnRental } from "@/lib/db/repository";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const { id: rawId } = await context.params;
  const parsed = parseValue(rawId, rentalIdSchema);
  if ("error" in parsed) return parsed.error;

  try {
    const returnDate = new Date().toISOString().slice(0, 10);
    const rental = await returnRental(parsed.data, returnDate);

    if (!rental) {
      return NextResponse.json({ error: "Rental not found" }, { status: 404 });
    }

    return NextResponse.json(rental);
  } catch (err) {
    console.error("POST /api/rentals/[id]/return", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to return rental" },
      { status: 500 },
    );
  }
}
