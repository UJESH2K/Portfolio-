import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { notifyNewRequest } from "@/lib/notify";

// Very small in-memory rate limit per IP to deter spam submissions.
const submissions = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_SUBMISSIONS = 5;

function rateLimited(ip: string) {
  const now = Date.now();
  const entry = submissions.get(ip);
  if (!entry || now > entry.resetAt) {
    submissions.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_SUBMISSIONS;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "local";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  const company = typeof body?.company === "string" ? body.company.trim() : null;
  const budget = typeof body?.budget === "string" ? body.budget.trim() : null;
  const projectType = typeof body?.projectType === "string" ? body.projectType.trim() : null;
  const preferredDate = typeof body?.preferredDate === "string" ? body.preferredDate.trim() : null;

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Name, email and message are required" }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Not configured yet — try email instead" }, { status: 503 });
  }

  const { error } = await supabase.from("meeting_requests").insert({
    name,
    email,
    company,
    budget,
    project_type: projectType,
    preferred_date: preferredDate,
    message,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await notifyNewRequest({
    name,
    email,
    company,
    budget,
    project_type: projectType,
    preferred_date: preferredDate,
    message,
  });

  return NextResponse.json({ ok: true });
}
