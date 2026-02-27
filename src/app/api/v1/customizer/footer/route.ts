import { NextRequest, NextResponse } from "next/server";
import { requireAuth, unauthorizedResponse } from "@/lib/auth";
import { getFooterBuilder, saveFooterBuilder } from "@/lib/customizer";
import { revalidateAll } from "@/lib/revalidate";

export async function GET() {
  try {
    const config = await getFooterBuilder();
    return NextResponse.json(config);
  } catch {
    return NextResponse.json({ error: "Failed to load footer builder config" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth) return unauthorizedResponse();

  try {
    const body = await request.json();

    if (!body.rows || !Array.isArray(body.rows)) {
      return NextResponse.json({ error: "Invalid footer builder config. Required: rows[]" }, { status: 400 });
    }

    await saveFooterBuilder(body);
    revalidateAll();

    return NextResponse.json(body);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
