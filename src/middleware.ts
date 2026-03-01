import { NextRequest, NextResponse } from "next/server";

interface RedirectEntry {
  source: string;
  destination: string;
  statusCode: number;
}

let redirectCache: { data: Map<string, RedirectEntry>; expires: number } | null = null;
const CACHE_TTL_MS = 60_000;

async function getRedirects(origin: string): Promise<Map<string, RedirectEntry>> {
  if (redirectCache && Date.now() < redirectCache.expires) {
    return redirectCache.data;
  }

  try {
    const res = await fetch(`${origin}/api/v1/redirects/active`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return new Map();

    const entries: RedirectEntry[] = await res.json();
    const map = new Map(entries.map((r) => [r.source, r]));
    redirectCache = { data: map, expires: Date.now() + CACHE_TTL_MS };
    return map;
  } catch {
    return new Map();
  }
}

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

  const redirectMap = await getRedirects(request.nextUrl.origin);
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
