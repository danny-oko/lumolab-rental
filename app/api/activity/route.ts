import {
  countActivityLogs,
  deleteActivityLog,
  deleteAllActivityLogs,
  listActivityLogs,
} from "@/lib/db/activity-log";
import { deleteActivitySchema } from "@/lib/api/schemas";
import { parseJsonBody } from "@/lib/api/validate";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    if (searchParams.get("count") === "1") {
      const total = await countActivityLogs();
      return NextResponse.json({ total });
    }

    const limit = Math.min(
      200,
      Math.max(1, Number(searchParams.get("limit") ?? 80) || 80),
    );
    const logs = await listActivityLogs(limit);
    return NextResponse.json(logs);
  } catch (err) {
    console.error("GET /api/activity", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load activity" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const parsed = await parseJsonBody(request, deleteActivitySchema);
  if ("error" in parsed) return parsed.error;

  try {
    if ("all" in parsed.data) {
      const count = await deleteAllActivityLogs();
      return NextResponse.json({ ok: true, deleted: count });
    }

    const deleted = await deleteActivityLog(parsed.data.id);
    if (!deleted) {
      return NextResponse.json({ error: "Log not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, id: parsed.data.id });
  } catch (err) {
    console.error("DELETE /api/activity", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete activity" },
      { status: 500 },
    );
  }
}
