import { NextResponse } from "next/server";
import { z } from "zod";

export function formatZodError(error: z.ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.length ? `${issue.path.join(".")}: ` : "";
      return `${path}${issue.message}`;
    })
    .join(" | ");
}

export async function parseJsonBody<T>(
  request: Request,
  schema: z.ZodType<T>,
): Promise<{ data: T } | { error: NextResponse }> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return {
      error: NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }),
    };
  }

  const result = schema.safeParse(raw);
  if (!result.success) {
    return {
      error: NextResponse.json(
        { error: formatZodError(result.error) },
        { status: 400 },
      ),
    };
  }

  return { data: result.data };
}

export function parseValue<T>(
  raw: unknown,
  schema: z.ZodType<T>,
): { data: T } | { error: NextResponse } {
  const result = schema.safeParse(raw);
  if (!result.success) {
    return {
      error: NextResponse.json(
        { error: formatZodError(result.error) },
        { status: 400 },
      ),
    };
  }

  return { data: result.data };
}
