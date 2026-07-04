import { createRental, listRentals } from "@/lib/db/repository";
import type { RentalRecord } from "@/lib/rental/types";
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
  try {
    const rental = (await request.json()) as RentalRecord;
    const created = await createRental(rental);
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("POST /api/rentals", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create rental" },
      { status: 500 },
    );
  }
}
