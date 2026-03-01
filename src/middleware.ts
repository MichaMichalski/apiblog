import { NextRequest, NextResponse } from "next/server";
import { getRedirectMap } from "@/lib/redirects";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login" || pathname === "/setup") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    const session = request.cookies.get("cms-session");
    if (!session) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  const redirectMap = await getRedirectMap();
  const match = redirectMap.get(pathname);
  if (match) {
    const dest = match.destination.startsWith("http")
      ? match.destination
      : new URL(match.destination, request.url).toString();
    return NextResponse.redirect(dest, match.statusCode);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/setup",
    "/((?!api/|uploads/|_next/|favicon\\.ico|robots\\.txt|sitemap\\.xml).*)",
  ],
};
