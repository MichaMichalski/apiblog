import { NextRequest, NextResponse } from "next/server";
import { requireAuth, unauthorizedResponse } from "@/lib/auth";
import { getMenuLocations, saveMenuLocations } from "@/lib/menus";
import { revalidateAll } from "@/lib/revalidate";

export async function GET() {
  try {
    const locations = await getMenuLocations();
    return NextResponse.json(locations);
  } catch {
    return NextResponse.json({ error: "Failed to load menu locations" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth) return unauthorizedResponse();

  try {
    const body = await request.json();

    const locations = {
      header: body.header ?? null,
      footer: body.footer ?? null,
      mobile: body.mobile ?? null,
    };

    await saveMenuLocations(locations);
    revalidateAll();

    return NextResponse.json(locations);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
