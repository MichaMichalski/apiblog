import { NextRequest, NextResponse } from "next/server";
import { requireAuth, unauthorizedResponse } from "@/lib/auth";
import { getWidgetAreas, saveWidgetAreas } from "@/lib/widgets";
import { revalidateAll } from "@/lib/revalidate";

export async function GET() {
  try {
    const areas = await getWidgetAreas();
    return NextResponse.json(areas);
  } catch {
    return NextResponse.json({ error: "Failed to load widget areas" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth) return unauthorizedResponse();

  try {
    const body = await request.json();

    if (!Array.isArray(body)) {
      return NextResponse.json({ error: "Body must be an array of widget areas" }, { status: 400 });
    }

    await saveWidgetAreas(body);
    revalidateAll();

    return NextResponse.json(body);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
