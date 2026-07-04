import { returnRental } from "@/lib/db/repository";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const returnDate = new Date().toISOString().slice(0, 10);
    const rental = await returnRental(id, returnDate);

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
