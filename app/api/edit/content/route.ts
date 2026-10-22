import { NextResponse } from "next/server";
import { readContent, storeMode } from "@/lib/repoStore";

export const dynamic = "force-dynamic";

/** The editable content, as /edit loads it. Behind the /edit login. */
export async function GET() {
  try {
    return NextResponse.json({ content: await readContent(), mode: storeMode() });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
