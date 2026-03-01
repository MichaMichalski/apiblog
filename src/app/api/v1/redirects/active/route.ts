import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const redirects = await prisma.redirect.findMany({
      where: { isActive: true },
      select: { source: true, destination: true, statusCode: true },
    });

    return NextResponse.json(redirects, {
      headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=300" },
    });
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
