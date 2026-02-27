import { NextRequest, NextResponse } from "next/server";
import { requireAuth, unauthorizedResponse } from "@/lib/auth";
import { getSiteFromDB, saveSiteToDB } from "@/lib/site";
import { revalidateAll } from "@/lib/revalidate";

export async function GET() {
  try {
    const site = await getSiteFromDB();
    return NextResponse.json(site);
  } catch {
    return NextResponse.json({ error: "Failed to load site config" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth) return unauthorizedResponse();

  try {
    const body = await request.json();

    if (!body.name || !Array.isArray(body.navigation)) {
      return NextResponse.json(
        { error: "Invalid site config. Required: name, navigation" },
        { status: 400 }
      );
    }

    await saveSiteToDB(body);
    revalidateAll();

    return NextResponse.json(body);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
