type D1ResultMeta = {
  duration: number;
  rows_read: number;
  rows_written: number;
  last_row_id?: number;
  changed_db?: boolean;
  changes?: number;
};

export type D1QueryResult<T = Record<string, unknown>> = {
  results: T[];
  success: boolean;
  meta: D1ResultMeta;
};

type D1ApiResponse = {
  success: boolean;
  errors?: { message: string }[];
  result: D1QueryResult[];
};

function getD1Config() {
  const accountId = process.env.CF_USER_ID;
  const databaseId = process.env.CF_DB_ID;
  const token = process.env.CF_API_KEY;

  if (!accountId || !databaseId || !token) {
    throw new Error(
      "Missing Cloudflare D1 credentials. Set CF_USER_ID, CF_DB_ID, and CF_API_KEY in .env",
    );
  }

  return { accountId, databaseId, token };
}

type D1Statement = { sql: string; params?: unknown[] };

type D1RequestBody = D1Statement | { batch: D1Statement[] };

async function d1Request(body: D1RequestBody): Promise<D1QueryResult[]> {
  const { accountId, databaseId, token } = getD1Config();

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    },
  );

  const json = (await res.json()) as D1ApiResponse;

  if (!res.ok || !json.success) {
    const msg =
      json.errors?.map((e) => e.message).join(", ") ||
      `D1 request failed (${res.status})`;
    throw new Error(msg);
  }

  return json.result;
}

export async function d1All<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  const [result] = await d1Request({ sql, params });
  if (!result.success) throw new Error("D1 query failed");
  return result.results as T[];
}

export async function d1First<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = [],
): Promise<T | null> {
  const rows = await d1All<T>(sql, params);
  return rows[0] ?? null;
}

export async function d1Run(
  sql: string,
  params: unknown[] = [],
): Promise<D1ResultMeta> {
  const [result] = await d1Request({ sql, params });
  if (!result.success) throw new Error("D1 statement failed");
  return result.meta;
}

export async function d1Batch(statements: D1Statement[]): Promise<D1QueryResult[]> {
  return d1Request({ batch: statements });
}
