import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/admin/login" || pathname === "/edit/login" || pathname.startsWith("/api/admin/login")) {
    return NextResponse.next();
  }

  const isEdit = pathname === "/edit" || pathname.startsWith("/edit/") || pathname.startsWith("/api/edit");
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin") || isEdit) {
    const token = req.cookies.get(ADMIN_COOKIE)?.value;
    const valid = await verifySessionToken(token);
    if (!valid) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const url = req.nextUrl.clone();
      url.pathname = isEdit ? "/edit/login" : "/admin/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/edit", "/edit/:path*", "/api/edit/:path*"],
};
