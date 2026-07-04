import { d1All, d1First, d1Run } from "@/lib/db/d1";
import type { ActivityLogEntry } from "@/lib/rental/types";

type ActivityRow = {
  id: number;
  created_at: string;
  kind: string;
  action: string;
  entity_id: string;
  summary: string;
  detail: string | null;
};

function rowToActivity(row: ActivityRow): ActivityLogEntry {
  return {
    id: Number(row.id),
    createdAt: row.created_at,
    kind: row.kind as ActivityLogEntry["kind"],
    action: row.action,
    entityId: row.entity_id,
    summary: row.summary,
    detail: row.detail ?? undefined,
  };
}

export async function insertActivityLog(entry: {
  kind: ActivityLogEntry["kind"];
  action: string;
  entityId: string;
  summary: string;
  detail?: string;
}): Promise<void> {
  await d1Run(
    `INSERT INTO activity_log (kind, action, entity_id, summary, detail)
     VALUES (?, ?, ?, ?, ?)`,
    [
      entry.kind,
      entry.action,
      entry.entityId,
      entry.summary,
      entry.detail ?? null,
    ],
  );
}

export async function listActivityLogs(limit = 80): Promise<ActivityLogEntry[]> {
  const rows = await d1All<ActivityRow>(
    `SELECT * FROM activity_log ORDER BY created_at DESC, id DESC LIMIT ?`,
    [limit],
  );
  return rows.map(rowToActivity);
}

export async function countActivityLogs(): Promise<number> {
  const row = await d1First<{ total: number }>(
    "SELECT COUNT(*) AS total FROM activity_log",
  );
  return Number(row?.total ?? 0);
}

export async function deleteActivityLog(id: number): Promise<boolean> {
  const existing = await d1First<{ id: number }>(
    "SELECT id FROM activity_log WHERE id = ?",
    [id],
  );
  if (!existing) return false;

  await d1Run("DELETE FROM activity_log WHERE id = ?", [id]);
  return true;
}

export async function deleteAllActivityLogs(): Promise<number> {
  const count = await countActivityLogs();
  if (count === 0) return 0;
  await d1Run("DELETE FROM activity_log");
  return count;
}
