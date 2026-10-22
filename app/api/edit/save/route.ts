import { NextRequest, NextResponse } from "next/server";
import { writeContent, type UploadFile } from "@/lib/repoStore";

export const dynamic = "force-dynamic";

const MAX_UPLOAD_BYTES = 3_000_000;

/** Saves /edit's content and new images. Behind the /edit login. */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body.content !== "object" || Array.isArray(body.content)) {
    return NextResponse.json({ error: "Nothing to save." }, { status: 400 });
  }
  const uploads: UploadFile[] = Array.isArray(body.uploads) ? body.uploads : [];
  for (const u of uploads) {
    // Only images, only into public/uploads, never anywhere else in the repo.
    if (typeof u?.path !== "string" || !/^public\/uploads\/[a-z0-9-]+-(800|1600)\.webp$/.test(u.path) || typeof u.base64 !== "string") {
      return NextResponse.json({ error: "Bad upload." }, { status: 400 });
    }
    if (u.base64.length * 0.75 > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: "Image too large." }, { status: 413 });
    }
  }
  try {
    const result = await writeContent(body.content, uploads, String(body.message || "Update site content from /edit"));
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
